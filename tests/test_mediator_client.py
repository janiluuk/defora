import asyncio
import pickle
import unittest

from defora_cli.mediator_client import MediatorClient


class FakeWebSocket:
    def __init__(self):
        self.sent = []
        self.to_return = pickle.dumps(["ok"])

    async def send(self, payload):
        self.sent.append(pickle.loads(payload))

    async def recv(self):
        return self.to_return

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False


def fake_connector(uri):
    return FakeWebSocket()


class TestMediatorClient(unittest.TestCase):
    def test_read(self):
        client = MediatorClient("localhost", "8766", connector=fake_connector)
        result = client.read("translation_x")
        self.assertEqual(result, "ok")

    def test_write_payload(self):
        sock = FakeWebSocket()

        def connector(uri):
            return sock

        client = MediatorClient("localhost", "8766", connector=connector)
        client.write("strength", 0.5)
        self.assertEqual(sock.sent[-1], [1, "strength", 0.5])


if __name__ == "__main__":
    unittest.main()
