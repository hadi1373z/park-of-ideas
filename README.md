# Park of Ideas

An independent, browser-based 3D garden of mathematics and creative questions. Extracted from [City of Ideas](https://github.com/hadi1373z/city-of-ideas), with its own renderer, controls, build, tests, and GitHub Pages deployment. It runs without loading the city or connecting to its tools.

## Explore

- Nine gardens and 118 thinker profiles, with sources and connections.
- Twelve optional creative missions and eight reading paths.
- A personal idea grove with local drafts and JSON export/import.
- Eight paper birds, two cranes, three butterflies, and three floating paper boats, with folding lessons.
- An embedded Atlas reading room; English, Persian, and German public interface support. Translation coverage varies; personal writing is kept as entered.
- A central fountain, free passage through park scenery, and the current park layout without the removed bridge, lake, and large roadside boards.

## Run locally

Requires Node.js 22 or later. No npm dependencies or API keys.

```sh
npm run check
npm run build
npm run preview
```

Open **http://127.0.0.1:4191/**. Serve the files over HTTP; opening index.html directly with file:// does not support all modules and catalogue loading.

Walk with WASD. Arrow keys move forward/back and turn. Drag to look; PageUp/PageDown look vertically. Shift speeds up. Click a sculpture, use E nearby, or use Search / Choose a garden. The scene buttons switch overview, zoom, daylight and sound. Touch joystick and standard browser gamepads are supported. Search, map, missions, grove, and reader remain usable if WebGL is unavailable.

## Architecture

- `src/index.html`, `app.js`, `style.css`: park interface, catalogue, missions, reading routes, grove and backups.
- `src/scene.js`: standalone Three.js renderer, camera, input, picking and animation loop.
- `src/navigation.js`: finite-position validation, park boundary and normalized movement.
- `src/park.js`, `park-data.js`: current park geometry and public catalogue layout.
- `src/origami-*.js`: paper models, flight routes, water animation and folding lessons.
- `src/atlas.html`: self-contained Atlas reading room.
- `tools/`: source checks, reproducible static build, local server and live asset verification.

## Privacy and saved work

No account or server is required. Grove notes and folding progress stay in this browser, using this project's own storage keys. The Atlas reader has its own local reading shelf. Clearing browser data can remove saved work: export a grove backup before moving browsers or devices. Existing city notes are not copied automatically; use the grove's JSON export/import. No private exports or user notes are part of this repository. External source links and folding-guide links open their original websites.

## Publishing and attribution

Pushes to `main` run checks, build `_site`, publish to GitHub Pages, and verify the served version and asset hashes. `_site` is generated and excluded from Git.

See [PROVENANCE.md](PROVENANCE.md) for extraction details and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for bundled dependencies. This is an educational catalogue snapshot; publication does not independently re-verify every historical claim.
