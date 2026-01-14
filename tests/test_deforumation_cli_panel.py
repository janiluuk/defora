"""Tests for deforumation_cli_panel module."""
import curses
import pytest
from pathlib import Path

from defora_cli.deforumation_cli_panel import (
    ControlBinding,
    key_to_label,
    normalize_label,
    default_bindings,
)


class FakeMediatorClient:
    """Mock mediator client for testing."""
    
    def __init__(self):
        self.values = {
            "cfg": 7.0,
            "strength": 0.65,
            "noise_multiplier": 1.0,
            "translation_z": 0.0,
        }
        self.writes = []
    
    def read(self, key):
        return self.values.get(key, 0.0)
    
    def write(self, key, val):
        self.writes.append((key, val))
        self.values[key] = val


def test_control_binding_clamp():
    """Test that control binding clamps values to min/max."""
    ctrl = ControlBinding(
        id="test",
        label="Test",
        param="test_param",
        step=0.1,
        min_value=0.0,
        max_value=1.0,
        value=0.5,
    )
    
    # Test clamping above max
    assert ctrl.clamp(1.5) == 1.0
    
    # Test clamping below min
    assert ctrl.clamp(-0.5) == 0.0
    
    # Test value within range
    assert ctrl.clamp(0.7) == 0.7


def test_control_binding_formatted():
    """Test that control binding formats values correctly."""
    ctrl = ControlBinding(
        id="test",
        label="Test",
        param="test_param",
        step=0.1,
        value=1.234567,
        fmt="{:.2f}",
    )
    
    assert ctrl.formatted() == "1.23"
    
    # Test with different format
    ctrl.fmt = "{:.1f}"
    assert ctrl.formatted() == "1.2"


def test_key_to_label():
    """Test key to label conversion."""
    assert key_to_label(curses.KEY_LEFT) == "LEFT"
    assert key_to_label(curses.KEY_RIGHT) == "RIGHT"
    assert key_to_label(curses.KEY_UP) == "UP"
    assert key_to_label(curses.KEY_DOWN) == "DOWN"
    assert key_to_label(10) == "ENTER"
    assert key_to_label(27) == "ESC"
    assert key_to_label(-1) is None


def test_normalize_label():
    """Test label normalization."""
    assert normalize_label("ABC") == "abc"
    assert normalize_label("Test") == "test"
    assert normalize_label("123") == "123"


def test_default_bindings():
    """Test that default bindings are properly structured."""
    bindings = default_bindings()
    
    assert "mediator" in bindings
    assert "bindings" in bindings
    assert "host" in bindings["mediator"]
    assert "port" in bindings["mediator"]
    
    # Check that bindings list is not empty
    assert len(bindings["bindings"]) > 0
    
    # Check structure of first binding
    first = bindings["bindings"][0]
    assert "id" in first
    assert "label" in first
    assert "param" in first
    assert "step" in first
    assert "inc_keys" in first
    assert "dec_keys" in first


def test_control_binding_with_no_limits():
    """Test control binding without min/max limits."""
    ctrl = ControlBinding(
        id="test",
        label="Test",
        param="test_param",
        step=0.1,
        value=100.0,
    )
    
    # Without limits, clamp should not restrict
    assert ctrl.clamp(1000.0) == 1000.0
    assert ctrl.clamp(-1000.0) == -1000.0


def test_control_binding_matches_tui_params():
    """Test that CLI panel bindings match TUI parameter mapping."""
    bindings = default_bindings()
    
    # Key parameters that should be present
    expected_params = ["cfg", "strength", "noise_multiplier", "translation_z", "translation_x"]
    
    binding_params = [b["param"] for b in bindings["bindings"]]
    
    for param in expected_params:
        assert param in binding_params, f"Expected parameter {param} not found in CLI panel bindings"


def test_control_binding_parameter_ranges():
    """Test that parameter ranges are reasonable."""
    bindings = default_bindings()
    
    for binding in bindings["bindings"]:
        # All parameters should have defined step size
        assert binding["step"] > 0, f"Step for {binding['param']} should be positive"
        
        # If min/max are defined, min should be less than max
        if "min" in binding and "max" in binding:
            assert binding["min"] < binding["max"], f"Min should be less than max for {binding['param']}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
