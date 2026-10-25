# Park of Ideas

An independent, browser-based 3D garden of mathematics and creative questions. Extracted from [City of Ideas](https://github.com/hadi1373z/city-of-ideas), with its own renderer, controls, build, tests, and GitHub Pages deployment. It runs without loading the city or connecting to its tools.

## Four park experiences

- [Original park](https://hadi1373z.github.io/park-of-ideas/): nine circular gardens around the central fountain.
- [The Question Garden](https://hadi1373z.github.io/park-of-ideas/question-garden.html): nine open garden rooms, joined gravel promenades, lower sculpture displays, branching trees with layered canopies, new landmark locations and a green-and-brass interface. Its three opening invitations lead to geometry, logic, or a personal question.

- [The Listening Grove](https://hadi1373z.github.io/park-of-ideas/listening-grove.html): a new rolling woodland at dusk, with a winding lantern trail and five playable clearings: water ripples, a synthesized harp, a balancing stone, firefly patterns, and paper cranes that fly and return. It has its own renderer, controls, and local field notes.

- [Skyfold Park](https://hadi1373z.github.io/park-of-ideas/skyfold.html): a folded-paper landscape above the clouds. Compress an accordion canyon, turn two pavilion wings into a doorway, and tilt a blue paper river to guide a boat. The three puzzles unlock a gatefold orchard with twelve paper trees and a hidden pavilion. Progress changes the visible landscape and stays saved between visits.

The first two editions share the catalogue, renderer, missions, reading tools and origami models. Their personal idea groves use separate browser storage keys; export/import can transfer ideas between them. The Atlas reading shelf remains shared within the same origin.

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
- `src/question-garden.html`, `question-garden-config.js`, `question-garden.css`: the second edition, with explicit layout and theme settings.
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

## The Listening Grove

The third park is built independently in `src/listening-grove/`, using shared Three.js and folded-paper crane geometry. It uses no city geometry, nine-garden catalogue layout, embedded reader, or external runtime services. Open `listening-grove.html` after building.

Choose Clearings to visit any instrument, or follow the trail. Field notes are stored under `listening-grove:field-notes:v1` and can be exported as JSON. They remain separate from the earlier groves. Sound is off on every fresh page load; Sound on enables quiet synthesized harp notes. No microphone or audio service is used. This new experience is currently in English. Reduced motion keeps the cranes perched and the fireflies still while visual controls remain usable.

Its balance and fireflies are authored visual models rather than physical or biological simulations.

## Skyfold Park

The fourth park has its own renderer and interface in `src/skyfold/`. `journey.js` owns the ordered puzzle state, save validation, boat flow, and safe walking boundary. `landscape.js` builds a continuous paper sheet, attached accordion hinges, turning wings, tilting river and unfolding orchard. `experience.js` manages camera inspection, walking, picking and keyboard/touch/gamepad input. `app.js` connects those mechanics to accessible controls and the local reflection journal. Existing folded-paper crane, butterfly and boat models are reused; there are no attached animal bodies or decorations.

Choose Make the first fold for the folding journey. Compress the canyon until the red marks meet; give both pavilion wings a quarter turn; tip the river Forward and release the boat. Level or reverse the river to pause or bring it back. Each completed fold stays in its new shape. Unfold the orchard after the boat arrives. The journey menu revisits unlocked places; Walk and Overview allow free exploration. The folding journey has no score or timer. There is no audio or external service. This version is currently in English.

Progress and a reflection are stored under `skyfold:journey:v1`, separate from all other parks. Your folds can export a JSON copy. Reset this journey is an explicit action inside Help; it resets puzzles while preserving the reflection. If storage is unavailable, the visit continues in memory and the interface reports that export is needed. Reduced motion disables ambient flights and animating camera transitions; user-controlled folds and boat movement still work.

Keyboard users can Tab to the fold sliders and adjust them with arrow keys. On a standard gamepad, D-pad moves between controls, the left stick adjusts a focused slider, A activates buttons, and B closes a panel. The sticks also support walking and looking. Controller support uses the existing browser gamepad mapping; physical hardware has not been tested in this release. Paper folding and boat flow are authored geometric mechanisms, not a rigid-origami or fluid simulator.

### Paper Chase

The landing screen now offers **Play Paper Chase**: catch five low-flying folded-paper cranes across the park, then bring the flock back to the red starting fold. Choose the 90-second challenge or practice without a timer. A direction arrow and distance guide the visitor; the Catch button becomes available within five paper-metres. Caught cranes fly home and perch there. Catching all five alone does not finish the round: return to the marked starting fold to win.

Left stick moves, right stick looks, A / Cross catches, and X / Square dashes. Start or B / Circle pauses and resumes. D-pad and A / Cross control the title screen, game menu, pause menu and replay. A menu press is consumed before scene interaction. Keyboard controls are WASD, arrows to turn, E to catch, Space to dash and Escape to pause. The touch joystick and Catch / Dash buttons provide the same actions on phones. A dash lasts 0.6 seconds and recharges in 3.5 seconds. The clock stops during menus, focus loss, hidden pages and controller disconnection.

Catches earn 100 points, with a 25-point increasing streak bonus for consecutive catches within twelve seconds. A timed win adds five points per remaining second. Best challenge score, fastest successful flight and completed rounds stay under `skyfold:paper-chase:v1`; practice cannot replace challenge records. Current flights restart on page reload. Saved folds and reflections use their existing separate key and are not changed by the game. If storage is unavailable, records remain in memory and the game menu says so.

`chase.js` owns the game rules and records. `chase-world.js` reuses the paper-only crane model for moving targets and the returning flock. `chase-ui.js` owns the HUD, game menus and controller menu navigation. Tests cover the complete win/loss/practice flow, scoring, pause, cooldowns, target bounds, paper meshes, local persistence, standard-controller input edges and actual menu adapter behavior. Browser playtests cover a complete practice round and a complete timed round; physical controller hardware remains untested.
