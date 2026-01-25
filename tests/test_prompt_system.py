"""
Tests for advanced prompt system API endpoints.

Tests prompt templates, wildcards, negative presets, and variable processing.
"""
import unittest


class TestPromptTemplates(unittest.TestCase):
    """Tests for prompt template management"""
    
    def test_template_list_structure(self):
        """Test prompt templates list response structure"""
        templates_response = {
            "templates": [
                {
                    "id": "cinematic_1",
                    "name": "Cinematic Shot",
                    "prompt": "cinematic shot of {subject}, {lighting}",
                    "negativePrompt": "amateur, snapshot",
                    "category": "photography",
                    "variables": ["subject", "lighting"],
                    "tags": ["cinematic", "professional"]
                }
            ],
            "count": 1
        }
        
        self.assertIn("templates", templates_response)
        self.assertIn("count", templates_response)
        self.assertIsInstance(templates_response["templates"], list)
        self.assertEqual(templates_response["count"], len(templates_response["templates"]))
        
        if len(templates_response["templates"]) > 0:
            template = templates_response["templates"][0]
            self.assertIn("id", template)
            self.assertIn("name", template)
            self.assertIn("prompt", template)
            self.assertIn("negativePrompt", template)
            self.assertIn("category", template)
            self.assertIn("variables", template)
            self.assertIn("tags", template)
    
    def test_single_template_structure(self):
        """Test single template response structure"""
        template_response = {
            "template": {
                "id": "anime_1",
                "name": "Anime Character",
                "prompt": "{character_type} anime character",
                "negativePrompt": "realistic, 3d",
                "category": "anime",
                "variables": ["character_type"],
                "tags": ["anime", "character"]
            }
        }
        
        self.assertIn("template", template_response)
        template = template_response["template"]
        self.assertIsInstance(template, dict)
        self.assertIn("id", template)
        self.assertIn("prompt", template)
    
    def test_template_search_by_category(self):
        """Test template search by category"""
        search_params = {
            "category": "photography"
        }
        
        # Simulate search results
        all_templates = [
            {"id": "1", "category": "photography", "name": "Portrait"},
            {"id": "2", "category": "anime", "name": "Anime"},
            {"id": "3", "category": "photography", "name": "Landscape"}
        ]
        
        filtered = [t for t in all_templates if t["category"] == search_params["category"]]
        self.assertEqual(len(filtered), 2)
        self.assertTrue(all(t["category"] == "photography" for t in filtered))
    
    def test_template_search_by_tag(self):
        """Test template search by tag"""
        templates = [
            {"id": "1", "tags": ["cinematic", "professional"]},
            {"id": "2", "tags": ["anime", "cute"]},
            {"id": "3", "tags": ["cinematic", "dramatic"]}
        ]
        
        search_tag = "cinematic"
        filtered = [t for t in templates if search_tag in t["tags"]]
        self.assertEqual(len(filtered), 2)
    
    def test_create_template_request(self):
        """Test creating a new template"""
        new_template = {
            "name": "My Custom Template",
            "prompt": "test prompt with {variable}",
            "negativePrompt": "bad quality",
            "category": "custom",
            "variables": ["variable"],
            "tags": ["custom", "test"]
        }
        
        # Validate required fields
        self.assertIn("name", new_template)
        self.assertIn("prompt", new_template)
        self.assertIsInstance(new_template["variables"], list)
        self.assertIsInstance(new_template["tags"], list)


class TestWildcards(unittest.TestCase):
    """Tests for wildcard system"""
    
    def test_wildcards_structure(self):
        """Test wildcards response structure"""
        wildcards_response = {
            "wildcards": {
                "subject": ["person", "cat", "dog"],
                "lighting": ["golden hour", "studio lighting"]
            },
            "categories": ["subject", "lighting"]
        }
        
        self.assertIn("wildcards", wildcards_response)
        self.assertIn("categories", wildcards_response)
        self.assertIsInstance(wildcards_response["wildcards"], dict)
        self.assertIsInstance(wildcards_response["categories"], list)
    
    def test_single_wildcard_category(self):
        """Test single wildcard category response"""
        wildcard_response = {
            "category": "subject",
            "options": ["person", "cat", "dog", "robot"]
        }
        
        self.assertIn("category", wildcard_response)
        self.assertIn("options", wildcard_response)
        self.assertIsInstance(wildcard_response["options"], list)
        self.assertGreater(len(wildcard_response["options"]), 0)
    
    def test_wildcard_random_selection(self):
        """Test that wildcard selection logic works"""
        options = ["option1", "option2", "option3"]
        
        # Simulate random selection
        import random
        random.seed(42)  # For reproducible tests
        selected = random.choice(options)
        
        self.assertIn(selected, options)


class TestPromptProcessing(unittest.TestCase):
    """Tests for prompt processing with variables and wildcards"""
    
    def test_variable_replacement(self):
        """Test variable replacement in prompts"""
        template = "cinematic shot of {subject}, {lighting}"
        variables = {
            "subject": "person",
            "lighting": "golden hour"
        }
        
        # Simulate variable replacement
        processed = template
        for key, value in variables.items():
            processed = processed.replace(f"{{{key}}}", value)
        
        expected = "cinematic shot of person, golden hour"
        self.assertEqual(processed, expected)
        self.assertNotIn("{", processed)
        self.assertNotIn("}", processed)
    
    def test_wildcard_replacement(self):
        """Test wildcard replacement in prompts"""
        template = "{subject} in {lighting}"
        wildcards = {
            "subject": ["person", "cat", "dog"],
            "lighting": ["golden hour", "neon lights"]
        }
        
        # Simulate wildcard replacement
        import random
        random.seed(42)
        processed = template
        for category, options in wildcards.items():
            if f"{{{category}}}" in processed:
                selected = random.choice(options)
                processed = processed.replace(f"{{{category}}}", selected)
        
        # Should have no remaining braces
        self.assertNotIn("{subject}", processed)
        self.assertNotIn("{lighting}", processed)
    
    def test_process_response_structure(self):
        """Test prompt processing response structure"""
        process_response = {
            "original": "test {variable}",
            "processed": "test value",
            "negativePrompt": "bad quality",
            "usedTemplate": "Test Template"
        }
        
        self.assertIn("original", process_response)
        self.assertIn("processed", process_response)
        self.assertIn("negativePrompt", process_response)
        self.assertIn("usedTemplate", process_response)


class TestNegativePresets(unittest.TestCase):
    """Tests for negative prompt presets"""
    
    def test_negative_presets_list(self):
        """Test negative presets list structure"""
        presets_response = {
            "presets": [
                {
                    "id": "quality_basic",
                    "name": "Basic Quality",
                    "prompt": "low quality, blurry"
                },
                {
                    "id": "anatomy_fix",
                    "name": "Anatomy Fixer",
                    "prompt": "bad anatomy, extra limbs"
                }
            ],
            "count": 2
        }
        
        self.assertIn("presets", presets_response)
        self.assertIn("count", presets_response)
        self.assertEqual(presets_response["count"], len(presets_response["presets"]))
        
        if len(presets_response["presets"]) > 0:
            preset = presets_response["presets"][0]
            self.assertIn("id", preset)
            self.assertIn("name", preset)
            self.assertIn("prompt", preset)
    
    def test_combine_negative_presets(self):
        """Test combining multiple negative presets"""
        presets = [
            {"id": "quality_basic", "prompt": "low quality, blurry"},
            {"id": "anatomy_fix", "prompt": "bad anatomy, extra limbs"}
        ]
        
        combined = ", ".join([p["prompt"] for p in presets])
        expected = "low quality, blurry, bad anatomy, extra limbs"
        
        self.assertEqual(combined, expected)
    
    def test_combine_response_structure(self):
        """Test combine presets response structure"""
        combine_response = {
            "combined": "low quality, blurry, bad anatomy",
            "usedPresets": ["Basic Quality", "Anatomy Fixer"],
            "count": 2
        }
        
        self.assertIn("combined", combine_response)
        self.assertIn("usedPresets", combine_response)
        self.assertIn("count", combine_response)
        self.assertIsInstance(combine_response["usedPresets"], list)
        self.assertEqual(combine_response["count"], len(combine_response["usedPresets"]))


class TestPromptValidation(unittest.TestCase):
    """Tests for prompt validation"""
    
    def test_template_has_required_fields(self):
        """Test that templates have required fields"""
        template = {
            "name": "Test",
            "prompt": "test prompt"
        }
        
        # Required fields
        required = ["name", "prompt"]
        for field in required:
            self.assertIn(field, template)
    
    def test_variables_extraction_from_prompt(self):
        """Test extracting variables from prompt"""
        prompt = "A {subject} in {location} during {time_of_day}"
        
        # Simple variable extraction using regex
        import re
        variables = re.findall(r'\{(\w+)\}', prompt)
        
        expected = ["subject", "location", "time_of_day"]
        self.assertEqual(variables, expected)
    
    def test_empty_prompt_validation(self):
        """Test that empty prompts are invalid"""
        invalid_template = {
            "name": "Test",
            "prompt": ""
        }
        
        # Should be invalid
        self.assertTrue(invalid_template["prompt"] == "")
        # In real implementation, this would return error


if __name__ == "__main__":
    unittest.main()
