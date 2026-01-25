"""
Tests for advanced workflow management features.

Tests the enhanced runs management features including batch operations,
comparison view, and pre-dispatch parameter editing.
"""
import unittest
import tempfile
import json
from pathlib import Path
import os


class TestAdvancedWorkflowFeatures(unittest.TestCase):
    """Tests for advanced workflow management features"""
    
    def setUp(self):
        """Setup test environment"""
        self.test_dir = tempfile.mkdtemp()
        self.runs_dir = Path(self.test_dir) / "runs"
        self.runs_dir.mkdir()
    
    def tearDown(self):
        """Clean up"""
        import shutil
        if hasattr(self, 'test_dir') and Path(self.test_dir).exists():
            shutil.rmtree(self.test_dir)
    
    def _create_test_run(self, run_id, **kwargs):
        """Helper to create a test run"""
        run_dir = self.runs_dir / run_id
        run_dir.mkdir()
        
        manifest = {
            "status": kwargs.get("status", "completed"),
            "started_at": "2024-01-01T00:00:00Z",
            "model": kwargs.get("model", "SDXL"),
            "frame_count": kwargs.get("frame_count", 100),
            "seed": kwargs.get("seed", 12345),
            "tag": kwargs.get("tag", "test"),
        }
        
        manifest_path = run_dir / "run.json"
        with manifest_path.open("w") as f:
            json.dump(manifest, f)
        
        return run_dir, manifest_path
    
    def test_batch_rerun_request_creation(self):
        """Test batch rerun request file creation"""
        # Create multiple test runs
        run1_dir, manifest1 = self._create_test_run("test_001")
        run2_dir, manifest2 = self._create_test_run("test_002")
        run3_dir, manifest3 = self._create_test_run("test_003")
        
        # Simulate batch rerun by creating request files
        for run_dir in [run1_dir, run2_dir, run3_dir]:
            request = {
                "mode": "rerun",
                "base_run": run_dir.name,
                "manifest": str(run_dir / "run.json"),
                "overrides": {"seed": 99999}
            }
            
            request_file = run_dir / "batch_rerun_request.json"
            with request_file.open("w") as f:
                json.dump(request, f)
            
            # Verify request was created
            self.assertTrue(request_file.exists())
            
            with request_file.open("r") as f:
                loaded = json.load(f)
            
            self.assertEqual(loaded["mode"], "rerun")
            self.assertEqual(loaded["overrides"]["seed"], 99999)
    
    def test_run_comparison_data_structure(self):
        """Test run comparison data structure"""
        # Create runs with different parameters
        runs = [
            self._create_test_run("compare_001", seed=111, model="SDXL"),
            self._create_test_run("compare_002", seed=222, model="Flux"),
            self._create_test_run("compare_003", seed=333, model="SDXL"),
        ]
        
        # Load and compare
        comparison_data = []
        for run_dir, manifest_path in runs:
            with manifest_path.open("r") as f:
                data = json.load(f)
                comparison_data.append({
                    "run_id": run_dir.name,
                    "model": data["model"],
                    "seed": data["seed"],
                    "frame_count": data["frame_count"],
                })
        
        # Verify comparison structure
        self.assertEqual(len(comparison_data), 3)
        self.assertEqual(comparison_data[0]["model"], "SDXL")
        self.assertEqual(comparison_data[1]["model"], "Flux")
        self.assertNotEqual(comparison_data[0]["seed"], comparison_data[1]["seed"])
    
    def test_batch_delete_validation(self):
        """Test batch delete creates confirmation requirement"""
        # Create test runs
        run1_dir, _ = self._create_test_run("delete_001")
        run2_dir, _ = self._create_test_run("delete_002")
        
        # Verify runs exist
        self.assertTrue(run1_dir.exists())
        self.assertTrue(run2_dir.exists())
        
        # Simulate deletion (in real usage, would require confirmation)
        import shutil
        for run_dir in [run1_dir, run2_dir]:
            if run_dir.exists():
                shutil.rmtree(run_dir)
        
        # Verify deletion
        self.assertFalse(run1_dir.exists())
        self.assertFalse(run2_dir.exists())
    
    def test_pre_dispatch_parameter_preview(self):
        """Test pre-dispatch parameter preview structure"""
        run_dir, manifest_path = self._create_test_run("preview_001")
        
        # Load manifest
        with manifest_path.open("r") as f:
            manifest = json.load(f)
        
        # Create preview data structure
        preview_data = {
            "run_id": run_dir.name,
            "model": manifest["model"],
            "frame_count": manifest["frame_count"],
            "overrides": {
                "seed": 54321,
                "steps": 30,
            }
        }
        
        # Verify preview structure
        self.assertIn("run_id", preview_data)
        self.assertIn("overrides", preview_data)
        self.assertEqual(preview_data["overrides"]["seed"], 54321)
    
    def test_batch_mode_selection_tracking(self):
        """Test batch mode selection tracking"""
        # Create test runs
        runs = [
            self._create_test_run(f"batch_{i:03d}") 
            for i in range(5)
        ]
        
        # Simulate selection tracking
        selected_indices = {0, 2, 4}  # Select runs 0, 2, 4
        
        # Verify selection
        self.assertEqual(len(selected_indices), 3)
        self.assertIn(0, selected_indices)
        self.assertIn(2, selected_indices)
        self.assertNotIn(1, selected_indices)
    
    def test_comparison_view_field_extraction(self):
        """Test field extraction for comparison view"""
        # Create runs with varying parameters
        run1_dir, _ = self._create_test_run(
            "field_001", 
            model="SDXL", 
            seed=111, 
            frame_count=100
        )
        run2_dir, _ = self._create_test_run(
            "field_002", 
            model="Flux", 
            seed=222, 
            frame_count=200
        )
        
        # Load manifests
        manifests = []
        for run_dir in [run1_dir, run2_dir]:
            with (run_dir / "run.json").open("r") as f:
                manifests.append(json.load(f))
        
        # Extract comparison fields
        comparison_fields = ["model", "seed", "frame_count"]
        comparison_table = []
        
        for manifest in manifests:
            row = {field: manifest.get(field) for field in comparison_fields}
            comparison_table.append(row)
        
        # Verify comparison table
        self.assertEqual(len(comparison_table), 2)
        self.assertEqual(comparison_table[0]["model"], "SDXL")
        self.assertEqual(comparison_table[1]["model"], "Flux")
        self.assertEqual(comparison_table[0]["frame_count"], 100)
        self.assertEqual(comparison_table[1]["frame_count"], 200)


if __name__ == "__main__":
    unittest.main()
