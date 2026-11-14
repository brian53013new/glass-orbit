# Glass Orbit｜玻璃軌道

**Glass Orbit** is a browser-based 3D pixel-card educational game for ages 7–12. Built for the **2026 NASA Space Apps Challenge — The Next Frontier / Build a Junior Astronaut Mission Trainer**, it lets a player use one archived NASA observation to make a fictional Moon/Mars-outpost decision about power, life support, and radiation protection.

> This is an independent, non-official NASA education prototype. It is not NASA-certified training, a radiation-dose calculator, a safety tool, a mission simulator, or an operational forecast.

## What is playable now

- A Three.js / React Three Fiber glass room with low-poly Earth, Moon, and Mars.
- Thick, raycast-selectable 3D card meshes plus keyboard- and touch-accessible card controls.
- Eight original cards, three core resources, a visible card-cost preview, a source drawer, a replayable trace, and success / partial / failure outcomes.
- A saved NASA DONKI CME JSON snapshot. Its observed 1018 km/s analysis changes the **education-model** shield goal from 2 to 3. This is deliberately not a scientific risk calculation.
- Bounded camera parallax, planet focus, Escape-to-return, and reduced-motion handling.

The core successful sequence is **儲能分配 → 輻射護盾 → 生命維持**. Other card orders make the trade-offs visible and may produce a partial result.

## Start locally

```bash
npm install
npm run dev
```

Then open the printed local URL. For a production check:

```bash
npm run verify:data
npm run build
npm run lint
```

## Data provenance

The raw snapshot is stored at [`src/data/donki-cme-2024-05-10.snapshot.json`](src/data/donki-cme-2024-05-10.snapshot.json). Its request URL, UTC retrieval time, HTTP status, original event date, SHA-256, intended use, and limitations are in [`src/data/manifest.json`](src/data/manifest.json).

The command `npm run verify:data` re-hashes the saved JSON and confirms the selected CME record is present. The game deliberately labels its information as:

| Layer | What Glass Orbit says |
| --- | --- |
| NASA observation | A saved DONKI CME record, its date, instruments, and listed analysis speed. |
| Game inference | Use a space-weather clue to practise a “protect before explore” choice. |
| Education model | The fictional shield target and all resource points. |
| Unknown / limitation | No dose, exposure, location risk, or mission safety result is calculated. |

See the [NASA DONKI portal](https://ccmc.gsfc.nasa.gov/tools/DONKI/) and the [challenge page](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/) for their official materials.

## Submission material

- [Project Page draft](PROJECT_PAGE.md)
- [90-second walkthrough and six-shot fallback plan](WALKTHROUGH_SCRIPT.md)
- [Sources and third-party notices](THIRD_PARTY.md)
- [MIT License](LICENSE)

## Deliberate scope

This is the first vertical slice: one room, three celestial bodies, eight cards, one real data source, and a replayable mission. It does not claim that the short evaluation path is a complete curriculum or a real operational mission plan. The target for a judge-facing guided session is 8–12 minutes; the compact success path is intentionally shorter for testing and video capture.
