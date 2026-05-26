#!/usr/bin/env python3
"""
Frame interpolation for Defora.

Provides frame interpolation between generated frames for smoother output.
Supports multiple interpolation methods including optical flow and blend-based.

Usage:
  python -m defora_cli.frame_interpolator interpolate --input-dir /path/to/frames --output-dir /path/to/output --factor 2
  python -m defora_cli.frame_interpolator interpolate --input-dir /path/to/frames --output-dir /path/to/output --method blend
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import Optional

try:
    import numpy as np
except ImportError:
    np = None

try:
    from PIL import Image
except ImportError:
    Image = None


def load_frame(path: Path) -> np.ndarray:
    """Load a frame as numpy array."""
    if Image is None:
        raise ImportError("PIL required for frame loading")
    img = Image.open(path)
    return np.array(img)


def save_frame(frame: np.ndarray, path: Path):
    """Save a frame from numpy array."""
    if Image is None:
        raise ImportError("PIL required for frame saving")
    img = Image.fromarray(frame)
    img.save(path)


def blend_interpolate(frame1: np.ndarray, frame2: np.ndarray, alpha: float) -> np.ndarray:
    """Simple blend interpolation between two frames."""
    if np is None:
        raise ImportError("numpy required for interpolation")
    return (frame1 * (1 - alpha) + frame2 * alpha).astype(np.uint8)


def warp_frame(frame: np.ndarray, flow_x: np.ndarray, flow_y: np.ndarray) -> np.ndarray:
    """Warp a frame using optical flow."""
    if np is None:
        raise ImportError("numpy required for warping")
    h, w = frame.shape[:2]
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    map_x = x + flow_x
    map_y = y + flow_y
    
    # Simple bilinear interpolation
    result = np.zeros_like(frame)
    for c in range(frame.shape[2]):
        for i in range(h):
            for j in range(w):
                x0 = int(np.floor(map_x[i, j]))
                y0 = int(np.floor(map_y[i, j]))
                x1 = min(x0 + 1, w - 1)
                y1 = min(y0 + 1, h - 1)
                x0 = max(0, x0)
                y0 = max(0, y0)
                
                dx = map_x[i, j] - x0
                dy = map_y[i, j] - y0
                
                result[i, j, c] = (
                    frame[y0, x0, c] * (1 - dx) * (1 - dy) +
                    frame[y0, x1, c] * dx * (1 - dy) +
                    frame[y1, x0, c] * (1 - dx) * dy +
                    frame[y1, x1, c] * dx * dy
                )
    return result


def compute_simple_flow(frame1: np.ndarray, frame2: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Compute simple block-based optical flow."""
    if np is None:
        raise ImportError("numpy required for flow computation")
    h, w = frame1.shape[:2]
    block_size = 16
    
    flow_x = np.zeros((h, w), dtype=np.float32)
    flow_y = np.zeros((h, w), dtype=np.float32)
    
    for y in range(0, h - block_size, block_size):
        for x in range(0, w - block_size, block_size):
            block1 = frame1[y:y+block_size, x:x+block_size]
            
            best_dx, best_dy = 0, 0
            best_diff = float('inf')
            
            for dy in range(-block_size, block_size + 1):
                for dx in range(-block_size, block_size + 1):
                    ny, nx = y + dy, x + dx
                    if ny < 0 or ny >= h - block_size or nx < 0 or nx >= w - block_size:
                        continue
                    block2 = frame2[ny:ny+block_size, nx:nx+block_size]
                    diff = np.sum((block1.astype(float) - block2.astype(float)) ** 2)
                    if diff < best_diff:
                        best_diff = diff
                        best_dx = dx
                        best_dy = dy
            
            flow_x[y:y+block_size, x:x+block_size] = best_dx
            flow_y[y:y+block_size, x:x+block_size] = best_dy
    
    return flow_x, flow_y


def optical_flow_interpolate(frame1: np.ndarray, frame2: np.ndarray, alpha: float) -> np.ndarray:
    """Optical flow-based interpolation."""
    flow_x, flow_y = compute_simple_flow(frame1, frame2)
    
    flow_x *= alpha
    flow_y *= alpha
    
    warped1 = warp_frame(frame1, -flow_x, -flow_y)
    warped2 = warp_frame(frame2, (1 - alpha) * flow_x, (1 - alpha) * flow_y)
    
    return (warped1 + warped2) / 2


def interpolate_frames(
    input_dir: Path,
    output_dir: Path,
    factor: int = 2,
    method: str = "blend",
    pattern: str = "frame_%05d.png",
):
    """
    Interpolate frames to increase framerate.
    
    Args:
        input_dir: Directory containing input frames
        output_dir: Directory to save interpolated frames
        factor: Interpolation factor (2 = double framerate)
        method: Interpolation method (blend, optical_flow)
        pattern: Frame filename pattern
    """
    if np is None:
        raise ImportError("numpy required for frame interpolation")
    if Image is None:
        raise ImportError("PIL required for frame interpolation")
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Find all frames
    frames = sorted([f for f in input_dir.glob("*.png") if "frame_" in f.name])
    if not frames:
        frames = sorted([f for f in input_dir.glob("*.jpg") if "frame_" in f.name])
    if not frames:
        raise ValueError(f"No frames found in {input_dir}")
    
    print(f"Found {len(frames)} frames")
    print(f"Interpolation factor: {factor}x")
    print(f"Method: {method}")
    
    out_idx = 0
    for i in range(len(frames) - 1):
        frame1 = load_frame(frames[i])
        frame2 = load_frame(frames[i + 1])
        
        # Save original frame
        out_path = output_dir / pattern % out_idx
        save_frame(frame1, out_path)
        out_idx += 1
        
        # Generate interpolated frames
        for j in range(1, factor):
            alpha = j / factor
            if method == "blend":
                interp = blend_interpolate(frame1, frame2, alpha)
            elif method == "optical_flow":
                interp = optical_flow_interpolate(frame1, frame2, alpha)
            else:
                raise ValueError(f"Unknown method: {method}")
            
            out_path = output_dir / pattern % out_idx
            save_frame(interp, out_path)
            out_idx += 1
    
    # Save last frame
    out_path = output_dir / pattern % out_idx
    save_frame(load_frame(frames[-1]), out_path)
    out_idx += 1
    
    print(f"Generated {out_idx} frames ({len(frames)} original + {out_idx - len(frames)} interpolated)")


def main():
    parser = argparse.ArgumentParser(description="Frame interpolation for Defora")
    sub = parser.add_subparsers(dest="command", required=True)
    
    interp = sub.add_parser("interpolate", help="Interpolate frames")
    interp.add_argument("--input-dir", required=True, help="Directory containing input frames")
    interp.add_argument("--output-dir", required=True, help="Directory to save interpolated frames")
    interp.add_argument("--factor", type=int, default=2, help="Interpolation factor (default: 2)")
    interp.add_argument("--method", choices=["blend", "optical_flow"], default="blend", help="Interpolation method")
    interp.add_argument("--pattern", default="frame_%05d.png", help="Frame filename pattern")
    
    args = parser.parse_args()
    
    if args.command == "interpolate":
        interpolate_frames(
            Path(args.input_dir),
            Path(args.output_dir),
            args.factor,
            args.method,
            args.pattern,
        )


if __name__ == "__main__":
    main()
