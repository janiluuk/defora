"""Live web server smoke tests (audit A-10). Spawns docker/web/server.js; no GPU."""
import unittest

try:
    import httpx
except ImportError:
    httpx = None

from web_server_harness import NodeWebServer, web_stack_ready


@unittest.skipUnless(httpx is not None, "httpx not installed")
@unittest.skipUnless(web_stack_ready(), "node and docker/web/node_modules required")
class TestWebServerLive(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = NodeWebServer()
        cls.server.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.stop()

    def test_health(self):
        r = httpx.get(f"{self.server.base}/api/health", timeout=5)
        self.assertEqual(r.status_code, 200)
        self.assertIn("ok", r.json())

    def test_frames_empty(self):
        r = httpx.get(f"{self.server.base}/api/frames?limit=5", timeout=5)
        self.assertEqual(r.status_code, 200)
        self.assertIn("items", r.json())

    def test_status(self):
        r = httpx.get(f"{self.server.base}/api/status", timeout=5)
        self.assertEqual(r.status_code, 200)


if __name__ == "__main__":
    unittest.main()
