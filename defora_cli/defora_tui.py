#!/usr/bin/env python3
"""
Defora TUI — multi-tab ncurses controller (LIVE, PROMPTS, MOTION, AUDIO/BEATS, CONTROLNET, SETTINGS).

Designed for large terminals (~170 cols / 45 rows) to feel like a playable instrument:
- Big preview + waveform strip always visible.
- Per-parameter sources (Manual/Beat/MIDI).
- Macro/MIDI status surfaced inline.
- Tab-specific panels mirror the design docs.

This is a UI skeleton; hook up real mediator/param logic as needed.
"""
from __future__ import annotations

import curses
from dataclasses import dataclass
from typing import Dict, List

TABS = ["LIVE", "PROMPTS", "MOTION", "AUDIO", "CONTROLNET", "SETTINGS"]
SOURCES = ["Manual", "Beat", "MIDI"]


@dataclass
class Param:
    name: str
    value: float
    min_value: float = 0.0
    max_value: float = 1.5
    step: float = 0.02
    source: str = "Manual"  # Manual / Beat / MIDI

    def clamp(self) -> None:
        self.value = max(self.min_value, min(self.value, self.max_value))

    def adjust(self, delta: float) -> None:
        self.value += delta
        self.clamp()

    def next_source(self) -> None:
        idx = SOURCES.index(self.source)
        self.source = SOURCES[(idx + 1) % len(SOURCES)]


def center_text(win, y: int, text: str, attr: int = 0):
    h, w = win.getmaxyx()
    x = max(0, (w - len(text)) // 2)
    win.addnstr(y, x, text, w - 1, attr)


class DeforaTUI:
    def __init__(self, stdscr):
        self.stdscr = stdscr
        self.tab = 0
        self.params: Dict[str, Param] = {
            "cfg": Param("Vibe (CFG)", 0.63),
            "strength": Param("Strength", 0.78, max_value=1.5),
            "noise": Param("Noise / Glitch", 0.20, max_value=1.0),
            "zoom": Param("Zoom", 0.80, min_value=0.2, max_value=2.0, step=0.05),
            "panx": Param("Pan X", 0.10, min_value=-1.0, max_value=1.0, step=0.05),
            "pany": Param("Pan Y", 0.00, min_value=-1.0, max_value=1.0, step=0.05),
            "rotate": Param("Rotate H", 0.00, min_value=-180, max_value=180, step=1.0),
        }
        self.selected_param = "cfg"
        self.session = "clown_set_01"
        self.seed = 42490527
        self.fps = 29
        self.lat = 120
        self.engine_status = "RUN"
        self.macros = [("Vibe", True), ("Zoom", True), ("Noise", False)]
        self.midi_device = "LaunchControl XL"
        self.status = "SPACE: toggle source • ←/→ adjust • Q: quit"

    def run(self):
        curses.curs_set(0)
        self.stdscr.nodelay(False)
        while True:
            self.draw()
            key = self.stdscr.getch()
            if key in (ord("q"), ord("Q")):
                break
            if key in (curses.KEY_F1, ord("1")):
                self.tab = 0
            elif key in (curses.KEY_F2, ord("2")):
                self.tab = 1
            elif key in (curses.KEY_F3, ord("3")):
                self.tab = 2
            elif key in (curses.KEY_F4, ord("4")):
                self.tab = 3
            elif key in (curses.KEY_F5, ord("5")):
                self.tab = 4
            elif key in (curses.KEY_F6, ord("6")):
                self.tab = 5
            elif key in (curses.KEY_LEFT, ord("h")):
                self.adjust_selected(-self.params[self.selected_param].step)
            elif key in (curses.KEY_RIGHT, ord("l")):
                self.adjust_selected(self.params[self.selected_param].step)
            elif key in (ord(" "),):
                if self.tab == 0:
                    self.params[self.selected_param].next_source()
            elif key in (ord("k"), curses.KEY_UP):
                self.prev_param()
            elif key in (ord("j"), curses.KEY_DOWN):
                self.next_param()

    def adjust_selected(self, delta: float):
        p = self.params[self.selected_param]
        p.adjust(delta)
        self.status = f"{p.name} -> {p.value:.2f} ({p.source})"

    def prev_param(self):
        keys = list(self.params.keys())
        idx = keys.index(self.selected_param)
        self.selected_param = keys[(idx - 1) % len(keys)]

    def next_param(self):
        keys = list(self.params.keys())
        idx = keys.index(self.selected_param)
        self.selected_param = keys[(idx + 1) % len(keys)]

    def draw(self):
        self.stdscr.erase()
        h, w = self.stdscr.getmaxyx()
        header = f"DEFORA TUI v0.2  Session: {self.session}  [Q]uit  [F1..F6]"
        self.stdscr.addnstr(0, 0, header.ljust(w), w - 1, curses.A_REVERSE)
        bar = (
            f"F1 LIVE  F2 PROMPTS  F3 MOTION  F4 AUDIO/BEATS  F5 CONTROLNET  F6 SETTINGS    "
            f"Engine: {self.engine_status}  FPS:{self.fps}  Lat:{self.lat}ms"
        )
        self.stdscr.addnstr(1, 0, bar.ljust(w), w - 1, curses.A_REVERSE)

        if self.tab == 0:
            self.draw_live()
        elif self.tab == 1:
            self.draw_prompts()
        elif self.tab == 2:
            self.draw_motion()
        elif self.tab == 3:
            self.draw_audio()
        elif self.tab == 4:
            self.draw_controlnet()
        elif self.tab == 5:
            self.draw_settings()

        self.stdscr.addnstr(h - 2, 0, "─" * (w - 1), w - 1)
        self.stdscr.addnstr(h - 1, 0, self.status.ljust(w - 1), w - 1)
        self.stdscr.refresh()

    def draw_preview_block(self, y: int, x: int, width: int, height: int):
        self.stdscr.addnstr(y, x, "+" + "-" * (width - 2) + "+", width)
        for i in range(1, height - 1):
            self.stdscr.addnstr(y + i, x, "|" + " " * (width - 2) + "|", width)
        self.stdscr.addnstr(y + height - 1, x, "+" + "-" * (width - 2) + "+", width)
        center_text(self.stdscr, y + height // 2 - 1, "[ ASCII VIDEO FRAME HERE ]")
        center_text(self.stdscr, y + height // 2, "(clown in box, etc.)")

    def draw_slider(self, y: int, label: str, param: Param, active: bool = False):
        bar_w = 20
        filled = int(((param.value - param.min_value) / (param.max_value - param.min_value)) * bar_w)
        bar = "█" * filled + "-" * (bar_w - filled)
        line = f"{label:<15} {param.value:>6.2f}  [{bar}]"
        attr = curses.A_REVERSE if active else curses.A_NORMAL
        self.stdscr.addnstr(y, 1, line, len(line), attr)

    def draw_live(self):
        h, w = self.stdscr.getmaxyx()
        left_w = int(w * 0.6)
        # Preview block
        self.draw_preview_block(3, 1, left_w - 2, 12)
        self.stdscr.addnstr(16, 1, f"Time: 00:08.5  Seed: {self.seed}   Playhead: █████░░░░░", w - 2)

        # Waveform strip
        self.stdscr.addnstr(18, 1, "THUMBNAILS + WAVEFORM", w - 2, curses.A_BOLD)
        self.stdscr.addnstr(19, 1, "[thumb]" * 10 + "...", w - 2)
        self.stdscr.addnstr(20, 1, "Tempo: 120 BPM        |      |      |      |      |      |      |", w - 2)
        self.stdscr.addnstr(21, 1, "Audio:   /\\/\\__/\\/\\_/\\/\\____/\\/\\/\\/\\____/\\/\\____/\\/\\/\\/\\____/\\/\\____", w - 2)

        # Columns
        col1_x = 1
        col2_x = int(w * 0.4)
        col3_x = int(w * 0.7)
        self.stdscr.addnstr(23, col1_x, "VIBE & STYLE", w - 2, curses.A_BOLD)
        self.draw_slider(24, "Vibe (CFG)", self.params["cfg"], self.selected_param == "cfg")
        self.draw_slider(25, "Strength", self.params["strength"], self.selected_param == "strength")
        self.draw_slider(26, "Noise / Glitch", self.params["noise"], self.selected_param == "noise")
        self.draw_slider(27, "CFG scale", Param("CFG scale", 5.00, 0, 15), False)
        self.draw_slider(28, "Cadence", Param("Cadence", 2.00, 0, 8), False)

        self.stdscr.addnstr(23, col2_x, "CAMERA & MOTION", w - col2_x - 2, curses.A_BOLD)
        self.draw_slider(24, "Zoom", self.params["zoom"], self.selected_param == "zoom")
        self.draw_slider(25, "Pan X", self.params["panx"], self.selected_param == "panx")
        self.draw_slider(26, "Pan Y", self.params["pany"], self.selected_param == "pany")
        self.draw_slider(27, "Tilt", Param("Tilt", 0.00, -180, 180, 1.0), False)
        self.draw_slider(28, "Rotate H", self.params["rotate"], self.selected_param == "rotate")
        self.stdscr.addnstr(29, col2_x, "Motion preset: [Tunnel Push]  (1 Static 2 Orbit 3 Chaos)", w - col2_x - 2)

        self.stdscr.addnstr(23, col3_x, "SOURCES / MACROS / MIDI", w - col3_x - 2, curses.A_BOLD)
        src_lines = [
            f"Vibe:     {' '.join(SOURCES)}",
            f"Strength: {' '.join(SOURCES)}",
            f"Zoom:     {' '.join(SOURCES)}",
            f"Noise:    {' '.join(SOURCES)}",
            "(TAB cycles • SPACE selects source)",
            "",
            "Beat macros:",
        ]
        for i, line in enumerate(src_lines):
            self.stdscr.addnstr(24 + i, col3_x, line, w - col3_x - 2)
        for idx, (name, on) in enumerate(self.macros):
            self.stdscr.addnstr(31 + idx, col3_x, f"  {idx+1} {name} ({'ON' if on else 'OFF'})", w - col3_x - 2)
        self.stdscr.addnstr(34, col3_x, f"MIDI: {self.midi_device} connected", w - col3_x - 2)

        self.stdscr.addnstr(
            h - 4,
            1,
            "TRANSPORT: [SPACE] Play/Pause   [←/→] Nudge frame   [<] Prev keyframe   [>] Next keyframe   [R]ec   [L]oop   [H]ide HUD",
            w - 2,
        )
        self.stdscr.addnstr(
            h - 3, 1, "Status: Beat macros active • MIDI device connected", w - 2
        )

    def draw_prompts(self):
        h, w = self.stdscr.getmaxyx()
        self.stdscr.addnstr(2, 1, "POSITIVE PROMPT A (FULL WIDTH)", w - 2, curses.A_BOLD)
        self.stdscr.addnstr(
            3,
            1,
            '"clown squeezed into a comically small box, shot in a photographic style, detailed view, highlighting the clown"',
            w - 2,
        )
        self.stdscr.addnstr(4, 1, "(E to edit in full-screen editor)", w - 2)
        self.stdscr.addnstr(6, 1, "NEGATIVE PROMPT", w - 2, curses.A_BOLD)
        self.stdscr.addnstr(
            7, 1, '"(bad quality), (worst quality), broken hands, bad anatomy, deformed, boring"', w - 2
        )
        self.stdscr.addnstr(9, 1, "PROMPT MORPHING", w - 2, curses.A_BOLD)
        self.stdscr.addnstr(10, 1, "Morph: [ON ]    Global blend A ●────────────○──────────── B", w - 2)
        table = [
            "ID  On  Name           A prompt                  B prompt                  Range (A..B)",
            "1   X   clean→mad      clean evil clown          abstract mad clown        0.40 – 1.00",
            "2   X   box→tunnel     small box                 neon tunnel               0.00 – 0.60",
            "3   .   style fade     photographic style        anime render              0.20 – 0.80",
            "4   .   extra slot     (empty)                   (empty)                   0.00 – 1.00",
        ]
        for i, line in enumerate(table):
            self.stdscr.addnstr(12 + i, 1, line, w - 2)
        self.stdscr.addnstr(
            h - 4,
            1,
            "↑/↓ move • SPACE toggle • A/B edit • R range • N new • DEL delete • U update • CTRL+S save • CTRL+L load",
            w - 2,
        )

    def draw_motion(self):
        h, w = self.stdscr.getmaxyx()
        self.stdscr.addnstr(2, 1, "CAMERA LIVE CONTROLS", w - 2, curses.A_BOLD)
        rows = [
            "Pan X:    0.10  [───○────────────]   Pan Y:    0.00  [────○──────────]",
            "Zoom:     0.80  [███████────────]   Tilt:     0.00  [────○──────────]",
            "Rotate H: 0.00  [────○──────────]   Rotate V: 0.00  [────○──────────]",
            "Presets: [1 Static] [2 Orbit] [3 Tunnel Push] [4 Handheld] [5 Chaos]",
        ]
        for i, line in enumerate(rows):
            self.stdscr.addnstr(3 + i, 1, line, w - 2)
        self.stdscr.addnstr(8, 1, "CAMERA CURVES (MULTI-LANE)", w - 2, curses.A_BOLD)
        lanes = [
            "Lane: [Pan X ▼]  View: [All lanes]",
            "Pan X:  1.0 ───────•───────────────•───────────────•──────────────",
            "         0.0 ──•──────────•───────────────────────────────•───────",
            "        -1.0 ────────────────────────────────────────────────────",
            "Pan Y:  1.0 ──•───────────────•───────────────•─────────────",
            "         0.0 ────────────────────────────────────────────────",
            "        -1.0 ────────────────────────────────────────────────",
            "beats: 0           4               8               12",
            "Controls: I insert • DEL delete • ←/→ move • ↑/↓ adjust • B snap • TAB change lane",
        ]
        for i, line in enumerate(lanes):
            self.stdscr.addnstr(9 + i, 1, line, w - 2)
        self.stdscr.addnstr(h - 4, 1, "Hints: apply presets with number keys • SHIFT+F1..F4 save preset slots", w - 2)

    def draw_audio(self):
        h, w = self.stdscr.getmaxyx()
        self.stdscr.addnstr(2, 1, "TRACK & TEMPO", w - 2, curses.A_BOLD)
        self.stdscr.addnstr(3, 1, "Track: my_track.wav    [T Change]   BPM: [Auto 114.8]  (M manual • Tap tempo [K])", w - 2)
        self.stdscr.addnstr(4, 1, "Tempo changes: |120 @ bar 1|  |128 @ bar 17|  |110 @ bar 33|   (E edit)", w - 2)
        self.stdscr.addnstr(6, 1, "WAVEFORM + TEMPO LANE", w - 2, curses.A_BOLD)
        wf = [
            "Tempo: 120              120               128                     110",
            "       |                 |                 |                       |",
            "Audio:  /\\/\\_/\\/\\/\\__/\\/\\/\\/\\____/\\/\\/\\/\\/__/\\/\\___/\\/\\__/\\/\\/\\__/\\/\\____",
            "Beats:  |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |",
        ]
        for i, line in enumerate(wf):
            self.stdscr.addnstr(7 + i, 1, line, w - 2)
        self.stdscr.addnstr(11, 1, "MACRO RACK (max 6)", w - 2, curses.A_BOLD)
        rack_lines = [
            "> Macro 1 [ON ] Target: [Vibe (CFG)] Shape: [Sine] Speed: [1/4 note] Depth: [█████────] Offset: [──○─────] Source: [Beat]",
            "  Macro 2 [on ] Target: [Zoom]      Shape: [Saw ] Speed: [1 bar   ] Depth: [██████──] Offset: [────○───] Source: [Beat]",
            "  Macro 3 [off] Target: [Noise]     Shape: [Noise] Speed: [1/8 note] Depth: [███─────] Offset: [────○───] Source: [Beat]",
            "  [+] Add macro (max 6)    ↑/↓ select macro • ENTER toggle • G show in graph",
        ]
        for i, line in enumerate(rack_lines):
            self.stdscr.addnstr(12 + i, 1, line, w - 2)
        self.stdscr.addnstr(16, 1, "ACTIVE MACRO CURVE", w - 2, curses.A_BOLD)
        curve = [
            "Active: Macro 1 → Vibe (CFG) → Sine @ 1/4",
            "1.0 ───────•─────────────•───────────────",
            "0.0 ──•──────────•────────────────────────",
            "-1.0 ────────────────────────────────────",
            "     bar 0        4          8          12   Tools: P preset • S smooth • R random • B beat snap",
        ]
        for i, line in enumerate(curve):
            self.stdscr.addnstr(17 + i, 1, line, w - 2)
        self.stdscr.addnstr(h - 4, 1, "Hint: if target source is MIDI, show warning 'Overridden by MIDI – press O to switch to Beat'", w - 2)

    def draw_controlnet(self):
        h, w = self.stdscr.getmaxyx()
        self.stdscr.addnstr(2, 1, "SLOTS (CN1–CN5)", w - 2, curses.A_BOLD)
        self.stdscr.addnstr(3, 1, "[CN1] [CN2*] [CN3] [CN4] [CN5] (TAB to change)", w - 2)
        self.stdscr.addnstr(5, 1, "CN2 SETTINGS", w - 2, curses.A_BOLD)
        left = [
            "Model:  [Canny]         Source image: clown_edges.png   [O open path]",
            "Enabled: [X]  Bypass: [ ]",
            "Weight:        0.40 [█████────]",
            "Start step:    0.00 [█--------]",
            "End step:      0.90 [█████████─]",
            "Low threshold:   52 [█████----]",
            "High threshold:  103 [████████─]",
        ]
        for i, line in enumerate(left):
            self.stdscr.addnstr(6 + i, 1, line, w - 2)
        drive = [
            "Drive parameters:",
            "  [ ] Vibe / CFG    [X] Camera pan/tilt    [ ] Zoom pulse    [ ] Noise/Glitch",
            "Slot ops: D duplicate • R reset • C clear image • I import Deforum preset",
        ]
        for i, line in enumerate(drive):
            self.stdscr.addnstr(14 + i, 1, line, w - 2)

    def draw_settings(self):
        h, w = self.stdscr.getmaxyx()
        self.stdscr.addnstr(2, 1, "ENGINE", w - 2, curses.A_BOLD)
        eng = [
            "Resolution: [1024x576]   FPS: [30]     Steps: [30]",
            "Sampler:   [DPM++ 2M Karras]",
            "Seed mode: ( ) Iteration  (X) Fixed  ( ) Random  ( ) Ladder  ( ) Alternate",
            "Fixed seed: [42490527]   [N new]",
            "Preview CRF: [ 20 ]     Low-latency: [X]",
            "Output dir: /renders/clown_set_01    [B browse]",
        ]
        for i, line in enumerate(eng):
            self.stdscr.addnstr(3 + i, 1, line, w - 2)
        self.stdscr.addnstr(10, 1, "CONTROLLERS / MIDI", w - 2, curses.A_BOLD)
        ctrl = [
            "Devices:",
            "  ● LaunchControl XL        [ON ]",
            "  ○ MiniLab mk2             [off]",
            "  ○ Virtual MIDI Bus 1      [off]",
            "  [R]escan devices                      MIDI: OK",
            "Learn mode: [OFF] (press L to toggle; move a knob to capture CC)",
            "Mappings:",
            "  CC 21 (LaunchControl) → Vibe (CFG)",
            "  CC 22 (LaunchControl) → Strength",
            "  CC 23 (LaunchControl) → Zoom",
            "For selected mapping: Mode [Absolute] Range 0–100% Curve [Linear]",
        ]
        for i, line in enumerate(ctrl):
            self.stdscr.addnstr(11 + i, 1, line, w - 2)
        mapping = [
            "Source (device/CC)        → Target parameter         Mode      Range       Curve",
            "LaunchControl CC21        → Vibe (CFG)              Absolute   0–100%     Linear",
            "LaunchControl CC22        → Strength                Absolute   0–100%     Linear",
            "LaunchControl CC23        → Zoom                    Absolute   0–150%     Exponential",
            "↑/↓ select • ENTER edit target • M mode • R range • C curve • DEL remove",
        ]
        base = 22
        for i, line in enumerate(mapping):
            self.stdscr.addnstr(base + i, 1, line, w - 2)
        self.stdscr.addnstr(
            h - 4,
            1,
            "Hints: TAB move sections • ENTER edit • +/- tweak numbers • CTRL+S save config",
            w - 2,
        )


def main(stdscr):
    ui = DeforaTUI(stdscr)
    ui.run()


if __name__ == "__main__":
    curses.wrapper(main)
