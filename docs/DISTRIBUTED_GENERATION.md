# Distributed Generation with SD-Forge + Deforumation

This example demonstrates load balancing across 3 SD-Forge instances running Deforumation-patched Deforum on a local network for **live video generation**.

> **Note**: ComfyUI is workflow-based and designed for batch processing, not real-time streaming. For live video generation with Defora, use SD-Forge with the Deforumation-patched Deforum extension.

## Architecture

```
┌─────────────────┐
│  Defora Server  │
│  (Load Balancer)│
└────────┬────────┘
         │
    ┌────┴────┐
    │ Round   │
    │ Robin   │
    └────┬────┘
         │
    ┌────┴────────────────┐
    │                     │
┌───▼────────┐  ┌──────────┐  ┌──▼─────────┐
│ SD-Forge   │  │ SD-Forge │  │ SD-Forge   │
│ +Deforum   │  │ +Deforum │  │ +Deforum   │
│ Node 1     │  │ Node 2   │  │ Node 3     │
│ RTX 4090   │  │ RTX 4090 │  │ RTX 3090   │
└────────────┘  └──────────┘  └────────────┘
192.168.1.10     .11           .12
```

## Configuration

### 1. SD-Forge Instance Setup

Start 3 SD-Forge instances with Deforumation on different machines or ports:

**Node 1** (192.168.1.10:7860):
```bash
cd stable-diffusion-webui-forge
python launch.py --listen 0.0.0.0 --port 7860 \
  --deforum-api --enable-insecure-extension-access \
  --xformers --no-half-vae
```

**Node 2** (192.168.1.11:7860):
```bash
cd stable-diffusion-webui-forge
python launch.py --listen 0.0.0.0 --port 7860 \
  --deforum-api --enable-insecure-extension-access \
  --xformers --no-half-vae
```

**Node 3** (192.168.1.12:7860):
```bash
cd stable-diffusion-webui-forge
python launch.py --listen 0.0.0.0 --port 7860 \
  --deforum-api --enable-insecure-extension-access \
  --xformers --no-half-vae
```

### 2. Defora Configuration

Configure the distributed generation pool in `docker-compose.yml` or environment:

```yaml
environment:
  # Distributed generation configuration
  DISTRIBUTED_ENABLED: "true"
  DISTRIBUTED_STRATEGY: "round_robin"  # or "least_busy", "priority", "random"
  DISTRIBUTED_NODES: >
    http://192.168.1.10:7860,
    http://192.168.1.11:7860,
    http://192.168.1.12:7860
  DISTRIBUTED_HEALTH_CHECK_INTERVAL: "30"  # seconds
  DISTRIBUTED_TIMEOUT: "300"  # seconds
  DISTRIBUTED_RETRY_ATTEMPTS: "2"
```

Or via API:

```bash
curl -X POST http://localhost:3000/api/distributed/configure \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "strategy": "round_robin",
    "nodes": [
      {
        "url": "http://192.168.1.10:7860",
        "name": "GPU-RTX4090-1",
        "gpuModel": "RTX 4090",
        "priority": 1,
        "capabilities": ["deforum", "live-video"]
      },
      {
        "url": "http://192.168.1.11:7860",
        "name": "GPU-RTX4090-2",
        "gpuModel": "RTX 4090",
        "priority": 1,
        "capabilities": ["deforum", "live-video"]
      },
      {
        "url": "http://192.168.1.12:7860",
        "name": "GPU-RTX3090",
        "gpuModel": "RTX 3090",
        "priority": 2,
        "capabilities": ["deforum", "live-video"]
      }
    ],
    "healthCheckInterval": 30,
    "timeout": 300,
    "retryAttempts": 2
  }'
```

## Load Balancing Strategies

### Round Robin (Default)
Distributes requests evenly across all available nodes in sequence.
- **Use case**: Equal GPU capabilities
- **Example**: Node1 → Node2 → Node3 → Node1 → ...

### Least Busy
Routes to the node with fewest active jobs.
- **Use case**: Mixed workloads
- **Example**: Check queue depth, send to least loaded

### Priority-Based
Routes based on node priority (1 = highest).
- **Use case**: Different GPU tiers
- **Example**: Try RTX 4090 nodes first, fallback to RTX 3090

### Random
Randomly selects available node.
- **Use case**: Simple distribution without state
- **Example**: Random selection from healthy nodes

## API Endpoints

### Get Pool Status
```bash
GET /api/distributed/status
```

Response:
```json
{
  "enabled": true,
  "strategy": "round_robin",
  "totalNodes": 3,
  "healthyNodes": 3,
  "nodes": [
    {
      "url": "http://192.168.1.10:7860",
      "name": "GPU-RTX4090-1",
      "status": "healthy",
      "activeJobs": 1,
      "totalJobs": 145,
      "lastHealthCheck": "2024-01-25T00:00:00Z",
      "responseTime": 23
    }
  ]
}
```

### Submit Distributed Job
```bash
POST /api/distributed/generate
```

Request:
```json
{
  "deforum_settings": {
    "max_frames": 240,
    "animation_mode": "2D",
    "strength_schedule": "0:(0.65)",
    "seed": 42
  },
  "prompt": "cinematic shot, dramatic lighting",
  "preferredNode": "GPU-RTX4090-1",  // optional
  "priority": "high"  // optional: high, normal, low
}
```

### Get Job Status
```bash
GET /api/distributed/jobs/:jobId
```

### Health Check
```bash
POST /api/distributed/health-check
```

Forces immediate health check of all nodes.

## Monitoring

### Real-time Metrics
```bash
GET /api/distributed/metrics
```

Returns:
- Per-node utilization
- Average response times
- Success/failure rates
- Queue depths
- GPU memory usage (if available)

### Example Dashboard Query
```bash
# Get current distribution
curl http://localhost:3000/api/distributed/metrics | jq '.nodeMetrics'
```

## Failover & Recovery

### Automatic Failover
- Unhealthy nodes automatically removed from pool
- Jobs redistributed to healthy nodes
- Automatic retry on failure

### Manual Node Control
```bash
# Disable node
POST /api/distributed/nodes/192.168.1.12:8188/disable

# Enable node
POST /api/distributed/nodes/192.168.1.12:8188/enable

# Remove node from pool
DELETE /api/distributed/nodes/192.168.1.12:8188
```

## Performance Tips

1. **Network**: Use gigabit+ network for image transfer
2. **Storage**: Shared NFS mount for models reduces duplication
3. **GPU**: Match GPU capabilities for balanced distribution
4. **Monitoring**: Enable metrics to identify bottlenecks
5. **Scaling**: Add nodes dynamically without restart

## Example: 100 Frame Generation

With 3 nodes, 100 frames distributed as:
- Node 1: Frames 1-33 (33 frames)
- Node 2: Frames 34-66 (33 frames)
- Node 3: Frames 67-100 (34 frames)

**Expected speedup**: ~3x faster than single node

```bash
# Submit batch job
curl -X POST http://localhost:3000/api/distributed/batch-generate \
  -H "Content-Type: application/json" \
  -d '{
    "frames": 100,
    "workflow": {...},
    "distribution": "auto"
  }'
```

## Troubleshooting

### Node shows as unhealthy
1. Check node is accessible: `curl http://192.168.1.10:8188/system_stats`
2. Verify firewall allows connections
3. Check node logs for errors

### Uneven distribution
1. Verify nodes have similar GPU capabilities
2. Check strategy matches use case (try "least_busy")
3. Review node priorities

### Jobs timing out
1. Increase `DISTRIBUTED_TIMEOUT`
2. Check network latency
3. Verify GPUs aren't overheating/throttling

## Security

For production deployments:
- Use VPN or private network
- Enable authentication on ComfyUI nodes
- Configure firewall rules
- Use HTTPS for external access

## Cloud Integration

The same configuration works with cloud GPU providers:

```bash
DISTRIBUTED_NODES: >
  http://local-gpu.lan:8188,
  https://runpod-instance-1.pod.io:8188,
  https://vastai-instance-1.vast.ai:8188
```

Remember to secure cloud endpoints with authentication tokens.
