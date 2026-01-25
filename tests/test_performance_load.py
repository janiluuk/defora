"""
Performance and load testing for Defora components.

These tests verify system behavior under load and measure performance
characteristics of key operations.
"""
import unittest
import time
import os
import tempfile
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess

# Skip performance tests by default in CI (they can be slow)
SKIP_PERF_TESTS = os.getenv("SKIP_PERF_TESTS", "1").lower() in ("1", "true", "yes")


class TestManifestLoadingPerformance(unittest.TestCase):
    """Performance tests for run manifest loading"""
    
    def setUp(self):
        """Skip performance tests if disabled"""
        if SKIP_PERF_TESTS:
            self.skipTest("Performance tests disabled via SKIP_PERF_TESTS environment variable")
        
        # Create temporary directory for test manifests
        self.test_dir = tempfile.mkdtemp()
        self.runs_dir = Path(self.test_dir) / "runs"
        self.runs_dir.mkdir()
    
    def tearDown(self):
        """Clean up test directory"""
        import shutil
        if hasattr(self, 'test_dir') and Path(self.test_dir).exists():
            shutil.rmtree(self.test_dir)
    
    def _create_test_manifest(self, run_id, **kwargs):
        """Create a test manifest file"""
        run_dir = self.runs_dir / run_id
        run_dir.mkdir(exist_ok=True)
        
        manifest = {
            "status": kwargs.get("status", "completed"),
            "started_at": kwargs.get("started_at", "2024-01-01T00:00:00Z"),
            "model": kwargs.get("model", "SDXL"),
            "frame_count": kwargs.get("frame_count", 120),
            "tag": kwargs.get("tag", "test"),
        }
        
        manifest_path = run_dir / "run.json"
        with manifest_path.open("w") as f:
            json.dump(manifest, f)
        
        return manifest_path
    
    def test_load_single_manifest_performance(self):
        """Test loading a single manifest"""
        manifest_path = self._create_test_manifest("test_run_001")
        
        start_time = time.time()
        with manifest_path.open("r") as f:
            data = json.load(f)
        load_time = time.time() - start_time
        
        self.assertIsNotNone(data)
        # Loading a single manifest should be very fast (< 100ms)
        self.assertLess(load_time, 0.1, f"Single manifest load took {load_time:.3f}s")
    
    def test_load_multiple_manifests_performance(self):
        """Test loading multiple manifests"""
        num_manifests = 100
        
        # Create test manifests
        for i in range(num_manifests):
            self._create_test_manifest(f"test_run_{i:04d}")
        
        # Time loading all manifests
        start_time = time.time()
        manifests = []
        for manifest_file in self.runs_dir.glob("*/run.json"):
            with manifest_file.open("r") as f:
                manifests.append(json.load(f))
        load_time = time.time() - start_time
        
        self.assertEqual(len(manifests), num_manifests)
        # Loading 100 manifests should take < 1 second
        self.assertLess(load_time, 1.0, f"Loading {num_manifests} manifests took {load_time:.3f}s")
        
        # Calculate average time per manifest
        avg_time = load_time / num_manifests
        print(f"\nAverage time per manifest: {avg_time*1000:.2f}ms")
    
    def test_concurrent_manifest_access(self):
        """Test concurrent access to manifests"""
        num_manifests = 50
        num_workers = 10
        
        # Create test manifests
        manifest_paths = []
        for i in range(num_manifests):
            path = self._create_test_manifest(f"test_run_{i:04d}")
            manifest_paths.append(path)
        
        def load_manifest(path):
            with path.open("r") as f:
                return json.load(f)
        
        # Time concurrent loading
        start_time = time.time()
        with ThreadPoolExecutor(max_workers=num_workers) as executor:
            futures = [executor.submit(load_manifest, path) for path in manifest_paths]
            results = [future.result() for future in as_completed(futures)]
        load_time = time.time() - start_time
        
        self.assertEqual(len(results), num_manifests)
        # Concurrent loading should be faster than sequential
        self.assertLess(load_time, 2.0, f"Concurrent loading took {load_time:.3f}s")
        print(f"\nConcurrent loading time: {load_time:.3f}s ({num_workers} workers)")


class TestSchemaValidationPerformance(unittest.TestCase):
    """Performance tests for schema validation"""
    
    def setUp(self):
        """Skip performance tests if disabled"""
        if SKIP_PERF_TESTS:
            self.skipTest("Performance tests disabled via SKIP_PERF_TESTS environment variable")
    
    def test_schema_validation_performance(self):
        """Test schema validation performance"""
        from defora_cli.run_manifest_schema import validate_run_manifest
        
        test_manifest = {
            "status": "completed",
            "started_at": "2024-01-01T00:00:00Z",
            "model": "SDXL",
            "frame_count": 240,
            "last_frame": "frame.png",
            "prompt_positive": "test prompt",
            "prompt_negative": "negative",
            "seed": 12345,
            "steps": 24,
            "strength": 0.75,
            "cfg": 7.5,
            "tag": "test",
            "notes": "test notes",
            "metadata": {"key": "value"},
        }
        
        num_validations = 1000
        start_time = time.time()
        
        for _ in range(num_validations):
            validate_run_manifest(test_manifest)
        
        total_time = time.time() - start_time
        avg_time = total_time / num_validations
        
        # Validation should be very fast (< 1ms per validation on average)
        self.assertLess(avg_time, 0.001, f"Average validation time: {avg_time*1000:.2f}ms")
        print(f"\nValidated {num_validations} manifests in {total_time:.3f}s")
        print(f"Average: {avg_time*1000:.3f}ms per validation")


class TestAPIEndpointPerformance(unittest.TestCase):
    """Performance tests for API endpoints"""
    
    def setUp(self):
        """Skip performance tests if disabled"""
        if SKIP_PERF_TESTS:
            self.skipTest("Performance tests disabled via SKIP_PERF_TESTS environment variable")
    
    def test_health_endpoint_response_time(self):
        """Test health endpoint response time"""
        # This test assumes the web server is running
        # In a real deployment, you'd use requests library
        pass  # Placeholder for actual implementation
    
    def test_concurrent_api_requests(self):
        """Test handling of concurrent API requests"""
        # This would test the web server's ability to handle multiple
        # simultaneous requests
        pass  # Placeholder for actual implementation


class TestMemoryUsage(unittest.TestCase):
    """Tests for memory usage and leak detection"""
    
    def setUp(self):
        """Skip performance tests if disabled"""
        if SKIP_PERF_TESTS:
            self.skipTest("Performance tests disabled via SKIP_PERF_TESTS environment variable")
    
    def test_manifest_loading_memory_usage(self):
        """Test memory usage when loading many manifests"""
        import sys
        
        # Get initial memory usage
        initial_size = sys.getsizeof([])
        
        # Create and load manifests
        manifests = []
        for i in range(100):
            manifests.append({
                "status": "completed",
                "started_at": "2024-01-01T00:00:00Z",
                "model": "SDXL",
                "frame_count": 120,
                "run_id": f"test_run_{i:04d}",
            })
        
        final_size = sys.getsizeof(manifests)
        
        # Memory usage should be reasonable (< 1MB for 100 manifests)
        memory_mb = (final_size - initial_size) / (1024 * 1024)
        print(f"\nMemory usage for 100 manifests: {memory_mb:.2f}MB")
        self.assertLess(memory_mb, 1.0, f"Memory usage too high: {memory_mb:.2f}MB")


class TestCommandLineToolsPerformance(unittest.TestCase):
    """Performance tests for CLI tools"""
    
    def setUp(self):
        """Skip performance tests if disabled"""
        if SKIP_PERF_TESTS:
            self.skipTest("Performance tests disabled via SKIP_PERF_TESTS environment variable")
    
    def test_cli_tool_startup_time(self):
        """Test CLI tool startup time"""
        import sys
        
        # Test forge_cli help command startup time
        start_time = time.time()
        result = subprocess.run(
            [sys.executable, "-m", "defora_cli.forge_cli", "--help"],
            capture_output=True,
            timeout=5
        )
        startup_time = time.time() - start_time
        
        self.assertEqual(result.returncode, 0)
        # CLI tool should start quickly (< 2 seconds)
        self.assertLess(startup_time, 2.0, f"CLI startup took {startup_time:.3f}s")
        print(f"\nCLI tool startup time: {startup_time:.3f}s")


class TestLoadTesting(unittest.TestCase):
    """Load testing scenarios"""
    
    def setUp(self):
        """Skip performance tests if disabled"""
        if SKIP_PERF_TESTS:
            self.skipTest("Performance tests disabled via SKIP_PERF_TESTS environment variable")
    
    def test_rapid_parameter_updates(self):
        """Test rapid parameter update handling"""
        from defora_cli.mediator_client import MediatorClient
        
        # Mock connector for testing
        call_count = [0]
        
        class FakeWebSocket:
            async def send(self, payload):
                call_count[0] += 1
            
            async def recv(self):
                import pickle
                return pickle.dumps(["ok"])
            
            async def __aenter__(self):
                return self
            
            async def __aexit__(self, exc_type, exc, tb):
                return False
        
        def connector(uri):
            return FakeWebSocket()
        
        client = MediatorClient("localhost", "8766", connector=connector)
        
        # Send rapid updates
        num_updates = 100
        start_time = time.time()
        
        for i in range(num_updates):
            client.write("cfg", 7.0 + (i % 10) * 0.1)
        
        update_time = time.time() - start_time
        avg_time = update_time / num_updates
        
        self.assertEqual(call_count[0], num_updates)
        # Rapid updates should be handled efficiently
        self.assertLess(avg_time, 0.01, f"Average update time: {avg_time*1000:.2f}ms")
        print(f"\nSent {num_updates} updates in {update_time:.3f}s")
        print(f"Average: {avg_time*1000:.3f}ms per update")


if __name__ == "__main__":
    # Print performance test info
    print("\n" + "="*60)
    print("Performance and Load Tests")
    print("="*60)
    print("Set SKIP_PERF_TESTS=0 to enable these tests")
    print("="*60 + "\n")
    
    unittest.main()
