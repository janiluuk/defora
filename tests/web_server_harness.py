"""Spawn docker/web/server.js for Python integration/perf tests (Node, not importable)."""
import os
import shutil
import socket
import subprocess
import time

try:
    import httpx
except ImportError:
    httpx = None

WEB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docker", "web"))


def web_stack_ready():
    if not shutil.which("node"):
        return False
    if not os.path.isfile(os.path.join(WEB_DIR, "server.js")):
        return False
    return os.path.isdir(os.path.join(WEB_DIR, "node_modules"))


def free_port():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


class NodeWebServer:
    """Background node server.js process for httpx-based tests."""

    def __init__(self, frames_dir=None, hls_dir=None):
        self._tmp = None
        self.frames_dir = frames_dir
        self.hls_dir = hls_dir
        self.port = None
        self.proc = None
        self.base = None

    def start(self, attempts=40, interval=0.25):
        import tempfile

        if not web_stack_ready():
            raise RuntimeError("node and docker/web/node_modules required")
        if self.frames_dir is None or self.hls_dir is None:
            self._tmp = tempfile.TemporaryDirectory()
            self.frames_dir = os.path.join(self._tmp.name, "frames")
            self.hls_dir = os.path.join(self._tmp.name, "hls")
            os.makedirs(self.frames_dir, exist_ok=True)
            os.makedirs(self.hls_dir, exist_ok=True)

        self.port = free_port()
        env = os.environ.copy()
        env["DISABLE_MQ"] = "1"
        env["PORT"] = str(self.port)
        env["FRAMES_DIR"] = self.frames_dir
        env["HLS_DIR"] = self.hls_dir

        self.proc = subprocess.Popen(
            ["node", "server.js"],
            cwd=WEB_DIR,
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        self.base = f"http://127.0.0.1:{self.port}"
        self._wait_for_health(attempts, interval)

    def _wait_for_health(self, attempts, interval):
        if httpx is None:
            raise RuntimeError("httpx not installed")
        last_err = None
        for _ in range(attempts):
            if self.proc.poll() is not None:
                raise RuntimeError(f"server.js exited early (code {self.proc.returncode})")
            try:
                r = httpx.get(f"{self.base}/api/health", timeout=1)
                if r.status_code == 200:
                    return
                last_err = f"status {r.status_code}"
            except Exception as exc:
                last_err = str(exc)
            time.sleep(interval)
        self.stop()
        raise RuntimeError(f"server did not become healthy: {last_err}")

    def stop(self):
        if self.proc and self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait(timeout=5)
        self.proc = None
        if self._tmp:
            self._tmp.cleanup()
            self._tmp = None

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, *args):
        self.stop()
