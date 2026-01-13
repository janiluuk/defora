#!/usr/bin/env python3
"""
Development frame seeder for testing the streaming pipeline.
Generates test frames with various patterns at the specified FPS.

Patterns:
- timestamp: Frame number and timestamp (default)
- colorbars: SMPTE color bars test pattern
- checkerboard: Animated checkerboard pattern
- gradient: Rotating color gradient
- text: Custom text overlay
"""
import os
import sys
import time
import math
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("ERROR: Pillow not installed", file=sys.stderr)
    sys.exit(1)


def generate_timestamp_frame(frame_num: int, width: int, height: int):
    """Generate a test frame with frame number and timestamp."""
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
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
    except Exception:
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
    img_rgba = img.convert('RGBA')
    glow_color = (255, 83, 217)
    for offset in range(5, 0, -1):
        alpha = int(100 / offset)
        glow_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_img)
        glow_draw.text((x, y), frame_text, font=font_large, fill=(*glow_color, alpha))
        img_rgba = Image.alpha_composite(img_rgba, glow_img)
    
    img = img_rgba.convert('RGB')
    draw = ImageDraw.Draw(img)
    draw.text((x, y), frame_text, font=font_large, fill=(45, 226, 255))
    
    # Timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    time_text = f"Generated: {timestamp}"
    bbox = draw.textbbox((0, 0), time_text, font=font_small)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    y = height - 80
    draw.text((x, y), time_text, font=font_small, fill=(232, 237, 247))
    
    # Progress indicator
    progress_text = "Defora Test Stream"
    draw.text((20, height - 50), progress_text, font=font_small, fill=(155, 177, 208))
    
    return img


def generate_colorbars_frame(frame_num: int, width: int, height: int):
    """Generate SMPTE color bars test pattern."""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # SMPTE color bars (simplified)
    colors = [
        (192, 192, 192),  # 75% White
        (192, 192, 0),    # Yellow
        (0, 192, 192),    # Cyan
        (0, 192, 0),      # Green
        (192, 0, 192),    # Magenta
        (192, 0, 0),      # Red
        (0, 0, 192),      # Blue
    ]
    
    bar_width = width // len(colors)
    bar_height = int(height * 0.66)
    
    # Draw main color bars
    for i, color in enumerate(colors):
        x1 = i * bar_width
        x2 = (i + 1) * bar_width if i < len(colors) - 1 else width
        draw.rectangle([x1, 0, x2, bar_height], fill=color)
    
    # Draw bottom section with black and white bars
    bottom_start = bar_height
    bottom_height = height - bar_height
    segment_width = width // 7
    
    for i in range(7):
        x1 = i * segment_width
        x2 = (i + 1) * segment_width if i < 6 else width
        intensity = int(255 * (i / 6))
        color = (intensity, intensity, intensity)
        draw.rectangle([x1, bottom_start, x2, height], fill=color)
    
    # Add frame counter
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)
    except:
        font = ImageFont.load_default()
    
    text = f"Frame {frame_num:05d} | SMPTE Color Bars"
    draw.text((20, 20), text, font=font, fill=(255, 255, 255))
    
    return img


def generate_checkerboard_frame(frame_num: int, width: int, height: int):
    """Generate animated checkerboard pattern."""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # Animated checker size based on frame number
    checker_size = 40 + int(20 * math.sin(frame_num * 0.05))
    
    # Draw checkerboard
    for y in range(0, height, checker_size):
        for x in range(0, width, checker_size):
            row = y // checker_size
            col = x // checker_size
            
            # Alternate colors with animation
            if (row + col) % 2 == 0:
                # Animated color transition
                hue = (frame_num * 2) % 360
                r = int(128 + 127 * math.sin(math.radians(hue)))
                g = int(128 + 127 * math.sin(math.radians(hue + 120)))
                b = int(128 + 127 * math.sin(math.radians(hue + 240)))
                color = (r, g, b)
            else:
                color = (20, 20, 20)
            
            draw.rectangle([x, y, x + checker_size, y + checker_size], fill=color)
    
    # Add frame counter
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 50)
    except:
        font = ImageFont.load_default()
    
    text = f"Frame {frame_num:05d}"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    y = height - 100
    
    # Text with outline
    for dx, dy in [(-2, -2), (-2, 2), (2, -2), (2, 2)]:
        draw.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0))
    draw.text((x, y), text, font=font, fill=(255, 255, 255))
    
    return img


def generate_gradient_frame(frame_num: int, width: int, height: int):
    """Generate rotating color gradient pattern."""
    img = Image.new('RGB', (width, height))
    pixels = img.load()
    
    # Rotating gradient
    angle = (frame_num * 3) % 360
    
    for y in range(height):
        for x in range(width):
            # Distance from center
            dx = x - width / 2
            dy = y - height / 2
            dist = math.sqrt(dx * dx + dy * dy)
            
            # Angle from center
            pixel_angle = (math.degrees(math.atan2(dy, dx)) + angle) % 360
            
            # Color based on angle and distance
            r = int(128 + 127 * math.sin(math.radians(pixel_angle)))
            g = int(128 + 127 * math.sin(math.radians(pixel_angle + 120)))
            b = int(128 + 127 * math.sin(math.radians(pixel_angle + 240)))
            
            # Fade based on distance
            fade = min(1.0, dist / (min(width, height) / 2))
            r = int(r * (1 - fade * 0.5))
            g = int(g * (1 - fade * 0.5))
            b = int(b * (1 - fade * 0.5))
            
            pixels[x, y] = (r, g, b)
    
    # Add frame counter
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
    except:
        font = ImageFont.load_default()
    
    text = f"Frame {frame_num:05d}"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    y = (height - (bbox[3] - bbox[1])) // 2
    
    # Text with shadow
    draw.text((x + 3, y + 3), text, font=font, fill=(0, 0, 0))
    draw.text((x, y), text, font=font, fill=(255, 255, 255))
    
    return img


def generate_text_frame(frame_num: int, width: int, height: int, custom_text: str):
    """Generate frame with custom text."""
    img = Image.new('RGB', (width, height), color=(30, 30, 50))
    draw = ImageDraw.Draw(img)
    
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Custom text (centered)
    bbox = draw.textbbox((0, 0), custom_text, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2 - 50
    draw.text((x, y), custom_text, font=font_large, fill=(45, 226, 255))
    
    # Frame counter
    frame_text = f"Frame {frame_num:05d}"
    bbox = draw.textbbox((0, 0), frame_text, font=font_small)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    y = height - 80
    draw.text((x, y), frame_text, font=font_small, fill=(155, 177, 208))
    
    return img


def main():
    output_dir = Path(os.getenv("OUTPUT_DIR", "/data/frames"))
    fps = int(os.getenv("FPS", "12"))
    clear = os.getenv("CLEAR", "0") in ("1", "true", "True", "yes")
    pattern = os.getenv("PATTERN", "timestamp")
    custom_text = os.getenv("CUSTOM_TEXT", "Defora Test")
    width = int(os.getenv("WIDTH", "1280"))
    height = int(os.getenv("HEIGHT", "720"))
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Clear existing frames if requested
    if clear:
        print(f"[seeder] Clearing existing frames in {output_dir}")
        for frame_file in output_dir.glob("frame_*.png"):
            try:
                frame_file.unlink()
            except Exception as e:
                print(f"[seeder] Warning: Could not delete {frame_file.name}: {e}", file=sys.stderr)
    
    print(f"[seeder] Starting frame generation at {fps} FPS")
    print(f"[seeder] Output directory: {output_dir}")
    print(f"[seeder] Pattern: {pattern}")
    print(f"[seeder] Resolution: {width}x{height}")
    
    frame_num = 1
    frame_delay = 1.0 / fps
    
    # Pattern generator function
    def generate_text_with_custom_text(fn, w, h):
        return generate_text_frame(fn, w, h, custom_text)
    
    pattern_generators = {
        'timestamp': generate_timestamp_frame,
        'colorbars': generate_colorbars_frame,
        'checkerboard': generate_checkerboard_frame,
        'gradient': generate_gradient_frame,
        'text': generate_text_with_custom_text,
    }
    
    generator = pattern_generators.get(pattern, generate_timestamp_frame)
    
    try:
        while True:
            start_time = time.time()
            
            # Generate frame
            img = generator(frame_num, width, height)
            output_path = output_dir / f"frame_{frame_num:05d}.png"
            img.save(output_path)
            
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
