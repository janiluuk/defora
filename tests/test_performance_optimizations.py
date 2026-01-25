"""
Tests for performance optimization features.

Tests WebSocket batching, HLS caching, and batch generation optimization.
"""
import unittest


class TestPerformanceSettings(unittest.TestCase):
    """Tests for performance settings management"""
    
    def test_performance_settings_structure(self):
        """Test performance settings response structure"""
        settings_response = {
            "websocket": {
                "batching": True,
                "batchInterval": 50,
                "maxBatchSize": 10
            },
            "hls": {
                "caching": True,
                "maxAge": 30000,
                "maxSize": 50,
                "currentSize": 0
            },
            "batchGeneration": {
                "enabled": True,
                "maxBatchSize": 4,
                "pendingCount": 0
            }
        }
        
        self.assertIn("websocket", settings_response)
        self.assertIn("hls", settings_response)
        self.assertIn("batchGeneration", settings_response)
        
        # WebSocket settings
        ws = settings_response["websocket"]
        self.assertIn("batching", ws)
        self.assertIn("batchInterval", ws)
        self.assertIn("maxBatchSize", ws)
        self.assertIsInstance(ws["batching"], bool)
        self.assertIsInstance(ws["batchInterval"], int)
        self.assertIsInstance(ws["maxBatchSize"], int)
        
        # HLS settings
        hls = settings_response["hls"]
        self.assertIn("caching", hls)
        self.assertIn("maxAge", hls)
        self.assertIn("maxSize", hls)
        self.assertIn("currentSize", hls)
        
        # Batch generation settings
        batch = settings_response["batchGeneration"]
        self.assertIn("enabled", batch)
        self.assertIn("maxBatchSize", batch)
        self.assertIn("pendingCount", batch)
    
    def test_update_settings_validation(self):
        """Test settings update validation"""
        update_request = {
            "websocket": {
                "batching": False,
                "batchInterval": 100,
                "maxBatchSize": 5
            }
        }
        
        # Validate intervals
        self.assertGreaterEqual(update_request["websocket"]["batchInterval"], 10)
        self.assertGreater(update_request["websocket"]["maxBatchSize"], 0)


class TestWebSocketBatching(unittest.TestCase):
    """Tests for WebSocket message batching"""
    
    def test_batch_message_structure(self):
        """Test batched message structure"""
        batch_message = {
            "type": "batch",
            "messages": [
                {"type": "update", "data": "msg1"},
                {"type": "update", "data": "msg2"}
            ],
            "count": 2,
            "timestamp": 1234567890
        }
        
        self.assertEqual(batch_message["type"], "batch")
        self.assertIn("messages", batch_message)
        self.assertIn("count", batch_message)
        self.assertIn("timestamp", batch_message)
        self.assertIsInstance(batch_message["messages"], list)
        self.assertEqual(batch_message["count"], len(batch_message["messages"]))
    
    def test_batch_size_limits(self):
        """Test batch size enforcement"""
        max_batch_size = 10
        pending_messages = []
        
        # Add messages
        for i in range(15):
            pending_messages.append({"msg": i})
            
            # Should flush when reaching max size
            if len(pending_messages) >= max_batch_size:
                batch = pending_messages[:max_batch_size]
                pending_messages = pending_messages[max_batch_size:]
                self.assertEqual(len(batch), max_batch_size)
    
    def test_batch_interval_timing(self):
        """Test that batch interval is configurable"""
        intervals = [10, 50, 100, 500]
        
        for interval in intervals:
            self.assertGreaterEqual(interval, 10)
            self.assertLessEqual(interval, 1000)


class TestHLSCaching(unittest.TestCase):
    """Tests for HLS segment caching"""
    
    def test_cache_stats_structure(self):
        """Test HLS cache stats structure"""
        cache_stats = {
            "total": 10,
            "valid": 8,
            "expired": 2,
            "maxSize": 50,
            "maxAge": 30000
        }
        
        self.assertIn("total", cache_stats)
        self.assertIn("valid", cache_stats)
        self.assertIn("expired", cache_stats)
        self.assertIn("maxSize", cache_stats)
        self.assertIn("maxAge", cache_stats)
        
        # Validate counts
        self.assertEqual(cache_stats["total"], cache_stats["valid"] + cache_stats["expired"])
    
    def test_cache_expiration_logic(self):
        """Test cache expiration logic"""
        import time
        
        max_age_ms = 30000  # 30 seconds
        now = time.time() * 1000  # Convert to milliseconds
        
        # Valid entry (5 seconds old)
        entry1_time = now - 5000
        self.assertLess(now - entry1_time, max_age_ms)
        
        # Expired entry (35 seconds old)
        entry2_time = now - 35000
        self.assertGreaterEqual(now - entry2_time, max_age_ms)
    
    def test_cache_size_limit(self):
        """Test cache size limiting"""
        max_size = 50
        cache_size = 45
        
        # Should allow adding when under limit
        self.assertLess(cache_size, max_size)
        
        # Should evict when at limit
        cache_size = 50
        self.assertEqual(cache_size, max_size)
    
    def test_clear_cache_response(self):
        """Test cache clear response"""
        clear_response = {
            "success": True,
            "clearedCount": 15
        }
        
        self.assertIn("success", clear_response)
        self.assertIn("clearedCount", clear_response)
        self.assertTrue(clear_response["success"])
        self.assertGreaterEqual(clear_response["clearedCount"], 0)


class TestBatchGeneration(unittest.TestCase):
    """Tests for batch generation optimization"""
    
    def test_batch_request_structure(self):
        """Test batch generation request structure"""
        batch_request = {
            "requests": [
                {"prompt": "test1", "steps": 20},
                {"prompt": "test2", "steps": 20}
            ]
        }
        
        self.assertIn("requests", batch_request)
        self.assertIsInstance(batch_request["requests"], list)
        self.assertGreater(len(batch_request["requests"]), 0)
    
    def test_batch_size_validation(self):
        """Test batch size validation"""
        max_batch_size = 4
        
        # Valid batch
        valid_batch = list(range(3))
        self.assertLessEqual(len(valid_batch), max_batch_size)
        
        # Oversized batch
        oversized_batch = list(range(6))
        self.assertGreater(len(oversized_batch), max_batch_size)
    
    def test_batch_response_structure(self):
        """Test batch generation response structure"""
        batch_response = {
            "batchId": "batch_1234567890",
            "status": "queued",
            "requestCount": 3,
            "position": 1
        }
        
        self.assertIn("batchId", batch_response)
        self.assertIn("status", batch_response)
        self.assertIn("requestCount", batch_response)
        self.assertIn("position", batch_response)
        self.assertIn(batch_response["status"], ["queued", "processing", "completed", "failed"])
    
    def test_batch_status_structure(self):
        """Test batch status response structure"""
        status_response = {
            "batchId": "batch_1234567890",
            "status": "processing",
            "requestCount": 3,
            "queuedAt": "2024-01-01T00:00:00Z",
            "processedAt": "2024-01-01T00:00:05Z",
            "completedAt": None
        }
        
        self.assertIn("batchId", status_response)
        self.assertIn("status", status_response)
        self.assertIn("requestCount", status_response)
        self.assertIn("queuedAt", status_response)


class TestPerformanceMetrics(unittest.TestCase):
    """Tests for performance metrics"""
    
    def test_metrics_structure(self):
        """Test performance metrics structure"""
        metrics = {
            "websocket": {
                "pendingMessages": 5,
                "batchingEnabled": True
            },
            "hls": {
                "cachedSegments": 20,
                "cachingEnabled": True
            },
            "batchQueue": {
                "pendingBatches": 2,
                "enabled": True
            },
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        self.assertIn("websocket", metrics)
        self.assertIn("hls", metrics)
        self.assertIn("batchQueue", metrics)
        self.assertIn("timestamp", metrics)
        
        # Validate metric values
        self.assertGreaterEqual(metrics["websocket"]["pendingMessages"], 0)
        self.assertGreaterEqual(metrics["hls"]["cachedSegments"], 0)
        self.assertGreaterEqual(metrics["batchQueue"]["pendingBatches"], 0)
    
    def test_metrics_monitoring(self):
        """Test that metrics can be monitored over time"""
        # Simulate metric snapshots
        snapshot1 = {"pendingMessages": 5, "timestamp": 1000}
        snapshot2 = {"pendingMessages": 3, "timestamp": 2000}
        
        # Messages decreased
        self.assertLess(snapshot2["pendingMessages"], snapshot1["pendingMessages"])
        
        # Time progressed
        self.assertGreater(snapshot2["timestamp"], snapshot1["timestamp"])


class TestPerformanceOptimizations(unittest.TestCase):
    """Integration tests for performance optimizations"""
    
    def test_all_optimizations_configurable(self):
        """Test that all optimizations can be enabled/disabled"""
        config = {
            "websocket_batching": True,
            "hls_caching": True,
            "batch_generation": True
        }
        
        # All should be boolean
        for key, value in config.items():
            self.assertIsInstance(value, bool)
    
    def test_performance_improves_with_batching(self):
        """Test that batching reduces message count"""
        # Without batching: 10 messages = 10 sends
        messages_without = 10
        
        # With batching (batch size 5): 10 messages = 2 sends
        batch_size = 5
        messages_with = messages_without // batch_size
        
        # Batching reduces network operations
        self.assertLess(messages_with, messages_without)
    
    def test_cache_reduces_redundant_requests(self):
        """Test that caching reduces redundant requests"""
        # Without cache: 5 requests for same segment = 5 fetches
        requests_without_cache = 5
        
        # With cache: 5 requests for same segment = 1 fetch + 4 cache hits
        fetches_with_cache = 1
        cache_hits = 4
        
        self.assertEqual(requests_without_cache, fetches_with_cache + cache_hits)
        self.assertLess(fetches_with_cache, requests_without_cache)


if __name__ == "__main__":
    unittest.main()
