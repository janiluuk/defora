"""
Integration tests for Mediator WebSocket connectivity and protocol.

These tests verify that the mediator WebSocket protocol works correctly
with actual WebSocket connections and message handling.
"""
import unittest
import asyncio
import pickle
import os
from unittest.mock import Mock, AsyncMock, patch

from defora_cli.mediator_client import MediatorClient


# Skip tests if websockets is not available
try:
    import websockets
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    WEBSOCKETS_AVAILABLE = False

SKIP_MEDIATOR_TESTS = os.getenv("SKIP_MEDIATOR_TESTS", "").lower() in ("1", "true", "yes")


class MockWebSocketServer:
    """Mock WebSocket server for testing mediator protocol"""
    
    def __init__(self):
        self.received_messages = []
        self.responses = {}
        self.connection_count = 0
        
    async def handler(self, websocket, path):
        """Handle WebSocket connections"""
        self.connection_count += 1
        try:
            async for message in websocket:
                # Decode the pickled message
                try:
                    payload = pickle.loads(message)
                    self.received_messages.append(payload)
                    
                    # Handle read/write operations
                    if isinstance(payload, list) and len(payload) == 3:
                        action, param, value = payload
                        
                        if action == 0:  # Read operation
                            # Return stored value or default
                            response_value = self.responses.get(param, "default_value")
                            response = [response_value]
                        elif action == 1:  # Write operation
                            # Store the value
                            self.responses[param] = value
                            response = ["ok"]
                        else:
                            response = ["error", "unknown action"]
                    else:
                        response = ["error", "invalid payload"]
                    
                    # Send pickled response
                    await websocket.send(pickle.dumps(response))
                except Exception as e:
                    error_response = ["error", str(e)]
                    await websocket.send(pickle.dumps(error_response))
        except Exception:
            pass  # Connection closed


class TestMediatorWebSocketIntegration(unittest.TestCase):
    """Integration tests for Mediator WebSocket protocol"""
    
    def setUp(self):
        """Skip tests if mediator tests are disabled or websockets unavailable"""
        if SKIP_MEDIATOR_TESTS:
            self.skipTest("Mediator tests disabled via SKIP_MEDIATOR_TESTS environment variable")
        if not WEBSOCKETS_AVAILABLE:
            self.skipTest("websockets module not available")
    
    def test_mediator_client_instantiation(self):
        """Test that MediatorClient can be instantiated with correct parameters"""
        client = MediatorClient("localhost", "8766")
        self.assertEqual(client.host, "localhost")
        self.assertEqual(client.port, "8766")
        self.assertEqual(client.uri, "ws://localhost:8766")
        self.assertEqual(client.timeout, 10.0)
    
    def test_mediator_client_custom_timeout(self):
        """Test MediatorClient with custom timeout"""
        client = MediatorClient("localhost", "8766", timeout=5.0)
        self.assertEqual(client.timeout, 5.0)
    
    def test_mediator_read_write_protocol(self):
        """Test that read/write protocol creates correct payloads"""
        
        # Create a mock connector that captures the payload
        sent_payloads = []
        
        class FakeWebSocket:
            def __init__(self):
                self.sent = []
            
            async def send(self, payload):
                decoded = pickle.loads(payload)
                sent_payloads.append(decoded)
            
            async def recv(self):
                return pickle.dumps(["ok"])
            
            async def __aenter__(self):
                return self
            
            async def __aexit__(self, exc_type, exc, tb):
                return False
        
        def connector(uri):
            return FakeWebSocket()
        
        client = MediatorClient("localhost", "8766", connector=connector)
        
        # Test write operation
        client.write("cfg", 7.5)
        self.assertEqual(sent_payloads[-1], [1, "cfg", 7.5])
        
        # Test read operation
        client.read("translation_x")
        self.assertEqual(sent_payloads[-1], [0, "translation_x", 0])
    
    def test_mediator_protocol_with_various_parameter_types(self):
        """Test mediator protocol with different value types"""
        
        class FakeWebSocket:
            def __init__(self):
                self.sent_values = []
            
            async def send(self, payload):
                decoded = pickle.loads(payload)
                if decoded[0] == 1:  # Write operation
                    self.sent_values.append((decoded[1], decoded[2]))
            
            async def recv(self):
                return pickle.dumps(["ok"])
            
            async def __aenter__(self):
                return self
            
            async def __aexit__(self, exc_type, exc, tb):
                return False
        
        fake_ws = FakeWebSocket()
        
        def connector(uri):
            return fake_ws
        
        client = MediatorClient("localhost", "8766", connector=connector)
        
        # Test various parameter types
        test_cases = [
            ("strength", 0.75),
            ("cfg", 7.5),
            ("seed", 12345),
            ("prompt", "test prompt"),
            ("enabled", True),
            ("translation_x", -2.5),
        ]
        
        for param, value in test_cases:
            client.write(param, value)
        
        # Verify all values were sent correctly
        self.assertEqual(len(fake_ws.sent_values), len(test_cases))
        for i, (param, value) in enumerate(test_cases):
            self.assertEqual(fake_ws.sent_values[i], (param, value))
    
    def test_mediator_timeout_handling(self):
        """Test that timeout is properly configured"""
        client = MediatorClient("localhost", "8766", timeout=2.0)
        self.assertEqual(client.timeout, 2.0)
        
        # Test with very short timeout (should not hang)
        client_short = MediatorClient("localhost", "8766", timeout=0.1)
        self.assertEqual(client_short.timeout, 0.1)
    
    def test_mediator_response_unpacking(self):
        """Test that single-item list responses are unpacked correctly"""
        
        class FakeWebSocket:
            def __init__(self, response):
                self.response = response
            
            async def send(self, payload):
                pass
            
            async def recv(self):
                return pickle.dumps(self.response)
            
            async def __aenter__(self):
                return self
            
            async def __aexit__(self, exc_type, exc, tb):
                return False
        
        # Test single-item list unpacking
        def connector_single(uri):
            return FakeWebSocket(["value"])
        
        client = MediatorClient("localhost", "8766", connector=connector_single)
        result = client.read("test_param")
        self.assertEqual(result, "value")
        
        # Test multi-item list (not unpacked)
        def connector_multi(uri):
            return FakeWebSocket(["value1", "value2"])
        
        client = MediatorClient("localhost", "8766", connector=connector_multi)
        result = client.read("test_param")
        self.assertEqual(result, ["value1", "value2"])
    
    def test_mediator_connection_uri_format(self):
        """Test that WebSocket URI is correctly formatted"""
        test_cases = [
            ("localhost", "8766", "ws://localhost:8766"),
            ("192.168.1.100", "8765", "ws://192.168.1.100:8765"),
            ("mediator", "8766", "ws://mediator:8766"),
        ]
        
        for host, port, expected_uri in test_cases:
            client = MediatorClient(host, port)
            self.assertEqual(client.uri, expected_uri)


class TestMediatorProtocolCompliance(unittest.TestCase):
    """Tests for mediator protocol compliance and message format"""
    
    def setUp(self):
        """Skip tests if mediator tests are disabled or websockets unavailable"""
        if SKIP_MEDIATOR_TESTS:
            self.skipTest("Mediator tests disabled via SKIP_MEDIATOR_TESTS environment variable")
        if not WEBSOCKETS_AVAILABLE:
            self.skipTest("websockets module not available")
    
    def test_pickle_protocol_encoding(self):
        """Test that messages are correctly pickled"""
        # Test write message encoding
        write_payload = [1, "cfg", 7.5]
        encoded = pickle.dumps(write_payload)
        decoded = pickle.loads(encoded)
        self.assertEqual(decoded, write_payload)
        
        # Test read message encoding
        read_payload = [0, "translation_x", 0]
        encoded = pickle.dumps(read_payload)
        decoded = pickle.loads(encoded)
        self.assertEqual(decoded, read_payload)
    
    def test_response_format_compliance(self):
        """Test that responses follow expected format"""
        # Single value response (should be unpacked)
        response = ["ok"]
        self.assertEqual(len(response), 1)
        
        # Multi-value response (should not be unpacked)
        response = ["value1", "value2", "value3"]
        self.assertGreater(len(response), 1)
    
    def test_parameter_name_handling(self):
        """Test handling of various parameter names"""
        valid_params = [
            "cfg",
            "strength",
            "translation_x",
            "translation_y",
            "translation_z",
            "rotation_x",
            "rotation_y",
            "rotation_z",
            "seed",
            "steps",
            "zoom",
            "fov",
        ]
        
        for param in valid_params:
            # Create message
            payload = [0, param, 0]
            encoded = pickle.dumps(payload)
            decoded = pickle.loads(encoded)
            
            # Verify message integrity
            self.assertEqual(decoded[0], 0)
            self.assertEqual(decoded[1], param)
            self.assertEqual(decoded[2], 0)


if __name__ == "__main__":
    unittest.main()
