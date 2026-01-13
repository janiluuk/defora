# Frame Seeder Patterns

The frame seeder generates test frames for development and testing. Multiple patterns are available to test different scenarios.

## Available Patterns

### Timestamp (Default)
**Use case**: General testing, frame timing verification

```bash
SEEDER_PATTERN=timestamp docker compose up dev-frame-seeder
```

**Features**:
- Large frame number display with neon glow effect
- Timestamp with millisecond precision
- Gradient background (dark blue to purple)
- "Defora Test Stream" indicator

**Visual**:
```
┌─────────────────────────────┐
│                             │
│       Frame 00042           │  (Large cyan text with pink glow)
│                             │
│ Generated: 2026-01-13 ...  │  (Timestamp at bottom)
│ Defora Test Stream          │  (Bottom left)
└─────────────────────────────┘
```

---

### Color Bars
**Use case**: Video signal testing, color accuracy verification

```bash
SEEDER_PATTERN=colorbars docker compose up dev-frame-seeder
```

**Features**:
- SMPTE color bars in top 2/3
- Grayscale gradient in bottom 1/3
- Frame counter overlay
- Standard broadcast test pattern

**Visual**:
```
┌─────────────────────────────┐
│ W │ Y │ C │ G │ M │ R │ B │  (Color bars)
│   │   │   │   │   │   │   │
│───┴───┴───┴───┴───┴───┴───│
│ B │░░░│▒▒▒│▓▓▓│███│▓▓▓│ W │  (Grayscale)
│ Frame 00042 | SMPTE Color...│
└─────────────────────────────┘
```

---

### Checkerboard
**Use case**: Motion detection, frame rate testing

```bash
SEEDER_PATTERN=checkerboard docker compose up dev-frame-seeder
```

**Features**:
- Animated checkerboard with varying checker size
- Color-shifting animated squares
- Frame counter with outline
- Smooth size transitions based on sine wave

**Visual**:
```
┌─────────────────────────────┐
│██░░██░░██░░██░░██░░██░░██│
│░░██░░██░░██░░██░░██░░██░░│
│██░░██░░██░░██░░██░░██░░██│
│░░██░░██░░██░░██░░██░░██░░│
│                             │
│       Frame 00042           │  (With black outline)
└─────────────────────────────┘
```

---

### Gradient
**Use case**: Smooth motion testing, color blending verification

```bash
SEEDER_PATTERN=gradient docker compose up dev-frame-seeder
```

**Features**:
- Rotating radial gradient
- Smooth color transitions
- Frame counter in center
- Animates continuously

**Visual**:
```
┌─────────────────────────────┐
│ ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  │
│███▓▓▓▒▒▒░░░░░▒▒▒▓▓▓███████│
│███▓▓▒▒░   Frame    ░▒▒▓███│
│███▓▓▒▒░   00042    ░▒▒▓███│
│███▓▓▓▒▒▒░░░░░▒▒▒▓▓▓███████│
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  │
└─────────────────────────────┘
```

---

### Custom Text
**Use case**: Branding, custom testing scenarios

```bash
SEEDER_PATTERN=text SEEDER_CUSTOM_TEXT="Your Text Here" docker compose up dev-frame-seeder
```

**Features**:
- Custom text display (large, centered)
- Frame counter at bottom
- Dark background
- Customizable via environment variable

**Visual**:
```
┌─────────────────────────────┐
│                             │
│     Your Text Here          │  (Cyan text)
│                             │
│      Frame 00042            │  (Smaller, gray)
└─────────────────────────────┘
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SEEDER_PATTERN` | `timestamp` | Pattern type: timestamp, colorbars, checkerboard, gradient, text |
| `SEEDER_FPS` | `12` | Frame rate (frames per second) |
| `SEEDER_CLEAR` | `1` | Clear existing frames on start (0=no, 1=yes) |
| `SEEDER_WIDTH` | `1280` | Frame width in pixels |
| `SEEDER_HEIGHT` | `720` | Frame height in pixels |
| `SEEDER_CUSTOM_TEXT` | `Defora Test` | Custom text for 'text' pattern |

### Examples

#### High FPS Checkerboard
```bash
SEEDER_PATTERN=checkerboard SEEDER_FPS=60 docker compose up dev-frame-seeder
```

#### 4K Color Bars
```bash
SEEDER_PATTERN=colorbars SEEDER_WIDTH=3840 SEEDER_HEIGHT=2160 docker compose up dev-frame-seeder
```

#### Custom Branding
```bash
SEEDER_PATTERN=text SEEDER_CUSTOM_TEXT="My Studio" SEEDER_FPS=24 docker compose up dev-frame-seeder
```

#### Mobile Resolution Gradient
```bash
SEEDER_PATTERN=gradient SEEDER_WIDTH=720 SEEDER_HEIGHT=1280 SEEDER_FPS=30 docker compose up dev-frame-seeder
```

---

## Use Cases

### Testing Scenarios

| Scenario | Recommended Pattern | Settings |
|----------|-------------------|----------|
| Frame timing | timestamp | FPS=24 |
| Color accuracy | colorbars | Default |
| Motion detection | checkerboard | FPS=60 |
| Smooth playback | gradient | FPS=30 |
| Encoder stress test | checkerboard | FPS=60, WIDTH=3840, HEIGHT=2160 |
| Network buffering | timestamp | FPS=12 (slower for debugging) |
| Custom branding | text | CUSTOM_TEXT="Your Brand" |

### Development Workflow

1. **Start with timestamp** to verify basic pipeline:
   ```bash
   docker compose up dev-frame-seeder encoder web
   ```

2. **Test color accuracy** with color bars:
   ```bash
   SEEDER_PATTERN=colorbars docker compose up dev-frame-seeder
   ```

3. **Stress test** with high FPS checkerboard:
   ```bash
   SEEDER_PATTERN=checkerboard SEEDER_FPS=60 docker compose up dev-frame-seeder
   ```

4. **Verify smooth playback** with gradient:
   ```bash
   SEEDER_PATTERN=gradient SEEDER_FPS=30 docker compose up dev-frame-seeder
   ```

---

## Troubleshooting

### Pattern Not Changing
- Make sure to stop the seeder before changing patterns:
  ```bash
  docker compose stop dev-frame-seeder
  SEEDER_PATTERN=colorbars docker compose up dev-frame-seeder
  ```
- Set `SEEDER_CLEAR=1` to clear old frames

### Frames Not Appearing
- Check if frames directory is being written to:
  ```bash
  docker compose exec dev-frame-seeder ls -la /data/frames
  ```
- Verify permissions on the frames volume

### Performance Issues
- Reduce FPS for complex patterns (gradient, checkerboard)
- Reduce resolution for testing
- Use simpler patterns (timestamp, text)

### Custom Text Not Showing
- Make sure `SEEDER_PATTERN=text` is set
- Check `SEEDER_CUSTOM_TEXT` is quoted if it contains spaces:
  ```bash
  SEEDER_CUSTOM_TEXT="Hello World" docker compose up dev-frame-seeder
  ```

---

## Technical Details

### Frame Generation

All patterns:
- Generate PNG files with sequential naming: `frame_00001.png`, `frame_00002.png`, etc.
- Use PIL/Pillow for image generation
- Support arbitrary resolutions
- Include frame counter for debugging

### Performance

Pattern generation speed (approximate, on modern CPU):

| Pattern | FPS Capability | CPU Usage |
|---------|---------------|-----------|
| timestamp | 120+ | Low |
| colorbars | 240+ | Very Low |
| checkerboard | 60+ | Medium |
| gradient | 30+ | High |
| text | 120+ | Low |

### File Size

Typical PNG file sizes:

| Resolution | Pattern | Size (approx) |
|------------|---------|---------------|
| 1280x720 | timestamp | 50-100 KB |
| 1280x720 | colorbars | 20-40 KB |
| 1280x720 | checkerboard | 100-200 KB |
| 1280x720 | gradient | 200-400 KB |
| 1920x1080 | timestamp | 100-200 KB |
| 3840x2160 | colorbars | 100-200 KB |

---

For more information on the frame seeder, see the source code in `docker/frame-seeder/seeder.py`.
