import unittest
from pathlib import Path

from defora_cli.stream_helper import build_ffmpeg_cmd


class TestStreamHelper(unittest.TestCase):
    def test_build_ffmpeg_cmd(self):
        cmd = build_ffmpeg_cmd(Path("/tmp"), "rtmp://example/live/key", 24, "1280x720")
        self.assertIn("ffmpeg", cmd[0])
        self.assertIn("rtmp://example/live/key", cmd)
        self.assertIn("-framerate", cmd)
        self.assertIn("1280x720", cmd)


if __name__ == "__main__":
    unittest.main()
