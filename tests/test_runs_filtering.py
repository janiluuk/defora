import json
import tempfile
import unittest
from pathlib import Path

from defora_cli.deforumation_runs_cli import RunRecord, RunBrowser, load_manifests


class TestRunsFiltering(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.tmp_path = Path(self.tmpdir.name)
        
        # Create test manifests
        manifests = [
            {"run_id": "run_001", "status": "completed", "started_at": "2024-01-01", "model": "SDXL", "frame_count": 100, "tag": "test"},
            {"run_id": "run_002", "status": "failed", "started_at": "2024-01-02", "model": "Flux", "frame_count": 50, "tag": "experiment"},
            {"run_id": "run_003", "status": "completed", "started_at": "2024-01-03", "model": "SDXL", "frame_count": 200, "tag": "test"},
        ]
        
        self.records = []
        for i, m in enumerate(manifests):
            manifest_path = self.tmp_path / f"run_{i}" / "run.json"
            manifest_path.parent.mkdir(parents=True, exist_ok=True)
            manifest_path.write_text(json.dumps(m))
            self.records.append(RunRecord(
                run_id=m["run_id"],
                status=m["status"],
                started_at=m["started_at"],
                model=m["model"],
                length_frames=m["frame_count"],
                tag=m["tag"],
                manifest_path=manifest_path,
            ))
    
    def tearDown(self):
        self.tmpdir.cleanup()
    
    def test_filter_by_text(self):
        """Test filtering records by text search"""
        browser = RunBrowser.__new__(RunBrowser)
        browser.records = self.records
        browser.filter_text = "run_001"
        browser.filter_status = ""
        browser.filter_tag = ""
        browser.filter_model = ""
        browser.sort_field = "run_id"
        browser.sort_reverse = True
        
        browser._apply_filters()
        
        self.assertEqual(len(browser.filtered_records), 1)
        self.assertEqual(browser.filtered_records[0].run_id, "run_001")
    
    def test_filter_by_status(self):
        """Test filtering records by status"""
        browser = RunBrowser.__new__(RunBrowser)
        browser.records = self.records
        browser.filter_text = ""
        browser.filter_status = "completed"
        browser.filter_tag = ""
        browser.filter_model = ""
        browser.sort_field = "run_id"
        browser.sort_reverse = True
        
        browser._apply_filters()
        
        self.assertEqual(len(browser.filtered_records), 2)
        for rec in browser.filtered_records:
            self.assertEqual(rec.status, "completed")
    
    def test_filter_by_tag(self):
        """Test filtering records by tag"""
        browser = RunBrowser.__new__(RunBrowser)
        browser.records = self.records
        browser.filter_text = ""
        browser.filter_status = ""
        browser.filter_tag = "experiment"
        browser.filter_model = ""
        browser.sort_field = "run_id"
        browser.sort_reverse = True
        
        browser._apply_filters()
        
        self.assertEqual(len(browser.filtered_records), 1)
        self.assertEqual(browser.filtered_records[0].tag, "experiment")
    
    def test_filter_by_model(self):
        """Test filtering records by model"""
        browser = RunBrowser.__new__(RunBrowser)
        browser.records = self.records
        browser.filter_text = ""
        browser.filter_status = ""
        browser.filter_tag = ""
        browser.filter_model = "SDXL"
        browser.sort_field = "run_id"
        browser.sort_reverse = True
        
        browser._apply_filters()
        
        self.assertEqual(len(browser.filtered_records), 2)
        for rec in browser.filtered_records:
            self.assertEqual(rec.model, "SDXL")
    
    def test_sort_by_field(self):
        """Test sorting records by different fields"""
        browser = RunBrowser.__new__(RunBrowser)
        browser.records = self.records
        browser.filter_text = ""
        browser.filter_status = ""
        browser.filter_tag = ""
        browser.filter_model = ""
        browser.sort_field = "started_at"
        browser.sort_reverse = False
        
        browser._apply_filters()
        
        self.assertEqual(len(browser.filtered_records), 3)
        self.assertEqual(browser.filtered_records[0].run_id, "run_001")
        self.assertEqual(browser.filtered_records[2].run_id, "run_003")
    
    def test_combined_filters(self):
        """Test combining multiple filters"""
        browser = RunBrowser.__new__(RunBrowser)
        browser.records = self.records
        browser.filter_text = ""
        browser.filter_status = "completed"
        browser.filter_tag = ""
        browser.filter_model = "SDXL"
        browser.sort_field = "run_id"
        browser.sort_reverse = True
        
        browser._apply_filters()
        
        self.assertEqual(len(browser.filtered_records), 2)


class TestRunsExport(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.tmp_path = Path(self.tmpdir.name)
        
        manifests = [
            {"run_id": "run_001", "status": "completed", "started_at": "2024-01-01", "model": "SDXL", "frame_count": 100, "tag": "test"},
            {"run_id": "run_002", "status": "failed", "started_at": "2024-01-02", "model": "Flux", "frame_count": 50, "tag": "experiment"},
        ]
        
        self.records = []
        for i, m in enumerate(manifests):
            manifest_path = self.tmp_path / f"run_{i}" / "run.json"
            manifest_path.parent.mkdir(parents=True, exist_ok=True)
            manifest_path.write_text(json.dumps(m))
            self.records.append(RunRecord(
                run_id=m["run_id"],
                status=m["status"],
                started_at=m["started_at"],
                model=m["model"],
                length_frames=m["frame_count"],
                tag=m["tag"],
                manifest_path=manifest_path,
            ))
    
    def tearDown(self):
        self.tmpdir.cleanup()


if __name__ == "__main__":
    unittest.main()
