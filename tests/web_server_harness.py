"""Spawn docker/web/server.js for Python integration/perf tests with bounded startup."""
import os
import shutil
import socket
import subprocess
import tempfile
import time

try:
    import httpx
except ImportError:
    httpx = None

WEB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docker", "web"))
TEST_SERVER = os.path.join(WEB_DIR, "scripts", "test-server.js")


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

    def __init__(self, frames_dir=None, hls_dir=None, startup_timeout=12.0):
        self._tmp = None
        self.frames_dir = frames_dir
        self.hls_dir = hls_dir
        self.startup_timeout = startup_timeout
        self.port = None
        self.proc = None
        self.base = None
        self._log = None

    def start(self, interval=0.2):
        if not web_stack_ready():
            raise RuntimeError("node and docker/web/node_modules required")
        if self._tmp is None:
            self._tmp = tempfile.TemporaryDirectory()
        root = self._tmp.name
        if self.frames_dir is None:
            self.frames_dir = os.path.join(self._tmp.name, "frames")
        if self.hls_dir is None:
            self.hls_dir = os.path.join(self._tmp.name, "hls")
        uploads_dir = os.path.join(root, "uploads")
        presets_dir = os.path.join(root, "presets")
        sequencers_dir = os.path.join(root, "sequencers")
        runs_dir = os.path.join(root, "runs")
        gpu_pool_path = os.path.join(root, "gpu-pool.json")

        os.makedirs(self.frames_dir, exist_ok=True)
        os.makedirs(self.hls_dir, exist_ok=True)
        os.makedirs(uploads_dir, exist_ok=True)
        os.makedirs(presets_dir, exist_ok=True)
        os.makedirs(sequencers_dir, exist_ok=True)
        os.makedirs(runs_dir, exist_ok=True)
        with open(gpu_pool_path, "w", encoding="utf-8") as fh:
            fh.write('{"enabled": false, "nodes": []}\n')

        self.port = free_port()
        env = os.environ.copy()
        env["DISABLE_MQ"] = "1"
        env["PORT"] = str(self.port)
        env["FRAMES_DIR"] = self.frames_dir
        env["HLS_DIR"] = self.hls_dir
        env["UPLOADS_DIR"] = uploads_dir
        env["PRESETS_DIR"] = presets_dir
        env["SEQUENCER_DIR"] = sequencers_dir
        env["RUNS_DIR"] = runs_dir
        env["GPU_POOL_PATH"] = gpu_pool_path

        self._log = tempfile.TemporaryFile(mode="w+t", encoding="utf-8")
        self.proc = subprocess.Popen(
            ["node", TEST_SERVER],
            cwd=WEB_DIR,
            env=env,
            stdout=self._log,
            stderr=subprocess.STDOUT,
        )
        self.base = f"http://127.0.0.1:{self.port}"
        self._wait_for_health(interval)

    def _log_tail(self, limit=80):
        if not self._log:
            return ""
        try:
            self._log.flush()
            self._log.seek(0)
            lines = self._log.read().splitlines()
            return "\n".join(lines[-limit:])
        except Exception:
            return ""

    def _wait_for_health(self, interval):
        if httpx is None:
            raise RuntimeError("httpx not installed")
        last_err = None
        deadline = time.monotonic() + self.startup_timeout
        while time.monotonic() < deadline:
            if self.proc.poll() is not None:
                output = self._log_tail()
                raise RuntimeError(
                    f"server.js exited early (code {self.proc.returncode})"
                    + (f"\n{output}" if output else "")
                )
            try:
                r = httpx.get(f"{self.base}/api/health", timeout=0.5)
                if r.status_code == 200:
                    return
                last_err = f"status {r.status_code}"
            except Exception as exc:
                last_err = str(exc)
            time.sleep(interval)
        self.stop()
        output = self._log_tail()
        raise RuntimeError(
            f"server did not become healthy within {self.startup_timeout:.1f}s: {last_err}"
            + (f"\n{output}" if output else "")
        )

    def stop(self):
        if self.proc and self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.proc.kill()
                self.proc.wait(timeout=2)
        self.proc = None
        if self._log:
            self._log.close()
            self._log = None
        if self._tmp:
            self._tmp.cleanup()
            self._tmp = None

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, *args):
        self.stop()
