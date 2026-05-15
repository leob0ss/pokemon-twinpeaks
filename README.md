# Pokemon Twin Peaks

A top-down Pokémon DS-style walkaround built as a **single `index.html` file** with vanilla JavaScript and Canvas 2D — no frameworks, no bundler, no dependencies.

Walk around a hand-painted tile map, explore mountains, paths, swamp streets, flowers, log fences, rock formations, and more — all rendered in real time on an HTML canvas with pixel-art scaling.

## How it works

### One-file architecture

Everything lives in `index.html`: the canvas element, all CSS, the full game loop, map generation, tile rendering, sprite animation, the map editor, and save/load logic. The surrounding folders are purely **static assets** (PNGs and SVGs) loaded at runtime.

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

### Rendering

A `requestAnimationFrame` loop calls `render()` each frame, which paints layers in depth order:
1. Background fill and water base
2. Street / path / swamp ground tiles
3. Mountain faces (split into underlay and main passes)
4. Grass and flower back patches
5. Walls, map objects (telescope, vehicles), fence overlays
6. Short decor overlays (ledge, small/medium rocks, path board, etc.) — not the tall props that sort around the player
7. Grass and flower front strips (with passes that respect the player’s tile while walking)
8. Tall decor (big rocks, lampposts) drawn before the player when they stand south of the prop’s base
9. Player sprite (4-directional, 4-frame walk cycle)
10. Tall decor drawn after the player when they stand north of the prop — props and flowers keep a stable order relative to each other; only player vs tall props is dynamic
11. Grass splashes and wind gusts

**Telescope:** stand on the tile *above* a telescope, face **down**, and press **↓** (or tap down on the mobile shell). A circular panorama (`view/Twinpeaks_fullview.png`) opens; pan with the viewport edges, drag, or the on-screen buttons on touch. **Esc** or **B** / **×** closes it.

**Path sign:** the board blocks that tile. Stand directly below it, face **up**, press **↑** for a Pokémon-style text box. **Space / Enter / Z / X**, tap the box, or **A** / **B** on the GBA shell advances and closes.

Wind ambience is **position-based**: stronger layered wind when the player is north of the summit threshold (see `WIND_NORMAL_MIN_TILE_Y` in `index.html`). In `?devMap`, a small HUD shows wind mode and row.

### Movement & collision

Arrow keys move the player tile-by-tile with smooth interpolation. Shift toggles running (faster step speed). Collision checks block movement into walls, mountains (unless the brown face is walkable), fences, solid decor overlays (ledge, rocks, board, lamppost, etc.), and map-edge boundaries.

### Sprites & assets

Character sprites are pre-exported PNGs (4 steps × 4 directions). Terrain tiles are a mix of SVGs (grass, earth, streets, wind) and PNGs (mountains, fences, rocks, flowers, vehicles, water). All loaded asynchronously at startup — the game renders immediately with flat-color fallbacks while images stream in.

## Project structure

```
index.html            Main game (all JS + HTML + CSS)
published-map.json    Shipped map edits (the world visitors walk on)
characters/           Player sprite PNGs (Red, 4-dir × 4-step)
grass/                Grass and flower tile SVGs/PNGs
earth/                Earth path tile SVGs + corner PNGs
street/               Road tile SVGs + corner PNGs
street_car/           Swamp street tile PNGs + corner PNGs
mountain/             Mountain face PNGs + corner PNGs
fence/                Log fence PNGs (7 variants)
ledge/                Ledge PNG
rocks/                Rock PNGs (small, medium, big)
objects/              Telescope SVG, path board PNG, lamppost PNG
view/                 Telescope panorama PNG (full skyline)
stair/                Stairs PNG
vehicles/             Vehicle PNGs (bicycles, truck)
water/                Water tile PNG
wind/                 Wind gust SVGs (small, medium, large)
sounds/               Footstep and wind ambience audio
reference_map/        Design reference files
map_saves/            Older published-map.json backups (V1–V4)
```

## Running locally

Serve the repo root with a static file server (`file://` can block fetches for map/audio):

```bash
python3 -m http.server 5173
```

Then open [http://localhost:5173](http://localhost:5173) (add `?devMap` for the editor).

### Controls

| Key | Action |
|-----|--------|
| Arrow keys | Move; when eligible, **↓** opens the telescope view, **↑** reads the path sign |
| Shift (hold) | Run |
| Esc | Close telescope view |
| Space / Enter / Z / X | Advance or close the sign text box when it is open |

On narrow / touch screens, a **GBA-style shell** appears: D-pad maps to arrows, **A** / **B** can interact with overlays (telescope close, message box).

## Map editor

Append `?devMap` to the URL to enable the built-in map editor:

```
http://localhost:5173/?devMap
```

This shows a toolbar with a **Cell** dropdown, **Angle** selector, **Undo**, and **Export** button. Shift+click paints tiles (including **Terrain → Flowers**, **Objects → Board / Lamppost**, etc.); Ctrl/Cmd+click selects regions for copy/paste. Edits are saved to `localStorage` automatically.

Use **Export map** to download a `published-map.json` that you can commit to the repo — that file is what visitors see when the site is deployed.

## Deployment

Deploy the entire directory as a static site (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.). Visitors on the live URL get:

- **Published map only** — no localStorage merge, no editor UI
- **Walk-only mode** — arrow keys to move, Shift to run, that's it

The editor is only accessible via `?devMap` and merges localStorage edits on `localhost` / `file:` origins for local authoring.
