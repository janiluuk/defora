import json
import os
import tempfile
import unittest
from pathlib import Path

from defora_cli.deforumation_runs_cli import RunRecord, RunBrowser


class TestRunBrowserHelpers(unittest.TestCase):
    def test_make_request_writes_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            manifest_path = Path(tmp) / "run.json"
            manifest_path.write_text(json.dumps({"status": "completed", "started_at": "now", "model": "m", "frame_count": 1}))
            rec = RunRecord(
                run_id="r1",
                status="completed",
                started_at="now",
                model="m",
                length_frames=1,
                tag="",
                manifest_path=manifest_path,
            )
            dummy = type("Dummy", (), {})()
            dummy.records = [rec]
            dummy.selected = 0
            dummy.overrides = {"seed": "999"}
            dummy.status = ""
            # inject make_request method
            browser = RunBrowser.__new__(RunBrowser)
            browser.records = dummy.records
            browser.selected = dummy.selected
            browser.overrides = dummy.overrides
            browser.status = ""
            browser.make_request("rerun")
            outfile = manifest_path.parent / "rerun_request.json"
            self.assertTrue(outfile.exists())
            blob = json.loads(outfile.read_text())
            self.assertEqual(blob["mode"], "rerun")
            self.assertEqual(blob["overrides"], {"seed": "999"})


if __name__ == "__main__":
    unittest.main()
