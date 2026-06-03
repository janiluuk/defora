#!/bin/bash
# Clean up old frames from the frames volume

set -e

# Default: remove frames older than 7 days
DAYS=${1:-7}

echo "Cleaning up frames older than $DAYS days..."
echo ""

# Check if frames volume exists
if ! docker volume inspect frames > /dev/null 2>&1; then
    echo "Error: frames volume does not exist"
    exit 1
fi

# Count files before cleanup
BEFORE=$(docker run --rm -v frames:/data alpine find /data -type f | wc -l)

# Remove old files
docker run --rm -v frames:/data alpine find /data -type f -mtime +${DAYS} -delete

# Count files after cleanup
AFTER=$(docker run --rm -v frames:/data alpine find /data -type f | wc -l)
REMOVED=$((BEFORE - AFTER))

echo "Cleanup complete:"
echo "  Files before: $BEFORE"
echo "  Files after: $AFTER"
echo "  Files removed: $REMOVED"
echo ""

# Show volume size
echo "Volume size:"
docker system df -v | grep -A 1 "VOLUME NAME" | grep frames || echo "Could not determine volume size"
