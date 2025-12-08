#!/usr/bin/env bash
# Prepare a frames directory seeded with the project logo (useful as a base layer for streams/deforum).
# Usage: ./scripts/logo_frames_example.sh [output_frames_dir]
# Defaults to runs/logo_base/frames. Requires rsvg-convert, inkscape, or ImageMagick's convert to rasterize the SVG.

set -euo pipefail

OUT_DIR="${1:-runs/logo_base/frames}"
SRC="${SRC:-assets/defora_logo.svg}"
PNG="${OUT_DIR}/logo.png"

mkdir -p "${OUT_DIR}"

rasterize() {
  if command -v rsvg-convert >/dev/null 2>&1; then
    rsvg-convert -w 1280 -h 720 "${SRC}" -o "${PNG}"
  elif command -v inkscape >/dev/null 2>&1; then
    inkscape "${SRC}" --export-type=png --export-filename="${PNG}" --export-width=1280 --export-height=720 >/dev/null
  elif command -v convert >/dev/null 2>&1; then
    convert -background none -resize 1280x720 "${SRC}" "${PNG}"
  else
    echo "No rasterizer found (need rsvg-convert, inkscape, or convert)" >&2
    exit 1
  fi
}

if [[ "${SRC}" == *.png ]]; then
  cp "${SRC}" "${PNG}"
else
  rasterize
fi

echo "Wrote base logo frame to ${PNG}"

# Duplicate the logo into a short frame sequence (30 frames) for downstream tooling that expects frame_*.png.
for i in $(seq 0 29); do
  printf -v fname "%s/frame_%04d.png" "${OUT_DIR}" "${i}"
  cp "${PNG}" "${fname}"
done

echo "Seeded ${OUT_DIR} with 30 frames."
