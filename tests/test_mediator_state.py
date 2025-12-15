import json

from defora_cli.mediator_state import DEFAULT_KEYS, fetch_state


class DummyClient:
    def __init__(self):
        self.reads = []

    def read(self, key):
        self.reads.append(key)
        return f"val-{key}"


def test_fetch_state_reads_all_keys():
    client = DummyClient()
    keys = ["cfg", "strength", "fov"]
    result = fetch_state(client, keys)
    assert result["cfg"] == "val-cfg"
    assert result["strength"] == "val-strength"
    assert set(client.reads) == set(keys)


def test_default_keys_non_empty():
    assert "cfg" in DEFAULT_KEYS
    assert "strength" in DEFAULT_KEYS
