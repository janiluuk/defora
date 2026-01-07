import unittest
from pathlib import Path

from defora_cli.stream_helper import build_ffmpeg_cmd, detect_protocol


class TestStreamHelper(unittest.TestCase):
    def test_build_ffmpeg_cmd_rtmp(self):
        """Test RTMP streaming command generation"""
        cmd = build_ffmpeg_cmd(Path("/tmp"), "rtmp://example/live/key", 24, "1280x720", "rtmp")
        self.assertIn("ffmpeg", cmd[0])
        self.assertIn("rtmp://example/live/key", cmd)
        self.assertIn("-framerate", cmd)
        self.assertIn("1280x720", cmd)
        self.assertIn("-f", cmd)
        self.assertIn("flv", cmd)

    def test_build_ffmpeg_cmd_srt(self):
        """Test SRT streaming command generation"""
        cmd = build_ffmpeg_cmd(Path("/tmp"), "srt://example:9000", 24, None, "srt")
        self.assertIn("ffmpeg", cmd[0])
        self.assertIn("srt://example:9000", cmd)
        self.assertIn("-f", cmd)
        self.assertIn("mpegts", cmd)
        self.assertIn("-flush_packets", cmd)

    def test_build_ffmpeg_cmd_whip(self):
        """Test WHIP streaming command generation"""
        cmd = build_ffmpeg_cmd(Path("/tmp"), "https://example.com/whip", 30, "1920x1080", "whip")
        self.assertIn("ffmpeg", cmd[0])
        self.assertIn("https://example.com/whip", cmd)
        self.assertIn("-f", cmd)
        self.assertIn("mp4", cmd)
        self.assertIn("-movflags", cmd)
        self.assertIn("-method", cmd)
        self.assertIn("POST", cmd)

    def test_detect_protocol_rtmp(self):
        """Test RTMP protocol detection"""
        self.assertEqual(detect_protocol("rtmp://example/live/key"), "rtmp")
        self.assertEqual(detect_protocol("rtmps://example/live/key"), "rtmp")

    def test_detect_protocol_srt(self):
        """Test SRT protocol detection"""
        self.assertEqual(detect_protocol("srt://example:9000"), "srt")

    def test_detect_protocol_whip(self):
        """Test WHIP protocol detection"""
        self.assertEqual(detect_protocol("https://example.com/whip"), "whip")
        self.assertEqual(detect_protocol("http://example.com/whip"), "whip")

    def test_detect_protocol_default(self):
        """Test default protocol detection"""
        self.assertEqual(detect_protocol("unknown://example"), "rtmp")


if __name__ == "__main__":
    unittest.main()
