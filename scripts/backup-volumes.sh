#!/bin/bash
# Backup all Docker volumes for Defora project

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
VOLUMES=("frames" "hls" "mqdata")

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting volume backup at $(date)"
echo "Backup directory: $BACKUP_DIR"
echo "---"

# Backup each volume
for VOLUME in "${VOLUMES[@]}"; do
    echo "Backing up volume: $VOLUME"
    
    BACKUP_FILE="$BACKUP_DIR/${VOLUME}-${TIMESTAMP}.tar.gz"
    
    # Check if volume exists
    if ! docker volume inspect "$VOLUME" > /dev/null 2>&1; then
        echo "  Warning: Volume $VOLUME does not exist, skipping..."
        continue
    fi
    
    # Create backup
    docker run --rm \
        -v "${VOLUME}:/data:ro" \
        -v "$(pwd)/${BACKUP_DIR}:/backup" \
        alpine \
        tar czf "/backup/$(basename "$BACKUP_FILE")" -C /data .
    
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "  ✓ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
done

echo "---"
echo "Backup completed at $(date)"
echo ""
echo "Backup files:"
ls -lh "$BACKUP_DIR"/*-${TIMESTAMP}.tar.gz 2>/dev/null || echo "No backups created"

# Optionally, remove backups older than 7 days
if [ "${CLEANUP_OLD_BACKUPS:-true}" = "true" ]; then
    echo ""
    echo "Cleaning up backups older than 7 days..."
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
    echo "Cleanup complete"
fi
