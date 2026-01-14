# Defora Troubleshooting Guide

This guide helps diagnose and fix common issues with the Defora audio-visual instrument.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Docker Stack Issues](#docker-stack-issues)
- [Mediator Connection Issues](#mediator-connection-issues)
- [SD-Forge / Generation Issues](#sd-forge--generation-issues)
- [Web UI Issues](#web-ui-issues)
- [Audio Processing Issues](#audio-processing-issues)
- [Streaming Issues](#streaming-issues)
- [Performance Issues](#performance-issues)
- [Known Bugs](#known-bugs)

---

## Installation Issues

### Submodule Not Initialized

**Symptom**: `deforumation/mediator.py` not found, tests fail

**Cause**: Git submodule not initialized

**Fix**:
```bash
cd /path/to/defora
git submodule update --init --recursive
```

Or use the helper script:
```bash
./scripts/clone_deforumation.sh
```

---

### Missing Python Dependencies

**Symptom**: `ModuleNotFoundError: No module named 'numpy'` or similar

**Cause**: Python dependencies not installed

**Fix**:
```bash
pip install -r requirements.txt
```

For development with tests:
```bash
pip install -r requirements.txt pytest
```

---

### Audio Reactive Modulator Tests Skipped

**Symptom**: Tests show "skipped due to missing numpy dependency"

**Cause**: Older requirements.txt missing audio dependencies

**Fix**: Requirements should include:
```
numpy>=1.20.0
scipy>=1.7.0
librosa>=0.10.0
```

Reinstall:
```bash
pip install -r requirements.txt
```

---

## Docker Stack Issues

### Containers Not Starting

**Symptom**: `docker compose up` fails or containers exit immediately

**Diagnosis**:
```bash
# Check container status
docker compose ps

# Check logs for specific service
docker compose logs web
docker compose logs sd-forge
docker compose logs mediator
```

**Common Causes**:

1. **Port conflicts**: Another service using required ports
   ```bash
   # Check what's using port 8080
   sudo lsof -i :8080
   # Or on some systems:
   sudo netstat -tulpn | grep 8080
   ```
   
   **Fix**: Stop conflicting service or change port in `docker-compose.yml`

2. **Volume permissions**: Permission denied errors
   ```bash
   # Check volume permissions
   docker volume inspect frames
   ```
   
   **Fix**: 
   ```bash
   # Reset volumes
   docker compose down -v
   docker compose up
   ```

3. **Out of disk space**:
   ```bash
   df -h
   ```
   
   **Fix**: Clean up old Docker resources
   ```bash
   docker system prune -a
   docker volume prune
   ```

---

### SD-Forge Container Won't Start

**Symptom**: `sd-forge` service exits or shows "CUDA not available"

**Diagnosis**:
```bash
docker compose logs sd-forge
```

**Common Causes**:

1. **No GPU / NVIDIA drivers not installed**
   
   **Check**:
   ```bash
   nvidia-smi
   ```
   
   **Fix**: Install NVIDIA drivers and Docker GPU support:
   ```bash
   # Install nvidia-container-toolkit
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
   curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
   
   sudo apt-get update
   sudo apt-get install -y nvidia-container-toolkit
   sudo systemctl restart docker
   ```

2. **Missing models**
   
   SD-Forge needs Stable Diffusion models. Download to `docker/sd-forge/models/Stable-diffusion/`
   
   **Recommended**: SDXL Lightning or Flux models for fast generation

3. **Insufficient VRAM**
   
   Minimum 12GB VRAM required
   
   **Fix**: Use `--lowvram` or `--medvram` flags in docker-compose.yml

---

### Health Checks Failing

**Symptom**: Containers marked as "unhealthy" in `docker compose ps`

**Diagnosis**:
```bash
# Check health status
docker compose ps

# Inspect specific container
docker inspect defora-web-1 | grep -A 20 Health
```

**Fix**:
1. Increase health check `start_period` in docker-compose.yml
2. Check service logs for startup errors
3. Verify ports are accessible:
   ```bash
   curl http://localhost:8080/health
   ```

---

## Mediator Connection Issues

### Cannot Connect to Mediator

**Symptom**: CLI tools show "Connection refused" or timeout errors

**Diagnosis**:
```bash
# Check if mediator is running
ps aux | grep mediator
# Or in Docker:
docker compose ps mediator

# Test connection
nc -zv localhost 8765
nc -zv localhost 8766
```

**Fix**:

1. **Start mediator** (standalone):
   ```bash
   cd deforumation
   python mediator.py
   ```

2. **Start mediator** (Docker):
   ```bash
   docker compose up mediator
   ```

3. **Check firewall**:
   ```bash
   sudo ufw status
   # Allow ports if needed:
   sudo ufw allow 8765
   sudo ufw allow 8766
   ```

4. **Wrong host**: Use correct hostname
   ```bash
   # Linux Docker: Use host.docker.internal or 172.17.0.1
   # Or set MEDIATOR_HOST env var
   export MEDIATOR_HOST=192.168.1.100
   ```

---

### Mediator Not Receiving Updates

**Symptom**: Sending parameters but generation doesn't reflect changes

**Diagnosis**:
1. Check mediator logs for incoming messages
2. Verify SD-Forge has Deforum extension installed
3. Check mediator.cfg in SD-Forge points to correct host/port

**Fix**:
1. Reinstall Deforum extension with mediator support:
   ```bash
   cd /path/to/sd-forge/extensions
   git clone https://github.com/Tok/sd-forge-deforum
   ```

2. Configure mediator in SD-Forge:
   ```
   Settings → Deforum → Mediator Host: localhost
   Settings → Deforum → Mediator Port: 8765
   ```

3. Restart SD-Forge

---

## SD-Forge / Generation Issues

### Generation Too Slow

**Symptom**: Takes >5 seconds per frame

**Causes**:
- Using non-Lightning/turbo models
- Too many steps
- Wrong sampler

**Fix**:
1. Use fast models:
   - SDXL Lightning (1-2 steps)
   - SD Turbo (1 step)
   - Flux Schnell (1-4 steps)

2. Reduce steps in `forge_cli`:
   ```bash
   ./forge_cli --steps 1 "prompt"
   ```

3. Use fast samplers: LCM, Euler a

---

### "Out of Memory" Errors

**Symptom**: CUDA OOM or generation fails with memory error

**Fix**:
1. Reduce resolution:
   ```bash
   ./forge_cli --width 512 --height 512 "prompt"
   ```

2. Add memory flags to SD-Forge:
   ```bash
   # In docker-compose.yml or launch command:
   --lowvram --opt-sdp-attention
   ```

3. Close other GPU applications

4. Use smaller models (SD 1.5 instead of SDXL)

---

### Generated Images Are Distorted/Wrong

**Symptom**: Images don't match prompt or are corrupted

**Causes**:
- Wrong model loaded
- Incompatible settings
- ControlNet issues

**Fix**:
1. Check active model in SD-Forge UI
2. Disable ControlNet if not needed
3. Reset to default settings:
   ```bash
   ./forge_cli --preset default "prompt"
   ```

---

## Web UI Issues

### Web UI Not Loading

**Symptom**: Browser shows "Connection refused" or blank page

**Diagnosis**:
```bash
# Check if web service is running
docker compose ps web
curl http://localhost:8080/health
```

**Fix**:
1. Ensure web service is running:
   ```bash
   docker compose up web
   ```

2. Check browser console for errors (F12)

3. Try different browser

4. Clear browser cache

---

### MIDI Not Working

**Symptom**: MIDI controller not detected or not sending values

**Fix**:
1. Enable Web MIDI in browser:
   - Chrome: chrome://flags → Enable Web MIDI
   - Firefox: Install Web MIDI extension

2. Grant MIDI permissions when prompted

3. Check MIDI device is connected:
   ```bash
   # Linux:
   aconnect -l
   # macOS:
   ls /dev/cu.usb*
   ```

4. Refresh MIDI devices in UI (SETTINGS tab)

5. Check browser compatibility (Chrome/Edge recommended)

---

### Video Stream Not Playing

**Symptom**: HLS player shows loading spinner or error

**Diagnosis**:
```bash
# Check if encoder is running
docker compose ps encoder

# Check if HLS files exist
ls -lah /var/lib/docker/volumes/defora_hls/_data/live/

# Check stream health
curl http://localhost:8080/api/health
```

**Fix**:
1. Ensure frames are being generated
2. Restart encoder:
   ```bash
   docker compose restart encoder
   ```
3. Wait 5-10 seconds for HLS segments to generate
4. Check encoder logs:
   ```bash
   docker compose logs encoder
   ```

---

### WebSocket Disconnects Frequently

**Symptom**: "Mediator disconnected" messages in UI

**Causes**:
- Network issues
- Mediator crashes
- Firewall blocking WebSocket

**Fix**:
1. Check mediator is stable:
   ```bash
   docker compose logs mediator
   ```

2. Increase WebSocket timeout

3. Check firewall settings for WebSocket (port 8765)

4. Use WSS (secure WebSocket) if behind proxy

---

## Audio Processing Issues

### Audio Reactive Modulator Fails

**Symptom**: `--live` mode crashes or no audio detected

**Diagnosis**:
```bash
# Test audio file
./audio_reactive_modulator --audio test.wav --output test.json

# Check dependencies
python -c "import numpy, scipy, librosa; print('OK')"
```

**Fix**:
1. Install audio dependencies:
   ```bash
   pip install numpy scipy librosa
   ```

2. Verify audio file format (WAV recommended)

3. Convert to supported format:
   ```bash
   ffmpeg -i input.mp3 -ar 44100 output.wav
   ```

4. Check audio file is not corrupted:
   ```bash
   ffprobe input.wav
   ```

---

### Beat Detection Not Syncing

**Symptom**: Beat macros triggering at wrong times

**Causes**:
- Incorrect BPM setting
- Audio not loaded
- Beat detection not running

**Fix**:
1. Manually set correct BPM in UI

2. Use tap tempo to sync

3. Check browser console for errors

4. Ensure audio file is uploaded and processed

---

## Streaming Issues

### RTMP Stream Not Connecting

**Symptom**: Stream helper can't connect to RTMP server

**Diagnosis**:
```bash
# Test RTMP server
ffmpeg -re -i test.mp4 -f flv rtmp://server/app/key

# Check stream_helper output
./stream_helper start --source frames --target rtmp://server/app/key --fps 24
```

**Fix**:
1. Verify RTMP URL is correct (format: `rtmp://host/app/streamkey`)

2. Check firewall allows RTMP (port 1935)

3. Test with different streaming service

4. Check streaming service settings (allow streaming, correct key)

---

### SRT/WHIP Not Working

**Symptom**: SRT or WHIP protocol fails to stream

**Fix**:
1. Ensure FFmpeg supports protocol:
   ```bash
   ffmpeg -protocols | grep srt
   ffmpeg -protocols | grep http  # WHIP uses HTTP
   ```

2. Install FFmpeg with protocol support if missing

3. Check protocol-specific requirements:
   - SRT: Port 9000 (default)
   - WHIP: HTTPS endpoint URL

---

### High Streaming Latency

**Symptom**: 10+ seconds delay in stream

**Causes**:
- HLS segment duration too long
- Network buffering
- Encoder settings

**Fix**:
1. Reduce HLS segment size in docker-compose.yml:
   ```yaml
   -hls_time 1  # 1 second segments
   ```

2. Use low-latency streaming protocols (SRT, WebRTC/WHIP)

3. Reduce encoder quality for lower bandwidth:
   ```bash
   ENCODER_QUALITY=low docker compose up
   ```

---

## Performance Issues

### High CPU Usage

**Symptom**: CPU at 100% during encoding

**Causes**:
- Software encoding (no GPU acceleration)
- Too high quality settings

**Fix**:
1. Use GPU encoding in stream_helper:
   ```bash
   # Add to FFmpeg command:
   -c:v h264_nvenc  # NVIDIA
   -c:v h264_vaapi  # Intel/AMD
   ```

2. Lower encoder quality (see `docs/ENCODER_QUALITY.md`)

3. Reduce resolution or framerate

---

### Frame Generation Lag

**Symptom**: Frame generation can't keep up with desired FPS

**Causes**:
- Model too slow
- Resolution too high
- Not enough VRAM

**Fix**:
1. Use faster models (Lightning, Turbo, Schnell)

2. Reduce steps to 1-2

3. Lower resolution

4. Disable ControlNet

5. Upgrade GPU

---

### Web UI Feels Sluggish

**Symptom**: UI updates slowly, sliders lag

**Causes**:
- Too many WebSocket messages
- Browser performance
- Network latency

**Fix**:
1. Reduce parameter update frequency in code

2. Close other browser tabs

3. Use Chrome/Edge (better WebSocket performance)

4. Check network connection if remote

---

## Known Bugs

### Frame Seeder Won't Stop

**Symptom**: Frame seeder continues running after `docker compose down`

**Cause**: Process runs in detached mode

**Fix**:
```bash
# Find and kill process
ps aux | grep frame-seeder
kill <PID>

# Or kill all Python processes (careful!):
pkill -f frame-seeder
```

---

### HLS Latency on First Connection

**Symptom**: First viewer experiences 5-10 second delay

**Cause**: HLS protocol design (needs multiple segments buffered)

**Expected Behavior**: Subsequent connections will have lower latency

**Workaround**: Use SRT or WHIP for lower latency

---

### MIDI Mappings Not Persisting

**Symptom**: MIDI mappings lost after browser refresh

**Cause**: Only stored in localStorage (per-browser)

**Fix**:
1. Save preset with MIDI mappings
2. Load preset on startup
3. Or export/import presets manually

---

### Docker Volumes Growing Too Large

**Symptom**: Disk space fills up from frames/outputs

**Fix**:
```bash
# Clean old frames
./scripts/cleanup-frames.sh

# Monitor volume sizes
./scripts/monitor-volumes.sh

# Remove unused volumes
docker volume prune
```

---

## Getting More Help

### Enable Debug Logging

**Web Server**:
```bash
# In docker-compose.yml or .env:
DEBUG=* docker compose up web
```

**Python CLIs**:
```bash
# Add verbose flag
./forge_cli -v "prompt"
./deforumation_dashboard --verbose
```

**SD-Forge**:
```
Check: /path/to/sd-forge/extensions/sd-forge-deforum/scripts/deforum_mediator.log
```

---

### Collect Diagnostic Information

When reporting issues, include:

1. **System info**:
   ```bash
   uname -a
   python --version
   docker --version
   nvidia-smi  # If using GPU
   ```

2. **Service logs**:
   ```bash
   docker compose logs > defora-logs.txt
   ```

3. **Test results**:
   ```bash
   python -m pytest -v > test-results.txt
   ```

4. **Configuration**:
   - docker-compose.yml
   - Environment variables
   - SD-Forge settings

---

### Community Support

- **GitHub Issues**: https://github.com/janiluuk/defora/issues
- **Documentation**: https://github.com/janiluuk/defora/tree/main/docs
- **Discord**: (If available)

---

### Common Commands Reference

```bash
# Test everything is working
./scripts/verify_setup.sh

# Run all tests
python -m pytest -v

# Check service health
docker compose ps

# View logs for all services
docker compose logs -f

# Restart a specific service
docker compose restart web

# Rebuild after code changes
docker compose up --build

# Clean slate (removes all data!)
docker compose down -v
./scripts/cleanup-frames.sh
docker volume prune
```

---

## See Also

- [Complete Setup Guide](COMPLETE_SETUP.md)
- [Architecture Overview](ARCHITECTURE.md)
- [API Documentation](API.md)
- [Streaming Stack](streaming_stack.md)
