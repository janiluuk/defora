import tempfile
import os
from pathlib import Path
import unittest

from sd_cli.monitor_cli import detect_frames_dir


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


if __name__ == "__main__":
    unittest.main()
