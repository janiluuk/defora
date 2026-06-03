#!/usr/bin/env python3
"""
OSC (Open Sound Control) bridge for Defora.

Provides OSC server/client for integration with external music/AV software
like Ableton Live, Max/MSP, TouchDesigner, etc.

Usage:
  python -m defora_cli.osc_bridge server --port 8000 --mediator-host 127.0.0.1 --mediator-port 8766
  python -m defora_cli.osc_bridge send --address /defora/translation_z --value 0.5 --host 127.0.0.1 --port 8000
"""
from __future__ import annotations

import argparse
import json
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

try:
    from pythonosc import dispatcher as osc_dispatcher
    from pythonosc import osc_server
    from pythonosc import udp_client
except ImportError:
    osc_dispatcher = None
    osc_server = None
    udp_client = None

from .mediator_client import MediatorClient


@dataclass
class OSCMapping:
    """Mapping between OSC address and Defora parameter."""
    osc_address: str
    param_name: str
    param_type: str = "float"  # float, int, bool, string
    min_value: float = -1.0
    max_value: float = 1.0
    scale_type: str = "linear"  # linear, exponential, logarithmic


class OSCBridge:
    """Bridge between OSC and Defora mediator."""
    
    def __init__(self, port: int = 8000, mediator_host: str = "localhost", 
                 mediator_port: str = "8766"):
        self.port = port
        self.mediator_host = mediator_host
        self.mediator_port = mediator_port
        self.mappings: Dict[str, OSCMapping] = {}
        self.server = None
        self.client = None
        self.mediator_client = None
        self._running = False
        
        # Default mappings
        self._load_default_mappings()
        
    def _load_default_mappings(self):
        """Load default OSC mappings."""
        default_mappings = [
            OSCMapping("/defora/translation_x", "translation_x", "float", -10.0, 10.0),
            OSCMapping("/defora/translation_y", "translation_y", "float", -10.0, 10.0),
            OSCMapping("/defora/translation_z", "translation_z", "float", -10.0, 10.0),
            OSCMapping("/defora/rotation_x", "rotation_x", "float", -180.0, 180.0),
            OSCMapping("/defora/rotation_y", "rotation_y", "float", -180.0, 180.0),
            OSCMapping("/defora/rotation_z", "rotation_z", "float", -180.0, 180.0),
            OSCMapping("/defora/fov", "fov", "float", 20.0, 120.0),
            OSCMapping("/defora/cfg", "cfg", "float", 1.0, 15.0),
            OSCMapping("/defora/strength", "strength", "float", 0.0, 1.0),
            OSCMapping("/defora/noise", "noise", "float", 0.0, 1.0),
            OSCMapping("/defora/zoom", "zoom", "float", 0.5, 2.0),
            OSCMapping("/defora/preset", "preset", "string"),
            OSCMapping("/defora/trigger", "trigger", "bool"),
        ]
        
        for mapping in default_mappings:
            self.mappings[mapping.osc_address] = mapping
            
    def add_mapping(self, mapping: OSCMapping):
        """Add a custom OSC mapping."""
        self.mappings[mapping.osc_address] = mapping
        
    def remove_mapping(self, osc_address: str):
        """Remove an OSC mapping."""
        if osc_address in self.mappings:
            del self.mappings[osc_address]
            
    def _scale_value(self, value: float, mapping: OSCMapping) -> float:
        """Scale OSC value to parameter range."""
        if mapping.scale_type == "linear":
            return value
        elif mapping.scale_type == "exponential":
            return mapping.min_value + (value ** 2) * (mapping.max_value - mapping.min_value)
        elif mapping.scale_type == "logarithmic":
            import math
            return mapping.min_value + math.log(1 + 9 * value) / math.log(10) * (mapping.max_value - mapping.min_value)
        return value
        
    def _handle_osc_message(self, address: str, *args):
        """Handle incoming OSC message."""
        if address not in self.mappings:
            return
            
        mapping = self.mappings[address]
        
        if not args:
            return
            
        value = args[0]
        
        # Convert value based on parameter type
        if mapping.param_type == "float":
            if isinstance(value, (int, float)):
                scaled = self._scale_value(float(value), mapping)
                scaled = max(mapping.min_value, min(mapping.max_value, scaled))
                if self.mediator_client:
                    try:
                        self.mediator_client.write(mapping.param_name, scaled)
                    except Exception as e:
                        print(f"[osc] Error sending to mediator: {e}")
        elif mapping.param_type == "int":
            if isinstance(value, (int, float)):
                if self.mediator_client:
                    try:
                        self.mediator_client.write(mapping.param_name, int(value))
                    except Exception as e:
                        print(f"[osc] Error sending to mediator: {e}")
        elif mapping.param_type == "bool":
            if isinstance(value, (int, float)):
                bool_value = bool(value)
                if self.mediator_client:
                    try:
                        self.mediator_client.write(mapping.param_name, bool_value)
                    except Exception as e:
                        print(f"[osc] Error sending to mediator: {e}")
        elif mapping.param_type == "string":
            if isinstance(value, str):
                if self.mediator_client:
                    try:
                        self.mediator_client.write(mapping.param_name, value)
                    except Exception as e:
                        print(f"[osc] Error sending to mediator: {e}")
                        
    def start_server(self):
        """Start OSC server."""
        if osc_dispatcher is None or osc_server is None:
            raise ImportError("python-osc package required. Install with: pip install python-osc")
            
        self.mediator_client = MediatorClient(self.mediator_host, self.mediator_port)
        
        dispatcher = osc_dispatcher.Dispatcher()
        
        # Register handlers for all mappings
        for address in self.mappings.keys():
            dispatcher.map(address, self._handle_osc_message)
            
        self.server = osc_server.ThreadingOSCUDPServer(
            ("0.0.0.0", self.port), dispatcher
        )
        
        self._running = True
        server_thread = threading.Thread(target=self.server.serve_forever)
        server_thread.daemon = True
        server_thread.start()
        
        print(f"[osc] Server started on port {self.port}")
        print(f"[osc] Mappings: {len(self.mappings)}")
        for addr, mapping in self.mappings.items():
            print(f"  {addr} -> {mapping.param_name} ({mapping.param_type})")
            
    def stop_server(self):
        """Stop OSC server."""
        self._running = False
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            print("[osc] Server stopped")
            
    def send_osc(self, address: str, value: Any, host: str = "localhost", port: int = 8000):
        """Send OSC message."""
        if udp_client is None:
            raise ImportError("python-osc package required. Install with: pip install python-osc")
            
        client = udp_client.SimpleUDPClient(host, port)
        client.send_message(address, value)
        

def main():
    parser = argparse.ArgumentParser(description="OSC bridge for Defora")
    sub = parser.add_subparsers(dest="command", required=True)
    
    # Server command
    server = sub.add_parser("server", help="Start OSC server")
    server.add_argument("--port", type=int, default=8000, help="OSC server port")
    server.add_argument("--mediator-host", default="localhost", help="Mediator host")
    server.add_argument("--mediator-port", default="8766", help="Mediator port")
    server.add_argument("--mappings", help="JSON file with custom mappings")
    
    # Send command
    send = sub.add_parser("send", help="Send OSC message")
    send.add_argument("--address", required=True, help="OSC address (e.g., /defora/translation_z)")
    send.add_argument("--value", required=True, help="Value to send")
    send.add_argument("--host", default="localhost", help="OSC server host")
    send.add_argument("--port", type=int, default=8000, help="OSC server port")
    
    args = parser.parse_args()
    
    if args.command == "server":
        bridge = OSCBridge(args.port, args.mediator_host, args.mediator_port)
        
        # Load custom mappings if provided
        if args.mappings:
            with open(args.mappings, 'r') as f:
                mappings_data = json.load(f)
                for m in mappings_data:
                    bridge.add_mapping(OSCMapping(**m))
        
        try:
            bridge.start_server()
            print("Press Ctrl+C to stop")
            while True:
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            bridge.stop_server()
    elif args.command == "send":
        bridge = OSCBridge()
        # Try to convert value to appropriate type
        try:
            value = float(args.value)
            if value == int(value):
                value = int(value)
        except ValueError:
            value = args.value
            
        bridge.send_osc(args.address, value, args.host, args.port)
        print(f"[osc] Sent {args.address} = {value}")


if __name__ == "__main__":
    main()
