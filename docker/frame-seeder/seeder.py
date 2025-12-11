#!/usr/bin/env python3
"""
Development frame seeder for testing the streaming pipeline.
Generates test frames with timestamp overlays at the specified FPS.
"""
import os
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("ERROR: Pillow not installed", file=sys.stderr)
    sys.exit(1)


def generate_frame(frame_num: int, output_dir: Path, width: int = 1280, height: int = 720):
    """Generate a single test frame with frame number and timestamp."""
    # Create gradient background (dark blue to purple)
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background
    for y in range(height):
        ratio = y / height
        r = int(15 + ratio * 80)
        g = int(20 + ratio * 50)
        b = int(45 + ratio * 120)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Add neon-style frame info
    try:
        # Try to use a larger font if available
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
    except Exception:
        # Fallback to default font
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Frame number (large, centered)
    frame_text = f"Frame {frame_num:05d}"
    bbox = draw.textbbox((0, 0), frame_text, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2 - 50
    
    # Neon glow effect
    glow_color = (255, 83, 217)  # Pink glow
    for offset in range(5, 0, -1):
        alpha = int(100 / offset)
        glow_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_img)
        glow_draw.text((x, y), frame_text, font=font_large, fill=(*glow_color, alpha))
        img = Image.alpha_composite(img.convert('RGBA'), glow_img).convert('RGB')
    
    draw.text((x, y), frame_text, font=font_large, fill=(45, 226, 255))  # Cyan text
    
    # Timestamp (smaller, bottom)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    time_text = f"Generated: {timestamp}"
    bbox = draw.textbbox((0, 0), time_text, font=font_small)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    y = height - 80
    draw.text((x, y), time_text, font=font_small, fill=(232, 237, 247))
    
    # Progress indicator (bottom left)
    progress_text = "Defora Test Stream"
    draw.text((20, height - 50), progress_text, font=font_small, fill=(155, 177, 208))
    
    # Save frame
    output_path = output_dir / f"frame_{frame_num:05d}.png"
    img.save(output_path)
    return output_path


def main():
    output_dir = Path(os.getenv("OUTPUT_DIR", "/data/frames"))
    fps = int(os.getenv("FPS", "12"))
    clear = os.getenv("CLEAR", "0") in ("1", "true", "True", "yes")
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Clear existing frames if requested
    if clear:
        print(f"[seeder] Clearing existing frames in {output_dir}")
        for frame_file in output_dir.glob("frame_*.png"):
            frame_file.unlink()
    
    print(f"[seeder] Starting frame generation at {fps} FPS")
    print(f"[seeder] Output directory: {output_dir}")
    
    frame_num = 1
    frame_delay = 1.0 / fps
    
    try:
        while True:
            start_time = time.time()
            
            # Generate frame
            output_path = generate_frame(frame_num, output_dir)
            
            # Log every 10th frame
            if frame_num % 10 == 0:
                print(f"[seeder] Generated frame {frame_num:05d} -> {output_path.name}")
            
            frame_num += 1
            
            # Sleep to maintain FPS
            elapsed = time.time() - start_time
            sleep_time = max(0, frame_delay - elapsed)
            time.sleep(sleep_time)
            
    except KeyboardInterrupt:
        print(f"\n[seeder] Stopped. Generated {frame_num - 1} frames total.")
        sys.exit(0)


if __name__ == "__main__":
    main()
