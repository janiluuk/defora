#!/usr/bin/env python3
"""
Tiny in-memory mediator server for demos/tests.

Speaks the same pickled triplet protocol expected by MediatorClient:
  [0, param, 0] → returns [value] (default 0)
  [1, param, value] → stores the value and echoes [param, value]

This is intentionally minimal: no auth, persistence, or schema checks.
"""
from __future__ import annotations

import asyncio
import os
import pickle
from typing import Any, Dict

import websockets
from websockets.exceptions import ConnectionClosedOK, ConnectionClosedError

HOST = os.getenv("MEDIATOR_HOST", "0.0.0.0")
PORT = int(os.getenv("MEDIATOR_PORT", "8766"))

STATE: Dict[str, Any] = {
    "cfg": 7.5,
    "strength": 0.6,
    "noise": 0.15,
}


async def handle_connection(websocket):
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

        if not isinstance(payload, list) or len(payload) != 3:
            await websocket.send(pickle.dumps(["error", "expected triplet [rw,param,val]"]))
            continue

        mode, param, value = payload
        if mode == 0:  # read
            await websocket.send(pickle.dumps([STATE.get(param, 0)]))
        else:  # write
            STATE[param] = value
            await websocket.send(pickle.dumps([param, value]))


async def main():
    print(f"[mediator-mock] listening on {HOST}:{PORT}")
    async with websockets.serve(handle_connection, HOST, PORT, ping_interval=None):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
