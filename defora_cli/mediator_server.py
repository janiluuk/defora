#!/usr/bin/env python3
"""
Minimal Defora mediator server (self-contained).

Implements the pickled triplet protocol expected by Deforumation clients:
  [0, param, 0] -> returns [value]
  [1, param, value] -> stores value and returns [param, value]

This is a lightweight, in-memory mediator that can bind both the Deforum
port (default 8765) and the Deforumation port (default 8766).
"""
from __future__ import annotations

import argparse
import asyncio
import pickle
from typing import Any, Dict

import websockets
from websockets.exceptions import ConnectionClosedOK, ConnectionClosedError

STATE: Dict[str, Any] = {
    "cfg": 7.5,
    "strength": 0.6,
    "noise_multiplier": 0.15,
    "translation_x": 0.0,
    "translation_y": 0.0,
    "translation_z": 0.0,
    "rotation_x": 0.0,
    "rotation_y": 0.0,
    "rotation_z": 0.0,
    "fov": 70.0,
}


async def handle_connection(websocket, label: str) -> None:
    while True:
        try:
            raw = await websocket.recv()
        except (ConnectionClosedOK, ConnectionClosedError):
            break

        try:
            payload = pickle.loads(raw)
        except Exception as exc:
            await websocket.send(pickle.dumps(["error", f"unpicklable: {exc}"]))
            continue

        if not isinstance(payload, (list, tuple)) or len(payload) != 3:
            await websocket.send(pickle.dumps(["error", "expected triplet [rw,param,val]"]))
            continue

        mode, param, value = payload
        if mode == 0:  # read
            await websocket.send(pickle.dumps([STATE.get(param, 0)]))
        else:  # write
            STATE[param] = value
            await websocket.send(pickle.dumps([param, value]))


async def run_server(host: str, port: int, label: str) -> None:
    print(f"[mediator] {label} listening on {host}:{port}")
    async with websockets.serve(
        lambda ws: handle_connection(ws, label),
        host,
        port,
        ping_interval=None,
    ):
        await asyncio.Future()  # run forever


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Defora mediator server")
    parser.add_argument("--mediator_deforum_address", default="0.0.0.0")
    parser.add_argument("--mediator_deforum_port", type=int, default=8765)
    parser.add_argument("--mediator_deforumation_address", default="0.0.0.0")
    parser.add_argument("--mediator_deforumation_port", type=int, default=8766)
    parser.add_argument("--deforumation_address", default="127.0.0.1")
    parser.add_argument("--deforumation_port", type=int, default=8767)
    parser.add_argument("--use_named_pipes", action="store_true", help="Ignored (compatibility).")
    return parser.parse_args()


async def main_async(args: argparse.Namespace) -> None:
    await asyncio.gather(
        run_server(args.mediator_deforum_address, args.mediator_deforum_port, "deforum"),
        run_server(args.mediator_deforumation_address, args.mediator_deforumation_port, "deforumation"),
    )


def main() -> None:
    args = parse_args()
    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()

