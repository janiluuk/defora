#!/bin/sh
set -eu

FRAMES_DIR="${FRAMES_DIR:-/data/frames}"
RTMP_TARGET="${RTMP_TARGET:-rtmp://vimage3:1935/live/deforum}"
QUALITY_PRESET="${ENCODER_QUALITY:-medium}"
FPS_VALUE="${FPS:-24}"
RESOLUTION_VALUE="${RESOLUTION:-960:540}"
SCAN_INTERVAL="${ENCODER_SCAN_INTERVAL:-0.5}"
IDLE_MAX_SLEEP="${ENCODER_IDLE_MAX_SLEEP:-2}"
ENCODER_REALTIME="${ENCODER_REALTIME:-0}"

case "$QUALITY_PRESET" in
  turbo)
    BITRATE=2000k
    MAXRATE=3000k
    BUFSIZE=4M
    PRESET=ultrafast
    CRF=25
    TUNE=zerolatency
    ;;
  low)
    BITRATE=500k
    MAXRATE=750k
    BUFSIZE=1M
    PRESET=veryfast
    CRF=28
    TUNE=zerolatency
    ;;
  medium)
    BITRATE=1500k
    MAXRATE=2250k
    BUFSIZE=3M
    PRESET=veryfast
    CRF=23
    TUNE=zerolatency
    ;;
  high)
    BITRATE=3500k
    MAXRATE=5000k
    BUFSIZE=7M
    PRESET=fast
    CRF=20
    TUNE=zerolatency
    ;;
  ultra)
    BITRATE=6000k
    MAXRATE=9000k
    BUFSIZE=12M
    PRESET=medium
    CRF=18
    TUNE=zerolatency
    ;;
  *)
    BITRATE=1500k
    MAXRATE=2250k
    BUFSIZE=3M
    PRESET=veryfast
    CRF=23
    TUNE=zerolatency
    ;;
esac

echo "Encoder starting with quality preset: $QUALITY_PRESET"
echo "  Bitrate: $BITRATE | Max: $MAXRATE | Buffer: $BUFSIZE"
echo "  Preset: $PRESET | CRF: $CRF | Tune: $TUNE"
echo "  Source: $FRAMES_DIR -> $RTMP_TARGET"

mkdir -p "$FRAMES_DIR"

wait_reason=""
idle_sleep="$SCAN_INTERVAL"
last_processed_frame=0

latest_frame_path() {
  ls -1 "$FRAMES_DIR"/frame_*.png 2>/dev/null | sort | tail -n 1 || true
}

latest_frame_number() {
  file_path="$1"
  file_name=${file_path##*/}
  printf '%s\n' "$file_name" | sed -n 's/^frame_0*\([0-9][0-9]*\)\.png$/\1/p'
}

announce_wait() {
  reason="$1"
  message="$2"
  if [ "$wait_reason" != "$reason" ]; then
    echo "$message"
    wait_reason="$reason"
  fi
}

sleep_with_backoff() {
  sleep "$idle_sleep"
  idle_sleep=$(awk "BEGIN { v=$idle_sleep*2; print (v>$IDLE_MAX_SLEEP?$IDLE_MAX_SLEEP:v) }")
}

while true; do
  latest_file=$(latest_frame_path)
  if [ -z "$latest_file" ]; then
    announce_wait "no_frames" "Waiting for frames in $FRAMES_DIR ..."
    sleep_with_backoff
    continue
  fi

  latest_frame=$(latest_frame_number "$latest_file")
  if [ -z "$latest_frame" ]; then
    announce_wait "bad_name" "Latest frame name did not match frame pattern; waiting for valid material ..."
    sleep_with_backoff
    continue
  fi

  if [ "$latest_frame" -le "$last_processed_frame" ]; then
    announce_wait "idle" "No new frames after frame_$(printf '%05d' "$last_processed_frame"). Sleeping."
    sleep_with_backoff
    continue
  fi

  start_frame=$(( last_processed_frame + 1 ))
  frame_count=$(( latest_frame - start_frame + 1 ))
  current_fps="$FPS_VALUE"
  if [ "$frame_count" -le 1 ]; then
    current_fps=1
  fi

  echo "Streaming new frames $start_frame..$latest_frame ($frame_count frame(s)) at $current_fps fps ..."
  wait_reason=""
  idle_sleep="$SCAN_INTERVAL"

  ffmpeg_input_rate=""
  if [ "$ENCODER_REALTIME" = "1" ]; then
    ffmpeg_input_rate="-re"
  fi

  if ffmpeg -hide_banner -loglevel warning $ffmpeg_input_rate \
      -framerate "$current_fps" \
      -start_number "$start_frame" \
      -i "$FRAMES_DIR/frame_%05d.png" \
      -frames:v "$frame_count" \
      -vf "scale=$RESOLUTION_VALUE" \
      -c:v libx264 -preset "$PRESET" -tune "$TUNE" \
      -b:v "$BITRATE" -maxrate "$MAXRATE" -bufsize "$BUFSIZE" -crf "$CRF" \
      -g "$(( current_fps * 2 ))" \
      -f flv "$RTMP_TARGET"
  then
    last_processed_frame="$latest_frame"
  else
    echo "ffmpeg exited early while streaming frames $start_frame..$latest_frame; retrying after $SCAN_INTERVAL s ..."
    sleep "$SCAN_INTERVAL"
  fi
done
