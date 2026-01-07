import tempfile
import os
from pathlib import Path
import unittest

from defora_cli.monitor_cli import detect_frames_dir, format_live_display


class TestMonitorCli(unittest.TestCase):
    def test_detect_frames_dir_env(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)
            env = {"DEFORUMATION_FRAMES_DIR": str(path)}
            # monkeypatch os.getenv via context? simple override
            import os
            original = os.environ.get("DEFORUMATION_FRAMES_DIR")
            os.environ["DEFORUMATION_FRAMES_DIR"] = str(path)
            try:
                self.assertEqual(detect_frames_dir(None), path)
            finally:
                if original is None:
                    del os.environ["DEFORUMATION_FRAMES_DIR"]
                else:
                    os.environ["DEFORUMATION_FRAMES_DIR"] = original

    def test_detect_frames_dir_runs(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp) / "runs" / "abc" / "frames"
            base.mkdir(parents=True)
            cwd = Path.cwd()
            try:
                # temporarily change cwd to tmp
                os.chdir(tmp)
                self.assertEqual(detect_frames_dir(None), base.resolve())
            finally:
                os.chdir(cwd)

    def test_format_live_display_basic(self):
        """Test basic live parameter display formatting"""
        values = {
            "strength": "0.750",
            "cfg": "6.000",
            "translation_x": "0.000",
            "translation_y": "0.000",
            "translation_z": "1.500",
        }
        prev_values = {}
        output = format_live_display(values, prev_values)
        self.assertIn("Live Parameters", output)
        self.assertIn("Generation:", output)
        self.assertIn("strength", output)
        self.assertIn("0.750", output)

    def test_format_live_display_with_changes(self):
        """Test live parameter display with change indicators"""
        values = {
            "strength": "0.800",
            "cfg": "7.000",
            "translation_z": "2.000",
        }
        prev_values = {
            "strength": "0.750",
            "cfg": "7.000",
            "translation_z": "1.500",
        }
        output = format_live_display(values, prev_values)
        # Check for change indicator (↑ or ↓)
        self.assertTrue("↑" in output or "↓" in output)

    def test_format_live_display_categories(self):
        """Test that all categories are present in output"""
        values = {
            "strength": "0.750",
            "cfg": "6.000",
            "translation_x": "0.000",
            "translation_y": "0.000",
            "translation_z": "1.500",
            "rotation_x": "0.000",
            "rotation_y": "15.000",
            "rotation_z": "0.000",
            "fov": "70.000",
        }
        prev_values = {}
        output = format_live_display(values, prev_values)
        self.assertIn("Generation:", output)
        self.assertIn("Camera Position:", output)
        self.assertIn("Camera Rotation:", output)
        self.assertIn("View:", output)


if __name__ == "__main__":
    unittest.main()
