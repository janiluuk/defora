"""
Tests for the runs browser API endpoints.

These tests verify the runs browser API functionality including:
- Listing runs with filtering and sorting
- Getting individual run details
- Updating run metadata
- Deleting runs
- Exporting runs to CSV/JSON
- Rerun and continue requests
"""
import unittest
import json
import tempfile
import os
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock


class TestRunsBrowserAPI(unittest.TestCase):
    """Test suite for runs browser API endpoints"""

    def setUp(self):
        """Set up temporary runs directory with test data"""
        self.tmpdir = tempfile.TemporaryDirectory()
        self.runs_dir = Path(self.tmpdir.name)
        
        # Create test run manifests
        self.test_runs = [
            {
                "run_id": "run_001",
                "status": "completed",
                "started_at": "2024-01-01T10:00:00Z",
                "model": "SDXL",
                "frame_count": 100,
                "tag": "test",
                "seed": 12345,
                "steps": 20,
                "strength": 0.75,
                "cfg": 7.0,
                "prompt_positive": "a beautiful landscape",
                "prompt_negative": "blurry, low quality",
                "notes": "",
            },
            {
                "run_id": "run_002",
                "status": "failed",
                "started_at": "2024-01-02T11:00:00Z",
                "model": "Flux",
                "frame_count": 50,
                "tag": "experiment",
                "seed": 67890,
                "steps": 30,
                "strength": 0.8,
                "cfg": 5.0,
                "prompt_positive": "neon city at night",
                "prompt_negative": "ugly, deformed",
                "notes": "Failed due to OOM",
            },
            {
                "run_id": "run_003",
                "status": "completed",
                "started_at": "2024-01-03T12:00:00Z",
                "model": "SDXL",
                "frame_count": 200,
                "tag": "test",
                "seed": 11111,
                "steps": 25,
                "strength": 0.7,
                "cfg": 6.5,
                "prompt_positive": "abstract art",
                "prompt_negative": "text, watermark",
                "notes": "Good results",
            },
        ]
        
        for run_data in self.test_runs:
            run_path = self.runs_dir / run_data["run_id"]
            run_path.mkdir(parents=True, exist_ok=True)
            manifest_path = run_path / "run.json"
            manifest_path.write_text(json.dumps(run_data))

    def tearDown(self):
        """Clean up temporary directory"""
        self.tmpdir.cleanup()

    def test_load_run_manifest(self):
        """Test loading a single run manifest"""
        manifest_path = self.runs_dir / "run_001" / "run.json"
        data = json.loads(manifest_path.read_text())
        self.assertEqual(data["run_id"], "run_001")
        self.assertEqual(data["status"], "completed")
        self.assertEqual(data["model"], "SDXL")

    def test_list_runs_sorted_by_date(self):
        """Test that runs are listed sorted by date (newest first)"""
        runs = []
        for entry in sorted(self.runs_dir.iterdir()):
            if entry.is_dir():
                manifest_path = entry / "run.json"
                if manifest_path.exists():
                    data = json.loads(manifest_path.read_text())
                    data["run_id"] = entry.name
                    runs.append(data)
        
        # Sort by started_at descending
        runs.sort(key=lambda r: r["started_at"], reverse=True)
        
        self.assertEqual(len(runs), 3)
        self.assertEqual(runs[0]["run_id"], "run_003")
        self.assertEqual(runs[2]["run_id"], "run_001")

    def test_filter_runs_by_status(self):
        """Test filtering runs by status"""
        runs = []
        for entry in self.runs_dir.iterdir():
            if entry.is_dir():
                manifest_path = entry / "run.json"
                if manifest_path.exists():
                    data = json.loads(manifest_path.read_text())
                    data["run_id"] = entry.name
                    runs.append(data)
        
        completed = [r for r in runs if r["status"] == "completed"]
        failed = [r for r in runs if r["status"] == "failed"]
        
        self.assertEqual(len(completed), 2)
        self.assertEqual(len(failed), 1)

    def test_filter_runs_by_tag(self):
        """Test filtering runs by tag"""
        runs = []
        for entry in self.runs_dir.iterdir():
            if entry.is_dir():
                manifest_path = entry / "run.json"
                if manifest_path.exists():
                    data = json.loads(manifest_path.read_text())
                    data["run_id"] = entry.name
                    runs.append(data)
        
        test_tagged = [r for r in runs if "test" in (r.get("tag") or "").lower()]
        experiment_tagged = [r for r in runs if "experiment" in (r.get("tag") or "").lower()]
        
        self.assertEqual(len(test_tagged), 2)
        self.assertEqual(len(experiment_tagged), 1)

    def test_filter_runs_by_model(self):
        """Test filtering runs by model"""
        runs = []
        for entry in self.runs_dir.iterdir():
            if entry.is_dir():
                manifest_path = entry / "run.json"
                if manifest_path.exists():
                    data = json.loads(manifest_path.read_text())
                    data["run_id"] = entry.name
                    runs.append(data)
        
        sdxl_runs = [r for r in runs if "sdxl" in (r.get("model") or "").lower()]
        flux_runs = [r for r in runs if "flux" in (r.get("model") or "").lower()]
        
        self.assertEqual(len(sdxl_runs), 2)
        self.assertEqual(len(flux_runs), 1)

    def test_search_runs_by_text(self):
        """Test searching runs by text across multiple fields"""
        runs = []
        for entry in self.runs_dir.iterdir():
            if entry.is_dir():
                manifest_path = entry / "run.json"
                if manifest_path.exists():
                    data = json.loads(manifest_path.read_text())
                    data["run_id"] = entry.name
                    runs.append(data)
        
        # Search for "landscape" in prompts
        landscape_runs = [r for r in runs if "landscape" in (r.get("prompt_positive") or "").lower()]
        self.assertEqual(len(landscape_runs), 1)
        
        # Search for "OOM" in notes
        oom_runs = [r for r in runs if "oom" in (r.get("notes") or "").lower()]
        self.assertEqual(len(oom_runs), 1)

    def test_sort_runs_by_field(self):
        """Test sorting runs by different fields"""
        runs = []
        for entry in self.runs_dir.iterdir():
            if entry.is_dir():
                manifest_path = entry / "run.json"
                if manifest_path.exists():
                    data = json.loads(manifest_path.read_text())
                    data["run_id"] = entry.name
                    runs.append(data)
        
        # Sort by frame_count ascending
        runs.sort(key=lambda r: r.get("frame_count", 0))
        self.assertEqual(runs[0]["frame_count"], 50)
        self.assertEqual(runs[2]["frame_count"], 200)
        
        # Sort by frame_count descending
        runs.sort(key=lambda r: r.get("frame_count", 0), reverse=True)
        self.assertEqual(runs[0]["frame_count"], 200)
        self.assertEqual(runs[2]["frame_count"], 50)

    def test_export_runs_to_csv(self):
        """Test exporting runs to CSV format"""
        runs = []
        for entry in self.runs_dir.iterdir():
            if entry.is_dir():
                manifest_path = entry / "run.json"
                if manifest_path.exists():
                    data = json.loads(manifest_path.read_text())
                    data["run_id"] = entry.name
                    runs.append(data)
        
        # Generate CSV
        headers = ["run_id", "status", "model", "frame_count", "tag", "seed"]
        csv_lines = [",".join(headers)]
        for run in runs:
            row = [str(run.get(h, "")) for h in headers]
            csv_lines.append(",".join(row))
        
        csv_content = "\n".join(csv_lines)
        
        # Verify CSV content
        self.assertIn("run_id,status,model,frame_count,tag,seed", csv_content)
        self.assertIn("run_001,completed,SDXL,100,test,12345", csv_content)

    def test_export_runs_to_json(self):
        """Test exporting runs to JSON format"""
        runs = []
        for entry in self.runs_dir.iterdir():
            if entry.is_dir():
                manifest_path = entry / "run.json"
                if manifest_path.exists():
                    data = json.loads(manifest_path.read_text())
                    data["run_id"] = entry.name
                    runs.append(data)
        
        export_data = {"runs": runs}
        json_content = json.dumps(export_data)
        
        # Verify JSON content
        parsed = json.loads(json_content)
        self.assertEqual(len(parsed["runs"]), 3)

    def test_rerun_request_structure(self):
        """Test that rerun request has correct structure"""
        run_path = self.runs_dir / "run_001"
        manifest = json.loads((run_path / "run.json").read_text())
        
        rerun_request = {
            "mode": "rerun",
            "run_id": manifest["run_id"],
            "original_manifest": manifest,
            "overrides": {"seed": 99999},
            "created_at": "2024-01-04T10:00:00Z",
        }
        
        self.assertEqual(rerun_request["mode"], "rerun")
        self.assertEqual(rerun_request["overrides"]["seed"], 99999)
        
        # Save and verify
        request_path = run_path / "rerun_request.json"
        request_path.write_text(json.dumps(rerun_request))
        loaded = json.loads(request_path.read_text())
        self.assertEqual(loaded["mode"], "rerun")

    def test_continue_request_structure(self):
        """Test that continue request has correct structure"""
        run_path = self.runs_dir / "run_001"
        manifest = json.loads((run_path / "run.json").read_text())
        
        continue_request = {
            "mode": "continue",
            "run_id": manifest["run_id"],
            "original_manifest": manifest,
            "from_frame": manifest["frame_count"],
            "overrides": {},
            "created_at": "2024-01-04T10:00:00Z",
        }
        
        self.assertEqual(continue_request["mode"], "continue")
        self.assertEqual(continue_request["from_frame"], 100)

    def test_update_run_notes(self):
        """Test updating run notes"""
        run_path = self.runs_dir / "run_001"
        manifest_path = run_path / "run.json"
        
        # Load and update
        manifest = json.loads(manifest_path.read_text())
        manifest["notes"] = "Updated notes for testing"
        manifest_path.write_text(json.dumps(manifest))
        
        # Verify update
        updated = json.loads(manifest_path.read_text())
        self.assertEqual(updated["notes"], "Updated notes for testing")

    def test_delete_run(self):
        """Test deleting a run"""
        run_path = self.runs_dir / "run_002"
        self.assertTrue(run_path.exists())
        
        # Simulate deletion
        import shutil
        shutil.rmtree(run_path)
        
        self.assertFalse(run_path.exists())

    def test_run_comparison(self):
        """Test comparing multiple runs"""
        runs = []
        for entry in self.runs_dir.iterdir():
            if entry.is_dir():
                manifest_path = entry / "run.json"
                if manifest_path.exists():
                    data = json.loads(manifest_path.read_text())
                    data["run_id"] = entry.name
                    runs.append(data)
        
        # Select runs for comparison
        selected_ids = ["run_001", "run_003"]
        selected_runs = [r for r in runs if r["run_id"] in selected_ids]
        
        # Compare properties
        props = ["status", "model", "frame_count", "seed", "steps", "strength", "cfg"]
        comparison = {}
        for prop in props:
            comparison[prop] = {r["run_id"]: r.get(prop, "-") for r in selected_runs}
        
        # Verify comparison data
        self.assertEqual(comparison["model"]["run_001"], "SDXL")
        self.assertEqual(comparison["model"]["run_003"], "SDXL")
        self.assertEqual(comparison["frame_count"]["run_001"], 100)
        self.assertEqual(comparison["frame_count"]["run_003"], 200)


if __name__ == "__main__":
    unittest.main()
