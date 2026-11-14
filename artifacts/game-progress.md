# Glass Orbit — Current Upgrade Progress

## Intent and constraints

- A high-resolution, three-dimensional glass observatory for ages 7–12.
- Keep the central control desk, cards, and celestial view unobstructed.
- Move the three information displays to a physical U-shape around the desk.
- Support `ArrowLeft` / `ArrowRight` and `A` / `D` camera yaw plus touch-accessible in-world controls.
- Use a physical 3D language dial, not a visible HTML language menu.
- Teach first-time players through six short, stateful, skippable actions without resetting the board.
- Deliver four replayable NASA-snapshot-linked micro-courses in the same 3D room.

## Core-loop contract

The player reads a NASA snapshot clue, uses the desk or view controls to inspect the room, chooses and plays a card while resource scarcity creates a trade-off, then compares the changed resource/evidence state and tries a different mission seed.

## Spatial plan

- Left rear: Earth / comms terminal, turned inward.
- Raised rear centre: Moon / active NASA mission terminal.
- Right rear: Mars / course-and-archive terminal, turned inward.
- Centre foreground: eight tangible choice cards.
- Front corners: NOVA onboarding console, view arrows, and an EN/繁中 dial.

## Progress

- [x] Replaced coarse room mosaic with a high-density glass pattern plan.
- [x] Defined four source-linked course records in `src/data/micro-courses.ts`.
- [ ] Rebuild terminal geometry, camera targets, dial, touch arrows, and onboarding state.
- [ ] Validate desktop, 375×812, real keyboard/mouse/touch paths, Escape, reduced motion, and clean storage.
- [ ] Capture active-play evidence and deploy the accepted revision.

## Design decisions

- Keep the game procedural and self-contained; no external generated art is needed for this correction.
- Use screen focus as an in-world camera move only; no modal is introduced.
- Course resource values remain explicitly educational abstractions, while source IDs point to the checked-in DONKI snapshot.

