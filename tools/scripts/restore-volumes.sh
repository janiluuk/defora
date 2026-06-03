#!/bin/bash
# Restore a Docker volume from a backup file

set -e

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <backup_file> <volume_name>"
    echo ""
    echo "Examples:"
    echo "  $0 backups/frames-20260113-120000.tar.gz frames"
    echo "  $0 backups/hls-20260113-120000.tar.gz hls"
    exit 1
fi

BACKUP_FILE="$1"
VOLUME_NAME="$2"

# Validate backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring volume: $VOLUME_NAME"
echo "From backup: $BACKUP_FILE"
echo ""

# Check if volume exists, create if it doesn't
if ! docker volume inspect "$VOLUME_NAME" > /dev/null 2>&1; then
    echo "Creating volume: $VOLUME_NAME"
    docker volume create "$VOLUME_NAME"
fi

# Confirm before proceeding
read -p "This will overwrite all data in volume '$VOLUME_NAME'. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

# Perform restore
echo "Restoring data..."
docker run --rm \
    -v "${VOLUME_NAME}:/data" \
    -v "$(pwd)/$(dirname "$BACKUP_FILE"):/backup:ro" \
    alpine \
    sh -c "rm -rf /data/* && tar xzf /backup/$(basename "$BACKUP_FILE") -C /data"

echo "✓ Restore complete"
echo ""
echo "Volume info:"
docker volume inspect "$VOLUME_NAME"
