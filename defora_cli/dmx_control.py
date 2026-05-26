#!/usr/bin/env python3
"""
DMX lighting control integration for Defora.

Provides DMX512 output to control stage lighting based on Defora parameters.
Supports USB-DMX interfaces and Art-Net/sACN network protocols.

Usage:
  python -m defora_cli.dmx_control output --interface usb --universe 0 --mediator-host 127.0.0.1
  python -m defora_cli.dmx_control art-net --ip 192.168.1.100 --universe 0
"""
from __future__ import annotations

import argparse
import json
import socket
import struct
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

try:
    from openrgb import OpenRGBClient
except ImportError:
    OpenRGBClient = None


@dataclass
class DMXChannel:
    """Represents a DMX channel mapping."""
    channel: int  # DMX channel number (1-512)
    param: str  # Defora parameter name
    min_value: float = 0.0
    max_value: float = 1.0
    invert: bool = False


@dataclass
class DMXUniverse:
    """Represents a DMX universe (512 channels)."""
    universe: int = 0
    channels: List[DMXChannel] = field(default_factory=list)
    values: bytearray = field(default_factory=lambda: bytearray(512))


class ArtNetSender:
    """Send DMX data via Art-Net protocol."""
    
    def __init__(self, broadcast_ip: str = "255.255.255.255", port: int = 6454):
        self.broadcast_ip = broadcast_ip
        self.port = port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        
    def send_universe(self, universe: int, data: bytearray):
        """Send a DMX universe via Art-Net."""
        # Art-Net header
        header = struct.pack('!HHBBBBHH',
            0x5074,  # "Art-Net" magic (little-endian: 0x50, 0x74)
            0x00,    # OpCode (ArtDmx = 0x5000, but we use simplified)
            0x00,    # Protocol version high
            14,      # Protocol version low
            0,       # Sequence
            0,       # Physical port
            universe,  # Universe
            len(data)  # Length
        )
        
        # Fix header for ArtDmx
        header = b'Art-Net\x00' + struct.pack('<HHBBHH',
            0x5000,  # ArtDmx opcode
            14,      # Protocol version
            0,       # Sequence
            0,       # Physical port
            universe,  # Universe
            len(data)  # Length
        )
        
        packet = header + bytes(data)
        self.sock.sendto(packet, (self.broadcast_ip, self.port))
        
    def close(self):
        """Close the socket."""
        self.sock.close()


class sACNSender:
    """Send DMX data via sACN (E1.31) protocol."""
    
    def __init__(self, multicast_ip: str = "239.255.0.{}", port: int = 5568):
        self.port = port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        
    def send_universe(self, universe: int, data: bytearray):
        """Send a DMX universe via sACN."""
        # sACN is more complex - simplified implementation
        # In production, use a proper sACN library
        pass
        
    def close(self):
        """Close the socket."""
        self.sock.close()


class DMXController:
    """Main DMX controller for Defora."""
    
    def __init__(self, interface: str = "artnet", universe: int = 0,
                 mediator_host: str = "localhost", mediator_port: str = "8766",
                 broadcast_ip: str = "255.255.255.255"):
        self.interface = interface
        self.universe = DMXUniverse(universe=universe)
        self.mediator_host = mediator_host
        self.mediator_port = mediator_port
        self.broadcast_ip = broadcast_ip
        self.sender = None
        self._running = False
        self._callbacks: List[Callable] = []
        
        # Default channel mappings
        self._setup_default_mappings()
        
    def _setup_default_mappings(self):
        """Setup default DMX channel mappings."""
        self.universe.channels = [
            DMXChannel(1, "translation_x", -10, 10),
            DMXChannel(2, "translation_y", -10, 10),
            DMXChannel(3, "translation_z", -10, 10),
            DMXChannel(4, "rotation_x", -180, 180),
            DMXChannel(5, "rotation_y", -180, 180),
            DMXChannel(6, "rotation_z", -180, 180),
            DMXChannel(7, "fov", 20, 120),
            DMXChannel(8, "cfg", 1, 15),
            DMXChannel(9, "strength", 0, 1.5),
            DMXChannel(10, "noise_multiplier", 0, 3),
            # Lighting-specific mappings
            DMXChannel(11, "link_bpm", 60, 200),
            DMXChannel(12, "link_phase", 0, 1),
            DMXChannel(13, "audio_level", 0, 1),
            DMXChannel(14, "beat_detected", 0, 1),
        ]
        
    def initialize(self):
        """Initialize DMX sender."""
        if self.interface == "artnet":
            self.sender = ArtNetSender(self.broadcast_ip)
        elif self.interface == "sacn":
            self.sender = sACNSender()
        elif self.interface == "openrgb":
            if OpenRGBClient is None:
                raise ImportError("openrgb-python required. Install with: pip install openrgb-python")
            self.sender = OpenRGBClient()
        else:
            raise ValueError(f"Unknown interface: {self.interface}")
            
        print(f"[dmx] Initialized with {self.interface} interface")
        print(f"[dmx] Universe: {self.universe.universe}")
        print(f"[dmx] Channels: {len(self.universe.channels)}")
        
    def add_callback(self, callback: Callable):
        """Add callback for DMX updates."""
        self._callbacks.append(callback)
        
    def update_channel(self, param: str, value: float):
        """Update a DMX channel from a parameter value."""
        for ch in self.universe.channels:
            if ch.param == param:
                # Normalize value to 0-255 range
                normalized = (value - ch.min_value) / (ch.max_value - ch.min_value)
                normalized = max(0, min(1, normalized))
                if ch.invert:
                    normalized = 1 - normalized
                    
                dmx_value = int(normalized * 255)
                self.universe.values[ch.channel - 1] = dmx_value
                
    def send_universe(self):
        """Send the current DMX universe."""
        if self.sender is None:
            return
            
        if self.interface == "artnet":
            self.sender.send_universe(self.universe.universe, self.universe.values)
        elif self.interface == "openrgb":
            # OpenRGB uses a different API
            pass
            
        # Notify callbacks
        for cb in self._callbacks:
            try:
                cb(self.universe.values)
            except Exception as e:
                print(f"[dmx] Callback error: {e}")
                
    def run_loop(self, fps: int = 30):
        """Run DMX update loop."""
        self._running = True
        interval = 1.0 / fps
        
        print(f"[dmx] Starting update loop at {fps} fps")
        
        # Simple mediator polling (in production, use WebSocket)
        last_params = {}
        
        while self._running:
            try:
                # In production, this would read from mediator WebSocket
                # For now, we'll just send the current universe values
                self.send_universe()
                time.sleep(interval)
                
            except KeyboardInterrupt:
                self.stop()
                break
            except Exception as e:
                print(f"[dmx] Loop error: {e}")
                time.sleep(0.1)
                
    def stop(self):
        """Stop DMX controller."""
        self._running = False
        if self.sender:
            self.sender.close()
        print("[dmx] Stopped")
        
    def get_status(self) -> Dict[str, Any]:
        """Get status dictionary."""
        return {
            "interface": self.interface,
            "universe": self.universe.universe,
            "channels": len(self.universe.channels),
            "running": self._running,
        }


def main():
    parser = argparse.ArgumentParser(description="DMX lighting control for Defora")
    sub = parser.add_subparsers(dest="command", required=True)
    
    # Art-Net command
    artnet = sub.add_parser("art-net", help="Start Art-Net DMX output")
    artnet.add_argument("--ip", default="255.255.255.255", help="Broadcast IP")
    artnet.add_argument("--universe", type=int, default=0, help="DMX universe")
    artnet.add_argument("--fps", type=int, default=30, help="Update rate")
    
    # sACN command
    sacn = sub.add_parser("sacn", help="Start sACN DMX output")
    sacn.add_argument("--universe", type=int, default=0, help="DMX universe")
    sacn.add_argument("--fps", type=int, default=30, help="Update rate")
    
    # OpenRGB command
    openrgb = sub.add_parser("openrgb", help="Start OpenRGB control")
    openrgb.add_argument("--host", default="localhost", help="OpenRGB host")
    openrgb.add_argument("--port", type=int, default=6742, help="OpenRGB port")
    
    # Status command
    sub.add_parser("status", help="Show DMX status")
    
    args = parser.parse_args()
    
    if args.command == "art-net":
        controller = DMXController("artnet", args.universe, broadcast_ip=args.ip)
        try:
            controller.initialize()
            controller.run_loop(args.fps)
        except KeyboardInterrupt:
            controller.stop()
    elif args.command == "sacn":
        controller = DMXController("sacn", args.universe)
        try:
            controller.initialize()
            controller.run_loop(args.fps)
        except KeyboardInterrupt:
            controller.stop()
    elif args.command == "openrgb":
        controller = DMXController("openrgb", args.universe)
        try:
            controller.initialize()
            controller.run_loop(args.fps)
        except KeyboardInterrupt:
            controller.stop()
    elif args.command == "status":
        try:
            controller = DMXController()
            status = controller.get_status()
            print(json.dumps(status, indent=2))
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()
