#!/usr/bin/env python3
"""
Terminal control panel for Deforumation's real-time controls.

This small TUI talks to the Deforumation mediator websocket so you can steer
live generation without opening the Qt UI. It exposes the core sliders
strength/CFG/noise, pan/zoom (x/y/z), rotation (x/y/z) and FOV and lets you
bind simple hotkeys to bump each value up or down.

Quick keys:
  - Up/Down: move selection
  - Left/Right or -/+: adjust the selected control by its step size
  - r: pull the latest values from the mediator
  - b: rebind increase/decrease hotkeys for the selected control
  - q: quit

Per-control hotkeys (shown in the list) also adjust values immediately.
Bindings persist in deforumation_cli_bindings.json next to this file.
"""
from __future__ import annotations

import argparse
import asyncio
import curses
import json
import os
import pickle
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import websockets

DEFAULT_MEDIATOR_HOST = os.getenv("DEFORUMATION_MEDIATOR_HOST", "localhost")
DEFAULT_MEDIATOR_PORT = os.getenv("DEFORUMATION_MEDIATOR_PORT", "8766")
CONFIG_PATH = Path(__file__).resolve().parent / "deforumation_cli_bindings.json"


@dataclass
class ControlBinding:
    id: str
    label: str
    param: str
    step: float
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    inc_keys: List[str] = field(default_factory=list)
    dec_keys: List[str] = field(default_factory=list)
    fmt: str = "{:.2f}"
    value: float = 0.0

    def clamp(self, new_value: float) -> float:
        if self.min_value is not None:
            new_value = max(self.min_value, new_value)
        if self.max_value is not None:
            new_value = min(self.max_value, new_value)
        return new_value

    def formatted(self) -> str:
        try:
            return self.fmt.format(self.value)
        except Exception:
            return str(self.value)


def default_bindings() -> Dict[str, object]:
    return {
        "mediator": {"host": DEFAULT_MEDIATOR_HOST, "port": DEFAULT_MEDIATOR_PORT},
        "bindings": [
            {
                "id": "noise",
                "label": "Noise",
                "param": "noise_multiplier",
                "step": 0.05,
                "min": 0.0,
                "max": 3.0,
                "fmt": "{:.2f}",
                "inc_keys": ["]"],
                "dec_keys": ["["],
            },
            {
                "id": "strength",
                "label": "Strength",
                "param": "strength",
                "step": 0.05,
                "min": 0.0,
                "max": 1.5,
                "fmt": "{:.2f}",
                "inc_keys": ["="],
                "dec_keys": ["-"],
            },
            {
                "id": "cfg",
                "label": "CFG",
                "param": "cfg",
                "step": 0.5,
                "min": 0.0,
                "max": 30.0,
                "fmt": "{:.1f}",
                "inc_keys": ["."],
                "dec_keys": [","],
            },
            {
                "id": "x",
                "label": "Pan X",
                "param": "translation_x",
                "step": 0.05,
                "min": -10.0,
                "max": 10.0,
                "fmt": "{:.2f}",
                "inc_keys": ["d"],
                "dec_keys": ["a"],
            },
            {
                "id": "y",
                "label": "Pan Y",
                "param": "translation_y",
                "step": 0.05,
                "min": -10.0,
                "max": 10.0,
                "fmt": "{:.2f}",
                "inc_keys": ["s"],
                "dec_keys": ["w"],
            },
            {
                "id": "z",
                "label": "Zoom (Z)",
                "param": "translation_z",
                "step": 0.05,
                "min": -10.0,
                "max": 10.0,
                "fmt": "{:.2f}",
                "inc_keys": ["e"],
                "dec_keys": ["q"],
            },
            {
                "id": "rot_x",
                "label": "Rotate X",
                "param": "rotation_x",
                "step": 0.25,
                "min": -180.0,
                "max": 180.0,
                "fmt": "{:.2f}",
                "inc_keys": ["l"],
                "dec_keys": ["j"],
            },
            {
                "id": "rot_y",
                "label": "Rotate Y",
                "param": "rotation_y",
                "step": 0.25,
                "min": -180.0,
                "max": 180.0,
                "fmt": "{:.2f}",
                "inc_keys": ["k"],
                "dec_keys": ["i"],
            },
            {
                "id": "rot_z",
                "label": "Rotate Z (Tilt)",
                "param": "rotation_z",
                "step": 0.25,
                "min": -180.0,
                "max": 180.0,
                "fmt": "{:.2f}",
                "inc_keys": [";"],
                "dec_keys": ["h"],
            },
            {
                "id": "fov",
                "label": "FOV",
                "param": "fov",
                "step": 1.0,
                "min": 1.0,
                "max": 180.0,
                "fmt": "{:.1f}",
                "inc_keys": ["0"],
                "dec_keys": ["9"],
            },
        ],
    }


def load_cli_config(path: Path) -> Dict[str, object]:
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        data = default_bindings()
        path.write_text(json.dumps(data, indent=2))
        return data
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_cli_config(path: Path, mediator: Dict[str, str], bindings: List[ControlBinding]) -> None:
    blob = {
        "mediator": mediator,
        "bindings": [
            {
                "id": b.id,
                "label": b.label,
                "param": b.param,
                "step": b.step,
                "min": b.min_value,
                "max": b.max_value,
                "fmt": b.fmt,
                "inc_keys": b.inc_keys,
                "dec_keys": b.dec_keys,
            }
            for b in bindings
        ],
    }
    path.write_text(json.dumps(blob, indent=2))


def key_to_label(key: int) -> Optional[str]:
    if key == -1:
        return None
    special = {
        curses.KEY_LEFT: "LEFT",
        curses.KEY_RIGHT: "RIGHT",
        curses.KEY_UP: "UP",
        curses.KEY_DOWN: "DOWN",
        10: "ENTER",
        27: "ESC",
    }
    if key in special:
        return special[key]
    try:
        name = curses.keyname(key).decode("utf-8")
    except Exception:
        return str(key)
    if len(name) == 1:
        return name.lower()
    return name


def normalize_label(label: str) -> str:
    return label.lower()


class MediatorClient:
    """Tiny helper around the mediator websocket protocol."""

    def __init__(self, host: str, port: str, timeout: float = 10.0):
        self.uri = f"ws://{host}:{port}"
        self.timeout = timeout

    async def _send_async(self, payload):
        async with websockets.connect(self.uri) as websocket:
            await asyncio.wait_for(websocket.send(pickle.dumps(payload)), timeout=self.timeout)
            reply = await asyncio.wait_for(websocket.recv(), timeout=self.timeout)
            try:
                decoded = pickle.loads(reply)
            except Exception:
                return reply
            if isinstance(decoded, list):
                if len(decoded) == 1:
                    return decoded[0]
                return decoded
            return decoded

    def send(self, payload):
        return asyncio.run(self._send_async(payload))

    def read(self, param: str):
        return self.send([0, param, 0])

    def write(self, param: str, value):
        return self.send([1, param, value])


class DeforumControlPanel:
    def __init__(self, stdscr, mediator_host: str, mediator_port: str, controls: List[ControlBinding]):
        self.stdscr = stdscr
        self.controls = controls
        self.selected_index = 0
        self.status = "Connecting to mediator..."
        self.mediator = MediatorClient(mediator_host, mediator_port)
        self.mediator_cfg = {"host": mediator_host, "port": mediator_port}

    def run(self) -> None:
        curses.curs_set(0)
        self.stdscr.nodelay(True)
        self.stdscr.timeout(100)
        self.bootstrap_flags()
        self.refresh_values()
        while True:
            self.draw()
            key = self.stdscr.getch()
            if key == -1:
                continue
            label = key_to_label(key)
            if label == "q":
                break
            handled = self.handle_global_input(key, label)
            if not handled:
                self.handle_binding_input(label)

    def handle_global_input(self, key: int, label: Optional[str]) -> bool:
        if key in (curses.KEY_UP, ord("k")):
            self.selected_index = (self.selected_index - 1) % len(self.controls)
            return True
        if key in (curses.KEY_DOWN, ord("j")):
            self.selected_index = (self.selected_index + 1) % len(self.controls)
            return True
        if key in (curses.KEY_LEFT, ord("-")):
            self.bump_selected(-1)
            return True
        if key in (curses.KEY_RIGHT, ord("+"), ord("=")):
            self.bump_selected(1)
            return True
        if label == "r":
            self.refresh_values()
            return True
        if label == "b":
            self.rebind_selected()
            return True
        return False

    def handle_binding_input(self, label: Optional[str]) -> None:
        if label is None:
            return
        lower = normalize_label(label)
        for ctrl in self.controls:
            if lower in [normalize_label(k) for k in ctrl.inc_keys]:
                self.update_control(ctrl, ctrl.step)
                return
            if lower in [normalize_label(k) for k in ctrl.dec_keys]:
                self.update_control(ctrl, -ctrl.step)
                return

    def bump_selected(self, direction: int) -> None:
        control = self.controls[self.selected_index]
        self.update_control(control, control.step * direction)

    def update_control(self, control: ControlBinding, delta: float) -> None:
        try:
            control.value = control.clamp(control.value + delta)
            self.mediator.write(control.param, control.value)
            self.status = f"Set {control.label} ({control.param}) -> {control.formatted()}"
        except Exception as exc:
            self.status = f"Failed to send {control.param}: {exc}"

    def refresh_values(self) -> None:
        for ctrl in self.controls:
            try:
                new_val = self.mediator.read(ctrl.param)
                if new_val is not None:
                    ctrl.value = float(new_val)
            except Exception as exc:
                self.status = f"Could not read {ctrl.param}: {exc}"
                return
        self.status = "Values reloaded from mediator"

    def draw(self) -> None:
        self.stdscr.erase()
        height, width = self.stdscr.getmaxyx()
        title = "Deforumation CLI Control Panel (q to quit, r reload, b rebind)"
        self.stdscr.addnstr(0, 0, title, width - 1, curses.A_BOLD)
        hint = "Arrows/-/+: adjust selection | Hotkeys column works anytime"
        self.stdscr.addnstr(1, 0, hint, width - 1)
        for idx, ctrl in enumerate(self.controls):
            prefix = "> " if idx == self.selected_index else "  "
            hotkeys = "/".join(ctrl.dec_keys or ["-"]) + " | " + "/".join(ctrl.inc_keys or ["+"])
            line = f"{prefix}{ctrl.label:<14} {ctrl.formatted():>8}  [{hotkeys:<12}]  ({ctrl.param})"
            attr = curses.A_REVERSE if idx == self.selected_index else curses.A_NORMAL
            self.stdscr.addnstr(3 + idx, 0, line, width - 1, attr)
        self.stdscr.hline(height - 2, 0, "-", width - 1)
        self.stdscr.addnstr(height - 1, 0, self.status[: width - 1], width - 1)
        self.stdscr.refresh()

    def rebind_selected(self) -> None:
        ctrl = self.controls[self.selected_index]
        inc = self.prompt_for_key(f"Press a key for INCREASE {ctrl.label} (Esc to cancel)")
        if inc is None:
            self.status = "Rebind canceled"
            return
        dec = self.prompt_for_key(f"Press a key for DECREASE {ctrl.label} (Esc to cancel)")
        if dec is None:
            self.status = "Rebind canceled"
            return
        ctrl.inc_keys = [inc]
        ctrl.dec_keys = [dec]
        save_cli_config(CONFIG_PATH, self.mediator_cfg, self.controls)
        self.status = f"Updated bindings for {ctrl.label} (+:{inc} / -:{dec})"

    def prompt_for_key(self, prompt: str) -> Optional[str]:
        self.stdscr.nodelay(False)
        self.status = prompt
        self.draw()
        key = self.stdscr.getch()
        self.stdscr.nodelay(True)
        label = key_to_label(key)
        if label in ("ESC", None):
            return None
        return label

    def bootstrap_flags(self) -> None:
        """Turn on the deforumation 'should_use' flags so our writes matter."""
        flags = {
            "should_use_deforumation_strength": 1,
            "should_use_deforumation_cfg": 1,
            "should_use_deforumation_cadence": 1,
            "should_use_deforumation_noise": 1,
            "should_use_deforumation_panning": 1,
            "should_use_deforumation_rotation": 1,
            "should_use_deforumation_zoom": 1,
            "should_use_deforumation_fov": 1,
            "should_use_deforumation_tilt": 1,
        }
        for key, value in flags.items():
            try:
                self.mediator.write(key, value)
            except Exception:
                pass


def build_controls(config_blob: Dict[str, object]) -> Tuple[Dict[str, str], List[ControlBinding]]:
    mediator_cfg = config_blob.get("mediator", {}) if isinstance(config_blob, dict) else {}
    bindings = []
    for item in config_blob.get("bindings", []):
        bindings.append(
            ControlBinding(
                id=item.get("id"),
                label=item.get("label", item.get("param", "")),
                param=item.get("param"),
                step=float(item.get("step", 0.1)),
                min_value=item.get("min"),
                max_value=item.get("max"),
                fmt=item.get("fmt", "{:.2f}"),
                inc_keys=item.get("inc_keys", []),
                dec_keys=item.get("dec_keys", []),
            )
        )
    return mediator_cfg, bindings


def main(stdscr, mediator_host: str, mediator_port: str) -> None:
    config_blob = load_cli_config(CONFIG_PATH)
    mediator_cfg, controls = build_controls(config_blob)
    mediator_host = mediator_host or mediator_cfg.get("host", DEFAULT_MEDIATOR_HOST)
    mediator_port = mediator_port or mediator_cfg.get("port", DEFAULT_MEDIATOR_PORT)
    panel = DeforumControlPanel(stdscr, mediator_host, str(mediator_port), controls)
    panel.run()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deforumation terminal control panel")
    parser.add_argument("--host", default=None, help="Mediator host (default: localhost)")
    parser.add_argument("--port", default=None, help="Mediator port (default: 8766)")
    args = parser.parse_args()
    curses.wrapper(lambda stdscr: main(stdscr, args.host, args.port))
