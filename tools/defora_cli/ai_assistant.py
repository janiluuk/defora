"""AI-Assisted Workflows for Defora.

Provides prompt suggestions, parameter auto-tuning, and style recommendations
to help users create better AI-generated content.
"""
from __future__ import annotations

import json
import math
import random
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class PromptSuggestion:
    """A prompt suggestion with metadata."""
    text: str
    category: str
    tags: List[str] = field(default_factory=list)
    confidence: float = 0.0
    reasoning: str = ""


@dataclass
class ParameterRecommendation:
    """A parameter recommendation with target value."""
    param: str
    current_value: float
    recommended_value: float
    confidence: float = 0.0
    reasoning: str = ""


@dataclass
class StyleTransfer:
    """Style transfer recommendation."""
    style_name: str
    description: str
    parameters: Dict[str, float] = field(default_factory=dict)
    prompt_modifiers: List[str] = field(default_factory=list)
    negative_prompt_modifiers: List[str] = field(default_factory=list)


class PromptAssistant:
    """AI assistant for prompt suggestions and improvements."""
    
    def __init__(self, suggestions_file: Optional[Path] = None):
        self.suggestions_file = suggestions_file or Path(__file__).parent / "ai_suggestions.json"
        self.suggestions: List[Dict[str, Any]] = []
        self._load_suggestions()
        
    def _load_suggestions(self):
        """Load suggestions from file."""
        if self.suggestions_file.exists():
            with open(self.suggestions_file, 'r') as f:
                self.suggestions = json.load(f)
        else:
            self._load_default_suggestions()
            
    def _load_default_suggestions(self):
        """Load default suggestions."""
        self.suggestions = [
            {
                "category": "photography",
                "tags": ["portrait", "landscape", "street", "macro"],
                "prompts": [
                    "professional portrait photography, studio lighting, shallow depth of field",
                    "dramatic landscape photography, golden hour, wide angle lens",
                    "street photography, candid moment, urban environment, black and white",
                    "macro photography, extreme close-up, detailed texture, bokeh background",
                ],
                "modifiers": ["8k resolution", "photorealistic", "professional color grading"],
            },
            {
                "category": "anime",
                "tags": ["character", "scene", "mecha", "fantasy"],
                "prompts": [
                    "anime character design, detailed eyes, vibrant colors, studio quality",
                    "anime landscape, beautiful sky, detailed clouds, Studio Ghibli style",
                    "mecha design, detailed mechanical parts, dynamic pose, anime style",
                    "fantasy anime scene, magical atmosphere, glowing effects, detailed background",
                ],
                "modifiers": ["masterpiece", "best quality", "highres"],
            },
            {
                "category": "cinematic",
                "tags": ["dramatic", "action", "sci-fi", "horror"],
                "prompts": [
                    "cinematic shot, dramatic lighting, film grain, anamorphic lens flare",
                    "action scene, dynamic composition, motion blur, cinematic color grading",
                    "sci-fi environment, futuristic architecture, neon lights, atmospheric fog",
                    "horror scene, dark atmosphere, volumetric lighting, unsettling mood",
                ],
                "modifiers": ["cinematic", "film still", "movie scene"],
            },
            {
                "category": "digital_art",
                "tags": ["concept", "illustration", "fantasy", "abstract"],
                "prompts": [
                    "concept art, detailed environment design, atmospheric lighting",
                    "digital illustration, vibrant colors, detailed brushwork, artstation style",
                    "fantasy art, magical scene, ethereal lighting, detailed composition",
                    "abstract digital art, geometric patterns, vibrant gradients, modern style",
                ],
                "modifiers": ["trending on artstation", "digital painting", "concept art"],
            },
        ]
        
    def suggest_prompts(self, current_prompt: str, category: Optional[str] = None, 
                       limit: int = 5) -> List[PromptSuggestion]:
        """Generate prompt suggestions based on current prompt and category."""
        suggestions = []
        
        # Find matching category
        matching_cats = []
        if category:
            matching_cats = [c for c in self.suggestions if c['category'] == category]
        else:
            # Try to infer category from current prompt
            current_lower = current_prompt.lower()
            for cat in self.suggestions:
                if any(tag in current_lower for tag in cat.get('tags', [])):
                    matching_cats.append(cat)
        
        if not matching_cats:
            matching_cats = self.suggestions[:2]
            
        for cat in matching_cats:
            for prompt in cat.get('prompts', [])[:limit]:
                confidence = self._calculate_confidence(current_prompt, prompt)
                suggestions.append(PromptSuggestion(
                    text=prompt,
                    category=cat['category'],
                    tags=cat.get('tags', []),
                    confidence=confidence,
                    reasoning=f"Based on {cat['category']} style"
                ))
                
        # Sort by confidence
        suggestions.sort(key=lambda x: x.confidence, reverse=True)
        return suggestions[:limit]
    
    def improve_prompt(self, current_prompt: str, style: str = "enhance") -> str:
        """Improve current prompt with additional keywords."""
        modifiers = []
        
        for cat in self.suggestions:
            if style in cat.get('tags', []) or style == cat.get('category'):
                modifiers = cat.get('modifiers', [])
                break
                
        if not modifiers:
            modifiers = ["high quality", "detailed", "professional"]
            
        # Add modifiers to prompt
        improved = current_prompt
        for mod in modifiers:
            if mod.lower() not in current_prompt.lower():
                improved += f", {mod}"
                
        return improved
    
    def _calculate_confidence(self, current: str, suggestion: str) -> float:
        """Calculate confidence score for a suggestion."""
        current_words = set(current.lower().split())
        suggestion_words = set(suggestion.lower().split())
        
        # Word overlap
        overlap = len(current_words & suggestion_words)
        total = len(current_words | suggestion_words)
        
        if total == 0:
            return 0.0
            
        return overlap / total


class ParameterTuner:
    """Auto-tune parameters for desired aesthetic."""
    
    def __init__(self):
        self.presets = {
            "photorealistic": {
                "cfg_scale": 7.0,
                "steps": 30,
                "denoising_strength": 0.55,
                "noise_schedule": "karras",
            },
            "anime": {
                "cfg_scale": 8.0,
                "steps": 20,
                "denoising_strength": 0.6,
                "noise_schedule": "normal",
            },
            "cinematic": {
                "cfg_scale": 6.5,
                "steps": 25,
                "denoising_strength": 0.5,
                "noise_schedule": "karras",
            },
            "abstract": {
                "cfg_scale": 9.0,
                "steps": 15,
                "denoising_strength": 0.7,
                "noise_schedule": "normal",
            },
        }
        
    def recommend_parameters(self, current_params: Dict[str, float], 
                            style: str = "photorealistic") -> List[ParameterRecommendation]:
        """Recommend parameter changes for desired style."""
        preset = self.presets.get(style, self.presets["photorealistic"])
        recommendations = []
        
        for param, target_value in preset.items():
            current_value = current_params.get(param, target_value)
            confidence = self._calculate_param_confidence(current_value, target_value)
            
            recommendations.append(ParameterRecommendation(
                param=param,
                current_value=current_value,
                recommended_value=target_value,
                confidence=confidence,
                reasoning=f"Optimized for {style} style"
            ))
            
        return recommendations
    
    def auto_tune(self, current_params: Dict[str, float], 
                 feedback_score: float) -> Dict[str, float]:
        """Auto-tune parameters based on feedback score."""
        tuned = dict(current_params)
        
        # Adjust based on feedback
        if feedback_score < 0.5:
            # Low score - increase CFG and steps
            tuned['cfg_scale'] = min(15.0, tuned.get('cfg_scale', 7.0) * 1.1)
            tuned['steps'] = min(50, int(tuned.get('steps', 20) * 1.1))
        elif feedback_score > 0.8:
            # High score - fine-tune
            tuned['cfg_scale'] = max(5.0, tuned.get('cfg_scale', 7.0) * 0.95)
            tuned['steps'] = max(10, int(tuned.get('steps', 20) * 0.95))
            
        return tuned
    
    def _calculate_param_confidence(self, current: float, target: float) -> float:
        """Calculate confidence for parameter recommendation."""
        if current == target:
            return 1.0
            
        diff = abs(current - target)
        max_diff = max(abs(current), abs(target))
        
        if max_diff == 0:
            return 1.0
            
        return max(0.0, 1.0 - (diff / max_diff))


class StyleTransferAssistant:
    """Recommend style transfers based on current output."""
    
    def __init__(self):
        self.styles: List[StyleTransfer] = [
            StyleTransfer(
                style_name="oil_painting",
                description="Classic oil painting style with visible brushstrokes",
                parameters={"cfg_scale": 7.5, "steps": 25},
                prompt_modifiers=["oil painting", "visible brushstrokes", "classical art"],
                negative_prompt_modifiers=["photorealistic", "digital"],
            ),
            StyleTransfer(
                style_name="watercolor",
                description="Soft watercolor painting style",
                parameters={"cfg_scale": 6.0, "steps": 20},
                prompt_modifiers=["watercolor painting", "soft edges", "pastel colors"],
                negative_prompt_modifiers=["sharp", "detailed", "photorealistic"],
            ),
            StyleTransfer(
                style_name="cyberpunk",
                description="Cyberpunk aesthetic with neon and futuristic elements",
                parameters={"cfg_scale": 8.0, "steps": 30},
                prompt_modifiers=["cyberpunk", "neon lights", "futuristic", "high tech"],
                negative_prompt_modifiers=["natural", "organic", "rustic"],
            ),
            StyleTransfer(
                style_name="minimalist",
                description="Clean minimalist style with simple composition",
                parameters={"cfg_scale": 5.5, "steps": 15},
                prompt_modifiers=["minimalist", "simple", "clean composition", "negative space"],
                negative_prompt_modifiers=["complex", "detailed", "busy"],
            ),
        ]
        
    def recommend_styles(self, current_prompt: str, limit: int = 3) -> List[StyleTransfer]:
        """Recommend style transfers based on current prompt."""
        current_words = set(current_prompt.lower().split())
        scored_styles = []
        
        for style in self.styles:
            # Calculate relevance score
            all_words = set()
            for mod in style.prompt_modifiers:
                all_words.update(mod.lower().split())
                
            overlap = len(current_words & all_words)
            score = overlap / max(len(all_words), 1)
            
            scored_styles.append((score, style))
            
        # Sort by score and return top N
        scored_styles.sort(key=lambda x: x[0], reverse=True)
        return [style for _, style in scored_styles[:limit]]
    
    def apply_style(self, current_prompt: str, current_negative: str, 
                   style_name: str) -> Dict[str, str]:
        """Apply style transfer to current prompts."""
        style = next((s for s in self.styles if s.style_name == style_name), None)
        if not style:
            return {"prompt": current_prompt, "negative_prompt": current_negative}
            
        # Add style modifiers
        new_prompt = current_prompt
        for mod in style.prompt_modifiers:
            if mod.lower() not in current_prompt.lower():
                new_prompt += f", {mod}"
                
        new_negative = current_negative
        for mod in style.negative_prompt_modifiers:
            if mod.lower() not in current_negative.lower():
                new_negative += f", {mod}"
                
        return {
            "prompt": new_prompt,
            "negative_prompt": new_negative,
            "parameters": style.parameters,
        }


class AnomalyDetector:
    """Detect anomalies in generated frames."""
    
    def __init__(self, threshold: float = 0.7):
        self.threshold = threshold
        self.history: List[Dict[str, Any]] = []
        
    def analyze_frame(self, frame_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a frame for anomalies."""
        # Simple heuristic analysis
        anomalies = []
        
        # Check for extreme parameter values
        if 'cfg_scale' in frame_data:
            if frame_data['cfg_scale'] > 15 or frame_data['cfg_scale'] < 3:
                anomalies.append({
                    "type": "extreme_cfg",
                    "severity": "high",
                    "message": f"CFG scale {frame_data['cfg_scale']} is outside normal range"
                })
                
        if 'steps' in frame_data:
            if frame_data['steps'] > 50:
                anomalies.append({
                    "type": "high_steps",
                    "severity": "medium",
                    "message": f"High step count ({frame_data['steps']}) may cause artifacts"
                })
                
        self.history.append({
            "frame_data": frame_data,
            "anomalies": anomalies,
            "timestamp": frame_data.get('timestamp', 0),
        })
        
        return {
            "anomalies": anomalies,
            "is_ok": len(anomalies) == 0,
        }
    
    def get_summary(self) -> Dict[str, Any]:
        """Get anomaly summary."""
        total = len(self.history)
        anomalous = sum(1 for h in self.history if h['anomalies'])
        
        return {
            "total_frames": total,
            "anomalous_frames": anomalous,
            "anomaly_rate": anomalous / total if total > 0 else 0,
        }


# Main AI assistant interface
class DeforaAIAssistant:
    """Main AI assistant for Defora workflows."""
    
    def __init__(self):
        self.prompt_assistant = PromptAssistant()
        self.parameter_tuner = ParameterTuner()
        self.style_transfer = StyleTransferAssistant()
        self.anomaly_detector = AnomalyDetector()
        
    def get_prompt_suggestions(self, current_prompt: str, category: Optional[str] = None,
                              limit: int = 5) -> List[Dict[str, Any]]:
        """Get prompt suggestions."""
        suggestions = self.prompt_assistant.suggest_prompts(current_prompt, category, limit)
        return [
            {
                "text": s.text,
                "category": s.category,
                "tags": s.tags,
                "confidence": s.confidence,
                "reasoning": s.reasoning,
            }
            for s in suggestions
        ]
    
    def improve_prompt(self, current_prompt: str, style: str = "enhance") -> str:
        """Improve current prompt."""
        return self.prompt_assistant.improve_prompt(current_prompt, style)
    
    def get_parameter_recommendations(self, current_params: Dict[str, float],
                                     style: str = "photorealistic") -> List[Dict[str, Any]]:
        """Get parameter recommendations."""
        recs = self.parameter_tuner.recommend_parameters(current_params, style)
        return [
            {
                "param": r.param,
                "current_value": r.current_value,
                "recommended_value": r.recommended_value,
                "confidence": r.confidence,
                "reasoning": r.reasoning,
            }
            for r in recs
        ]
    
    def auto_tune_parameters(self, current_params: Dict[str, float],
                           feedback_score: float) -> Dict[str, float]:
        """Auto-tune parameters based on feedback."""
        return self.parameter_tuner.auto_tune(current_params, feedback_score)
    
    def get_style_recommendations(self, current_prompt: str,
                                 limit: int = 3) -> List[Dict[str, Any]]:
        """Get style transfer recommendations."""
        styles = self.style_transfer.recommend_styles(current_prompt, limit)
        return [
            {
                "style_name": s.style_name,
                "description": s.description,
                "parameters": s.parameters,
                "prompt_modifiers": s.prompt_modifiers,
                "negative_prompt_modifiers": s.negative_prompt_modifiers,
            }
            for s in styles
        ]
    
    def apply_style_transfer(self, current_prompt: str, current_negative: str,
                           style_name: str) -> Dict[str, Any]:
        """Apply style transfer."""
        return self.style_transfer.apply_style(current_prompt, current_negative, style_name)
    
    def analyze_frame(self, frame_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze frame for anomalies."""
        return self.anomaly_detector.analyze_frame(frame_data)
    
    def get_anomaly_summary(self) -> Dict[str, Any]:
        """Get anomaly detection summary."""
        return self.anomaly_detector.get_summary()
