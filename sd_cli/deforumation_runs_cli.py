#!/usr/bin/env python3
"""
Skeleton TUI for browsing Deforumation runs and prepping re-run/continue actions.

Current scope:
  - Lists run manifests found under ./runs/<run_id>/run.json (or shows demo data)
  - Shows basic details for the selected run
  - Provides stub hotkeys for re-run/continue/edit/tag (no-op placeholders)

Planned next steps (phaseable):
  - Wire "re-run" and "continue" to the mediator/deforum CLI
  - Add override editing and prompt/seed tweaks before dispatch
  - Persist tags/notes into the manifest/index
  - Add thumbnail/ASCII preview of last frame
"""
from __future__ import annotations

import curses
import json
import os
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import subprocess
import threading
import sys

from .run_manifest_schema import validate_run_manifest

ASCII_PREVIEW = os.getenv("DEFORUMATION_ASCII_PREVIEW", "0") == "1"
AUTO_DISPATCH = os.getenv("DEFORUMATION_AUTO_DISPATCH", "0") == "1"
MODULE_ROOT = Path(__file__).resolve().parent
FORGE_CLI_PATH = os.getenv("DEFORUMATION_FORGE_CLI", str(MODULE_ROOT / "forge_cli.py"))

RUNS_DIR = Path("runs")


@dataclass
class RunRecord:
    run_id: str
    status: str
    started_at: str
    model: str
    length_frames: int
    tag: str
    manifest_path: Path
    last_frame_path: Optional[Path] = None
    prompt_positive: str = ""
    prompt_negative: str = ""
    seed: Optional[int] = None
    steps: Optional[int] = None
    strength: Optional[float] = None
    cfg: Optional[float] = None


def load_manifests() -> List[RunRecord]:
    records: List[RunRecord] = []
    if not RUNS_DIR.exists():
        return records
    for manifest in RUNS_DIR.glob("*/run.json"):
        try:
            with manifest.open("r", encoding="utf-8") as handle:
                blob = json.load(handle)
            validate_run_manifest(blob)
            run_id = manifest.parent.name
            rec = RunRecord(
                run_id=run_id,
                status=blob.get("status", "unknown"),
                started_at=blob.get("started_at", ""),
                model=blob.get("model", ""),
                length_frames=int(blob.get("frame_count", 0)),
                tag=blob.get("tag", ""),
                manifest_path=manifest,
                last_frame_path=Path(blob["last_frame"]) if blob.get("last_frame") else None,
                prompt_positive=blob.get("prompt_positive", ""),
                prompt_negative=blob.get("prompt_negative", ""),
                seed=blob.get("seed"),
                steps=blob.get("steps"),
                strength=blob.get("strength"),
                cfg=blob.get("cfg"),
            )
            records.append(rec)
        except Exception:
            continue
    return sorted(records, key=lambda r: r.run_id, reverse=True)


def demo_records() -> List[RunRecord]:
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    return [
        RunRecord(
            run_id="demo_run_01",
            status="completed",
            started_at=now,
            model="SDXL",
            length_frames=240,
            tag="test",
            manifest_path=Path("runs/demo_run_01/run.json"),
            prompt_positive="Surreal biomechanical cathedral",
            prompt_negative="lowres, watermark",
            seed=12345,
            steps=24,
            strength=0.65,
            cfg=6.5,
        ),
        RunRecord(
            run_id="demo_run_02",
            status="aborted",
            started_at=now,
            model="Flux-schnell",
            length_frames=96,
            tag="wip",
            manifest_path=Path("runs/demo_run_02/run.json"),
            prompt_positive="Retro city neon rain",
            prompt_negative="text, logo",
            seed=999,
            steps=12,
            strength=0.55,
            cfg=2.0,
        ),
    ]


class RunBrowser:
    def __init__(self, stdscr):
        self.stdscr = stdscr
        self.records: List[RunRecord] = []
        self.selected = 0
        self.status = "Up/Down move | r reload | c continue | R rerun | e overrides | t tag | q quit"
        self.reload_records()
        self.overrides: dict = {}
        self.preview_cache: Dict[str, List[str]] = {}

    def reload_records(self) -> None:
        recs = load_manifests()
        if not recs:
            recs = demo_records()
            self.status = "No manifests found; showing demo data. q to quit."
        self.records = recs
        self.selected = min(self.selected, max(len(self.records) - 1, 0))

    def run(self) -> None:
        curses.curs_set(0)
        self.stdscr.nodelay(False)
        while True:
            self.draw()
            key = self.stdscr.getch()
            if key in (ord("q"), 27):  # q or ESC
                break
            elif key in (curses.KEY_UP, ord("k")):
                self.selected = (self.selected - 1) % len(self.records)
            elif key in (curses.KEY_DOWN, ord("j")):
                self.selected = (self.selected + 1) % len(self.records)
            elif key in (ord("r"),):
                self.reload_records()
            elif key == ord("e"):
                self.overrides = self.prompt_overrides_structured()
            elif key == ord("t"):
                self.add_tag()
            elif key == ord("R"):
                self.make_request(mode="rerun")
            elif key == ord("c"):
                self.make_request(mode="continue")

    def draw(self) -> None:
        self.stdscr.erase()
        h, w = self.stdscr.getmaxyx()
        self.stdscr.addnstr(0, 0, "Deforumation Runs", w - 1, curses.A_BOLD)
        list_width = max(int(w * 0.4), 30)
        for idx, rec in enumerate(self.records):
            prefix = "> " if idx == self.selected else "  "
            line = f"{prefix}{rec.run_id:<20} {rec.status:<10} {rec.length_frames:>4}f {rec.model:<12} {rec.tag}"
            attr = curses.A_REVERSE if idx == self.selected else curses.A_NORMAL
            self.stdscr.addnstr(2 + idx, 0, line[: list_width - 1], list_width - 1, attr)

        # Details pane
        rec = self.records[self.selected]
        detail_x = list_width + 1
        y = 2
        def add(label: str, value: str) -> None:
            nonlocal y
            self.stdscr.addnstr(y, detail_x, f"{label}: {value}", w - detail_x - 1)
            y += 1

        add("Run", rec.run_id)
        add("Status", rec.status)
        add("Started", rec.started_at or "-")
        add("Model", rec.model or "-")
        add("Frames", str(rec.length_frames))
        add("Seed", str(rec.seed) if rec.seed is not None else "-")
        add("Steps", str(rec.steps) if rec.steps is not None else "-")
        add("Strength", f"{rec.strength:.3f}" if rec.strength is not None else "-")
        add("CFG", f"{rec.cfg:.2f}" if rec.cfg is not None else "-")
        add("Tag", rec.tag or "-")
        add("Manifest", str(rec.manifest_path))
        add("Last frame", str(rec.last_frame_path) if rec.last_frame_path else "-")
        add("Prompt+", (rec.prompt_positive or "")[: w - detail_x - 5])
        add("Prompt-", (rec.prompt_negative or "")[: w - detail_x - 5])
        if ASCII_PREVIEW and rec.last_frame_path and rec.last_frame_path.exists():
            self.draw_ascii_preview(rec.last_frame_path, detail_x, y, h, w)

        # Footer status
        self.stdscr.hline(h - 2, 0, "-", w - 1)
        self.stdscr.addnstr(h - 1, 0, self.status[: w - 1], w - 1)
        self.stdscr.refresh()

    def prompt_overrides_structured(self) -> dict:
        rec = self.records[self.selected]
        prompts = [
            ("seed", rec.seed),
            ("steps", rec.steps),
            ("strength", rec.strength),
            ("cfg", rec.cfg),
            ("frame_count", rec.length_frames),
        ]
        overrides = {}
        curses.echo()
        try:
            for key, default in prompts:
                self.stdscr.addstr(f"{key} [{default if default is not None else ''}]: ")
                self.stdscr.clrtoeol()
                raw = self.stdscr.getstr().decode("utf-8").strip()
                if raw == "":
                    continue
                overrides[key] = raw
        finally:
            curses.noecho()
        self.status = f"Overrides set: {overrides}" if overrides else "No overrides set"
        return overrides

    def add_tag(self) -> None:
        rec = self.records[self.selected]
        prompt = f"Tag for {rec.run_id}: "
        curses.echo()
        self.stdscr.addstr(prompt)
        self.stdscr.clrtoeol()
        line = self.stdscr.getstr().decode("utf-8")
        curses.noecho()
        rec.tag = line.strip()
        # Optionally persist: write back to manifest
        try:
            if rec.manifest_path.exists():
                with rec.manifest_path.open("r", encoding="utf-8") as h:
                    blob = json.load(h)
                blob["tag"] = rec.tag
                with rec.manifest_path.open("w", encoding="utf-8") as h:
                    json.dump(blob, h, indent=2)
        except Exception:
            pass
        self.status = f"Tagged {rec.run_id} as '{rec.tag}'"

    def make_request(self, mode: str) -> None:
        rec = self.records[self.selected]
        request = {
            "mode": mode,
            "base_run": rec.run_id,
            "manifest": str(rec.manifest_path),
            "last_frame": str(rec.last_frame_path) if rec.last_frame_path else None,
            "overrides": self.overrides,
        }
        outfile = rec.manifest_path.parent / f"{mode}_request.json"
        try:
            with outfile.open("w", encoding="utf-8") as h:
                json.dump(request, h, indent=2)
            self.status = f"Saved {mode} request -> {outfile}"
            if AUTO_DISPATCH:
                self.run_dispatcher_async(outfile)
        except Exception as exc:
            self.status = f"Failed to save {mode} request: {exc}"

    def draw_ascii_preview(self, path: Path, x: int, start_y: int, max_h: int, max_w: int) -> None:
        cache_key = str(path)
        if cache_key in self.preview_cache:
            lines = self.preview_cache[cache_key]
            for idx, line in enumerate(lines):
                if start_y + idx >= max_h - 2:
                    break
                self.stdscr.addnstr(start_y + idx, x, line, max_w - x - 1)
            return
        try:
            from PIL import Image
        except Exception:
            return
        try:
            img = Image.open(path).convert("L")
            target_w = max_w - x - 1
            target_h = max_h - start_y - 3
            if target_w <= 0 or target_h <= 0:
                return
            img.thumbnail((target_w, target_h))
            pixels = img.load()
            chars = "@%#*+=-:. "
            lines = []
            for iy in range(img.height):
                line_chars = []
                for ix in range(img.width):
                    val = pixels[ix, iy] / 255.0
                    line_chars.append(chars[int(val * (len(chars) - 1))])
                lines.append("".join(line_chars))
            self.preview_cache[cache_key] = lines
            for idx, line in enumerate(lines):
                if start_y + idx >= max_h - 2:
                    break
                self.stdscr.addnstr(start_y + idx, x, line, max_w - x - 1)
        except Exception:
            return

    def run_dispatcher_async(self, request_path: Path) -> None:
        """Invoke the dispatcher in a background thread to avoid UI blocking."""
        def worker():
            try:
                result = subprocess.run(
                    [
                        sys.executable,
                        "-m",
                        "sd_cli.deforumation_request_dispatcher",
                        "--request",
                        str(request_path),
                        "--execute",
                        "--forge-cli",
                        FORGE_CLI_PATH,
                    ],
                    capture_output=True,
                    text=True,
                    check=False,
                )
                if result.returncode == 0:
                    self.status = f"Dispatched {request_path.name}"
                else:
                    self.status = f"Dispatch failed ({result.returncode}): {result.stderr.strip()}"
            except Exception as exc:
                self.status = f"Dispatch error: {exc}"

        t = threading.Thread(target=worker, daemon=True)
        t.start()


def main(stdscr):
    browser = RunBrowser(stdscr)
    browser.run()


if __name__ == "__main__":
    curses.wrapper(main)
