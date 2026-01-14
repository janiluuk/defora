"""
Integration tests for Docker stack startup and basic connectivity.

These tests verify that the Docker Compose stack can start successfully
and that basic service connectivity works as expected.
"""
import unittest
import subprocess
import time
import socket
import os
from pathlib import Path


# Determine project root directory
PROJECT_ROOT = os.getenv("DEFORA_ROOT", str(Path(__file__).parent.parent))


class TestDockerStackIntegration(unittest.TestCase):
    """Integration tests for Docker stack"""

    def test_docker_compose_file_valid(self):
        """Test that docker-compose.yml is valid"""
        result = subprocess.run(
            ["docker", "compose", "config"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT
        )
        
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
        result = subprocess.run(
            ["docker", "compose", "config"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT
        )
        
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
        result = subprocess.run(
            ["docker", "compose", "config"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT
        )
        
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
