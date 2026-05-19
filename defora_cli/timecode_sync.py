#!/usr/bin/env python3
"""
Timecode synchronization for Defora.

Supports LTC (Linear Timecode) and MTC (MIDI Timecode) for synchronization
with professional audio/video equipment.

Usage:
  python -m defora_cli.timecode_sync ltc --port 8001 --mediator-host 127.0.0.1 --mediator-port 8766
  python -m defora_cli.timecode_sync mtc --midi-device "MIDI Timecode" --mediator-host 127.0.0.1
"""
from __future__ import annotations

import argparse
import json
import struct
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

try:
    import sounddevice as sd
    import numpy as np
except ImportError:
    sd = None
    np = None

from .mediator_client import MediatorClient


@dataclass
class TimecodeState:
    """Current timecode state."""
    hours: int = 0
    minutes: int = 0
    seconds: int = 0
    frames: int = 0
    fps: float = 24.0
    is_running: bool = False
    direction: str = "forward"  # forward, reverse
    drop_frame: bool = False
    last_update: float = 0.0


class LTCDemodulator:
    """Demodulate LTC timecode from audio input."""
    
    def __init__(self, sample_rate: int = 44100, fps: float = 24.0):
        self.sample_rate = sample_rate
        self.fps = fps
        self.buffer = np.zeros(sample_rate) if np else []
        self.state = TimecodeState(fps=fps)
        
    def decode_frame(self, audio_data: np.ndarray) -> Optional[TimecodeState]:
        """Decode a single LTC frame from audio data."""
        if np is None:
            return None
            
        # LTC uses bi-phase mark coding
        # Simplified implementation - real implementation would need proper LTC library
        # This is a placeholder for the actual demodulation logic
        
        # Detect zero crossings to find bit transitions
        zero_crossings = np.where(np.diff(np.signbit(audio_data)))[0]
        
        if len(zero_crossings) < 80:  # LTC frame has 80 bits
            return None
            
        # Extract bits from timing between zero crossings
        bits = []
        for i in range(1, len(zero_crossings)):
            period = zero_crossings[i] - zero_crossings[i-1]
            # LTC: short period = 0, long period = 1
            bits.append(1 if period > self.sample_rate / (self.fps * 160) else 0)
            
        if len(bits) < 80:
            return None
            
        # Parse LTC frame (simplified)
        # Real implementation would use proper LTC library like pyltc
        try:
            # Bits 0-3: frame units
            frame_units = sum(bits[i] << i for i in range(4))
            # Bits 4-5: frame tens
            frame_tens = sum(bits[i+4] << i for i in range(2))
            # Bits 6-7: drop frame flag + binary group flag
            drop_frame = bool(bits[6])
            # Bits 8-11: seconds units
            sec_units = sum(bits[i+8] << i for i in range(4))
            # Bits 12-14: seconds tens
            sec_tens = sum(bits[i+12] << i for i in range(3))
            # Bits 16-19: minutes units
            min_units = sum(bits[i+16] << i for i in range(4))
            # Bits 20-22: minutes tens
            min_tens = sum(bits[i+20] << i for i in range(3))
            # Bits 24-27: hours units
            hour_units = sum(bits[i+24] << i for i in range(4))
            # Bits 28-29: hours tens
            hour_tens = sum(bits[i+28] << i for i in range(2))
            
            self.state.frames = frame_units + frame_tens * 10
            self.state.seconds = sec_units + sec_tens * 10
            self.state.minutes = min_units + min_tens * 10
            self.state.hours = hour_units + hour_tens * 10
            self.state.drop_frame = drop_frame
            self.state.is_running = True
            self.state.last_update = time.time()
            
            return self.state
        except:
            return None


class MTCDemodulator:
    """Demodulate MIDI Timecode."""
    
    def __init__(self, fps: float = 24.0):
        self.fps = fps
        self.state = TimecodeState(fps=fps)
        self.quarter_frame_buffer = [None] * 8
        self.frame_count = 0
        
    def process_quarter_frame(self, quarter_type: int, value: int):
        """Process a MIDI quarter frame message."""
        self.quarter_frame_buffer[quarter_type] = value
        
        if quarter_type == 7:
            # Full frame received
            self._assemble_frame()
            
    def _assemble_frame(self):
        """Assemble full frame from quarter frame messages."""
        buf = self.quarter_frame_buffer
        
        if None in buf:
            return
            
        # Parse MTC full frame
        # Type 0: frame rate + hours
        fps_type = (buf[7] >> 5) & 0x03
        if fps_type == 0:
            self.fps = 24.0
        elif fps_type == 1:
            self.fps = 25.0
        elif fps_type == 2:
            self.fps = 29.97
            self.state.drop_frame = True
        else:
            self.fps = 30.0
            
        self.state.hours = buf[7] & 0x1F
        
        # Type 1: minutes tens
        self.state.minutes = (buf[6] << 4) | buf[5]
        
        # Type 2: seconds units
        self.state.seconds = (buf[4] << 4) | buf[3]
        
        # Type 3: frames
        self.state.frames = (buf[2] << 4) | buf[1]
        
        self.state.is_running = True
        self.state.last_update = time.time()


class TimecodeSync:
    """Main timecode synchronization bridge."""
    
    def __init__(self, mode: str = "ltc", fps: float = 24.0,
                 mediator_host: str = "localhost", mediator_port: str = "8766",
                 audio_port: int = 8001, midi_device: Optional[str] = None):
        self.mode = mode
        self.fps = fps
        self.mediator_host = mediator_host
        self.mediator_port = mediator_port
        self.audio_port = audio_port
        self.midi_device = midi_device
        self.mediator_client = None
        self._running = False
        
        if mode == "ltc":
            self.demodulator = LTCDemodulator(fps=fps)
        else:
            self.demodulator = MTCDemodulator(fps=fps)
            
    def initialize(self):
        """Initialize timecode sync."""
        self.mediator_client = MediatorClient(self.mediator_host, self.mediator_port)
        print(f"[timecode] Initialized in {self.mode.upper()} mode at {self.fps} fps")
        
    def _audio_callback(self, indata, frames, time_info, status):
        """Callback for audio input (LTC)."""
        if status:
            print(f"[timecode] Audio status: {status}")
            
        if np is None:
            return
            
        # Convert to mono
        audio_data = indata.mean(axis=1) if indata.ndim > 1 else indata
        
        # Try to decode LTC frame
        state = self.demodulator.decode_frame(audio_data)
        if state:
            self._send_to_mediator(state)
            
    def _send_to_mediator(self, state: TimecodeState):
        """Send timecode state to mediator."""
        if not self.mediator_client:
            return
            
        try:
            # Send individual values
            self.mediator_client.write("tc_hours", state.hours)
            self.mediator_client.write("tc_minutes", state.minutes)
            self.mediator_client.write("tc_seconds", state.seconds)
            self.mediator_client.write("tc_frames", state.frames)
            self.mediator_client.write("tc_fps", state.fps)
            self.mediator_client.write("tc_running", state.is_running)
            
            # Send SMPTE string
            smpte = f"{state.hours:02d}:{state.minutes:02d}:{state.seconds:02d}:{state.frames:02d}"
            self.mediator_client.write("tc_smpte", smpte)
            
            # Calculate total frames from start
            total_frames = (
                state.hours * 3600 * state.fps +
                state.minutes * 60 * state.fps +
                state.seconds * state.fps +
                state.frames
            )
            self.mediator_client.write("tc_total_frames", total_frames)
            
        except Exception as e:
            print(f"[timecode] Mediator error: {e}")
            
    def run_ltc(self):
        """Run LTC synchronization from audio input."""
        if sd is None:
            raise ImportError("sounddevice required for LTC. Install with: pip install sounddevice")
            
        print(f"[timecode] Listening for LTC on default audio input")
        print(f"[timecode] Sample rate: 44100, FPS: {self.fps}")
        
        self._running = True
        
        try:
            with sd.InputStream(callback=self._audio_callback, channels=1, samplerate=44100):
                while self._running:
                    time.sleep(0.1)
        except KeyboardInterrupt:
            self.stop()
            
    def run_mtc(self):
        """Run MTC synchronization from MIDI input."""
        try:
            import mido
        except ImportError:
            raise ImportError("mido required for MTC. Install with: pip install mido")
            
        # Find MIDI device
        ports = mido.get_input_names()
        if not ports:
            print("[timecode] No MIDI input ports found")
            return
            
        port_name = self.midi_device
        if port_name and port_name not in ports:
            print(f"[timecode] MIDI device '{port_name}' not found, using first available")
            port_name = ports[0]
        elif not port_name:
            port_name = ports[0]
            
        print(f"[timecode] Listening for MTC on: {port_name}")
        
        self._running = True
        
        with mido.open_input(port_name) as port:
            for msg in port:
                if not self._running:
                    break
                    
                # MTC messages are MIDI Time Code Quarter Frame
                if msg.type == 'quarter_frame':
                    self.demodulator.process_quarter_frame(msg.msg, msg.value)
                    state = self.demodulator.state
                    if state.is_running:
                        self._send_to_mediator(state)
                        
    def stop(self):
        """Stop timecode synchronization."""
        self._running = False
        print("[timecode] Stopped")
        
    def get_status(self) -> Dict[str, Any]:
        """Get status dictionary."""
        state = self.demodulator.state
        return {
            "mode": self.mode,
            "fps": state.fps,
            "hours": state.hours,
            "minutes": state.minutes,
            "seconds": state.seconds,
            "frames": state.frames,
            "is_running": state.is_running,
            "drop_frame": state.drop_frame,
            "smpte": f"{state.hours:02d}:{state.minutes:02d}:{state.seconds:02d}:{state.frames:02d}",
        }


def main():
    parser = argparse.ArgumentParser(description="Timecode sync for Defora")
    sub = parser.add_subparsers(dest="command", required=True)
    
    # LTC command
    ltc = sub.add_parser("ltc", help="Start LTC synchronization")
    ltc.add_argument("--port", type=int, default=8001, help="Audio input port")
    ltc.add_argument("--fps", type=float, default=24.0, help="Frame rate")
    ltc.add_argument("--mediator-host", default="localhost", help="Mediator host")
    ltc.add_argument("--mediator-port", default="8766", help="Mediator port")
    
    # MTC command
    mtc = sub.add_parser("mtc", help="Start MTC synchronization")
    mtc.add_argument("--midi-device", help="MIDI device name")
    mtc.add_argument("--fps", type=float, default=24.0, help="Frame rate")
    mtc.add_argument("--mediator-host", default="localhost", help="Mediator host")
    mtc.add_argument("--mediator-port", default="8766", help="Mediator port")
    
    # Status command
    sub.add_parser("status", help="Show timecode status")
    
    args = parser.parse_args()
    
    if args.command == "ltc":
        sync = TimecodeSync("ltc", args.fps, args.mediator_host, args.mediator_port, args.port)
        try:
            sync.initialize()
            sync.run_ltc()
        except KeyboardInterrupt:
            sync.stop()
        except ImportError as e:
            print(f"Error: {e}")
    elif args.command == "mtc":
        sync = TimecodeSync("mtc", args.fps, args.mediator_host, args.mediator_port, 
                           midi_device=args.midi_device)
        try:
            sync.initialize()
            sync.run_mtc()
        except KeyboardInterrupt:
            sync.stop()
        except ImportError as e:
            print(f"Error: {e}")
    elif args.command == "status":
        try:
            sync = TimecodeSync()
            sync.initialize()
            status = sync.get_status()
            print(json.dumps(status, indent=2))
        except ImportError as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()
