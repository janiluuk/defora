#!/usr/bin/env python3
"""
Ableton Link synchronization for Defora.

Provides tempo synchronization with Ableton Live and other Link-enabled apps.
Allows Defora to sync its BPM, beat phase, and start/stop with external music software.

Usage:
  python -m defora_cli.ableton_link sync --bpm 120 --mediator-host 127.0.0.1 --mediator-port 8766
  python -m defora_cli.ableton_link status
"""
from __future__ import annotations

import argparse
import json
import math
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

try:
    import link_python as link
except ImportError:
    link = None

from .mediator_client import MediatorClient


@dataclass
class LinkState:
    """Current Link synchronization state."""
    bpm: float = 120.0
    beat: float = 0.0
    phase: float = 0.0
    is_playing: bool = False
    num_peers: int = 0
    last_update: float = 0.0


class AbletonLinkSync:
    """Synchronize Defora with Ableton Link ecosystem."""
    
    def __init__(self, bpm: float = 120.0, mediator_host: str = "localhost",
                 mediator_port: str = "8766"):
        self.bpm = bpm
        self.mediator_host = mediator_host
        self.mediator_port = mediator_port
        self.state = LinkState(bpm=bpm)
        self.link = None
        self.mediator_client = None
        self._running = False
        self._callbacks: List[Callable] = []
        
    def initialize(self):
        """Initialize Link session."""
        if link is None:
            raise ImportError("link-python package required. Install with: pip install link-python")
        
        self.link = link.Link(self.bpm)
        self.link.enable(True)
        self.mediator_client = MediatorClient(self.mediator_host, self.mediator_port)
        
        print(f"[link] Initialized with BPM: {self.bpm}")
        print(f"[link] Connect to Ableton Live or other Link-enabled apps")
        
    def add_callback(self, callback: Callable):
        """Add callback for beat/bpm changes."""
        self._callbacks.append(callback)
        
    def _notify_callbacks(self, event_type: str, data: Dict[str, Any]):
        """Notify all registered callbacks."""
        for cb in self._callbacks:
            try:
                cb(event_type, data)
            except Exception as e:
                print(f"[link] Callback error: {e}")
                
    def get_state(self) -> LinkState:
        """Get current Link state."""
        if self.link is None:
            return self.state
            
        self.state.bpm = self.link.bpm()
        self.state.num_peers = self.link.numPeers()
        self.state.last_update = time.time()
        
        return self.state
        
    def set_bpm(self, bpm: float):
        """Set BPM (will sync to peers)."""
        if self.link is None:
            self.bpm = bpm
            return
            
        self.link.setBpm(bpm, time.time())
        self.state.bpm = bpm
        self._notify_callbacks("bpm_change", {"bpm": bpm})
        
    def force_beat_at_time(self, beat: float, at_time: float):
        """Force a specific beat at a specific time."""
        if self.link is None:
            return
            
        self.link.forceBeatAtTime(beat, at_time)
        self.state.beat = beat
        self._notify_callbacks("beat_force", {"beat": beat, "time": at_time})
        
    def request_beat_at_time(self, beat: float, at_time: float):
        """Request a beat alignment (softer than force)."""
        if self.link is None:
            return
            
        self.link.requestBeatAtTime(beat, at_time)
        
    def start_playing(self):
        """Start playing (sync with peers)."""
        if self.link is None:
            self.state.is_playing = True
            return
            
        self.link.startPlaying(time.time())
        self.state.is_playing = True
        self._notify_callbacks("start", {})
        
    def stop_playing(self):
        """Stop playing."""
        if self.link is None:
            self.state.is_playing = False
            return
            
        self.link.stopPlaying(time.time())
        self.state.is_playing = False
        self._notify_callbacks("stop", {})
        
    def is_playing(self) -> bool:
        """Check if currently playing."""
        if self.link is None:
            return self.state.is_playing
        return self.link.isPlaying()
        
    def get_beat_phase(self) -> float:
        """Get current beat phase (0.0 - 1.0)."""
        if self.link is None:
            return self.state.phase
            
        beat_time = self.link.clock().beatAtTime(time.time(), self.bpm)
        self.state.beat = beat_time
        self.state.phase = beat_time - math.floor(beat_time)
        return self.state.phase
        
    def get_bar_phase(self) -> float:
        """Get current bar phase (0.0 - 1.0 for 4/4 time)."""
        if self.link is None:
            return 0.0
            
        beat = self.link.clock().beatAtTime(time.time(), self.bpm)
        return (beat % 4) / 4.0
        
    def get_beat_since_start(self) -> float:
        """Get beats since session start."""
        if self.link is None:
            return 0.0
        return self.link.clock().beatAtTime(time.time(), self.bpm)
        
    def run_sync_loop(self, fps: int = 24):
        """Run synchronization loop."""
        if self.link is None:
            print("[link] Link not initialized")
            return
            
        self._running = True
        interval = 1.0 / fps
        
        print(f"[link] Starting sync loop at {fps} fps")
        
        while self._running:
            try:
                state = self.get_state()
                phase = self.get_beat_phase()
                
                # Send to mediator
                if self.mediator_client:
                    try:
                        self.mediator_client.write("link_bpm", state.bpm)
                        self.mediator_client.write("link_beat", state.beat)
                        self.mediator_client.write("link_phase", phase)
                        self.mediator_client.write("link_playing", state.is_playing)
                    except Exception as e:
                        print(f"[link] Mediator error: {e}")
                
                # Notify callbacks
                self._notify_callbacks("update", {
                    "bpm": state.bpm,
                    "beat": state.beat,
                    "phase": phase,
                    "playing": state.is_playing,
                    "peers": state.num_peers,
                })
                
                time.sleep(interval)
                
            except KeyboardInterrupt:
                self.stop()
                break
            except Exception as e:
                print(f"[link] Sync loop error: {e}")
                time.sleep(0.1)
                
    def stop(self):
        """Stop synchronization."""
        self._running = False
        if self.link:
            self.link.enable(False)
        print("[link] Stopped")
        
    def get_status(self) -> Dict[str, Any]:
        """Get status dictionary."""
        state = self.get_state()
        return {
            "bpm": state.bpm,
            "beat": state.beat,
            "phase": state.phase,
            "is_playing": state.is_playing,
            "num_peers": state.num_peers,
            "connected": self.link is not None,
        }


def main():
    parser = argparse.ArgumentParser(description="Ableton Link sync for Defora")
    sub = parser.add_subparsers(dest="command", required=True)
    
    # Sync command
    sync = sub.add_parser("sync", help="Start Link synchronization")
    sync.add_argument("--bpm", type=float, default=120.0, help="Initial BPM")
    sync.add_argument("--mediator-host", default="localhost", help="Mediator host")
    sync.add_argument("--mediator-port", default="8766", help="Mediator port")
    sync.add_argument("--fps", type=int, default=24, help="Sync update rate")
    
    # Status command
    sub.add_parser("status", help="Show Link status")
    
    args = parser.parse_args()
    
    if args.command == "sync":
        syncer = AbletonLinkSync(args.bpm, args.mediator_host, args.mediator_port)
        try:
            syncer.initialize()
            syncer.run_sync_loop(args.fps)
        except KeyboardInterrupt:
            syncer.stop()
        except ImportError as e:
            print(f"Error: {e}")
    elif args.command == "status":
        try:
            syncer = AbletonLinkSync()
            syncer.initialize()
            status = syncer.get_status()
            print(json.dumps(status, indent=2))
            syncer.stop()
        except ImportError as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()
