# Defora instrument UI — style guide

Source of truth for presentation tokens and control chrome. Visual reference:
`docs/ui-refactor/02-mockups.html` (`button.mk` in the mock CSS).

## Tokens (already in `style.css` `:root`)

| Token | Value | Use |
|-------|-------|-----|
| `--bg-3` | `#14161f` | Idle button fill |
| `--border` | `#2a2d3a` | Hairline borders (0.5px) |
| `--text-secondary` | `#9a9db0` | Idle button label |
| `--live` / `--live-text` | teal | Running / modulated / on |
| `--accent` / `--accent-text` | purple | Selected option in a group |
| `--a-group` / `--b-group` | blue / pink | A/B sides |
| `--error` | red | Destructive actions |
| `--radius-sm` | `7px` | Button corner radius |

## Text buttons — `.framesync-button`

Default (idle) — matches mock `button.mk`:

```css
font-size: 11px;
padding: 6px 12px;
border-radius: var(--radius-sm);
border: 0.5px solid var(--border);
background: var(--bg-3);
color: var(--text-secondary);
```

### Variants

| Class | When to use |
|-------|-------------|
| *(none)* | Secondary actions: Refresh, Save, + Add, Export |
| `.active` | Selected item in a mutually exclusive group (preset, sub-mode, LFO link) |
| `.framesync-button--live` | Feature is **on** or **running** (Play, On, Start, Apply) |
| `.framesync-button--accent` | Explicit accent emphasis (snap A/B — often on `Crossfader` component) |
| `.framesync-button--danger` | Remove / delete (compact destructive) |
| `.framesync-button--compact` | Tighter padding (toolbars, ✕, inline rows) |
| `:disabled` | 0.45 opacity, no pointer |

Do **not** use amber `--warn` for selected buttons; that was legacy FrameSync chrome.

## Segmented pills — `.sub-pill`

Sub-tab navigation (PROMPTS, SETTINGS, MODULATION). Active tab uses **accent** fill,
not pink B-group.

## Option chips — `.chip`

Binary / multi toggles in panels (output surface, line options, motion presets in
LiveView). Active chip uses accent border; A/B assignment buttons use
`.prompt-group-button--a` / `--b` for blue/pink.

## Transport — `.control-btn`

Preview transport (Play, Frame, Record). Same inset language as `.framesync-button`;
`.playing` → live teal, `.recording` → error pulse.

## Primary CTA — `.btn`

Rare solid calls-to-action (legacy). Prefer `.framesync-button--live` for new work.

## Migration checklist

1. All `<button>` actions use `.framesync-button` (or `.chip` / `.sub-pill` / `.control-btn` where appropriate).
2. No transparent text-only delete links — use `.framesync-button--danger`.
3. Toggle **on** states use `--live`, not warn/amber.
4. No hard-coded hex on buttons; only CSS variables.
