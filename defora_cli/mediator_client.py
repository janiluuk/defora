#!/usr/bin/env python3
"""
Lightweight mediator client with pluggable connector for tests.

The real mediator uses a websocket where messages are pickled triples:
  [should_write:int, param:str, value:any]
Reads expect [0, param, 0]; writes expect [1, param, value].
Responses are pickled; if the payload is a list of length 1 the single item is returned.
"""
from __future__ import annotations

import asyncio
import pickle
from typing import Any, Callable, Optional

try:
    import websockets  # type: ignore
except Exception:  # pragma: no cover - optional runtime dependency
    websockets = None  # type: ignore


class MediatorClient:
    def __init__(
        self,
        host: str,
        port: str,
        timeout: float = 10.0,
        connector: Optional[Callable[..., Any]] = None,
    ):
        self.host = host
        self.port = port
        self.timeout = timeout
        self.uri = f"ws://{host}:{port}"
        self.connector = connector or (websockets and websockets.connect)
        if self.connector is None:
            raise RuntimeError("websockets is not available and no connector was provided")

    async def _send_async(self, payload):
        async with self.connector(self.uri) as websocket:
            await asyncio.wait_for(websocket.send(pickle.dumps(payload)), timeout=self.timeout)
            reply = await asyncio.wait_for(websocket.recv(), timeout=self.timeout)
            try:
                decoded = pickle.loads(reply)
            except Exception:
                return reply
            if isinstance(decoded, list) and len(decoded) == 1:
                return decoded[0]
            return decoded

    def send(self, payload):
        return asyncio.run(self._send_async(payload))

    def read(self, param: str):
        return self.send([0, param, 0])

    def write(self, param: str, value: Any):
        return self.send([1, param, value])
