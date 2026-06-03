"""Defora Plugin System - Extensible architecture for community plugins."""

from __future__ import annotations

import importlib
import importlib.util
import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional


@dataclass
class PluginManifest:
    """Plugin metadata and configuration."""
    name: str
    version: str
    author: str
    description: str
    plugin_type: str  # "modulator", "mapper", "post-process", "ui-extension"
    entry_point: str  # "module:function"
    parameters: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)


@dataclass
class PluginInfo:
    """Runtime plugin information."""
    manifest: PluginManifest
    module: Any
    enabled: bool = True
    instance: Any = None


class PluginRegistry:
    """Central registry for Defora plugins."""
    
    def __init__(self, plugins_dir: Optional[str] = None):
        self.plugins_dir = Path(plugins_dir) if plugins_dir else Path(__file__).parent
        self.plugins: Dict[str, PluginInfo] = {}
        self._load_builtin_plugins()
        
    def _load_builtin_plugins(self):
        """Load built-in plugins from the plugins directory."""
        manifest_path = self.plugins_dir / "manifest.json"
        if manifest_path.exists():
            self.load_manifest(manifest_path)
            
    def load_manifest(self, path: Path):
        """Load plugins from a manifest file."""
        with open(path, 'r') as f:
            data = json.load(f)
            
        for plugin_data in data.get('plugins', []):
            manifest = PluginManifest(**plugin_data)
            self.register(manifest)
            
    def register(self, manifest: PluginManifest) -> bool:
        """Register a plugin from its manifest."""
        try:
            module_path, func_name = manifest.entry_point.split(':')
            spec = importlib.util.find_spec(module_path)
            if spec is None:
                print(f"[plugin] Module not found: {module_path}")
                return False
                
            module = importlib.import_module(module_path)
            func = getattr(module, func_name, None)
            if func is None:
                print(f"[plugin] Entry point not found: {func_name}")
                return False
                
            plugin_info = PluginInfo(
                manifest=manifest,
                module=module,
                instance=func
            )
            self.plugins[manifest.name] = plugin_info
            print(f"[plugin] Registered: {manifest.name} v{manifest.version}")
            return True
        except Exception as e:
            print(f"[plugin] Failed to register {manifest.name}: {e}")
            return False
            
    def load_plugin(self, name: str) -> Optional[PluginInfo]:
        """Load a plugin by name."""
        return self.plugins.get(name)
        
    def enable_plugin(self, name: str) -> bool:
        """Enable a registered plugin."""
        if name in self.plugins:
            self.plugins[name].enabled = True
            return True
        return False
        
    def disable_plugin(self, name: str) -> bool:
        """Disable a registered plugin."""
        if name in self.plugins:
            self.plugins[name].enabled = False
            return True
        return False
        
    def get_plugins_by_type(self, plugin_type: str) -> List[PluginInfo]:
        """Get all plugins of a specific type."""
        return [
            p for p in self.plugins.values() 
            if p.manifest.plugin_type == plugin_type and p.enabled
        ]
        
    def get_enabled_plugins(self) -> List[PluginInfo]:
        """Get all enabled plugins."""
        return [p for p in self.plugins.values() if p.enabled]
        
    def execute_plugin(self, name: str, *args, **kwargs) -> Any:
        """Execute a plugin by name."""
        plugin = self.plugins.get(name)
        if not plugin:
            raise ValueError(f"Plugin not found: {name}")
        if not plugin.enabled:
            raise ValueError(f"Plugin is disabled: {name}")
        if not plugin.instance:
            raise ValueError(f"Plugin has no instance: {name}")
        return plugin.instance(*args, **kwargs)
        
    def list_plugins(self) -> List[Dict[str, Any]]:
        """List all registered plugins with their status."""
        return [
            {
                'name': p.manifest.name,
                'version': p.manifest.version,
                'author': p.manifest.author,
                'description': p.manifest.description,
                'type': p.manifest.plugin_type,
                'enabled': p.enabled,
                'tags': p.manifest.tags,
            }
            for p in self.plugins.values()
        ]


class ModulatorPlugin:
    """Base class for custom modulator plugins."""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        
    def modulate(self, value: float, time: float, params: Dict[str, Any]) -> float:
        """
        Apply modulation to a parameter value.
        
        Args:
            value: Current parameter value
            time: Current time in seconds
            params: Additional parameters from plugin config
            
        Returns:
            Modulated parameter value
        """
        raise NotImplementedError


class ParameterMappingPlugin:
    """Base class for custom parameter mapping plugins."""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        
    def map_value(self, source_value: float, source_range: tuple, target_range: tuple) -> float:
        """
        Map a source value to a target range.
        
        Args:
            source_value: Input value
            source_range: (min, max) of source
            target_range: (min, max) of target
            
        Returns:
            Mapped value in target range
        """
        # Default linear mapping
        src_min, src_max = source_range
        tgt_min, tgt_max = target_range
        
        if src_max == src_min:
            return (tgt_min + tgt_max) / 2
            
        normalized = (source_value - src_min) / (src_max - src_min)
        return tgt_min + normalized * (tgt_max - tgt_min)


# Built-in modulator plugins

class SmoothModulator(ModulatorPlugin):
    """Smooth modulation with configurable smoothing factor."""
    
    def modulate(self, value: float, time: float, params: Dict[str, Any]) -> float:
        smoothing = params.get('smoothing', 0.5)
        prev_value = params.get('prev_value', value)
        return prev_value * (1 - smoothing) + value * smoothing


class StepModulator(ModulatorPlugin):
    """Step-based modulation (quantizes values)."""
    
    def modulate(self, value: float, time: float, params: Dict[str, Any]) -> float:
        steps = params.get('steps', 8)
        min_val = params.get('min', 0.0)
        max_val = params.get('max', 1.0)
        
        step_size = (max_val - min_val) / steps
        return min_val + round((value - min_val) / step_size) * step_size


class RandomModulator(ModulatorPlugin):
    """Random modulation with controlled variance."""
    
    def modulate(self, value: float, time: float, params: Dict[str, Any]) -> float:
        import random
        variance = params.get('variance', 0.1)
        return value + random.uniform(-variance, variance)


# Built-in parameter mapping plugins

class ExponentialMapping(ParameterMappingPlugin):
    """Exponential parameter mapping."""
    
    def map_value(self, source_value: float, source_range: tuple, target_range: tuple) -> float:
        src_min, src_max = source_range
        tgt_min, tgt_max = target_range
        
        normalized = (source_value - src_min) / (src_max - src_min)
        normalized = normalized ** 2  # Exponential curve
        return tgt_min + normalized * (tgt_max - tgt_min)


class LogarithmicMapping(ParameterMappingPlugin):
    """Logarithmic parameter mapping."""
    
    def map_value(self, source_value: float, source_range: tuple, target_range: tuple) -> float:
        src_min, src_max = source_range
        tgt_min, tgt_max = target_range
        
        normalized = (source_value - src_min) / (src_max - src_min)
        import math
        normalized = math.log(1 + 9 * normalized) / math.log(10)  # Log curve
        return tgt_min + normalized * (tgt_max - tgt_min)


class SigmoidMapping(ParameterMappingPlugin):
    """Sigmoid (S-curve) parameter mapping."""
    
    def map_value(self, source_value: float, source_range: tuple, target_range: tuple) -> float:
        src_min, src_max = source_range
        tgt_min, tgt_max = target_range
        
        normalized = (source_value - src_min) / (src_max - src_min)
        # Sigmoid function
        normalized = 1 / (1 + math.exp(-10 * (normalized - 0.5)))
        return tgt_min + normalized * (tgt_max - tgt_min)


import math

# Plugin factory for creating plugin instances
def create_modulator(plugin_type: str, config: Dict[str, Any] = None) -> ModulatorPlugin:
    """Create a modulator plugin by type."""
    modulators = {
        'smooth': SmoothModulator,
        'step': StepModulator,
        'random': RandomModulator,
    }
    
    if plugin_type not in modulators:
        raise ValueError(f"Unknown modulator type: {plugin_type}")
        
    return modulators[plugin_type](config)


def create_mapping(plugin_type: str, config: Dict[str, Any] = None) -> ParameterMappingPlugin:
    """Create a parameter mapping plugin by type."""
    mappings = {
        'linear': ParameterMappingPlugin,
        'exponential': ExponentialMapping,
        'logarithmic': LogarithmicMapping,
        'sigmoid': SigmoidMapping,
    }
    
    if plugin_type not in mappings:
        raise ValueError(f"Unknown mapping type: {plugin_type}")
        
    return mappings[plugin_type](config)
