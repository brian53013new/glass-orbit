# Glass Orbit｜玻璃軌道

**Challenge:** 2026 NASA Space Apps Challenge — *Build a Junior Astronaut Mission Trainer*  
**Theme:** The Next Frontier  
**Format:** Game · Web Application · Open Source

## The problem

Children can hear that an off-world outpost needs power, life support, radiation protection, supplies, and communications, but those systems are often presented as disconnected facts. Glass Orbit gives ages 7–12 a single, visible decision loop: read one real NASA space-weather clue, pay a cost to play a card, and see the fictional outpost change.

## Our solution

Glass Orbit is a browser-based 3D block-pixel game set in a bright glass observatory against a dark celestial exterior. Voxel Earth, Moon, and Mars remain visible through its framed panes while the player manages a small outpost from a physical card table. Every player-facing surface is a scene object: cards, mission console, resource pillars, and a settings block. Original exhibit cards carry an icon, English-first bilingual title, cost, and short effect on their 3D faces; one click reads the console and a second click plays. The first vertical slice contains one room, three celestial bodies, eight original task cards, three core resources, two reproducible NASA event seeds, and replayable success / partial-success / failure outcomes.

## How NASA data changes a decision

The game ships with a date-stamped NASA DONKI CME snapshot. It reads a real record for `2024-05-10T07:12:00-CME-001`, including an analysis with a speed of 1018 km/s. A clearly labeled **education model** turns this observation into a fictional target of shield ≥ 3; a lower-speed example would set shield ≥ 2. This makes the event influence the mission objective without claiming to calculate radiation exposure, risk, or a NASA operational recommendation.

## Player loop

1. Read the in-world mission console and distinguish observation, inference, and education model.
2. Select a thick 3D task card from the control desk.
3. Read its cost and immediate consequence in the same 3D console.
4. Click it again to play a sequence such as **Energy Allocation → Radiation Shield → Life Support**.
5. Inspect the trace, outcome, and source drawer; replay with another strategy.

## Technology

- React, TypeScript, Vite
- Three.js + React Three Fiber for the glass observatory, voxel celestial bodies, control desk, physical consoles, and thick card meshes
- High-resolution WebGL, hard-edged geometry, detailed shadows, and a responsive 3D scene with semantic accessibility controls
- Offline NASA DONKI JSON snapshot, SHA-256 manifest, and a data-verification script

## Data, provenance, and limitations

- Official dataset: [NASA DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/)
- Exact request, retrieval UTC, HTTP status, original event date, SHA-256, and limitations: [`src/data/manifest.json`](src/data/manifest.json)
- Saved raw JSON: [`src/data/donki-cme-2024-05-10.snapshot.json`](src/data/donki-cme-2024-05-10.snapshot.json)

This is an independent educational game. It is not a NASA product, endorsement, certification, mission simulator, safety tool, radiation-dose calculator, or operational forecast.

## Demo and fallback

Demo URL: set after private deployment. The recommended 90-second recorded walkthrough and six-shot fallback plan are in [`WALKTHROUGH_SCRIPT.md`](WALKTHROUGH_SCRIPT.md).

## License

Project source is MIT licensed. See [`LICENSE`](LICENSE) and [`THIRD_PARTY.md`](THIRD_PARTY.md).
