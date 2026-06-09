# Pokemon Twin Peaks

A top-down Pokémon DS-style walkaround built with **vanilla JavaScript**, **Canvas 2D**, and **ES modules** — no frameworks, no bundler, no npm dependencies.

Walk around a hand-painted tile map of Twin Peaks, chase birds, read signs, use the telescope, and meet Leo in a short intro — all rendered in real time on an HTML canvas with pixel-art scaling.

## How it works

### Module layout (no bundler)

The game ships as **vanilla ES modules**: `index.html` loads `main.js`, which imports `js/ui-env.js` (shared touch/audio/camera flags). **`?devMap`** triggers a dynamic `import("./js/editor.js")` after the map boots so visitors do not download the map editor unless authoring. All CSS lives in **`styles.css`**. Raster/SVG world art lives under **`Visual_assets/`** and is referenced via **`VISUAL_ASSETS_ROOT`** in `main.js` (and the telescope `<img>` path in `index.html`). Everything still runs without npm or a build step.

### Map & terrain

The world is a procedurally-generated tile grid (mountains, grass, earth, walls, stairs, water) defined in `buildMapData()`. On top of that base grid, **`published-map.json`** stores hand-painted edits — terrain changes, path/street layouts, mountain face variants, log fences, ledges, rocks, vehicles, and more. These edits are merged onto the procedural grid at boot so the final map is a blend of code-generated terrain and authored detail.

Terrain types include:
- **Grass & flowers** — animated wind gusts, step-rustle splashes, layered front/back depth for the player
- **Mountains** — 9-directional brown faces + inverse corner tiles, auto-tiled or hand-picked per cell
- **Earth paths** — walkable lanes with their own 9-directional ground art and corner tiles
- **Streets & swamp streets** — two additional earth lane types with separate tile sets
- **Water** — fills behind mountains in the upper portion of the map
- **Walls, stairs, telescope, vehicles, log fences, ledges, rocks, path sign board, lampposts** — each with collision and custom rendering where applicable

### Overlay system

Objects like **log fences**, **ledges**, **rocks**, the **path sign board**, and **lampposts** use a separate overlay layer (`fenceOverlays`, `decorOverlays`) so they draw on top of whatever terrain is underneath without replacing it in the map grid. This mirrors how Pokémon games layer props over terrain.

### Desktop game window

On **mouse / trackpad** devices (`pointer: fine`), the canvas lives inside a centered responsive **16:9** frame (`#game-stage` / `#game-frame`) that scales between **560px** and **880px** wide (and with viewport height), instead of filling the monitor. That keeps the camera from revealing the entire map width on large screens and reduces pixels drawn per frame. **Touch** devices still use the full-screen **GBA-style shell** with an on-screen D-pad.

A **Studio Leo** credit (`a project by studio leo`) sits below the game frame on desktop and mobile.

### Intro tutorial

Step onto tile **(2, 99)** once per page load to trigger a short cutscene:

1. **Leo** (character #2) shouts **“Hey!”** from off-screen west **(-12, 99)**
2. Your character turns to face him
3. He walks in; multi-page dialogue plays with **talk blips** (`talk_short` for “Hey!”, rotating `talk_normal_1`–`3` for the rest)
4. Text **types in progressively** — advance only after each line finishes (Space / Enter / Z / X or tap)
5. He walks back off-screen; movement resumes

### Birds

Several birds roam the **playable area** (roughly **x -26…44**, **y 40…103**). Walk near one and it flees; when all are chased away, new ones respawn on valid grass, flowers, paths, and similar tiles.

### Rendering

A `requestAnimationFrame` loop calls `render()` each frame, which paints layers in depth order:
1. Background fill and water base
2. Street / path / swamp ground tiles
3. Mountain faces (split into underlay and main passes)
4. Grass and flower back patches
5. Walls, map objects (telescope, vehicles), fence overlays
6. Short decor overlays (ledge, small/medium rocks, path board, etc.) — not the tall props that sort around the player
7. Grass and flower front strips (with passes that respect the player’s tile while walking)
8. Tall decor (big rocks, lampposts, Sutro Tower) drawn before the player when they stand south of the prop’s base
9. Player sprite (4-directional, 4-frame walk cycle; **character_3** assets)
10. Birds (idle layered in grass/flowers; fleeing birds draw on top)
11. Tall decor drawn after the player when they stand north of the prop — props and flowers keep a stable order relative to each other; only player vs tall props is dynamic
12. Grass splashes and wind gusts

**Path signs:** stand on the tile below a board, face **up**, press **↑** (or **W**) for a Pokémon-style text box. Lines type in fully before you can advance. **Space / Enter / Z / X** or tap the box goes to the next line or closes.
- **Twin Peaks** board at **(2, 95)** — read from **(2, 96)**
- **Relax area** board at **(-17, 87)** — read from **(-17, 88)** (“A place to relax...”)

**Telescope:** stand on the tile *above* a telescope, face **down**, and press **↓** (or **S** / tap down on the mobile shell). The panorama (`Visual_assets/view/Twinpeaks_fullview.png`) is **lazy-loaded** on first open. Pan with the viewport edges, drag, or the on-screen buttons on touch. **Esc** or **×** closes it.

Wind ambience is **position-based**: stronger layered wind when the player is north of the summit threshold (see `WIND_NORMAL_MIN_TILE_Y` in `main.js`). In `?devMap`, a small HUD shows wind mode and row.

### Movement & collision

**Arrow keys** or **WASD** move the player tile-by-tile with smooth interpolation. Shift toggles running (faster step speed). Collision checks block movement into walls, mountains (unless the brown face is walkable), fences, solid decor overlays (ledge, rocks, board, lamppost, etc.), and map-edge boundaries.

### Audio

A **volume preface** lives on **`start.html`**: title **Volume UP**, a short reminder to turn sound on, and an **ok** button that opens the game. Visiting **`index.html`** redirects to `start.html` first (each refresh shows the preface again). **`index.html?devMap`** skips the preface for the map editor.

On the game page, wind, footsteps, zone music, and talk blips stay muted until the first tap or key press (required by mobile browsers for audio). Dialogue uses separate talk SFX (see intro tutorial above).

**Zen zone music:** inside the relax-area rectangle **(-20, 85)–(-14, 89)**, `sounds/zen-music-pokemon.mp3` fades in on loop and wind ducks slightly while you are there.

### Sprites & assets

Character sprites are pre-exported PNGs (4 steps × 4 directions). Terrain tiles are a mix of SVGs (grass, earth, streets, wind) and PNGs (mountains, fences, rocks, flowers, vehicles, water). All loaded asynchronously at startup — the game renders immediately with flat-color fallbacks while images stream in.

## Project structure

```
start.html            Volume preface (entry screen before the game)
start.css             Styles for the volume preface page only
index.html            Game shell + canvas; links styles.css and main.js
main.js               Game loop, map, rendering, audio, persistence
js/ui-env.js          `UI` getters: coarse pointer, camera zoom, mobile audio multiplier
js/editor.js          Map editor UI + wiring (loaded only with `?devMap`)
styles.css            All game + shell styles
published-map.json    Shipped map edits (the world visitors walk on)
Visual_assets/        All raster/vector map & character art (paths via `VISUAL_ASSETS_ROOT` in main.js)
  animals/            Bird sprite PNGs (fly / walk)
  characters/         Player (character_3) and NPC (character_2) PNGs, 4-dir × 4-step
  grass/              Grass and flower tile SVGs/PNGs
  earth/              Earth path tile SVGs + corner PNGs
  street/             Road tile SVGs + corner PNGs
  street_car/         Swamp street tile PNGs + corner PNGs
  mountain/           Mountain face PNGs + corner PNGs
  fence/              Log fence PNGs (7 variants)
  ledge/              Ledge PNG
  rocks/              Rock PNGs (small, medium, big)
  objects/            Telescope SVG, path board PNG, lamppost PNG, Sutro Tower PNG
  ui/                 Volume preface icon (`Audio_Playing.svg`)
  view/               Telescope panorama PNG (full skyline)
  stair/              Stairs PNG
  vehicles/           Vehicle PNGs (bicycles, truck)
  water/              Water tile PNG
  wind/               Wind gust SVGs (small, medium, large)
sounds/               Footsteps, wind ambience, zen zone music, talk blips (short + normal ×3)
reference_map/        Design reference files
map_saves/            Older published-map.json backups (V1–V4)
```

## Running locally

Serve the repo root with a static file server. **ES modules** (`main.js` → `js/*.js`) require HTTP on some browsers; `file://` is not recommended.

```bash
python3 -m http.server 5173
```

Then open [http://localhost:5173](http://localhost:5173) (add `?devMap` for the editor).

### Controls

| Key | Action |
|-----|--------|
| Arrow keys / **W A S D** | Move; when eligible, **↓** / **S** opens the telescope, **↑** / **W** reads the path sign |
| Shift (hold) | Run |
| Esc | Close telescope view |
| Space / Enter / Z / X | Advance dialogue or close the text box (only after the current line has finished typing) |

On narrow / touch screens, a **GBA-style shell** appears: the D-pad maps to arrow keys for movement.

## Map editor

Append `?devMap` to the URL to enable the built-in map editor:

```
http://localhost:5173/?devMap
```

This shows a toolbar with a **Cell** dropdown, **Angle** selector, **Undo**, and **Export** button. Shift+click paints tiles (including **Terrain → Flowers**, **Objects → Board / Lamppost**, etc.); Ctrl/Cmd+click selects regions for copy/paste. Edits are saved to `localStorage` automatically.

Use **Export map** to download a `published-map.json` that you can commit to the repo — that file is what visitors see when the site is deployed. **Dev-mode paints live in `localStorage` only** until you export and commit; production never reads your browser’s local edits.

## Deployment

Deploy the entire directory as a static site (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.). Visitors on the live URL get:

- **Published map only** — no localStorage merge, no editor UI
- **Walk-only mode** — arrow keys to move, Shift to run, that's it

The editor is only accessible via `?devMap` and merges localStorage edits on `localhost` / `file:` origins for local authoring.
