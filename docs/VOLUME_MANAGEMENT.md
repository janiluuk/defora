# Docker Volume Management

This document explains how to manage Docker volumes for the Defora project.

## Overview

Defora uses several Docker volumes to persist data across container restarts:

- **frames**: Stores generated image frames
- **hls**: Stores HLS video segments for streaming
- **mqdata**: RabbitMQ data directory
- **models**: SD-Forge model storage (if used)
- **outputs**: SD-Forge output directory (if used)

## Volume Locations

To find where Docker stores volumes on your system:

```bash
docker volume inspect frames
docker volume inspect hls
docker volume inspect mqdata
```

The output will show the `Mountpoint` field, which is the actual location on disk.

## Backup Volumes

### Manual Backup

To back up a volume manually:

```bash
# Create a backup directory
mkdir -p backups

# Backup frames volume
docker run --rm -v frames:/data -v $(pwd)/backups:/backup alpine tar czf /backup/frames-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

# Backup hls volume
docker run --rm -v hls:/data -v $(pwd)/backups:/backup alpine tar czf /backup/hls-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

# Backup mqdata volume
docker run --rm -v mqdata:/data -v $(pwd)/backups:/backup alpine tar czf /backup/mqdata-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

### Automated Backup Script

Use the provided backup script:

```bash
./scripts/backup-volumes.sh
```

This will create timestamped archives of all volumes in the `backups/` directory.

## Restore Volumes

To restore a volume from a backup:

```bash
# Stop the stack first
docker compose down

# Restore frames volume
docker run --rm -v frames:/data -v $(pwd)/backups:/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/frames-TIMESTAMP.tar.gz -C /data"

# Restore hls volume
docker run --rm -v hls:/data -v $(pwd)/backups:/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/hls-TIMESTAMP.tar.gz -C /data"

# Restore mqdata volume
docker run --rm -v mqdata:/data -v $(pwd)/backups:/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/mqdata-TIMESTAMP.tar.gz -C /data"

# Start the stack
docker compose up -d
```

Or use the restore script:

```bash
./scripts/restore-volumes.sh backups/frames-20260113-120000.tar.gz frames
```

## Volume Cleanup

### Remove Old Frames

To clean up old frames and free disk space:

```bash
# Remove frames older than 7 days
docker run --rm -v frames:/data alpine find /data -type f -mtime +7 -delete

# Or use the cleanup script
./scripts/cleanup-frames.sh 7
```

### Remove HLS Segments

HLS segments are automatically cleaned up by the encoder, but you can manually remove them:

```bash
docker run --rm -v hls:/data alpine rm -rf /data/*
```

### Prune All Volumes

⚠️ **WARNING**: This will delete ALL unused Docker volumes on your system:

```bash
docker volume prune
```

## Volume Size Monitoring

Check the size of each volume:

```bash
docker system df -v | grep -A 20 "VOLUME NAME"
```

Or use the monitoring script:

```bash
./scripts/monitor-volumes.sh
```

## Volume Migration

To move volumes to a different host:

1. Backup volumes on the source host:
   ```bash
   ./scripts/backup-volumes.sh
   ```

2. Copy the backup files to the new host:
   ```bash
   scp backups/*.tar.gz newhost:/path/to/defora/backups/
   ```

3. Restore volumes on the new host:
   ```bash
   ./scripts/restore-volumes.sh backups/frames-TIMESTAMP.tar.gz frames
   ./scripts/restore-volumes.sh backups/hls-TIMESTAMP.tar.gz hls
   ./scripts/restore-volumes.sh backups/mqdata-TIMESTAMP.tar.gz mqdata
   ```

## Best Practices

1. **Regular Backups**: Schedule automatic backups using cron:
   ```bash
   # Add to crontab: backup volumes daily at 2 AM
   0 2 * * * cd /path/to/defora && ./scripts/backup-volumes.sh
   ```

2. **Retention Policy**: Keep backups for a reasonable period:
   - Daily backups: Keep for 7 days
   - Weekly backups: Keep for 4 weeks
   - Monthly backups: Keep for 6 months

3. **Monitor Disk Space**: Set up alerts when volumes exceed 80% capacity

4. **Test Restores**: Periodically test your backup/restore process to ensure it works

5. **Separate Storage**: Consider using a separate disk or mount point for volumes to isolate them from the OS disk

## Troubleshooting

### Volume Permission Issues

If you encounter permission errors:

```bash
# Fix permissions for frames volume
docker run --rm -v frames:/data alpine chown -R 1000:1000 /data

# Fix permissions for mqdata volume
docker run --rm -v mqdata:/data alpine chown -R 999:999 /data
```

### Volume Full Errors

If a volume fills up:

1. Check disk space: `df -h`
2. Clean up old files: `./scripts/cleanup-frames.sh 1`
3. Increase volume size (if using a separate partition)
4. Archive and remove old backups

### Corrupted Volume Data

If a volume becomes corrupted:

1. Stop the stack: `docker compose down`
2. Remove the corrupted volume: `docker volume rm frames`
3. Restore from backup: `./scripts/restore-volumes.sh backups/frames-LATEST.tar.gz frames`
4. Start the stack: `docker compose up -d`

---

For more information, see the Docker documentation on [volume management](https://docs.docker.com/storage/volumes/).
