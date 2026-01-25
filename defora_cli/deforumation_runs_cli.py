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
    notes: str = ""
    metadata: Optional[Dict] = None


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
                notes=blob.get("notes", ""),
                metadata=blob.get("metadata", {}),
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
        self.batch_mode = False
        self.selected_runs: set = set()
        self.comparison_mode = False
        self.comparison_runs: List[int] = []

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
                if self.comparison_mode:
                    self.comparison_mode = False
                    self.comparison_runs = []
                    continue
                if self.batch_mode:
                    self.batch_mode = False
                    self.selected_runs.clear()
                    continue
                break
            elif key in (curses.KEY_UP, ord("k")):
                self.selected = (self.selected - 1) % len(self.records)
            elif key in (curses.KEY_DOWN, ord("j")):
                self.selected = (self.selected + 1) % len(self.records)
            elif key in (ord("r"),):
                self.reload_records()
            elif key == ord("e"):
                if not self.comparison_mode:
                    self.overrides = self.prompt_overrides_structured()
            elif key == ord("t"):
                if not self.comparison_mode:
                    self.add_tag()
            elif key == ord("n"):
                if not self.comparison_mode:
                    self.edit_notes()
            elif key == ord("R"):
                if not self.comparison_mode:
                    self.make_request_with_preview(mode="rerun")
            elif key == ord("c"):
                if not self.comparison_mode:
                    self.make_request_with_preview(mode="continue")
            elif key == ord("b"):
                # Toggle batch mode
                self.batch_mode = not self.batch_mode
                if not self.batch_mode:
                    self.selected_runs.clear()
                self.status = f"Batch mode: {'ON' if self.batch_mode else 'OFF'}"
            elif key == ord(" ") and self.batch_mode:
                # Space to select/deselect runs in batch mode
                if self.selected in self.selected_runs:
                    self.selected_runs.remove(self.selected)
                else:
                    self.selected_runs.add(self.selected)
            elif key == ord("B") and self.batch_mode:
                # Batch rerun
                self.batch_rerun()
            elif key == ord("D") and self.batch_mode:
                # Batch delete
                self.batch_delete()
            elif key == ord("v"):
                # Toggle comparison mode
                if not self.comparison_mode:
                    self.comparison_runs = [self.selected]
                    self.comparison_mode = True
                    self.status = "Comparison mode: Select run to compare (v to add, q to exit)"
                else:
                    if len(self.comparison_runs) < 4:  # Max 4 runs to compare
                        if self.selected not in self.comparison_runs:
                            self.comparison_runs.append(self.selected)
                    self.status = f"Comparing {len(self.comparison_runs)} runs"

    def draw(self) -> None:
        self.stdscr.erase()
        h, w = self.stdscr.getmaxyx()
        
        # Header with mode indicators
        header = "Deforumation Runs"
        if self.batch_mode:
            header += " [BATCH MODE]"
        if self.comparison_mode:
            header += f" [COMPARE: {len(self.comparison_runs)} runs]"
        
        # Keybinding help
        if self.comparison_mode:
            help_text = " | [↑↓/jk] nav | [v] add to compare | [q] exit compare"
        elif self.batch_mode:
            help_text = " | [↑↓] nav | [SPACE] select | [B] batch rerun | [D] batch delete | [b] exit batch | [q] quit"
        else:
            help_text = " | [↑↓/jk] nav | [r] reload | [e] overrides | [t] tag | [n] notes | [R] rerun | [c] continue | [b] batch | [v] compare | [q] quit"
        
        self.stdscr.addnstr(0, 0, header + help_text, w - 1, curses.A_BOLD)
        
        list_width = max(int(w * 0.4), 30)
        
        if self.comparison_mode and len(self.comparison_runs) > 0:
            self.draw_comparison_view(h, w)
        else:
            self.draw_list_view(h, w, list_width)
        
        # Footer status
        self.stdscr.hline(h - 2, 0, "-", w - 1)
        self.stdscr.addnstr(h - 1, 0, self.status[: w - 1], w - 1)
        self.stdscr.refresh()
    
    def draw_list_view(self, h: int, w: int, list_width: int) -> None:
        """Draw the standard list view"""
        for idx, rec in enumerate(self.records):
            if idx >= h - 4:
                break
            
            # Show selection marker
            if self.batch_mode and idx in self.selected_runs:
                prefix = "[X] "
            else:
                prefix = "> " if idx == self.selected else "  "
            
            line = f"{prefix}{rec.run_id:<20} {rec.status:<10} {rec.length_frames:>4}f {rec.model:<12} {rec.tag}"
            attr = curses.A_REVERSE if idx == self.selected else curses.A_NORMAL
            self.stdscr.addnstr(2 + idx, 0, line[: list_width - 1], list_width - 1, attr)
        
        # Details pane (only in list view, not comparison)
        if not self.comparison_mode:
            rec = self.records[self.selected]
            detail_x = list_width + 1
            y = 2
            def add(label: str, value: str) -> None:
                nonlocal y
                if y < h - 3:
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
            add("Notes", rec.notes or "-")
            add("Manifest", str(rec.manifest_path))
            add("Last frame", str(rec.last_frame_path) if rec.last_frame_path else "-")
            add("Prompt+", (rec.prompt_positive or "")[: w - detail_x - 5])
            add("Prompt-", (rec.prompt_negative or "")[: w - detail_x - 5])
            if ASCII_PREVIEW and rec.last_frame_path and rec.last_frame_path.exists():
                self.draw_ascii_preview(rec.last_frame_path, detail_x, y, h, w)
    
    def draw_comparison_view(self, h: int, w: int) -> None:
        """Draw comparison view for multiple runs"""
        if not self.comparison_runs:
            return
        
        # Calculate column widths
        num_runs = len(self.comparison_runs)
        col_width = (w - 2) // num_runs
        
        # Header row
        y = 2
        for idx, run_idx in enumerate(self.comparison_runs):
            if run_idx < len(self.records):
                rec = self.records[run_idx]
                x = idx * col_width
                self.stdscr.addnstr(y, x, f"Run {idx+1}: {rec.run_id[:15]}", col_width - 1, curses.A_BOLD)
        
        y += 1
        self.stdscr.hline(y, 0, "-", w - 1)
        y += 1
        
        # Compare fields
        fields = [
            ("Status", lambda r: r.status),
            ("Model", lambda r: r.model),
            ("Frames", lambda r: str(r.length_frames)),
            ("Seed", lambda r: str(r.seed) if r.seed else "-"),
            ("Steps", lambda r: str(r.steps) if r.steps else "-"),
            ("Strength", lambda r: f"{r.strength:.3f}" if r.strength is not None else "-"),
            ("CFG", lambda r: f"{r.cfg:.2f}" if r.cfg is not None else "-"),
            ("Tag", lambda r: r.tag or "-"),
        ]
        
        for field_name, field_fn in fields:
            if y >= h - 3:
                break
            # Print field name
            self.stdscr.addnstr(y, 0, field_name + ":", 20)
            
            # Print values for each run
            for idx, run_idx in enumerate(self.comparison_runs):
                if run_idx < len(self.records):
                    rec = self.records[run_idx]
                    value = field_fn(rec)
                    x = idx * col_width
                    self.stdscr.addnstr(y, x, value[:col_width-1], col_width - 1)
            y += 1
        add("Model", rec.model or "-")
        add("Frames", str(rec.length_frames))
        add("Seed", str(rec.seed) if rec.seed is not None else "-")
        add("Steps", str(rec.steps) if rec.steps is not None else "-")
        add("Strength", f"{rec.strength:.3f}" if rec.strength is not None else "-")
        add("CFG", f"{rec.cfg:.2f}" if rec.cfg is not None else "-")
        add("Tag", rec.tag or "-")
        add("Notes", rec.notes or "-")
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
        # Persist tag to manifest
        self.save_manifest_metadata(rec)
        self.status = f"Tagged {rec.run_id} as '{rec.tag}'"
    
    def edit_notes(self) -> None:
        """Edit notes for the selected run and persist to manifest"""
        rec = self.records[self.selected]
        curses.echo()
        curses.curs_set(1)
        self.stdscr.addstr(self.h - 2, 0, f"Notes for {rec.run_id}: ")
        self.stdscr.clrtoeol()
        try:
            # Allow up to 200 characters for notes
            new_notes = self.stdscr.getstr(self.h - 2, 30, 200).decode("utf-8")
            rec.notes = new_notes
            # Persist notes to manifest
            self.save_manifest_metadata(rec)
            self.status = f"Updated notes for {rec.run_id}"
        except Exception:
            pass
        finally:
            curses.noecho()
            curses.curs_set(0)
    
    def save_manifest_metadata(self, rec: RunRecord) -> None:
        """Save tag, notes, and metadata back to the manifest file"""
        try:
            with rec.manifest_path.open("r", encoding="utf-8") as h:
                manifest = json.load(h)
            
            manifest["tag"] = rec.tag
            manifest["notes"] = rec.notes
            if rec.metadata:
                manifest["metadata"] = rec.metadata
            
            with rec.manifest_path.open("w", encoding="utf-8") as h:
                json.dump(manifest, h, indent=2)
        except Exception as exc:
            self.status = f"Failed to save metadata: {exc}"

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
    
    def make_request_with_preview(self, mode: str) -> None:
        """Make request with pre-dispatch parameter preview and editing"""
        rec = self.records[self.selected]
        
        # Show preview dialog
        curses.curs_set(1)
        h, w = self.stdscr.getmaxyx()
        
        # Create preview window
        preview_h = min(15, h - 4)
        preview_w = min(60, w - 4)
        preview_y = (h - preview_h) // 2
        preview_x = (w - preview_w) // 2
        
        try:
            preview_win = curses.newwin(preview_h, preview_w, preview_y, preview_x)
            preview_win.box()
            preview_win.addstr(0, 2, f" {mode.upper()} Preview ", curses.A_BOLD)
            
            y = 2
            preview_win.addstr(y, 2, f"Run: {rec.run_id}"); y += 1
            preview_win.addstr(y, 2, f"Model: {rec.model}"); y += 1
            preview_win.addstr(y, 2, f"Frames: {rec.length_frames}"); y += 1
            
            if self.overrides:
                y += 1
                preview_win.addstr(y, 2, "Overrides:", curses.A_BOLD); y += 1
                for key, value in self.overrides.items():
                    preview_win.addstr(y, 4, f"{key}: {value}"); y += 1
            
            y += 1
            preview_win.addstr(y, 2, "Continue? [y]es / [e]dit / [n]o")
            preview_win.refresh()
            
            # Get user input
            key = preview_win.getch()
            
            if key == ord('y') or key == ord('Y'):
                # Proceed with request
                self.make_request(mode)
            elif key == ord('e') or key == ord('E'):
                # Edit overrides first
                curses.curs_set(0)
                self.overrides = self.prompt_overrides_structured()
                self.make_request(mode)
            else:
                # Cancel
                self.status = f"{mode} cancelled"
        finally:
            curses.curs_set(0)
    
    def batch_rerun(self) -> None:
        """Batch rerun selected runs"""
        if not self.selected_runs:
            self.status = "No runs selected for batch rerun"
            return
        
        # Confirm
        h, w = self.stdscr.getmaxyx()
        confirm_msg = f"Rerun {len(self.selected_runs)} runs? [y/n]"
        self.stdscr.addstr(h - 2, 0, confirm_msg, curses.A_REVERSE)
        self.stdscr.refresh()
        
        key = self.stdscr.getch()
        if key != ord('y') and key != ord('Y'):
            self.status = "Batch rerun cancelled"
            return
        
        # Create requests for all selected runs
        count = 0
        for idx in self.selected_runs:
            if idx < len(self.records):
                rec = self.records[idx]
                request = {
                    "mode": "rerun",
                    "base_run": rec.run_id,
                    "manifest": str(rec.manifest_path),
                    "last_frame": None,
                    "overrides": self.overrides,
                }
                outfile = rec.manifest_path.parent / "batch_rerun_request.json"
                try:
                    with outfile.open("w", encoding="utf-8") as h:
                        json.dump(request, h, indent=2)
                    if AUTO_DISPATCH:
                        self.run_dispatcher_async(outfile)
                    count += 1
                except Exception:
                    pass
        
        self.status = f"Batch rerun: {count}/{len(self.selected_runs)} requests created"
        self.selected_runs.clear()
    
    def batch_delete(self) -> None:
        """Batch delete selected runs"""
        if not self.selected_runs:
            self.status = "No runs selected for deletion"
            return
        
        # Confirm
        h, w = self.stdscr.getmaxyx()
        confirm_msg = f"DELETE {len(self.selected_runs)} runs? [y/n] (WARNING: Cannot undo!)"
        self.stdscr.addstr(h - 2, 0, confirm_msg, curses.A_REVERSE)
        self.stdscr.refresh()
        
        key = self.stdscr.getch()
        if key != ord('y') and key != ord('Y'):
            self.status = "Batch delete cancelled"
            return
        
        # Delete selected runs
        import shutil
        count = 0
        for idx in sorted(self.selected_runs, reverse=True):
            if idx < len(self.records):
                rec = self.records[idx]
                try:
                    # Delete the entire run directory
                    run_dir = rec.manifest_path.parent
                    if run_dir.exists():
                        shutil.rmtree(run_dir)
                        count += 1
                except Exception:
                    pass
        
        self.status = f"Deleted {count}/{len(self.selected_runs)} runs"
        self.selected_runs.clear()
        self.reload_records()

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
                self.status = f"Dispatching {request_path.name}..."
                result = subprocess.run(
                    [
                        sys.executable,
                        "-m",
                        "defora_cli.deforumation_request_dispatcher",
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
                    self.status = f"✓ Dispatched {request_path.name} successfully"
                else:
                    # Capture and display error details (truncated for display, full logged)
                    error_msg = result.stderr.strip() if result.stderr else f"exit code {result.returncode}"
                    # Log full error for debugging
                    if len(error_msg) > 150:
                        import logging
                        logging.error(f"Dispatch failed: {error_msg}")
                    self.status = f"✗ Dispatch failed: {error_msg[:150]}"
            except Exception as exc:
                self.status = f"✗ Dispatch error: {str(exc)[:150]}"

        t = threading.Thread(target=worker, daemon=True)
        t.start()


def main(stdscr):
    browser = RunBrowser(stdscr)
    browser.run()


if __name__ == "__main__":
    curses.wrapper(main)
