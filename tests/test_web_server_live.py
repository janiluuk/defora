"""Live web server smoke tests (audit A-10). No GPU; MQ disabled."""
import os
import tempfile
import unittest

try:
    import httpx
except ImportError:
    httpx = None


@unittest.skipUnless(httpx is not None, "httpx not installed")
class TestWebServerLive(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.frames = os.path.join(cls.tmp.name, "frames")
        cls.hls = os.path.join(cls.tmp.name, "hls")
        os.makedirs(cls.frames, exist_ok=True)
        os.makedirs(cls.hls, exist_ok=True)
        os.environ["DISABLE_MQ"] = "1"
        web_dir = os.path.join(os.path.dirname(__file__), "..", "docker", "web")
        cls._server_mod = __import__(
            "server",
            fromlist=["start"],
        ) if False else None
        import sys
        sys.path.insert(0, web_dir)
        from server import start  # noqa: E402

        cls._ctx = start(
            port=0,
            framesDir=cls.frames,
            hlsDir=cls.hls,
            enableMq=False,
            publicDir=os.path.join(web_dir, "public"),
        )
        cls.app = cls._ctx["app"]
        cls.base = f"http://127.0.0.1:{cls._ctx['port']}"

    @classmethod
    def tearDownClass(cls):
        srv = cls._ctx.get("server")
        if srv:
            srv.close()
        cls.tmp.cleanup()

    def test_health(self):
        r = httpx.get(f"{self.base}/api/health", timeout=5)
        self.assertEqual(r.status_code, 200)
        self.assertIn("ok", r.json())

    def test_frames_empty(self):
        r = httpx.get(f"{self.base}/api/frames?limit=5", timeout=5)
        self.assertEqual(r.status_code, 200)
        self.assertIn("items", r.json())

    def test_status(self):
        r = httpx.get(f"{self.base}/api/status", timeout=5)
        self.assertEqual(r.status_code, 200)


if __name__ == "__main__":
    unittest.main()
