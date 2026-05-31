# CreaPrompt Integration Plan — Defora Prompt Studio

**Source retrieved from:** `vimage5:/opt/forge/extensions/sd-webui-creaprompt`  
**Temporary location:** `docker/web/creaprompt-src/`  
**Target data location:** `docker/web/data/creaprompt/`

---

## What CreaPrompt is

A structured random-prompt generator with:
- **40 CSV category files** — 12,844 entries total, covering Subject, Appearance, Action, Setting, Style, and Tech
- **`.config` presets** — named category selections (Woman, Man, Animals, Landscapes, etc.)
- **`collection.txt`** — 801 curated complete prompts for one-click generation
- **Logic**: pick a random entry from each active category, concatenate with commas → feed to SD prompt

The original Gradio UI is a wall of checkboxes and text boxes. The Defora version will be **card/chip visual, instant-preview, preset-driven**.

---

## Architecture Overview

```
server.js
  └── /api/creaprompt/*          parse CSVs at startup, serve structured JSON

PromptStudioPanel.vue            new component under src/components/
  └── CategoryGroupChip.vue      single togglable category chip (reusable)

PromptsView.vue
  └── sub-tab: CREA              mounts PromptStudioPanel

App.vue
  └── creaprompt state object    catalog cache, active categories, built prompt
```

---

## Data Architecture

### CSV → Catalog format

Each CSV file maps to one **category**. Filename format: `N_Mname.csv` (N=group sort, M=item sort, name=display label).

At server startup, parse all CSVs in `data/creaprompt/` into:

```json
{
  "categories": [
    {
      "id": "Man",
      "label": "Man",
      "group": "SUBJECT",
      "sortKey": "0_0",
      "count": 35,
      "entries": ["A middle-aged man…", "A bearded man…", …]
    },
    …
  ],
  "collection": ["Dreamscape A bright vivid…", …]
}
```

### Logical group taxonomy

Map each CSV prefix to a semantic group:

| Group | Categories |
|-------|-----------|
| **SUBJECT** | Man, Woman, Celebrity_Man, Celebrity_Woman, fictional_characters, humanoids, animals, vehicles |
| **APPEARANCE** | haircuts, haircolors, Eyes_Style, Woman_Dress, Expressions |
| **ACTION** | Sports, Actions, Actions_Malapris, Films_Scenes, Erotic, AccidentsIndustry, Prevention |
| **SETTING** | Places, Special_Places, locations, Landscapes, Sky, Eras |
| **SHOT** | shotstyle, Angle_of_view_FD, Angle_of_view_PJ |
| **STYLE** | artistic_style, realistic_style, Artists, Artists_special, artists_AdelAiRealistic, styles_AdelAI, effects_AdelAI |
| **TECH** | Cameras, cameras_AdelAI, lighting, lighting_AdelAI, films_AdelAI, image_quality |

### Built-in presets (from `.config` files)

| Preset | Active categories |
|--------|------------------|
| Woman | Woman, haircolors, haircuts, image_quality, Cameras, lighting, shotstyle, artists, Sky, Eras, artistic_style, realistic_style, Actions_Malapris, Woman_Dress, artists_AdelAiRealistic |
| Man | Man, haircolors, haircuts, image_quality, Cameras, lighting, shotstyle, artists, Sky, Eras, artistic_style, realistic_style, Actions_Malapris, artists_AdelAiRealistic |
| Animals | image_quality, Cameras, lighting, animals, shotstyle, Landscapes, artistic_style, realistic_style, lighting_AdelAI |
| Landscapes | Landscapes, Sky, artistic_style, realistic_style, artists, lighting_AdelAI, image_quality, Cameras, lighting |
| Vehicles | vehicles, shotstyle, Landscapes, Sky, Eras, artistic_style, realistic_style, artists, artists_AdelAiRealistic, lighting_AdelAI, image_quality, Cameras, lighting |
| Humanoids | humanoids, shotstyle, Landscapes, Sky, artistic_style, realistic_style, artists, lighting_AdelAI, image_quality, Cameras, lighting |

User presets are stored in `localStorage` under `defora_creaprompt_presets`.

---

## Server API  (`docker/web/server.js`)

Add a `creapromptCatalog` object loaded once at startup, then these routes:

```
GET  /api/creaprompt/catalog
     → { categories: Category[], collection: string[] }
     (cached from startup parse; no disk I/O per request)

POST /api/creaprompt/roll
     body: { activeCategories: string[], prefix?: string, suffix?: string }
     → { prompt: string, parts: { categoryId: string, value: string }[] }
     (picks random entry from each active category server-side)

GET  /api/creaprompt/collection/random
     → { prompt: string }
     (picks one random line from collection.txt)
```

No preset persistence on the server — presets live in localStorage only (no auth, single-user performance tool).

---

## Frontend Component Design

### Visual mockup — CREA sub-tab in PROMPTS

```
┌─ PROMPTS  IMAGE  LORA  CONTROLNET  STORY  [CREA] ─────────────────┐
│                                                                      │
│  ┌─ Presets ──────────────────────────────────────────────────────┐ │
│  │  [Woman]  [Man]  [Animals]  [Landscapes]  [Vehicles]  [+ Save] │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Generated prompt ─────────────────────────────────────── hero ┐ │
│  │                                                                  │ │
│  │  "a gorgeous woman with long blonde hair, natural lighting,    │ │
│  │   cinematic, Sony A7, impressionist oil painting, 1920s…"      │ │
│  │                                                                  │ │
│  │  [🎲 Roll]   [→ Prompt A]   [→ Prompt B]   [→ Active prompt]   │ │
│  └──────────────────────────────────────────────────────────────── ┘ │
│                                                                      │
│  prefix [____________]   suffix [____________]  [📚 Collection]      │
│                                                                      │
│  SUBJECT ─────────────────────────────────────────────────────────  │
│   [Woman ●] [Man] [Celebrity ♀ ●] [Celebrity ♂] [Fictional] [Animals] [Humanoids] [Vehicles] │
│                                                                      │
│  APPEARANCE ──────────────────────────────────────────────────────  │
│   [Hair color ●] [Haircut ●] [Eyes] [Dress ●] [Expressions ●]      │
│                                                                      │
│  ACTION ──────────────────────────────────────────────────────────  │
│   [Sports] [Actions] [Actions+ ●] [Film scenes] [Erotic]           │
│                                                                      │
│  SETTING ─────────────────────────────────────────────────────────  │
│   [Places] [Landscapes] [Locations] [Special] [Sky ●] [Eras ●]     │
│                                                                      │
│  SHOT ────────────────────────────────────────────────────────────  │
│   [Shot style ●] [Angle FD] [Angle PJ]                              │
│                                                                      │
│  STYLE ───────────────────────────────────────────────────────────  │
│   [Artistic ●] [Realistic ●] [Artists ●] [Artists+ ●] [AdelAI] [Effects] │
│                                                                      │
│  TECH ────────────────────────────────────────────────────────────  │
│   [Camera ●] [Camera AdelAI] [Lighting ●] [Lighting AdelAI ●] [Films] [Quality ●] │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**● = ON (teal chip)**  **bare = OFF (dim chip)**

### Chip behaviour

Each category chip has three states:

| State | Visual | Behaviour |
|-------|--------|-----------|
| **OFF** | `.chip` (dim, idle fill) | Not included in roll |
| **ON** | `.chip.active` (teal `--live` border + dim teal fill) | Random pick from this category included |
| **PINNED** | `.chip.chip--accent` (purple, accent border) | Specific entry chosen; shown inline below chip |

Click chip: OFF → ON → OFF (toggle)  
Long-click / secondary click chip: opens an inline picker showing 5 random entries from that category + a search field to find a specific entry → selecting one sets PINNED state.

### Prompt hero

```
┌──────────────────────────────────────────────────────────────────┐
│  "a gorgeous woman with long blonde hair, natural lighting,      │
│   Sony A7, impressionist oil painting, sky with golden clouds…"  │
│                                                                   │
│  [🎲 Roll again]  [→ A]  [→ B]  [→ prompt]   N categories active │
└──────────────────────────────────────────────────────────────────┘
```

- Large monospace-style text block, teal color on active, dim while empty
- Shows which category each token came from on hover (tooltip per token segment)
- "Roll again" re-randomizes with same active categories
- "→ A" / "→ B" push to `performance.morphA` / `morphB` slot text
- "→ prompt" replaces the current prompt A text directly
- Category count chip on right: `N active`

### Preset system

- Built-in presets as horizontal pill row at top
- "+ Save" button opens inline name input → saves to localStorage
- Right-click on a user preset → delete
- Active preset highlighted in `--accent` purple
- Loading a preset updates active categories; user can then tweak

### Collection mode

- "📚 Collection" button next to prefix/suffix
- Calls `/api/creaprompt/collection/random`
- Fills the hero text with a curated complete prompt
- User can then send to A/B/prompt as normal
- Collection bypass doesn't care about active categories

---

## File execution plan

### Step 1 — Copy data, add server routes

1. Copy `creaprompt-src/csv/` → `docker/web/data/creaprompt/csv/` (permanent home, not `creaprompt-src/`)
2. In `server.js`, add a `loadCreapromptCatalog()` function called at startup:
   - Reads all `*.csv` files from `data/creaprompt/csv/`
   - Parses filename → id, label, group, sortKey using the `N_M` prefix
   - Reads all lines into `entries[]` array
   - Reads `collection.txt`
   - Stores as `global.creapromptCatalog`
3. Add three Express routes under `/api/creaprompt/`:
   - `GET /catalog` — returns catalog JSON
   - `POST /roll` — server-side random pick
   - `GET /collection/random` — random collection entry

### Step 2 — App.vue state

Add to `data()`:
```js
creaprompt: {
  catalog: null,           // loaded once from /api/creaprompt/catalog
  activeCategories: [],    // Set<categoryId>
  pinnedValues: {},        // { categoryId: specificEntry }
  prefix: '',
  suffix: '',
  builtPrompt: '',
  parts: [],               // [{ categoryId, value }] for hover display
  isRolling: false,
  activePreset: null,
},
```

Add methods:
- `loadCreapromptCatalog()` — fetch and cache catalog
- `rollCreaprompt()` — call `/api/creaprompt/roll`, populate `creaprompt.builtPrompt`
- `loadCreapromptCollection()` — call `/api/creaprompt/collection/random`
- `applyCreapromptPreset(preset)` — set `activeCategories` from preset
- `sendCreapromptToSlot(slot)` — push `builtPrompt` to `performance.morphA/B` or `prompts.text`
- `saveCreapromptPreset(name)` — write user presets to localStorage
- `deleteCreapromptPreset(name)`

### Step 3 — PromptStudioPanel.vue

New component at `src/components/PromptStudioPanel.vue`.

Receives `creaprompt` state + catalog via `app` proxy (same proxyAppView pattern).

Sub-components:
- **CategoryGroupChip** — single chip, emits `toggle`/`pin` events
  - Props: `{ id, label, active, pinned, pinnedValue, count }`
- **CategoryGroup** — row of chips for one semantic group with a label
  - Props: `{ group, categories, activeSet, pinnedValues }`
- **CreapromptHero** — the large prompt output area
  - Props: `{ prompt, parts, isRolling }`
  - Emits: `roll`, `send-a`, `send-b`, `send-prompt`
- **PresetPillRow** — horizontal preset chips + save button
  - Props: `{ builtinPresets, userPresets, activePreset }`
  - Emits: `select`, `save`, `delete`

### Step 4 — PromptsView.vue: add CREA sub-tab

```html
<button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='CREA'}"
  @click="switchSubTab('PROMPTS','CREA')">CREA</button>
```

```html
<div v-else-if="currentSubTab.PROMPTS==='CREA'">
  <PromptStudioPanel />
</div>
```

Load catalog when user first opens CREA tab (`watch: currentSubTab.PROMPTS`).

### Step 5 — CSS

New classes in `style.css`:

```css
/* Prompt hero */
.creaprompt-hero { … }          /* large text block, teal glow when populated */
.creaprompt-hero__text { … }    /* monospace, teal color, min-height 80px */
.creaprompt-hero__meta { … }    /* "N categories active" dim small text */
.creaprompt-hero__actions { … } /* button row: roll, →A, →B, →prompt */

/* Category groups */
.creaprompt-groups { … }        /* vertical stack of groups */
.creaprompt-group { … }         /* single group row */
.creaprompt-group__label { … }  /* "SUBJECT" etc — uppercase dim small */
.creaprompt-group__chips { … }  /* flex-wrap chip row */

/* Chip states */
/* Chip active (ON): .chip.active — existing class, teal border */
/* Chip pinned: .chip.chip--accent — existing accent purple */

/* Preset row */
.creaprompt-presets { … }
.creaprompt-presets__save { … }

/* Pinned value inline display */
.creaprompt-pin-value { … }     /* appears under chip when pinned; shows truncated value */

/* Collection and prefix/suffix bar */
.creaprompt-aux-row { … }
```

All colors via tokens (`--live`, `--accent`, `--text-dim`, `--border`, `--bg-2`). No hex.

---

## Key UX decisions

1. **Roll is server-side**: Avoids shipping 12k entries to the browser. Catalog metadata (ids, labels, groups, counts) goes to the browser; entries stay on the server and are sampled on `POST /roll`.

2. **Chips not checkboxes**: The current Gradio UI has a wall of checkbox text. Chips convey group membership visually and use the design system (`.chip`, `.chip.active`) already in place.

3. **Pinning replaces dropdown**: Instead of a 1000-item dropdown per category, long-click opens a floating mini-picker showing 5 random entries + search. This is faster than scrolling.

4. **Parts hover**: When the built prompt is showing, each token range shows which category produced it on hover — helps performers understand what's in the mix without reading a long string.

5. **→ A / → B integration**: Push directly to the A/B morph slots so the performer can dice a new prompt B while A is running, then crossfade on LIVE. This is the core performance use case.

6. **Preset pill row is compact**: Built-in presets are 5–6 named chips. User presets appear after them. The "+ Save" button opens an inline name input (no modal).

7. **Collection is a distinct mode**: Not mixed with category-based rolling. A separate button, makes it clear the prompt came from the curated collection, not from active categories. Useful for "give me anything good" mode.

---

## Files to create / modify

| File | Change |
|------|--------|
| `docker/web/data/creaprompt/csv/` | **New** — permanent data home (copy from `creaprompt-src/csv/`) |
| `docker/web/server.js` | Add `loadCreapromptCatalog()` + 3 routes |
| `docker/web/src/App.vue` | Add `creaprompt` state + 6 methods |
| `docker/web/src/components/PromptStudioPanel.vue` | **New** — main CREA component |
| `docker/web/src/components/views/PromptsView.vue` | Add CREA sub-pill + mount panel |
| `docker/web/src/style.css` | Add `creaprompt-*` CSS classes |
| `docker/web/creaprompt-src/` | **Delete after** data is copied to `data/` |

No backend Python, no WS protocol changes, no Forge API calls. Everything is pure JS/Express/Vue.

---

## Acceptance criteria

- [ ] CREA sub-tab appears in PROMPTS nav
- [ ] Catalog loads on first open (single fetch, cached)
- [ ] Category chips toggle ON/OFF, active ones teal
- [ ] Built-in presets restore their category selections in one click
- [ ] Roll generates a non-empty prompt from active categories
- [ ] Collection mode returns a curated prompt ignoring category selection
- [ ] Prompt hero displays the built prompt in large readable text
- [ ] → A / → B push to morph slots (visible in LIVE Morph HUD)
- [ ] → Active prompt replaces current prompt A text
- [ ] Prefix and suffix prepend/append correctly
- [ ] User preset save/load/delete via localStorage
- [ ] All colors via CSS tokens, no hex in Vue templates
- [ ] Chip state restored when user returns to CREA tab (state in `creaprompt` object)
- [ ] 228 existing tests still pass (no regressions)
