# Glass Orbit｜玻璃軌道

> **Live Demo / 線上試玩**：https://brian53013new.github.io/glass-orbit/ ｜ [繁體中文版 README](README.zh-TW.md)

**Glass Orbit** is a browser-based 3D pixel-card educational game for ages 7–12. Built for the **2026 NASA Space Apps Challenge — The Next Frontier / Build a Junior Astronaut Mission Trainer**, it lets a player use one archived NASA observation to make a fictional Moon/Mars-outpost decision about power, life support, and radiation protection.

> This is an independent, non-official NASA education prototype. It is not NASA-certified training, a radiation-dose calculator, a safety tool, a mission simulator, or an operational forecast.

## What is playable now

- A Three.js / React Three Fiber glass observatory with voxel Earth, Moon, and Mars outside its framed panes.
- A visible 3D-only play surface: upright physical card meshes, an in-scene mission console, resource pillars, and a clickable settings block. The hidden semantic controls preserve keyboard and touch access.
- A dark celestial exterior, bright glass-and-metal interior, high-resolution rendering, hard-edged voxel geometry, and no full-screen pixelation, bloom, or blur.
- A real card-detail sequence: lift, short depth arc, enlargement, source plaque, and Escape-to-return in the same 3D room.
- Three mosaic-glass mission screens with shared camera dolly focus, rich world-space records, and Escape-to-return without resetting the board.
- English is the default on every page load; the 3D dial and top-right toggle switch to Traditional Chinese during the session.
- Eight mission events (6 real NASA DONKI CME snapshots + 2 designed training scenarios), 12 original cards (with `★ SKILL` abilities), an original Web Audio ambient soundtrack, and a live NOVA companion narrator.
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

- [Sources and third-party notices](THIRD_PARTY.md)
- [MIT License](LICENSE)

## AI Usage Disclosure｜AI 使用說明

- **Development Environment / 開發環境**：Visual Studio Code (VS Code)
- **Originality / 原創聲明**：The entire website—including the game concept, 360° glass observatory architecture, monochrome interior vs. color space aesthetic, mission structure, and every interactive detail—is an **original human design**, not an AI-generated template.
- **AI Assistance Scope (~40% of codebase) / AI 協助範圍（約占總程式碼 40%）**：AI was used inside VS Code as a development assistant to help modify complex logic and optimize existing code, with the **majority of AI-assisted code concentrated in frontend UI layout and styling**.

## Deliberate scope

This is the first vertical slice: one room, three celestial bodies, eight cards, one real data source, and a replayable mission. It does not claim that the short evaluation path is a complete curriculum or a real operational mission plan. A first click reads a card in the 3D console; a second click plays it. The target for a judge-facing guided session is 8–12 minutes; the compact success path is intentionally shorter for testing and video capture.
