# Detailed 3D card addendum — implementation audit

## Before this addendum

The visible player experience was already a single React Three Fiber room. The remaining HTML controls are deliberately clipped semantic fallbacks for keyboard and screen-reader access; `three-only.css` keeps them out of the visible game. The main gap was that a selected card only lifted slightly and the renderer intentionally used a low device-pixel ratio.

## Changes delivered

| Area | Delivered implementation |
| --- | --- |
| Rendering | High-resolution canvas DPR (1–1.75) with WebGL antialiasing. The block style is now geometry, materials, edges and discrete palettes—not an output-wide pixelation filter. |
| Card detail | `CardDetailState` has `closed`, `lifting`, `moving`, `expanded` and `returning` states. The same thick card mesh raises, follows a short depth arc, enlarges, and returns with Escape. |
| Detail information | A world-space `DetailPlaque3D` presents bilingual title, effect, cost, NASA DONKI record, original date, education model and limitation beside the enlarged card. |
| In-room features | `ArchiveWall3D` displays played cards; `ReplayConsole3D` provides in-world replay and new-event controls once a mission has an outcome. |
| Screen focus | Three distinct `WorldScreen3D` exhibits use shared `ScreenFocusState` transitions (`overview → targeting → dollyIn → focused → returning`) and move the camera rig rather than scaling HTML. |
| Mosaic glass | `MosaicGlassTiles` adds transparent, thick, discrete-color window panels; each screen has tile seams, a stand, depth, a back, and a unique visual accent. |
| Exterior | The framed glass room keeps layered box stars and distinct, depth-separated voxel Earth, Moon and Mars. |

## Current 3D scene graph

`Canvas → CameraRig, PixelStars, MuseumRoom, MosaicGlassTiles, Planet × 3, Desk, WorldScreen3D × 3, ResourcePillars3D, SettingsConsole3D, ArchiveWall3D, CardMesh × 8, DetailPlaque3D, ReplayConsole3D`.

## Verification

- `npm run lint` — passed (non-blocking React hook advisories only)
- `npm run verify:data` — passed; NASA DONKI snapshot SHA-256 verified
- `npm run build` — passed
- Browser QA — opened a card in the scene, observed the expanded 3D card and source plaque, then returned it using Escape.
- Browser QA — focused NASA and outpost screens, observed full world-space records, then returned to the overview with Escape without resetting the run.

## External-skill note

The addendum names several third-party GitHub skills. They are not installed in this workspace, so none are claimed as used. Their requested outcomes were applied directly where relevant: scene/camera review, card-state validation, viewport inspection, and browser interaction QA.
