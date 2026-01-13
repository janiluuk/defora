#!/bin/bash
# Monitor Docker volume sizes for Defora project

set -e

VOLUMES=("frames" "hls" "mqdata")

echo "Docker Volume Status"
echo "===================="
echo ""

for VOLUME in "${VOLUMES[@]}"; do
    # Check if volume exists
    if ! docker volume inspect "$VOLUME" > /dev/null 2>&1; then
        echo "Volume: $VOLUME - NOT FOUND"
        continue
    fi
    
    echo "Volume: $VOLUME"
    
    # Get volume size
    SIZE=$(docker run --rm -v "${VOLUME}:/data:ro" alpine du -sh /data 2>/dev/null | cut -f1 || echo "Unknown")
    echo "  Size: $SIZE"
    
    # Get file count
    FILES=$(docker run --rm -v "${VOLUME}:/data:ro" alpine find /data -type f 2>/dev/null | wc -l || echo "Unknown")
    echo "  Files: $FILES"
    
    # Get mount point
    MOUNTPOINT=$(docker volume inspect "$VOLUME" -f '{{.Mountpoint}}' 2>/dev/null || echo "Unknown")
    echo "  Mount: $MOUNTPOINT"
    
    echo ""
done

# Show overall Docker system usage
echo "Overall Docker System Usage"
echo "==========================="
docker system df
