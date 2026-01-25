import unittest

from defora_cli.run_manifest_schema import validate_run_manifest


class TestRunManifestSchema(unittest.TestCase):
    def test_valid_manifest(self):
        blob = {
            "status": "completed",
            "started_at": "2024-01-01T00:00:00Z",
            "model": "SDXL",
            "frame_count": 120,
            "last_frame": "runs/id/frame_0119.png",
            "prompt_positive": "test prompt",
            "prompt_negative": "bad stuff",
            "seed": 42,
            "steps": 24,
            "strength": 0.65,
            "cfg": 6.5,
            "tag": "demo",
        }
        self.assertEqual(validate_run_manifest(blob), blob)
    
    def test_valid_manifest_with_notes_and_metadata(self):
        """Test that manifest with notes and metadata passes validation."""
        blob = {
            "status": "completed",
            "started_at": "2024-01-01T00:00:00Z",
            "model": "SDXL",
            "frame_count": 120,
            "tag": "demo",
            "notes": "This is a test run with custom notes",
            "metadata": {
                "custom_key": "custom_value",
                "another_key": 123,
            }
        }
        result = validate_run_manifest(blob)
        self.assertEqual(result, blob)
        self.assertIn("notes", result)
        self.assertIn("metadata", result)
        self.assertEqual(result["notes"], "This is a test run with custom notes")
        self.assertEqual(result["metadata"]["custom_key"], "custom_value")

    def test_missing_required_fields(self):
        with self.assertRaises(ValueError):
            validate_run_manifest({})

    def test_wrong_types(self):
        blob = {
            "status": 5,  # wrong
            "started_at": "now",
            "model": "SDXL",
            "frame_count": "ten",  # wrong
        }
        with self.assertRaises(ValueError):
            validate_run_manifest(blob)


if __name__ == "__main__":
    unittest.main()
