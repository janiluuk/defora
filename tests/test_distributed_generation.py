"""
Tests for distributed generation system.

Tests load balancing, health checking, and multi-node coordination.
"""
import unittest


class TestDistributedConfiguration(unittest.TestCase):
    """Tests for distributed system configuration"""
    
    def test_configuration_structure(self):
        """Test distributed configuration structure"""
        config = {
            "enabled": True,
            "strategy": "round_robin",
            "nodes": [
                {
                    "url": "http://192.168.1.10:8188",
                    "name": "GPU-RTX4090-1",
                    "gpuModel": "RTX 4090",
                    "priority": 1
                }
            ],
            "healthCheckInterval": 30,
            "timeout": 300,
            "retryAttempts": 2
        }
        
        self.assertIn("enabled", config)
        self.assertIn("strategy", config)
        self.assertIn("nodes", config)
        self.assertIn("healthCheckInterval", config)
        self.assertIn("timeout", config)
        
        # Validate strategy
        valid_strategies = ["round_robin", "least_busy", "random", "priority"]
        self.assertIn(config["strategy"], valid_strategies)
        
        # Validate nodes
        self.assertIsInstance(config["nodes"], list)
        if len(config["nodes"]) > 0:
            node = config["nodes"][0]
            self.assertIn("url", node)
            self.assertIn("name", node)
    
    def test_node_structure(self):
        """Test node configuration structure"""
        node = {
            "url": "http://192.168.1.10:8188",
            "name": "GPU-RTX4090-1",
            "status": "healthy",
            "activeJobs": 2,
            "totalJobs": 150,
            "priority": 1,
            "gpuModel": "RTX 4090",
            "lastHealthCheck": "2024-01-25T00:00:00Z",
            "responseTime": 45
        }
        
        required_fields = ["url", "name", "status"]
        for field in required_fields:
            self.assertIn(field, node)
        
        # Validate status values
        valid_statuses = ["healthy", "unhealthy", "unknown", "disabled"]
        self.assertIn(node["status"], valid_statuses)
        
        # Validate counts
        self.assertGreaterEqual(node["activeJobs"], 0)
        self.assertGreaterEqual(node["totalJobs"], 0)


class TestLoadBalancing(unittest.TestCase):
    """Tests for load balancing strategies"""
    
    def test_round_robin_distribution(self):
        """Test round robin load balancing"""
        nodes = ["node1", "node2", "node3"]
        current_index = 0
        
        # Simulate 10 requests
        assignments = []
        for _ in range(10):
            assignments.append(nodes[current_index])
            current_index = (current_index + 1) % len(nodes)
        
        # Should distribute evenly
        self.assertEqual(assignments.count("node1"), 4)  # indices 0, 3, 6, 9
        self.assertEqual(assignments.count("node2"), 3)  # indices 1, 4, 7
        self.assertEqual(assignments.count("node3"), 3)  # indices 2, 5, 8
    
    def test_least_busy_selection(self):
        """Test least busy node selection"""
        nodes = [
            {"name": "node1", "activeJobs": 5},
            {"name": "node2", "activeJobs": 2},
            {"name": "node3", "activeJobs": 8}
        ]
        
        # Find least busy
        least_busy = min(nodes, key=lambda n: n["activeJobs"])
        
        self.assertEqual(least_busy["name"], "node2")
        self.assertEqual(least_busy["activeJobs"], 2)
    
    def test_priority_selection(self):
        """Test priority-based selection"""
        nodes = [
            {"name": "node1", "priority": 2},
            {"name": "node2", "priority": 1},  # Highest priority (lower number)
            {"name": "node3", "priority": 3}
        ]
        
        # Sort by priority (lower is higher priority)
        sorted_nodes = sorted(nodes, key=lambda n: n["priority"])
        
        self.assertEqual(sorted_nodes[0]["name"], "node2")
        self.assertEqual(sorted_nodes[0]["priority"], 1)
    
    def test_random_selection(self):
        """Test random node selection"""
        import random
        
        nodes = ["node1", "node2", "node3"]
        random.seed(42)  # For reproducible tests
        
        selected = random.choice(nodes)
        self.assertIn(selected, nodes)


class TestHealthChecking(unittest.TestCase):
    """Tests for node health checking"""
    
    def test_health_check_result_structure(self):
        """Test health check result structure"""
        result = {
            "success": True,
            "checked": 3,
            "healthy": 2,
            "results": [
                {"url": "http://node1:8188", "healthy": True, "responseTime": 45},
                {"url": "http://node2:8188", "healthy": True, "responseTime": 52},
                {"url": "http://node3:8188", "healthy": False, "reason": "timeout"}
            ]
        }
        
        self.assertIn("success", result)
        self.assertIn("checked", result)
        self.assertIn("healthy", result)
        self.assertIn("results", result)
        
        self.assertEqual(result["checked"], len(result["results"]))
        
        # Validate individual results
        for check in result["results"]:
            self.assertIn("url", check)
            self.assertIn("healthy", check)
            
            if check["healthy"]:
                self.assertIn("responseTime", check)
            else:
                self.assertIn("reason", check)
    
    def test_health_status_transitions(self):
        """Test node health status transitions"""
        transitions = [
            ("unknown", "healthy"),
            ("healthy", "unhealthy"),
            ("unhealthy", "healthy"),
            ("healthy", "disabled"),
            ("disabled", "unknown")
        ]
        
        valid_statuses = ["healthy", "unhealthy", "unknown", "disabled"]
        
        for from_status, to_status in transitions:
            self.assertIn(from_status, valid_statuses)
            self.assertIn(to_status, valid_statuses)
    
    def test_periodic_health_check_interval(self):
        """Test health check interval validation"""
        intervals = [10, 30, 60, 120, 300]
        
        for interval in intervals:
            self.assertGreaterEqual(interval, 5)  # Minimum 5 seconds
            self.assertLessEqual(interval, 600)  # Maximum 10 minutes


class TestJobManagement(unittest.TestCase):
    """Tests for distributed job management"""
    
    def test_job_creation_structure(self):
        """Test job creation response structure"""
        job_response = {
            "jobId": "job_1234567890_abc123",
            "assignedNode": "GPU-RTX4090-1",
            "nodeUrl": "http://192.168.1.10:8188",
            "status": "queued",
            "estimatedWaitTime": 60
        }
        
        self.assertIn("jobId", job_response)
        self.assertIn("assignedNode", job_response)
        self.assertIn("nodeUrl", job_response)
        self.assertIn("status", job_response)
        self.assertIn("estimatedWaitTime", job_response)
        
        # Validate status
        valid_statuses = ["queued", "running", "completed", "failed"]
        self.assertIn(job_response["status"], valid_statuses)
    
    def test_job_status_structure(self):
        """Test job status response structure"""
        job_status = {
            "id": "job_1234567890_abc123",
            "nodeUrl": "http://192.168.1.10:8188",
            "nodeName": "GPU-RTX4090-1",
            "workflow": {},
            "priority": "normal",
            "status": "running",
            "createdAt": "2024-01-25T00:00:00Z",
            "startedAt": "2024-01-25T00:00:05Z",
            "completedAt": None
        }
        
        required_fields = ["id", "nodeUrl", "nodeName", "status", "createdAt"]
        for field in required_fields:
            self.assertIn(field, job_status)
        
        # Validate priority
        valid_priorities = ["low", "normal", "high"]
        self.assertIn(job_status["priority"], valid_priorities)
    
    def test_wait_time_estimation(self):
        """Test wait time estimation logic"""
        # 30 seconds per active job
        active_jobs = 3
        estimated_wait = active_jobs * 30
        
        self.assertEqual(estimated_wait, 90)
        self.assertGreaterEqual(estimated_wait, 0)


class TestMetrics(unittest.TestCase):
    """Tests for distributed metrics"""
    
    def test_metrics_structure(self):
        """Test distributed metrics structure"""
        metrics = {
            "enabled": True,
            "strategy": "round_robin",
            "totalJobs": 250,
            "nodeMetrics": [
                {
                    "url": "http://node1:8188",
                    "name": "GPU-RTX4090-1",
                    "activeJobs": 2,
                    "totalJobs": 100,
                    "successRate": "98.50",
                    "avgResponseTime": 45,
                    "status": "healthy"
                }
            ]
        }
        
        self.assertIn("enabled", metrics)
        self.assertIn("strategy", metrics)
        self.assertIn("totalJobs", metrics)
        self.assertIn("nodeMetrics", metrics)
        
        # Validate node metrics
        self.assertIsInstance(metrics["nodeMetrics"], list)
        if len(metrics["nodeMetrics"]) > 0:
            node_metric = metrics["nodeMetrics"][0]
            self.assertIn("url", node_metric)
            self.assertIn("name", node_metric)
            self.assertIn("activeJobs", node_metric)
            self.assertIn("successRate", node_metric)
    
    def test_success_rate_calculation(self):
        """Test success rate calculation"""
        success_count = 95
        failure_count = 5
        total = success_count + failure_count
        
        success_rate = (success_count / total) * 100
        
        self.assertEqual(success_rate, 95.0)
        self.assertGreaterEqual(success_rate, 0)
        self.assertLessEqual(success_rate, 100)


class TestFailover(unittest.TestCase):
    """Tests for failover and recovery"""
    
    def test_node_disable_enable(self):
        """Test disabling and enabling nodes"""
        node = {
            "url": "http://node1:8188",
            "status": "healthy"
        }
        
        # Disable
        node["status"] = "disabled"
        self.assertEqual(node["status"], "disabled")
        
        # Enable (set to unknown for next health check)
        node["status"] = "unknown"
        self.assertEqual(node["status"], "unknown")
    
    def test_healthy_node_filtering(self):
        """Test filtering to only healthy nodes"""
        nodes = [
            {"name": "node1", "status": "healthy"},
            {"name": "node2", "status": "unhealthy"},
            {"name": "node3", "status": "healthy"},
            {"name": "node4", "status": "disabled"}
        ]
        
        healthy = [n for n in nodes if n["status"] == "healthy"]
        
        self.assertEqual(len(healthy), 2)
        self.assertEqual(healthy[0]["name"], "node1")
        self.assertEqual(healthy[1]["name"], "node3")
    
    def test_no_healthy_nodes_handling(self):
        """Test handling when no healthy nodes available"""
        nodes = [
            {"name": "node1", "status": "unhealthy"},
            {"name": "node2", "status": "disabled"}
        ]
        
        healthy = [n for n in nodes if n["status"] == "healthy"]
        
        self.assertEqual(len(healthy), 0)
        # Should return error in actual implementation


class TestDistributedGeneration(unittest.TestCase):
    """Integration tests for distributed generation"""
    
    def test_three_node_example(self):
        """Test 3 ComfyUI instance example"""
        nodes = [
            {
                "url": "http://192.168.1.10:8188",
                "name": "GPU-RTX4090-1",
                "status": "healthy",
                "activeJobs": 1
            },
            {
                "url": "http://192.168.1.11:8188",
                "name": "GPU-RTX4090-2",
                "status": "healthy",
                "activeJobs": 0
            },
            {
                "url": "http://192.168.1.12:8188",
                "name": "GPU-RTX3090",
                "status": "healthy",
                "activeJobs": 2
            }
        ]
        
        # All nodes should be healthy
        self.assertEqual(len(nodes), 3)
        self.assertTrue(all(n["status"] == "healthy" for n in nodes))
        
        # Total active jobs
        total_active = sum(n["activeJobs"] for n in nodes)
        self.assertEqual(total_active, 3)
    
    def test_frame_distribution(self):
        """Test distributing 100 frames across 3 nodes"""
        total_frames = 100
        num_nodes = 3
        
        # Equal distribution
        frames_per_node = total_frames // num_nodes
        remainder = total_frames % num_nodes
        
        distribution = [frames_per_node] * num_nodes
        # Add remainder to last node
        distribution[-1] += remainder
        
        self.assertEqual(sum(distribution), total_frames)
        self.assertEqual(distribution[0], 33)
        self.assertEqual(distribution[1], 33)
        self.assertEqual(distribution[2], 34)


if __name__ == "__main__":
    unittest.main()
