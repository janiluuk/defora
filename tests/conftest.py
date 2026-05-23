"""Ensure tests/ is importable for web_server_harness and siblings."""
import sys
from pathlib import Path

_tests = Path(__file__).resolve().parent
if str(_tests) not in sys.path:
    sys.path.insert(0, str(_tests))
