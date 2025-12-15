import json

from defora_cli import control_mapping as cm


class DummyClient:
    def __init__(self):
        self.writes = []

    def write(self, key, value):
        self.writes.append((key, value))


def test_live_param_maps_flags():
    result = cm.map_control("liveParam", {"cfg": 7.5, "noise_multiplier": 0.9, "unknown": 1})
    keys = [k for k, _ in result.writes]
    assert "should_use_deforumation_cfg" in keys
    assert "should_use_deforumation_noise" in keys
    assert "cfg" in keys and "noise_multiplier" in keys
    assert "unknown" not in keys


def test_transport_sets_start_and_resume():
    res = cm.map_control("transport", {"action": "resume", "start_frame": 12})
    assert ("start_frame", 12) in res.writes
    assert ("should_resume", 1) in res.writes

def test_prompt_mix_allowed():
    res = cm.map_control("prompts", {"prompt_mix": 0.4, "positive_prompt_1": "a", "positive_prompt_2": "b"})
    keys = [k for k, _ in res.writes]
    assert "prompt_mix" in keys
    assert "positive_prompt_1" in keys


def test_handle_message_uses_mapping():
    client = DummyClient()
    payload = {"controlType": "liveParam", "payload": {"strength": 0.6}}
    body = json.dumps(payload).encode("utf-8")
    msg = cm.map_control(payload["controlType"], payload["payload"])
    assert msg.writes  # sanity
    from defora_cli.control_bridge import handle_message

    result = handle_message(client, body)
    assert "strength" in result
    assert ("should_use_deforumation_strength", 1) in client.writes
    assert ("strength", 0.6) in client.writes
