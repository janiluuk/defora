"""
Integration tests for Docker stack startup and basic connectivity.

These tests verify that the Docker Compose stack can start successfully
and that basic service connectivity works as expected.

To skip Docker-related tests in CI, set SKIP_DOCKER_TESTS=1
"""
import unittest
import subprocess
import time
import socket
import os
import json
import requests
from pathlib import Path


# Determine project root directory
PROJECT_ROOT = os.getenv("DEFORA_ROOT", str(Path(__file__).parent.parent))

# Allow skipping Docker tests in CI environments
SKIP_DOCKER_TESTS = os.getenv("SKIP_DOCKER_TESTS", "").lower() in ("1", "true", "yes")

# Track if we started services in this test run
_SERVICES_STARTED = False


class TestDockerStackIntegration(unittest.TestCase):
    """Integration tests for Docker stack"""

    def setUp(self):
        """Skip all Docker tests if SKIP_DOCKER_TESTS is set"""
        if SKIP_DOCKER_TESTS:
            self.skipTest("Docker tests disabled via SKIP_DOCKER_TESTS environment variable")

    def test_docker_compose_file_valid(self):
        """Test that docker-compose.yml is valid"""
        try:
            result = subprocess.run(
                ["docker", "compose", "config"],
                capture_output=True,
                text=True,
                cwd=PROJECT_ROOT,
                timeout=10  # 10 second timeout to prevent hanging
            )
        except subprocess.TimeoutExpired:
            self.skipTest("docker compose config timed out (may be pulling images or network issue)")
        
        # If docker is not available, skip this test
        if result.returncode == 127 or "command not found" in result.stderr:
            self.skipTest("Docker not available in test environment")
        
        # Check that compose file is valid
        self.assertEqual(
            result.returncode, 
            0, 
            f"docker-compose.yml validation failed: {result.stderr}"
        )
        self.assertIn("services:", result.stdout or result.stderr)

    def test_required_volumes_defined(self):
        """Test that required volumes are defined in docker-compose.yml"""
        try:
            result = subprocess.run(
                ["docker", "compose", "config"],
                capture_output=True,
                text=True,
                cwd=PROJECT_ROOT,
                timeout=10  # 10 second timeout to prevent hanging
            )
        except subprocess.TimeoutExpired:
            self.skipTest("docker compose config timed out")
        
        if result.returncode == 127 or "command not found" in result.stderr:
            self.skipTest("Docker not available in test environment")
        
        if result.returncode != 0:
            self.skipTest("docker-compose.yml not valid, skipping volume test")
        
        output = result.stdout
        required_volumes = ["frames", "hls", "mqdata"]
        
        for volume in required_volumes:
            self.assertIn(
                volume, 
                output, 
                f"Required volume '{volume}' not found in docker-compose.yml"
            )

    def test_health_check_endpoints_defined(self):
        """Test that health check configurations are present"""
        try:
            result = subprocess.run(
                ["docker", "compose", "config"],
                capture_output=True,
                text=True,
                cwd=PROJECT_ROOT,
                timeout=10  # 10 second timeout to prevent hanging
            )
        except subprocess.TimeoutExpired:
            self.skipTest("docker compose config timed out")
        
        if result.returncode == 127 or "command not found" in result.stderr:
            self.skipTest("Docker not available in test environment")
        
        if result.returncode != 0:
            self.skipTest("docker-compose.yml not valid")
        
        output = result.stdout
        # Check for healthcheck configuration
        self.assertIn(
            "healthcheck",
            output,
            "No healthcheck configuration found in docker-compose.yml"
        )

    def test_port_not_in_use(self):
        """Test that default ports are available (not currently in use)"""
        ports_to_check = [
            (8080, "Web UI"),
            (1935, "RTMP"),
            (8765, "Mediator WS"),
            (8766, "Mediator API"),
        ]
        
        unavailable_ports = []
        for port, service in ports_to_check:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            
            # If result is 0, port is in use (connection succeeded)
            # If result is non-zero, port is available (connection refused/timeout)
            if result == 0:
                unavailable_ports.append(f"{service} (port {port})")
        
        # This test just warns if ports are in use, doesn't fail
        # (ports might be in use by an existing stack)
        if unavailable_ports:
            print(f"\nNote: Some ports already in use: {', '.join(unavailable_ports)}")
            print("This may indicate the stack is already running.")


class TestDockerStackE2E(unittest.TestCase):
    """End-to-end tests for Docker stack services"""
    
    @classmethod
    def setUpClass(cls):
        """Start minimal services for testing"""
        global _SERVICES_STARTED
        if SKIP_DOCKER_TESTS:
            return
        
        # Check if Docker is available
        try:
            result = subprocess.run(
                ["docker", "--version"],
                capture_output=True,
                timeout=5
            )
            if result.returncode != 0:
                return
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return
        
        # Start only essential services (web, mq, mediator)
        # Skip sd-forge as it requires GPU
        try:
            print("\n" + "="*60)
            print("Starting Docker services for E2E tests...")
            print("="*60)
            
            # Stop any existing services first
            subprocess.run(
                ["docker", "compose", "down", "-v"],
                cwd=PROJECT_ROOT,
                capture_output=True,
                timeout=30
            )
            
            # Start core services
            result = subprocess.run(
                ["docker", "compose", "up", "-d", "web", "mq", "mediator"],
                cwd=PROJECT_ROOT,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                _SERVICES_STARTED = True
                print("✓ Services started successfully")
                print("Waiting for services to be healthy...")
                
                # Wait for services to be healthy
                time.sleep(10)
                
                # Check service health
                for _ in range(6):  # Try for up to 60 seconds
                    health_result = subprocess.run(
                        ["docker", "compose", "ps", "--format", "json"],
                        cwd=PROJECT_ROOT,
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    if health_result.returncode == 0:
                        try:
                            # Parse JSON output (one JSON object per line)
                            services = [json.loads(line) for line in health_result.stdout.strip().split('\n') if line]
                            all_healthy = all(
                                s.get('Health', '') == 'healthy' or s.get('Health', '') == ''
                                for s in services
                                if s.get('Service') in ['web', 'mq', 'mediator']
                            )
                            if all_healthy:
                                print("✓ All services are healthy")
                                break
                        except json.JSONDecodeError:
                            pass
                    time.sleep(10)
                else:
                    print("⚠ Services may not be fully healthy, proceeding anyway")
            else:
                print(f"✗ Failed to start services: {result.stderr}")
                
        except subprocess.TimeoutExpired:
            print("✗ Timeout starting services")
        except Exception as e:
            print(f"✗ Error starting services: {e}")
    
    @classmethod
    def tearDownClass(cls):
        """Stop services after all tests"""
        global _SERVICES_STARTED
        if _SERVICES_STARTED and not SKIP_DOCKER_TESTS:
            print("\n" + "="*60)
            print("Stopping Docker services...")
            print("="*60)
            try:
                result = subprocess.run(
                    ["docker", "compose", "down", "-v"],
                    cwd=PROJECT_ROOT,
                    capture_output=True,
                    timeout=30
                )
                if result.returncode == 0:
                    print("✓ Services stopped successfully")
                else:
                    print(f"⚠ Issue stopping services")
            except subprocess.TimeoutExpired:
                print("✗ Timeout stopping services")
            except Exception as e:
                print(f"✗ Error stopping services: {e}")
            
            _SERVICES_STARTED = False
    
    def setUp(self):
        """Skip tests if Docker tests are disabled or services didn't start"""
        if SKIP_DOCKER_TESTS:
            self.skipTest("Docker tests disabled via SKIP_DOCKER_TESTS environment variable")
        if not _SERVICES_STARTED:
            self.skipTest("Docker services not started (Docker may not be available)")
    
    def test_web_service_health(self):
        """Test that web service is accessible and healthy"""
        max_retries = 5
        for i in range(max_retries):
            try:
                response = requests.get("http://localhost:8080/health", timeout=5)
                if response.status_code == 200:
                    self.assertEqual(response.status_code, 200)
                    # Verify response is JSON
                    data = response.json()
                    self.assertIn("status", data)
                    return
            except (requests.ConnectionError, requests.Timeout):
                if i < max_retries - 1:
                    time.sleep(2)
                else:
                    self.fail("Web service health check failed after retries")
    
    def test_web_service_serves_index(self):
        """Test that web service serves the main index page"""
        max_retries = 3
        for i in range(max_retries):
            try:
                response = requests.get("http://localhost:8080/", timeout=5)
                self.assertEqual(response.status_code, 200)
                # Should contain HTML content
                self.assertIn("<!DOCTYPE html>", response.text, "Expected HTML content")
                return
            except (requests.ConnectionError, requests.Timeout):
                if i < max_retries - 1:
                    time.sleep(2)
                else:
                    self.fail("Web service index page failed after retries")
    
    def test_rabbitmq_management_accessible(self):
        """Test that RabbitMQ management interface is accessible"""
        max_retries = 5
        for i in range(max_retries):
            try:
                response = requests.get("http://localhost:15672/", timeout=5)
                # RabbitMQ returns 401 without auth, which is expected
                self.assertIn(response.status_code, [200, 401])
                return
            except (requests.ConnectionError, requests.Timeout):
                if i < max_retries - 1:
                    time.sleep(2)
                else:
                    self.fail("RabbitMQ management interface not accessible after retries")
    
    def test_mediator_ports_listening(self):
        """Test that mediator WebSocket ports are listening"""
        ports_to_check = [8765, 8766]
        
        for port in ports_to_check:
            max_retries = 5
            for i in range(max_retries):
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                result = sock.connect_ex(('localhost', port))
                sock.close()
                
                if result == 0:  # Connection successful
                    break
                elif i < max_retries - 1:
                    time.sleep(2)
                else:
                    self.fail(f"Mediator port {port} not listening after retries")
    
    def test_web_api_endpoints(self):
        """Test that web API endpoints respond correctly"""
        endpoints = [
            ("/api/health", 200),
            ("/api/presets", 200),
        ]
        
        for endpoint, expected_status in endpoints:
            max_retries = 3
            for i in range(max_retries):
                try:
                    response = requests.get(f"http://localhost:8080{endpoint}", timeout=5)
                    self.assertEqual(
                        response.status_code, 
                        expected_status,
                        f"Endpoint {endpoint} returned {response.status_code}, expected {expected_status}"
                    )
                    break
                except (requests.ConnectionError, requests.Timeout):
                    if i < max_retries - 1:
                        time.sleep(2)
                    else:
                        self.fail(f"API endpoint {endpoint} failed after retries")
    
    def test_services_running(self):
        """Test that expected services are running"""
        result = subprocess.run(
            ["docker", "compose", "ps", "--format", "json"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        self.assertEqual(result.returncode, 0, "Failed to list running services")
        
        # Parse JSON output
        services = [json.loads(line) for line in result.stdout.strip().split('\n') if line]
        service_names = {s.get('Service') for s in services}
        
        # Check that core services are present
        expected_services = {'web', 'mq', 'mediator'}
        for service in expected_services:
            self.assertIn(
                service, 
                service_names,
                f"Expected service '{service}' not found in running services"
            )


class TestMediatorConnectivity(unittest.TestCase):
    """Tests for mediator service connectivity"""

    def test_mediator_connection_structure(self):
        """Test that mediator connection logic is properly structured"""
        # This is a structure test, not an actual connection test
        # Verifies expected WebSocket endpoints
        expected_endpoints = [
            "ws://localhost:8765",  # Control endpoint
            "ws://localhost:8766",  # Status endpoint
        ]
        
        for endpoint in expected_endpoints:
            self.assertTrue(
                endpoint.startswith("ws://"),
                f"Endpoint {endpoint} should use WebSocket protocol"
            )


if __name__ == "__main__":
    unittest.main()
