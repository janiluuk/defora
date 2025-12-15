#!/usr/bin/env python3
"""
RabbitMQ → mediator bridge for control messages.

Listens on a queue (default: controls) for JSON messages of shape:
  {"controlType": "...", "payload": {...}}
and maps them to concrete mediator writes (enabling any required
"should_use_deforumation_*" flags) before sending via MediatorClient.

Env:
- MQ_URL (default: amqp://localhost)
- MQ_QUEUE (default: controls)
- MEDIATOR_HOST (default: localhost)
- MEDIATOR_PORT (default: 8766)
"""
from __future__ import annotations

import json
import os
import sys
import time
from typing import Any, Dict

import pika

from .mediator_client import MediatorClient
from .control_mapping import map_control


MQ_URL = os.getenv("MQ_URL", "amqp://localhost")
MQ_QUEUE = os.getenv("MQ_QUEUE", "controls")
MEDIATOR_HOST = os.getenv("MEDIATOR_HOST", "localhost")
MEDIATOR_PORT = os.getenv("MEDIATOR_PORT", "8766")


def handle_message(client: MediatorClient, body: bytes) -> str:
    try:
        msg = json.loads(body.decode("utf-8"))
    except Exception as exc:
        return f"invalid json: {exc}"
    control_type = msg.get("controlType") or msg.get("type") or ""
    payload: Dict[str, Any] = msg.get("payload") or {}
    if not isinstance(payload, dict):
        return "payload not a dict"
    mapped = map_control(control_type, payload)
    sent = []
    for key, value in mapped.writes:
        try:
            client.write(key, value)
            sent.append(key)
        except Exception:
            continue
    if not sent:
        return f"no writes for {control_type}"
    return f"{mapped.detail or control_type}: {', '.join(sent)}"


def main():
    client = MediatorClient(MEDIATOR_HOST, MEDIATOR_PORT)
    params = pika.URLParameters(MQ_URL)
    while True:
        try:
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            channel.queue_declare(queue=MQ_QUEUE, durable=False)

            def callback(ch, method, properties, body):
                result = handle_message(client, body)
                print(f"[bridge] {result}")

            channel.basic_consume(queue=MQ_QUEUE, on_message_callback=callback, auto_ack=True)
            print(f"[bridge] listening on {MQ_QUEUE}, mediator {MEDIATOR_HOST}:{MEDIATOR_PORT}")
            channel.start_consuming()
        except KeyboardInterrupt:
            break
        except Exception as exc:
            print(f"[bridge] error: {exc}", file=sys.stderr)
            time.sleep(2)


if __name__ == "__main__":
    main()
