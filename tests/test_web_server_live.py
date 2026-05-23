"""Live web server smoke tests (audit A-10). Spawns docker/web/server.js; no GPU."""
import os
import shutil
import socket
import subprocess
import tempfile
import time
import unittest

try:
    import httpx
except ImportError:
    httpx = None

WEB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docker", "web"))


def _web_stack_ready():
    if not shutil.which("node"):
        return False
    if not os.path.isfile(os.path.join(WEB_DIR, "server.js")):
        return False
    return os.path.isdir(os.path.join(WEB_DIR, "node_modules"))


def _free_port():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


@unittest.skipUnless(httpx is not None, "httpx not installed")
@unittest.skipUnless(_web_stack_ready(), "node and docker/web/node_modules required")
class TestWebServerLive(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.frames = os.path.join(cls.tmp.name, "frames")
        cls.hls = os.path.join(cls.tmp.name, "hls")
        os.makedirs(cls.frames, exist_ok=True)
        os.makedirs(cls.hls, exist_ok=True)

        cls.port = _free_port()
        env = os.environ.copy()
        env["DISABLE_MQ"] = "1"
        env["PORT"] = str(cls.port)
        env["FRAMES_DIR"] = cls.frames
        env["HLS_DIR"] = cls.hls

        cls.proc = subprocess.Popen(
            ["node", "server.js"],
            cwd=WEB_DIR,
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        cls.base = f"http://127.0.0.1:{cls.port}"
        cls._wait_for_health()

    @classmethod
    def _wait_for_health(cls, attempts=40, interval=0.25):
        last_err = None
        for _ in range(attempts):
            if cls.proc.poll() is not None:
                raise RuntimeError(f"server.js exited early (code {cls.proc.returncode})")
            try:
                r = httpx.get(f"{cls.base}/api/health", timeout=1)
                if r.status_code == 200:
                    return
                last_err = f"status {r.status_code}"
            except Exception as exc:
                last_err = str(exc)
            time.sleep(interval)
        cls._stop_proc()
        raise RuntimeError(f"server did not become healthy: {last_err}")

    @classmethod
    def _stop_proc(cls):
        proc = getattr(cls, "proc", None)
        if not proc or proc.poll() is not None:
            return
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=5)

    @classmethod
    def tearDownClass(cls):
        cls._stop_proc()
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
