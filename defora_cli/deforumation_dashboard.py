#!/usr/bin/env python3
"""
Curses dashboard inspired by the Deforumation GUI.

Goals:
- Bring the key Deforumation tabs (prompts, prompt mixer, motions, control toggles, audio sync, settings)
  into a terminal UI so you can operate without the Qt app.
- Load/save values from the upstream DeforumationSendConfig.json.
- Push selected fields to the mediator (host/port configurable) for live control.
- Kick off audio-reactive modulation via the packaged helper.

The layout intentionally mirrors the tab names shown in deforumation/github_images.
"""
from __future__ import annotations

import argparse
import curses
import json
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Tuple

from .mediator_client import MediatorClient

DEFAULT_CONFIG_PATH = Path("deforumation/helpers/DeforumationSendConfig.json")
DEFAULT_AUDIO_OUTPUT = Path("audio_modulation.json")
DEFAULT_MAPPING = Path()  # no default mapping; user should set explicitly
PRESETS_DIR = Path("deforumation/presets")

TAB_PROMPTS = "PROMPTS"
TAB_MIX = "PROMPT MIXER"
TAB_MOTIONS = "MOTIONS"
TAB_CONTROL = "CONTROLNET"
TAB_AUDIO = "AUDIO SYNC"
TAB_SETTINGS = "SETTINGS"


# label, key, type
PROMPT_FIELDS: List[Tuple[str, str, type]] = [
    ("Positive prompt", "positive_prompt", str),
    ("Negative prompt", "negative_prompt", str),
    ("Steps", "steps", int),
    ("CFG", "cfg", float),
    ("Strength", "strength", float),
    ("Cadence", "cadence", int),
    ("Noise multiplier", "noise_multiplier", float),
    ("Seed", "seed", int),
]

MIX_FIELDS: List[Tuple[str, str, type]] = [
    ("Prompt A", "positive_prompt_1", str),
    ("Prompt B", "positive_prompt_2", str),
    ("Neg A", "negative_prompt_1", str),
    ("Neg B", "negative_prompt_2", str),
    ("Mix (0-1)", "prompt_mix", float),
    ("Use deforumation prompts", "should_use_deforumation_prompts", bool),
]

MOTION_FIELDS: List[Tuple[str, str, type]] = [
    ("Pan X", "translation_x", float),
    ("Pan Y", "translation_y", float),
    ("Zoom (Z)", "translation_z", float),
    ("Rotate X", "rotation_x", float),
    ("Rotate Y", "rotation_y", float),
    ("Tilt (Z rot)", "rotation_z", float),
    ("FOV", "fov", float),
]

CONTROL_FIELDS: List[Tuple[str, str, type]] = [
    ("Prompt scheduling", "should_use_deforumation_prompt_scheduling", bool),
    ("Before Deforum prompt", "should_use_before_deforum_prompt", bool),
    ("After Deforum prompt", "should_use_after_deforum_prompt", bool),
]

AUDIO_FIELDS: List[Tuple[str, str, type]] = [
    ("Audio file", "audio_path", str),
    ("Mapping JSON", "mapping_path", str),
    ("FPS", "audio_fps", int),
    ("Output JSON", "audio_output", str),
    ("Live send to mediator", "audio_live", bool),
]

SETTINGS_FIELDS: List[Tuple[str, str, type]] = [
    ("Use strength", "should_use_deforumation_strength", bool),
    ("Use CFG", "should_use_deforumation_cfg", bool),
    ("Use cadence", "should_use_deforumation_cadence", bool),
    ("Use noise", "should_use_deforumation_noise", bool),
    ("Use panning", "should_use_deforumation_panning", bool),
    ("Use rotation", "should_use_deforumation_rotation", bool),
    ("Use zoom", "should_use_deforumation_zoom", bool),
    ("Use FOV", "should_use_deforumation_fov", bool),
    ("Use tilt", "should_use_deforumation_tilt", bool),
    ("Stay on top", "should_stay_on_top", bool),
    ("Pause rendering", "is_paused_rendering", bool),
]

TAB_FIELDS: Dict[str, List[Tuple[str, str, type]]] = {
    TAB_PROMPTS: PROMPT_FIELDS,
    TAB_MIX: MIX_FIELDS,
    TAB_MOTIONS: MOTION_FIELDS,
    TAB_CONTROL: CONTROL_FIELDS,
    TAB_AUDIO: AUDIO_FIELDS,
    TAB_SETTINGS: SETTINGS_FIELDS,
}

SENDABLE_KEYS = {
    TAB_PROMPTS: ["strength", "cfg", "cadence", "noise_multiplier"],
    TAB_MOTIONS: ["translation_x", "translation_y", "translation_z", "rotation_x", "rotation_y", "rotation_z", "fov"],
    TAB_CONTROL: [f[1] for f in CONTROL_FIELDS],
    TAB_SETTINGS: [f[1] for f in SETTINGS_FIELDS],
}


def _parse_value(raw: str, typ: type) -> Any:
    if typ is bool:
        return raw.lower() in ("1", "true", "yes", "on", "y")
    if typ is int:
        return int(raw)
    if typ is float:
        return float(raw)
    return raw


@dataclass
class DashboardState:
    config_path: Path
    mediator_host: str
    mediator_port: str
    data: Dict[str, Any] = field(default_factory=dict)
    status: str = ""
    tab: str = TAB_PROMPTS
    cursor: Dict[str, int] = field(default_factory=lambda: {t: 0 for t in TAB_FIELDS})


def load_config(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def save_config(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2)


def preset_path(name: str) -> Path:
    return PRESETS_DIR / f"{name}.json"


def load_preset(name: str) -> Dict[str, Any]:
    path = preset_path(name)
    return load_config(path)


def save_preset(name: str, data: Dict[str, Any]) -> Path:
    path = preset_path(name)
    save_config(path, data)
    return path


def ensure_defaults(data: Dict[str, Any]) -> Dict[str, Any]:
    # Add fields we rely on but the upstream config might not have.
    data = dict(data)
    data.setdefault("prompt_mix", 0.5)
    data.setdefault("negative_prompt_2", "")
    data.setdefault("audio_path", "")
    data.setdefault("mapping_path", "")
    data.setdefault("audio_fps", 24)
    data.setdefault("audio_output", str(DEFAULT_AUDIO_OUTPUT))
    data.setdefault("audio_live", False)
    return data


def draw_ui(stdscr, state: DashboardState) -> None:
    stdscr.erase()
    h, w = stdscr.getmaxyx()
    stdscr.addnstr(0, 0, "Deforumation Dashboard", w - 1, curses.A_BOLD)

    # Tabs bar
    tab_line = []
    for name in TAB_FIELDS:
        decorated = f"[{name}]" if name == state.tab else f" {name} "
        tab_line.append(decorated)
    stdscr.addnstr(1, 0, " | ".join(tab_line)[: w - 1], w - 1, curses.A_REVERSE)

    fields = TAB_FIELDS[state.tab]
    cursor = state.cursor.get(state.tab, 0)
    y = 3
    for idx, (label, key, _) in enumerate(fields):
        val = state.data.get(key, "")
        display = f"{label}: {val}"
        attr = curses.A_REVERSE if idx == cursor else curses.A_NORMAL
        stdscr.addnstr(y + idx, 2, display[: w - 4], w - 4, attr)

    # Footer
    stdscr.hline(h - 3, 0, "-", w - 1)
    stdscr.addnstr(
        h - 2,
        0,
        "Arrows: move  | Enter: edit  | Space: toggle bool  | s: save  | r: reload  | m: send to mediator  | g: audio run  | q: quit",
        w - 1,
    )
    stdscr.addnstr(h - 1, 0, f"Status: {state.status}"[: w - 1], w - 1)
    stdscr.refresh()


def edit_field(stdscr, label: str, current: Any, typ: type) -> Any:
    curses.echo()
    stdscr.addstr(label + " (current: " + str(current) + "): ")
    stdscr.clrtoeol()
    raw = stdscr.getstr().decode("utf-8").strip()
    curses.noecho()
    if raw == "":
        return current
    try:
        return _parse_value(raw, typ)
    except Exception:
        return current


def toggle_field(value: Any) -> Any:
    if isinstance(value, bool):
        return not value
    if isinstance(value, int):
        return 0 if value else 1
    return value


def send_to_mediator(state: DashboardState, keys: List[str]) -> str:
    try:
        client = MediatorClient(state.mediator_host, state.mediator_port)
    except Exception as exc:  # pragma: no cover - runtime only
        return f"Mediator unavailable: {exc}"
    sent = []
    for key in keys:
        if key not in state.data:
            continue
        try:
            client.write(key, state.data[key])
            sent.append(key)
        except Exception:
            continue
    return f"Sent to mediator: {', '.join(sent) if sent else 'nothing'}"


def run_audio_helper(state: DashboardState) -> str:
    audio = state.data.get("audio_path") or ""
    mapping = state.data.get("mapping_path") or ""
    fps = state.data.get("audio_fps") or 24
    output = state.data.get("audio_output") or str(DEFAULT_AUDIO_OUTPUT)
    live = state.data.get("audio_live") is True
    if not audio:
        return "Set an audio file first."
    if mapping and not Path(mapping).exists():
        return f"Mapping file not found: {mapping}"
    cmd = [
        sys.executable,
        "-m",
        "defora_cli.audio_reactive_modulator",
        "--audio",
        audio,
        "--fps",
        str(fps),
    ]
    if mapping:
        cmd.extend(["--mapping", mapping])
    if output and not live:
        cmd.extend(["--output", output])
    if live:
        cmd.append("--live")
        if output:
            cmd.extend(["--output", output])
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode == 0:
            return "Audio helper finished."
        return f"Audio helper failed ({result.returncode}): {result.stderr.strip() or result.stdout.strip()}"
    except Exception as exc:  # pragma: no cover - runtime only
        return f"Audio helper error: {exc}"


def dashboard(stdscr, state: DashboardState) -> None:
    curses.curs_set(0)
    while True:
        draw_ui(stdscr, state)
        key = stdscr.getch()
        fields = TAB_FIELDS[state.tab]
        cursor = state.cursor[state.tab]

        if key in (ord("q"), 27):
            break
        elif key in (curses.KEY_LEFT, ord("h")):
            tab_names = list(TAB_FIELDS.keys())
            idx = tab_names.index(state.tab)
            state.tab = tab_names[(idx - 1) % len(tab_names)]
        elif key in (curses.KEY_RIGHT, ord("l")):
            tab_names = list(TAB_FIELDS.keys())
            idx = tab_names.index(state.tab)
            state.tab = tab_names[(idx + 1) % len(tab_names)]
        elif key in (curses.KEY_UP, ord("k")):
            state.cursor[state.tab] = (cursor - 1) % len(fields)
        elif key in (curses.KEY_DOWN, ord("j")):
            state.cursor[state.tab] = (cursor + 1) % len(fields)
        elif key in (ord(" "),):
            label, cfg_key, typ = fields[cursor]
            if typ is bool:
                state.data[cfg_key] = toggle_field(state.data.get(cfg_key, False))
                state.status = f"Toggled {label}"
        elif key in (curses.KEY_ENTER, ord("\n"), ord("\r")):
            label, cfg_key, typ = fields[cursor]
            new_val = edit_field(stdscr, label, state.data.get(cfg_key), typ)
            state.data[cfg_key] = new_val
            state.status = f"Updated {label}"
        elif key == ord("s"):
            save_config(state.config_path, state.data)
            state.status = f"Saved {state.config_path}"
        elif key == ord("r"):
            state.data = ensure_defaults(load_config(state.config_path))
            state.status = "Reloaded config"
        elif key == ord("m"):
            keys = SENDABLE_KEYS.get(state.tab, [])
            state.status = send_to_mediator(state, keys)
        elif key == ord("g"):
            if state.tab == TAB_AUDIO:
                state.status = run_audio_helper(state)
            else:
                state.status = "Audio helper: switch to AUDIO SYNC tab"


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Deforumation-style curses dashboard.")
    parser.add_argument(
        "--config",
        default=str(DEFAULT_CONFIG_PATH),
        help="Path to DeforumationSendConfig.json (defaults to upstream location).",
    )
    parser.add_argument("--preset", help="Load a named preset from deforumation/presets/<name>.json if present.")
    parser.add_argument("--save-preset", help="Save the merged state to deforumation/presets/<name>.json on exit.")
    parser.add_argument("--host", default="localhost", help="Mediator host")
    parser.add_argument("--port", default="8766", help="Mediator port")
    return parser.parse_args(argv)


def main(argv: List[str] | None = None) -> None:
    args = parse_args(argv or sys.argv[1:])
    cfg_path = Path(args.config)
    if args.preset:
        preset_data = load_preset(args.preset)
        if not preset_data:
            preset_data = load_config(cfg_path)
    else:
        preset_data = load_config(cfg_path)
    data = ensure_defaults(preset_data)
    state = DashboardState(
        config_path=cfg_path,
        mediator_host=args.host,
        mediator_port=args.port,
        data=data,
    )
    curses.wrapper(lambda stdscr: dashboard(stdscr, state))
    if args.save_preset:
        path = save_preset(args.save_preset, state.data)
        print(f"Saved preset -> {path}")


if __name__ == "__main__":
    main()
