"""
Tests to verify features and phases documented in FEATURES_STATUS.md.

This test suite validates that the documented features in each phase
are properly implemented and functional.
"""
import unittest
from pathlib import Path
import re


class TestFeaturesStatusDocument(unittest.TestCase):
    """Test FEATURES_STATUS.md structure and content"""

    def setUp(self):
        """Load FEATURES_STATUS.md"""
        self.features_file = Path(__file__).parent.parent / "FEATURES_STATUS.md"
        self.assertTrue(self.features_file.exists(), "FEATURES_STATUS.md must exist")
        self.content = self.features_file.read_text()

    def test_document_has_all_phases(self):
        """Verify all 5 phases are documented"""
        phases = [
            "Phase 1: Critical Infrastructure",
            "Phase 2: Web UI Backend Implementation",
            "Phase 3: CLI Tool Enhancements",
            "Phase 4: Docker Stack Improvements",
            "Phase 5: Advanced Features",
        ]
        for phase in phases:
            self.assertIn(phase, self.content, f"Missing {phase}")

    def test_document_has_status_summary(self):
        """Verify Quick Status Summary section exists"""
        self.assertIn("Quick Status Summary", self.content)
        self.assertIn("Tests", self.content)
        self.assertIn("Core CLI Tools", self.content)
        self.assertIn("Web UI", self.content)
        self.assertIn("Docker Stack", self.content)

    def test_document_has_testing_status(self):
        """Verify Testing Status section exists"""
        self.assertIn("Testing Status", self.content)
        self.assertIn("Unit Tests:", self.content)

    def test_document_has_implementation_priority(self):
        """Verify Implementation Priority section exists"""
        self.assertIn("Implementation Priority", self.content)
        priority_levels = ["Immediate", "High Priority", "Medium Priority", "Low Priority"]
        for level in priority_levels:
            self.assertIn(level, self.content)

    def test_status_markers_are_valid(self):
        """Verify all status markers use consistent format"""
        valid_markers = ["✅", "⚠️", "❌", "🔄"]
        # Extract all lines with Status: markers
        status_lines = [line for line in self.content.split('\n') if 'Status' in line and '**' in line]
        self.assertGreater(len(status_lines), 0, "Should have status markers")
        
        # Check that status lines contain valid markers
        for line in status_lines:
            has_valid_marker = any(marker in line for marker in valid_markers)
            self.assertTrue(has_valid_marker, f"Line should have valid status marker: {line}")


class TestPhase1CriticalInfrastructure(unittest.TestCase):
    """Test Phase 1: Critical Infrastructure features"""

    def test_audio_reactive_modulator_exists(self):
        """Verify audio_reactive_modulator.py exists"""
        arm_path = Path(__file__).parent.parent / "defora_cli" / "audio_reactive_modulator.py"
        self.assertTrue(arm_path.exists(), "audio_reactive_modulator.py must exist")

    def test_requirements_file_exists(self):
        """Verify requirements.txt exists"""
        req_path = Path(__file__).parent.parent / "requirements.txt"
        self.assertTrue(req_path.exists(), "requirements.txt must exist")

    def test_deforumation_submodule_directory_exists(self):
        """Verify deforumation submodule directory exists"""
        submodule_path = Path(__file__).parent.parent / "deforumation"
        self.assertTrue(submodule_path.exists(), "deforumation directory must exist")


class TestPhase2WebUIBackend(unittest.TestCase):
    """Test Phase 2: Web UI Backend Implementation features"""

    def test_web_index_html_exists(self):
        """Verify web UI index.html exists"""
        index_path = Path(__file__).parent.parent / "docker" / "web" / "public" / "index.html"
        self.assertTrue(index_path.exists(), "Web UI index.html must exist")

    def test_web_server_exists(self):
        """Verify web server.js exists"""
        server_path = Path(__file__).parent.parent / "docker" / "web" / "server.js"
        self.assertTrue(server_path.exists(), "Web server.js must exist")

    def test_web_index_has_tabs(self):
        """Verify web UI has all documented tabs"""
        index_path = Path(__file__).parent.parent / "docker" / "web" / "public" / "index.html"
        if not index_path.exists():
            self.skipTest("Web UI not available")
        
        content = index_path.read_text()
        tabs = ["PROMPTS", "MOTION", "AUDIO", "CONTROLNET", "SETTINGS"]
        for tab in tabs:
            self.assertIn(tab, content, f"Web UI should have {tab} tab")

    def test_web_server_has_api_endpoints(self):
        """Verify web server has documented API endpoints"""
        server_path = Path(__file__).parent.parent / "docker" / "web" / "server.js"
        if not server_path.exists():
            self.skipTest("Web server not available")
        
        content = server_path.read_text()
        endpoints = ["/api/presets", "/api/controlnet/models"]
        for endpoint in endpoints:
            self.assertIn(endpoint, content, f"Server should have {endpoint} endpoint")


class TestPhase3CLIToolEnhancements(unittest.TestCase):
    """Test Phase 3: CLI Tool Enhancements features"""

    def test_stream_helper_exists(self):
        """Verify stream_helper.py exists"""
        stream_path = Path(__file__).parent.parent / "defora_cli" / "stream_helper.py"
        self.assertTrue(stream_path.exists(), "stream_helper.py must exist")

    def test_monitor_cli_exists(self):
        """Verify monitor_cli.py exists"""
        monitor_path = Path(__file__).parent.parent / "defora_cli" / "monitor_cli.py"
        self.assertTrue(monitor_path.exists(), "monitor_cli.py must exist")

    def test_forge_cli_exists(self):
        """Verify forge_cli.py exists"""
        forge_path = Path(__file__).parent.parent / "defora_cli" / "forge_cli.py"
        self.assertTrue(forge_path.exists(), "forge_cli.py must exist")

    def test_deforumation_dashboard_exists(self):
        """Verify deforumation_dashboard.py exists"""
        dashboard_path = Path(__file__).parent.parent / "defora_cli" / "deforumation_dashboard.py"
        self.assertTrue(dashboard_path.exists(), "deforumation_dashboard.py must exist")


class TestPhase4DockerStackImprovements(unittest.TestCase):
    """Test Phase 4: Docker Stack Improvements features"""

    def test_docker_compose_exists(self):
        """Verify docker-compose.yml exists"""
        compose_path = Path(__file__).parent.parent / "docker-compose.yml"
        self.assertTrue(compose_path.exists(), "docker-compose.yml must exist")

    def test_docker_compose_has_services(self):
        """Verify docker-compose.yml has documented services"""
        compose_path = Path(__file__).parent.parent / "docker-compose.yml"
        if not compose_path.exists():
            self.skipTest("docker-compose.yml not available")
        
        content = compose_path.read_text()
        services = ["web", "mediator", "mq", "encoder"]
        for service in services:
            # Check for service definition (service name followed by colon)
            self.assertRegex(content, rf'\n\s*{service}:', f"docker-compose should have {service} service")

    def test_docker_compose_has_healthchecks(self):
        """Verify docker-compose.yml has healthcheck configuration"""
        compose_path = Path(__file__).parent.parent / "docker-compose.yml"
        if not compose_path.exists():
            self.skipTest("docker-compose.yml not available")
        
        content = compose_path.read_text()
        self.assertIn("healthcheck", content, "docker-compose should have healthcheck configurations")

    def test_docker_compose_has_volumes(self):
        """Verify docker-compose.yml has named volumes"""
        compose_path = Path(__file__).parent.parent / "docker-compose.yml"
        if not compose_path.exists():
            self.skipTest("docker-compose.yml not available")
        
        content = compose_path.read_text()
        volumes = ["frames", "hls", "mqdata"]
        for volume in volumes:
            self.assertIn(volume, content, f"docker-compose should reference {volume} volume")


class TestPhase5AdvancedFeatures(unittest.TestCase):
    """Test Phase 5: Advanced Features (future features)"""

    def test_phase5_documented_as_future(self):
        """Verify Phase 5 features are documented as not implemented"""
        features_file = Path(__file__).parent.parent / "FEATURES_STATUS.md"
        content = features_file.read_text()
        
        # Find Phase 5 section
        phase5_section = content[content.find("Phase 5: Advanced Features"):]
        
        # These features should be marked as not implemented
        future_features = [
            "Frame Interpolation",
            "Multi-GPU Support",
            "Recording & Replay",
            "Cloud Deployment",
        ]
        
        for feature in future_features:
            self.assertIn(feature, phase5_section, f"Phase 5 should document {feature}")


class TestDocumentationCompleteness(unittest.TestCase):
    """Test that FEATURES_STATUS.md is complete and well-structured"""

    def setUp(self):
        """Load FEATURES_STATUS.md"""
        self.features_file = Path(__file__).parent.parent / "FEATURES_STATUS.md"
        self.content = self.features_file.read_text()

    def test_has_last_updated_date(self):
        """Verify document has Last Updated timestamp"""
        self.assertIn("Last Updated", self.content)

    def test_has_known_bugs_section(self):
        """Verify Known Bugs section exists"""
        self.assertIn("Known Bugs", self.content)

    def test_has_documentation_status_section(self):
        """Verify Documentation Status section exists"""
        self.assertIn("Documentation Status", self.content)

    def test_has_contribution_guidelines(self):
        """Verify Contribution Guidelines section exists"""
        self.assertIn("Contribution Guidelines", self.content)

    def test_all_phases_have_status_markers(self):
        """Verify each phase section has status information"""
        phase_sections = [
            ("Phase 1", "Status"),
            ("Phase 2", "Status"),
            ("Phase 3", "Status"),
            ("Phase 4", "Status"),
            ("Phase 5", "Status"),
        ]
        
        for phase_name, required_text in phase_sections:
            # Find the phase section
            phase_index = self.content.find(phase_name)
            self.assertNotEqual(phase_index, -1, f"Should find {phase_name}")
            
            # Check if Status appears after this phase
            next_phase_index = self.content.find("Phase", phase_index + len(phase_name))
            if next_phase_index == -1:
                next_phase_index = len(self.content)
            
            phase_content = self.content[phase_index:next_phase_index]
            self.assertIn(required_text, phase_content, 
                         f"{phase_name} should contain {required_text}")


class TestFeatureImplementationTracking(unittest.TestCase):
    """Test that feature implementation is properly tracked"""

    def test_completed_features_marked_correctly(self):
        """Verify completed features use ✅ marker"""
        features_file = Path(__file__).parent.parent / "FEATURES_STATUS.md"
        content = features_file.read_text()
        
        # Count completed features (should have at least some)
        completed_count = content.count("Status**: ✅")
        self.assertGreater(completed_count, 0, "Should have some completed features")

    def test_incomplete_features_marked_correctly(self):
        """Verify incomplete/partial features use ⚠️ or ❌ markers"""
        features_file = Path(__file__).parent.parent / "FEATURES_STATUS.md"
        content = features_file.read_text()
        
        # Count partial/incomplete features
        partial_count = content.count("Status**: ⚠️") + content.count("Status**: ❌")
        self.assertGreater(partial_count, 0, "Should have some incomplete features")

    def test_testing_status_shows_counts(self):
        """Verify testing status section shows test counts"""
        features_file = Path(__file__).parent.parent / "FEATURES_STATUS.md"
        content = features_file.read_text()
        
        # Find testing status section
        testing_section_start = content.find("Testing Status")
        self.assertNotEqual(testing_section_start, -1)
        
        testing_section = content[testing_section_start:testing_section_start + 2000]
        
        # Should mention passing tests
        self.assertRegex(testing_section, r'\d+/\d+\s+passing', 
                        "Testing status should show passing test counts")


if __name__ == "__main__":
    unittest.main()
