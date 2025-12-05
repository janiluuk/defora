import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from sd_cli.deforumation_dashboard import (
    DashboardState,
    _parse_value,
    ensure_defaults,
    load_preset,
    save_preset,
    run_audio_helper,
    send_to_mediator,
    toggle_field,
)


class TestDeforumationDashboard(unittest.TestCase):
    def test_ensure_defaults_and_parse(self):
        base = {"positive_prompt": "hi", "audio_output": "custom.json"}
        blob = ensure_defaults(base)
        self.assertEqual(blob["positive_prompt"], "hi")
        self.assertEqual(blob["prompt_mix"], 0.5)
        self.assertIn("audio_path", blob)
        self.assertEqual(_parse_value("true", bool), True)
        self.assertEqual(_parse_value("0", int), 0)
        self.assertAlmostEqual(_parse_value("0.5", float), 0.5)

    def test_toggle_field(self):
        self.assertFalse(toggle_field(True))
        self.assertEqual(toggle_field(1), 0)
        self.assertEqual(toggle_field(0), 1)

    def test_send_to_mediator_writes_expected_keys(self):
        sent = []

        class FakeClient:
            def __init__(self, host, port):
                self.host = host
                self.port = port

            def write(self, key, val):
                sent.append((key, val))

        state = DashboardState(
            config_path=Path("x"),
            mediator_host="h",
            mediator_port="p",
            data={"strength": 0.5, "cfg": 7.0},
        )
        with patch("sd_cli.deforumation_dashboard.MediatorClient", FakeClient):
            msg = send_to_mediator(state, ["strength", "cfg", "missing"])
        self.assertIn("Sent to mediator", msg)
        self.assertIn(("strength", 0.5), sent)
        self.assertIn(("cfg", 7.0), sent)

    def test_run_audio_helper_invokes_subprocess(self):
        state = DashboardState(
            config_path=Path("x"),
            mediator_host="h",
            mediator_port="p",
            data={
                "audio_path": "/tmp/audio.wav",
                "mapping_path": "",
                "audio_fps": 12,
                "audio_output": "/tmp/out.json",
                "audio_live": False,
            },
        )
        with patch("sd_cli.deforumation_dashboard.subprocess.run") as mock_run:
            mock_run.return_value.returncode = 0
            msg = run_audio_helper(state)
        self.assertIn("finished", msg)
        mock_run.assert_called_once()
        args = mock_run.call_args[0][0]
        self.assertEqual(args[0], sys.executable)
        self.assertEqual(args[1:4], ["-m", "sd_cli.audio_reactive_modulator", "--audio"])

    def test_run_audio_helper_missing_mapping(self):
        state = DashboardState(
            config_path=Path("x"),
            mediator_host="h",
            mediator_port="p",
            data={
                "audio_path": "/tmp/audio.wav",
                "mapping_path": "/tmp/missing.json",
                "audio_fps": 12,
                "audio_output": "/tmp/out.json",
                "audio_live": False,
            },
        )
        msg = run_audio_helper(state)
        self.assertIn("Mapping file not found", msg)

    def test_preset_roundtrip(self, tmp_path: Path = None):
        name = "testpreset_dashboard"
        data = {"positive_prompt": "hi", "cfg": 7}
        path = save_preset(name, data)
        self.assertTrue(path.exists())
        loaded = load_preset(name)
        self.assertEqual(loaded["cfg"], 7)


if __name__ == "__main__":
    unittest.main()
