import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from sd_cli.deforumation_request_dispatcher import (
    forge_cli_args,
    forge_cli_command,
    merge_payload,
    build_payload_from_args,
)


class TestRequestDispatcher(unittest.TestCase):
    def test_merge_payload_overrides(self):
        with tempfile.TemporaryDirectory() as tmp:
            manifest = {
                "prompt_positive": "hello",
                "prompt_negative": "bad",
                "seed": 1,
                "steps": 10,
                "strength": 0.5,
                "cfg": 6.0,
                "frame_count": 50,
                "model": "m",
            }
            mpath = Path(tmp) / "run.json"
            mpath.write_text(json.dumps(manifest))
            payload = merge_payload(mpath, {"seed": "999", "steps": "12"})
        self.assertEqual(payload["seed"], 999)
        self.assertEqual(payload["steps"], 12)
        self.assertEqual(payload["prompt_positive"], "hello")

    def test_command_build(self):
        payload = {
            "prompt_positive": "abc",
            "prompt_negative": "neg",
            "steps": 10,
            "strength": 0.7,
            "cfg": 5.5,
            "frame_count": 42,
            "seed": 3,
        }
        cmd = forge_cli_command("continue", payload, "/tmp/last.png")
        self.assertIn("--init-image", cmd)
        self.assertIn("abc", cmd)
        self.assertIn("neg", cmd)
        self.assertIn("--seed 3", cmd)

    def test_args_build(self):
        payload = {
            "prompt_positive": "abc",
            "prompt_negative": "neg",
            "steps": 10,
            "strength": 0.7,
            "cfg": 5.5,
            "frame_count": 42,
            "seed": 3,
        }
        args = forge_cli_args("continue", payload, "/tmp/last.png", forge_cli_path="/tmp/forge_cli.py")
        self.assertIn("abc", args)
        self.assertIn("/tmp/last.png", args)
        self.assertIn("--seed", args)
        self.assertEqual(args[1], "/tmp/forge_cli.py")

    def test_build_payload_from_args_with_preset(self):
        class Dummy:
            pass

        dummy = Dummy()
        dummy.prompt = ""
        dummy.negative = ""
        dummy.frame_count = None
        dummy.steps = None
        dummy.strength = None
        dummy.cfg = None
        dummy.seed = None
        with tempfile.TemporaryDirectory() as tmp:
            preset_path = Path(tmp) / "preset.json"
            preset_path.write_text(json.dumps({"prompt_positive": "p", "frame_count": 12, "cfg": 5.0}))
            dummy.preset = str(preset_path)
            payload = build_payload_from_args(dummy)
            self.assertEqual(payload["prompt_positive"], "p")
            self.assertEqual(payload["frame_count"], 12)

    @mock.patch("sd_cli.deforumation_request_dispatcher.subprocess.run")
    def test_execute_calls_subprocess(self, mock_run):
        mock_run.return_value.returncode = 0
        payload = {
            "prompt_positive": "abc",
            "steps": 10,
            "strength": 0.7,
            "cfg": 5.5,
            "frame_count": 42,
        }
        args = forge_cli_args("rerun", payload, None)
        from sd_cli.deforumation_request_dispatcher import subprocess as dispatcher_subprocess

        dispatcher_subprocess.run(args, text=True)
        mock_run.assert_called_once()


if __name__ == "__main__":
    unittest.main()
