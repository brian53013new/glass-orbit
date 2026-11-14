# Sources and third-party notices

## NASA data

- NASA DONKI data is preserved as a raw offline snapshot with its request, retrieval UTC, HTTP status, SHA-256, and limitations in [`src/data/manifest.json`](src/data/manifest.json).
- Official data page: [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/)
- NASA Open APIs: [api.nasa.gov](https://api.nasa.gov/)
- Challenge reference: [Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)

NASA data and public-domain imagery do not imply NASA endorsement. No NASA official insignia or logo (Meatball or Worm) is used.

## NASA public-domain imagery (`public/nasa/`)

Archived from the [NASA Image and Video Library](https://images.nasa.gov/) (`images-api.nasa.gov`) and cataloged in [`public/nasa/nasa-media.json`](public/nasa/nasa-media.json):

- `public/nasa/earth.jpg` — `GSFC_20171208_Archive_e001386` (*Most Amazing High Definition Image of Earth - Blue Marble 2012*)
- `public/nasa/moon.jpg` — `GSFC_20171208_Archive_e001861` (*Full Moon*)
- `public/nasa/mars.jpg` — `PIA02005` (*Tharsis Volcanoes and Valles Marineris, Mars*)
- `public/nasa/cme.jpg` — `PIA21836` (*Bastille Day Solar Flare and a Coronal Mass Ejection*)

## Code libraries

- React and React DOM — MIT License
- Three.js — MIT License
- React Three Fiber — MIT License
- Vite — MIT License

See installed package metadata and the respective projects for complete license text.

## Fonts

The user interface requests Noto Sans TC, Space Grotesk, and DM Mono from Google Fonts at runtime. They remain subject to their respective font licenses; no font files are vendored in this repository. The game uses no third-party images, sounds, icons, game assets, APKs, or materials from the referenced card game.

## Skills and reference material

No GitHub skill repository listed in the kickoff package was installed or copied into this project. The 2023 Taiwan programming-techniques PDF is treated only as internal submission advice, not as 2026 NASA Space Apps rules.
