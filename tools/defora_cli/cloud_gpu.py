#!/usr/bin/env python3
"""
Cloud GPU integration for Defora.

Supports RunPod and Vast.ai for cloud-based SD-Forge deployment.
Enables automatic provisioning, monitoring, and cost optimization.

Usage:
  python -m defora_cli.cloud_gpu provision --provider runpod --gpu-type RTX4090 --pool-name cloud-pool
  python -m defora_cli.cloud_gpu status --pool-name cloud-pool
  python -m defora_cli.cloud_gpu cost-estimate --provider runpod --hours 8
"""
from __future__ import annotations

import argparse
import json
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import requests
except ImportError:
    requests = None


@dataclass
class CloudNode:
    """Represents a cloud GPU node."""
    node_id: str
    provider: str  # runpod, vastai
    gpu_type: str
    status: str  # provisioning, running, stopping, stopped, error
    url: str = ""
    cost_per_hour: float = 0.0
    started_at: float = 0.0
    metrics: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CloudPool:
    """Cloud GPU pool configuration."""
    name: str
    provider: str
    gpu_type: str
    min_nodes: int = 0
    max_nodes: int = 3
    current_nodes: List[CloudNode] = field(default_factory=list)
    auto_scale: bool = True
    max_cost_per_hour: float = 10.0


class RunPodClient:
    """Client for RunPod API."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("RUNPOD_API_KEY", "")
        self.base_url = "https://api.runpod.io"
        
        if not self.api_key:
            raise ValueError("RUNPOD_API_KEY environment variable required")
            
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
    def list_gpu_types(self) -> List[Dict[str, Any]]:
        """List available GPU types."""
        if requests is None:
            raise ImportError("requests package required")
            
        response = requests.get(f"{self.base_url}/gpu-types", headers=self.headers)
        response.raise_for_status()
        return response.json()
        
    def provision_node(self, gpu_type: str, name: str, image: str = "runpod/defora:latest") -> str:
        """Provision a new GPU node."""
        if requests is None:
            raise ImportError("requests package required")
            
        payload = {
            "name": name,
            "gpu_type": gpu_type,
            "image": image,
            "ports": ["7860/http", "8766/tcp"],
            "env": [
                {"key": "DEFORA_CLOUD", "value": "1"},
            ],
        }
        
        response = requests.post(
            f"{self.base_url}/v1/pods",
            headers=self.headers,
            json=payload,
        )
        response.raise_for_status()
        result = response.json()
        return result.get("id", "")
        
    def stop_node(self, node_id: str) -> bool:
        """Stop a GPU node."""
        if requests is None:
            raise ImportError("requests package required")
            
        response = requests.post(
            f"{self.base_url}/v1/pod/{node_id}/stop",
            headers=self.headers,
        )
        return response.status_code == 200
        
    def get_node_status(self, node_id: str) -> Dict[str, Any]:
        """Get node status."""
        if requests is None:
            raise ImportError("requests package required")
            
        response = requests.get(
            f"{self.base_url}/v1/pod/{node_id}",
            headers=self.headers,
        )
        response.raise_for_status()
        return response.json()
        
    def get_cost_estimate(self, gpu_type: str, hours: int) -> float:
        """Estimate cost for running a GPU."""
        # RunPod pricing (approximate)
        pricing = {
            "RTX4090": 0.74,
            "RTX4080": 0.54,
            "RTX4070": 0.40,
            "A100": 1.50,
            "A6000": 0.76,
            "A40": 0.50,
        }
        price_per_hour = pricing.get(gpu_type, 0.50)
        return price_per_hour * hours


class VastAIClient:
    """Client for Vast.ai API."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("VAST_API_KEY", "")
        self.base_url = "https://console.vast.ai/api/v0"
        
        if not self.api_key:
            raise ValueError("VAST_API_KEY environment variable required")
            
    def search_instances(self, gpu_type: str, min_vram: int = 12) -> List[Dict[str, Any]]:
        """Search for available GPU instances."""
        if requests is None:
            raise ImportError("requests package required")
            
        params = {
            "q": {
                "gpu_name": {"in": [gpu_type]},
                "vram": {"gte": min_vram},
                "verified": {"eq": True},
            },
            "order": [["price", "asc"]],
        }
        
        response = requests.get(
            f"{self.base_url}/search",
            headers={"Authorization": f"Bearer {self.api_key}"},
            params={"q": json.dumps(params)},
        )
        response.raise_for_status()
        return response.json().get("offers", [])
        
    def create_instance(self, offer_id: str, image: str = "runpod/defora:latest") -> str:
        """Create a new instance."""
        if requests is None:
            raise ImportError("requests package required")
            
        payload = {
            "image": image,
            "disk": 50,
            "label": f"defora-{int(time.time())}",
            "env": {"DEFORA_CLOUD": "1"},
        }
        
        response = requests.post(
            f"{self.base_url}/instances/create/{offer_id}/",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json=payload,
        )
        response.raise_for_status()
        result = response.json()
        return result.get("new_contract", "")
        
    def destroy_instance(self, instance_id: str) -> bool:
        """Destroy an instance."""
        if requests is None:
            raise ImportError("requests package required")
            
        response = requests.post(
            f"{self.base_url}/instances/destroy/{instance_id}/",
            headers={"Authorization": f"Bearer {self.api_key}"},
        )
        return response.status_code == 200
        
    def get_cost_estimate(self, gpu_type: str, hours: int) -> float:
        """Estimate cost for running a GPU."""
        # Vast.ai pricing (approximate, usually cheaper than RunPod)
        pricing = {
            "RTX4090": 0.45,
            "RTX4080": 0.35,
            "RTX4070": 0.25,
            "A100": 0.90,
            "A6000": 0.45,
            "A40": 0.30,
        }
        price_per_hour = pricing.get(gpu_type, 0.30)
        return price_per_hour * hours


class CloudGPUManager:
    """Manage cloud GPU resources for Defora."""
    
    def __init__(self, pool_file: Optional[Path] = None):
        self.pool_file = pool_file or Path(__file__).parent / "cloud_pools.json"
        self.pools: Dict[str, CloudPool] = {}
        self._load_pools()
        
    def _load_pools(self):
        """Load pool configuration from file."""
        if self.pool_file.exists():
            with open(self.pool_file, 'r') as f:
                data = json.load(f)
                for name, pool_data in data.items():
                    self.pools[name] = CloudPool(**pool_data)
                    
    def save_pools(self):
        """Save pool configuration to file."""
        data = {name: pool.__dict__ for name, pool in self.pools.items()}
        with open(self.pool_file, 'w') as f:
            json.dump(data, f, indent=2, default=str)
            
    def create_pool(self, name: str, provider: str, gpu_type: str, 
                   min_nodes: int = 0, max_nodes: int = 3,
                   auto_scale: bool = True, max_cost: float = 10.0) -> CloudPool:
        """Create a new cloud GPU pool."""
        pool = CloudPool(
            name=name,
            provider=provider,
            gpu_type=gpu_type,
            min_nodes=min_nodes,
            max_nodes=max_nodes,
            auto_scale=auto_scale,
            max_cost_per_hour=max_cost,
        )
        self.pools[name] = pool
        self.save_pools()
        return pool
        
    def provision_nodes(self, pool_name: str, count: int = 1) -> List[str]:
        """Provision new nodes in a pool."""
        pool = self.pools.get(pool_name)
        if not pool:
            raise ValueError(f"Pool '{pool_name}' not found")
            
        if len(pool.current_nodes) + count > pool.max_nodes:
            raise ValueError(f"Would exceed max nodes ({pool.max_nodes})")
            
        node_ids = []
        
        if pool.provider == "runpod":
            client = RunPodClient()
            for i in range(count):
                node_id = client.provision_node(
                    pool.gpu_type,
                    f"{pool_name}-{len(pool.current_nodes) + i}",
                )
                node = CloudNode(
                    node_id=node_id,
                    provider="runpod",
                    gpu_type=pool.gpu_type,
                    status="provisioning",
                    cost_per_hour=client.get_cost_estimate(pool.gpu_type, 1),
                    started_at=time.time(),
                )
                pool.current_nodes.append(node)
                node_ids.append(node_id)
                
        elif pool.provider == "vastai":
            client = VastAIClient()
            instances = client.search_instances(pool.gpu_type)
            if not instances:
                raise ValueError(f"No {pool.gpu_type} instances available on Vast.ai")
                
            for i in range(min(count, len(instances))):
                instance_id = client.create_instance(instances[i]["id"])
                node = CloudNode(
                    node_id=instance_id,
                    provider="vastai",
                    gpu_type=pool.gpu_type,
                    status="provisioning",
                    cost_per_hour=instances[i]["price"],
                    started_at=time.time(),
                )
                pool.current_nodes.append(node)
                node_ids.append(instance_id)
        else:
            raise ValueError(f"Unknown provider: {pool.provider}")
            
        self.save_pools()
        return node_ids
        
    def stop_pool(self, pool_name: str):
        """Stop all nodes in a pool."""
        pool = self.pools.get(pool_name)
        if not pool:
            raise ValueError(f"Pool '{pool_name}' not found")
            
        for node in pool.current_nodes:
            if node.provider == "runpod":
                client = RunPodClient()
                client.stop_node(node.node_id)
            elif node.provider == "vastai":
                client = VastAIClient()
                client.destroy_instance(node.node_id)
            node.status = "stopped"
            
        self.save_pools()
        
    def get_pool_status(self, pool_name: str) -> Dict[str, Any]:
        """Get status of a pool."""
        pool = self.pools.get(pool_name)
        if not pool:
            raise ValueError(f"Pool '{pool_name}' not found")
            
        total_cost = sum(n.cost_per_hour for n in pool.current_nodes if n.status == "running")
        running_nodes = sum(1 for n in pool.current_nodes if n.status == "running")
        
        return {
            "name": pool.name,
            "provider": pool.provider,
            "gpu_type": pool.gpu_type,
            "nodes": len(pool.current_nodes),
            "running": running_nodes,
            "min_nodes": pool.min_nodes,
            "max_nodes": pool.max_nodes,
            "cost_per_hour": total_cost,
            "max_cost_per_hour": pool.max_cost_per_hour,
            "auto_scale": pool.auto_scale,
        }
        
    def get_cost_estimate(self, provider: str, gpu_type: str, hours: int) -> float:
        """Get cost estimate for cloud GPU."""
        if provider == "runpod":
            client = RunPodClient()
            return client.get_cost_estimate(gpu_type, hours)
        elif provider == "vastai":
            client = VastAIClient()
            return client.get_cost_estimate(gpu_type, hours)
        else:
            raise ValueError(f"Unknown provider: {provider}")


def main():
    parser = argparse.ArgumentParser(description="Cloud GPU integration for Defora")
    sub = parser.add_subparsers(dest="command", required=True)
    
    # Provision command
    provision = sub.add_parser("provision", help="Provision cloud GPU nodes")
    provision.add_argument("--provider", required=True, choices=["runpod", "vastai"])
    provision.add_argument("--gpu-type", required=True, help="GPU type (e.g., RTX4090)")
    provision.add_argument("--pool-name", required=True, help="Pool name")
    provision.add_argument("--count", type=int, default=1, help="Number of nodes")
    provision.add_argument("--max-cost", type=float, default=10.0, help="Max cost per hour")
    
    # Status command
    status = sub.add_parser("status", help="Show pool status")
    status.add_argument("--pool-name", required=True, help="Pool name")
    
    # Stop command
    stop = sub.add_parser("stop", help="Stop pool")
    stop.add_argument("--pool-name", required=True, help="Pool name")
    
    # Cost estimate command
    cost = sub.add_parser("cost-estimate", help="Estimate cloud GPU costs")
    cost.add_argument("--provider", required=True, choices=["runpod", "vastai"])
    cost.add_argument("--gpu-type", required=True, help="GPU type")
    cost.add_argument("--hours", type=int, default=8, help="Number of hours")
    
    args = parser.parse_args()
    manager = CloudGPUManager()
    
    if args.command == "provision":
        try:
            pool = manager.create_pool(
                args.pool_name,
                args.provider,
                args.gpu_type,
                max_cost=args.max_cost,
            )
            node_ids = manager.provision_nodes(args.pool_name, args.count)
            print(f"Provisioned {len(node_ids)} nodes:")
            for node_id in node_ids:
                print(f"  - {node_id}")
        except Exception as e:
            print(f"Error: {e}")
    elif args.command == "status":
        try:
            status = manager.get_pool_status(args.pool_name)
            print(json.dumps(status, indent=2))
        except Exception as e:
            print(f"Error: {e}")
    elif args.command == "stop":
        try:
            manager.stop_pool(args.pool_name)
            print(f"Pool '{args.pool_name}' stopped")
        except Exception as e:
            print(f"Error: {e}")
    elif args.command == "cost-estimate":
        try:
            cost = manager.get_cost_estimate(args.provider, args.gpu_type, args.hours)
            print(f"Estimated cost for {args.hours}h on {args.provider} ({args.gpu_type}): ${cost:.2f}")
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()
