# Browser verification — 2026-10-22

Tested on an isolated local HTTP preview of the standalone build.

- 3D overview renders all nine gardens without the city renderer or a parent frame.
- Enter walking view; keyboard W changes the reported park position.
- Search for Euclid; open his profile; Visit the sculpture moves to Geometry Garden.
- Origami friends opens the folding lesson with working paper diagrams.
- Plant a synthetic idea; reload; the grove retains it.
- Open the local Atlas reader; profiles and reading paths load in the reading room.
- Persian interface selection updates the park UI.
- At 390 × 844, navigation and mission controls remain available; the mission editor opens.
- No browser console errors were captured during these checks.

Only synthetic local notes were entered. No user notes were copied or uploaded. These checks do not constitute a full manual accessibility or physical-controller audit.

## The Question Garden — second edition

- Separate opening screen, nine-room layout, and grid map checked visually.
- Notice a pattern enters the relocated Geometry Garden; walking view keeps the city interface absent.
- Relocated fountain boats and grove are verified by model tests.
- Original and second-edition grove storage keys are separate; the Atlas reading shelf is shared.

- On the local preview, a synthetic second-edition question survives reload; following Original park shows its different synthetic test idea instead. Neither is uploaded with the source.
- Phone-sized view checked at 390 × 844; all three opening invitations and the park controls remain available.

## The Listening Grove — 2026-10-23

- Independent rolling woodland scene and lantern trail render without the nine-garden builder.
- Each of the five clearings opens from its labelled destination button.
- Touch the water shows moving ripple rings; balancing controls visibly tilt the beam; the firefly pattern controls change the lights.
- Sound toggles on/off explicitly; harp key C changes the feedback while sound is enabled. No audio plays on initial load.
- Paper Meadow releases the cranes. Unit tests verify the entire flight and return and repeated-release handling.
- A synthetic field note survives page reload; JSON export contains that note. All such browser tests use the isolated local origin.
- Mobile opening and walking controls checked at 390 × 844.

These are functional checks, not a formal manual accessibility or hardware-gamepad audit.
