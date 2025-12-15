#!/usr/bin/env python3
"""
Fetch a small set of mediator parameters and print them as JSON.

Intended for lightweight status/initial-state queries from web/TUI layers.
"""
from __future__ import annotations

import argparse
import json
from typing import Dict, Iterable, List, Tuple

from .mediator_client import MediatorClient

DEFAULT_KEYS: Tuple[str, ...] = (
    "cfg",
    "strength",
    "noise_multiplier",
    "cadence",
    "translation_x",
    "translation_y",
    "translation_z",
    "rotation_x",
    "rotation_y",
    "rotation_z",
    "fov",
    "seed",
    "total_generated_images",
    "start_frame",
)


def fetch_state(client: MediatorClient, keys: Iterable[str]) -> Dict[str, object]:
    state: Dict[str, object] = {}
    for key in keys:
        try:
            state[key] = client.read(key)
        except Exception:
            state[key] = None
    return state


def main():
    parser = argparse.ArgumentParser(description="Fetch mediator parameters as JSON")
    parser.add_argument("--host", default="localhost", help="Mediator host")
    parser.add_argument("--port", default="8766", help="Mediator port")
    parser.add_argument(
        "--keys",
        default=",".join(DEFAULT_KEYS),
        help="Comma-separated list of mediator keys to read",
    )
    args = parser.parse_args()

    keys = [k.strip() for k in args.keys.split(",") if k.strip()]
    client = MediatorClient(args.host, args.port)
    state = fetch_state(client, keys)
    print(json.dumps(state))


if __name__ == "__main__":
    main()
