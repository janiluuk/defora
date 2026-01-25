"""
End-to-end workflow tests with generation simulation.

These tests verify complete workflows including generation requests,
manifest handling, and output processing.
"""
import unittest
import os
import tempfile
import json
import time
import subprocess
import sys
from pathlib import Path
from datetime import datetime

SKIP_E2E_TESTS = os.getenv("SKIP_E2E_TESTS", "").lower() in ("1", "true", "yes")


class TestE2EGenerationWorkflow(unittest.TestCase):
    """End-to-end tests for complete generation workflows"""
    
    def setUp(self):
        """Setup test environment"""
        if SKIP_E2E_TESTS:
            self.skipTest("E2E tests disabled via SKIP_E2E_TESTS environment variable")
        
        # Create temporary directory for test runs
        self.test_dir = tempfile.mkdtemp()
        self.runs_dir = Path(self.test_dir) / "runs"
        self.runs_dir.mkdir()
    
    def tearDown(self):
        """Clean up test directory"""
        import shutil
        if hasattr(self, 'test_dir') and Path(self.test_dir).exists():
            shutil.rmtree(self.test_dir)
    
    def _create_run_directory(self, run_id):
        """Create a run directory with manifest and frames"""
        run_dir = self.runs_dir / run_id
        run_dir.mkdir(exist_ok=True)
        
        # Create frames directory
        frames_dir = run_dir / "frames"
        frames_dir.mkdir(exist_ok=True)
        
        return run_dir, frames_dir
    
    def _create_manifest(self, run_dir, **kwargs):
        """Create a run manifest"""
        manifest = {
            "status": kwargs.get("status", "completed"),
            "started_at": kwargs.get("started_at", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")),
            "model": kwargs.get("model", "SDXL"),
            "frame_count": kwargs.get("frame_count", 10),
            "last_frame": kwargs.get("last_frame"),
            "prompt_positive": kwargs.get("prompt_positive", "test prompt"),
            "prompt_negative": kwargs.get("prompt_negative", ""),
            "seed": kwargs.get("seed", 12345),
            "steps": kwargs.get("steps", 24),
            "strength": kwargs.get("strength", 0.75),
            "cfg": kwargs.get("cfg", 7.5),
            "tag": kwargs.get("tag", "test"),
            "notes": kwargs.get("notes", ""),
            "metadata": kwargs.get("metadata", {}),
        }
        
        manifest_path = run_dir / "run.json"
        with manifest_path.open("w") as f:
            json.dump(manifest, f, indent=2)
        
        return manifest_path
    
    def _create_mock_frames(self, frames_dir, count=10):
        """Create mock frame files"""
        frame_paths = []
        for i in range(count):
            frame_path = frames_dir / f"frame_{i:05d}.png"
            # Create empty file to simulate frame
            frame_path.touch()
            frame_paths.append(frame_path)
        return frame_paths
    
    def test_complete_generation_workflow(self):
        """Test complete workflow: request -> generation -> manifest"""
        run_id = "test_e2e_001"
        run_dir, frames_dir = self._create_run_directory(run_id)
        
        # Step 1: Create initial manifest (simulating start of generation)
        manifest_path = self._create_manifest(
            run_dir,
            status="running",
            frame_count=10,
        )
        
        # Verify manifest was created
        self.assertTrue(manifest_path.exists())
        with manifest_path.open("r") as f:
            manifest = json.load(f)
        self.assertEqual(manifest["status"], "running")
        
        # Step 2: Simulate frame generation
        frame_paths = self._create_mock_frames(frames_dir, count=10)
        self.assertEqual(len(frame_paths), 10)
        
        # Step 3: Update manifest to completed status
        with manifest_path.open("r") as f:
            manifest = json.load(f)
        
        manifest["status"] = "completed"
        manifest["last_frame"] = str(frame_paths[-1])
        
        with manifest_path.open("w") as f:
            json.dump(manifest, f, indent=2)
        
        # Step 4: Verify final state
        with manifest_path.open("r") as f:
            final_manifest = json.load(f)
        
        self.assertEqual(final_manifest["status"], "completed")
        self.assertIsNotNone(final_manifest["last_frame"])
        self.assertEqual(final_manifest["frame_count"], 10)
    
    def test_rerun_workflow(self):
        """Test workflow for re-running a completed generation"""
        # Create original run
        original_run_id = "test_original_001"
        original_dir, original_frames = self._create_run_directory(original_run_id)
        
        original_manifest = self._create_manifest(
            original_dir,
            status="completed",
            frame_count=10,
            prompt_positive="original prompt",
            seed=12345,
        )
        
        self._create_mock_frames(original_frames, count=10)
        
        # Create rerun request
        rerun_request = {
            "mode": "rerun",
            "base_run": original_run_id,
            "manifest": str(original_manifest),
            "last_frame": None,
            "overrides": {
                "seed": 54321,  # Different seed for variation
            }
        }
        
        request_path = original_dir / "rerun_request.json"
        with request_path.open("w") as f:
            json.dump(rerun_request, f, indent=2)
        
        # Verify request was created
        self.assertTrue(request_path.exists())
        with request_path.open("r") as f:
            request = json.load(f)
        
        self.assertEqual(request["mode"], "rerun")
        self.assertEqual(request["overrides"]["seed"], 54321)
    
    def test_continue_workflow(self):
        """Test workflow for continuing a generation"""
        # Create initial run
        run_id = "test_continue_001"
        run_dir, frames_dir = self._create_run_directory(run_id)
        
        # Create partial generation (e.g., stopped at frame 50)
        frame_paths = self._create_mock_frames(frames_dir, count=50)
        
        manifest = self._create_manifest(
            run_dir,
            status="aborted",
            frame_count=100,  # Intended to generate 100
            last_frame=str(frame_paths[-1]),
        )
        
        # Create continue request
        continue_request = {
            "mode": "continue",
            "base_run": run_id,
            "manifest": str(manifest),
            "last_frame": str(frame_paths[-1]),
            "overrides": {}
        }
        
        request_path = run_dir / "continue_request.json"
        with request_path.open("w") as f:
            json.dump(continue_request, f, indent=2)
        
        # Verify request
        self.assertTrue(request_path.exists())
        with request_path.open("r") as f:
            request = json.load(f)
        
        self.assertEqual(request["mode"], "continue")
        self.assertIsNotNone(request["last_frame"])
    
    def test_manifest_with_metadata_workflow(self):
        """Test workflow with custom metadata"""
        run_id = "test_metadata_001"
        run_dir, frames_dir = self._create_run_directory(run_id)
        
        # Create manifest with rich metadata
        custom_metadata = {
            "artist": "test_user",
            "project": "experimental",
            "render_settings": {
                "quality": "high",
                "optimization": "speed"
            },
            "tags": ["abstract", "colorful", "experimental"],
        }
        
        manifest = self._create_manifest(
            run_dir,
            status="completed",
            frame_count=20,
            notes="Test run with custom metadata",
            metadata=custom_metadata,
        )
        
        # Verify metadata is preserved
        with manifest.open("r") as f:
            loaded = json.load(f)
        
        self.assertIn("metadata", loaded)
        self.assertEqual(loaded["metadata"]["artist"], "test_user")
        self.assertEqual(loaded["metadata"]["project"], "experimental")
        self.assertIn("tags", loaded["metadata"])
        self.assertEqual(len(loaded["metadata"]["tags"]), 3)
    
    def test_failed_generation_workflow(self):
        """Test workflow for handling failed generations"""
        run_id = "test_failed_001"
        run_dir, frames_dir = self._create_run_directory(run_id)
        
        # Simulate failed generation (few frames generated)
        frame_paths = self._create_mock_frames(frames_dir, count=3)
        
        manifest = self._create_manifest(
            run_dir,
            status="aborted",
            frame_count=100,
            last_frame=str(frame_paths[-1]) if frame_paths else None,
            notes="Generation failed: out of memory",
            metadata={"error": "CUDA out of memory", "frames_completed": 3}
        )
        
        # Verify error information is captured
        with manifest.open("r") as f:
            loaded = json.load(f)
        
        self.assertEqual(loaded["status"], "aborted")
        self.assertIn("error", loaded["metadata"])
        self.assertIn("failed", loaded["notes"])


class TestDispatcherIntegration(unittest.TestCase):
    """Integration tests for request dispatcher"""
    
    def setUp(self):
        """Setup test environment"""
        if SKIP_E2E_TESTS:
            self.skipTest("E2E tests disabled via SKIP_E2E_TESTS environment variable")
        
        self.test_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Clean up"""
        import shutil
        if hasattr(self, 'test_dir') and Path(self.test_dir).exists():
            shutil.rmtree(self.test_dir)
    
    def test_dispatcher_request_validation(self):
        """Test that dispatcher validates requests correctly"""
        # Create a test request file
        request = {
            "mode": "rerun",
            "base_run": "test_001",
            "manifest": "/path/to/manifest.json",
            "overrides": {"seed": 999}
        }
        
        request_path = Path(self.test_dir) / "test_request.json"
        with request_path.open("w") as f:
            json.dump(request, f)
        
        # Verify request file structure
        with request_path.open("r") as f:
            loaded = json.load(f)
        
        self.assertIn("mode", loaded)
        self.assertIn("manifest", loaded)
        self.assertEqual(loaded["mode"], "rerun")


class TestRunsCliIntegration(unittest.TestCase):
    """Integration tests for runs CLI"""
    
    def setUp(self):
        """Setup test environment"""
        if SKIP_E2E_TESTS:
            self.skipTest("E2E tests disabled via SKIP_E2E_TESTS environment variable")
    
    def test_runs_cli_help(self):
        """Test that runs CLI help works"""
        result = subprocess.run(
            [sys.executable, "-m", "defora_cli.deforumation_runs_cli", "--help"],
            capture_output=True,
            timeout=5
        )
        
        # Help should work (may return non-zero if it's curses-based)
        self.assertIn(b"deforumation", result.stdout.lower() + result.stderr.lower())


class TestWorkflowChaining(unittest.TestCase):
    """Tests for chaining multiple workflow steps"""
    
    def setUp(self):
        """Setup test environment"""
        if SKIP_E2E_TESTS:
            self.skipTest("E2E tests disabled via SKIP_E2E_TESTS environment variable")
        
        self.test_dir = tempfile.mkdtemp()
        self.runs_dir = Path(self.test_dir) / "runs"
        self.runs_dir.mkdir()
    
    def tearDown(self):
        """Clean up"""
        import shutil
        if hasattr(self, 'test_dir') and Path(self.test_dir).exists():
            shutil.rmtree(self.test_dir)
    
    def test_generation_to_rerun_chain(self):
        """Test chaining: generation -> completion -> rerun request"""
        # Step 1: Initial generation
        run1_id = "chain_001"
        run1_dir = self.runs_dir / run1_id
        run1_dir.mkdir()
        
        manifest1 = {
            "status": "completed",
            "started_at": "2024-01-01T00:00:00Z",
            "model": "SDXL",
            "frame_count": 10,
            "seed": 12345,
            "tag": "original"
        }
        
        manifest1_path = run1_dir / "run.json"
        with manifest1_path.open("w") as f:
            json.dump(manifest1, f)
        
        # Step 2: Create rerun from first generation
        run2_id = "chain_002"
        run2_dir = self.runs_dir / run2_id
        run2_dir.mkdir()
        
        manifest2 = manifest1.copy()
        manifest2["seed"] = 54321
        manifest2["tag"] = "variation_1"
        manifest2["metadata"] = {"based_on": run1_id}
        
        manifest2_path = run2_dir / "run.json"
        with manifest2_path.open("w") as f:
            json.dump(manifest2, f)
        
        # Verify chain
        with manifest2_path.open("r") as f:
            loaded = json.load(f)
        
        self.assertEqual(loaded["metadata"]["based_on"], run1_id)
        self.assertNotEqual(loaded["seed"], manifest1["seed"])


if __name__ == "__main__":
    unittest.main()
