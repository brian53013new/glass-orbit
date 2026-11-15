# Sources and third-party notices

## NASA & Partner Agency Data (CSA)

- NASA DONKI data is preserved as a raw offline snapshot with its request, retrieval UTC, HTTP status, SHA-256, and limitations in [`src/data/manifest.json`](src/data/manifest.json).
- All 7 challenge-referenced official resources are cataloged in [`src/data/official-resources.ts`](src/data/official-resources.ts) and surfaced in-game under **NASA Source**:
  - [NASA Open APIs](https://api.nasa.gov/)
  - [Space Weather Database Of Notifications, Knowledge, Information (DONKI)](https://ccmc.gsfc.nasa.gov/tools/DONKI/)
  - [NASA Open Science Data Repository (OSDR)](https://osdr.nasa.gov/bio/repo/) ([search API](https://osdr.nasa.gov/osdr/data/search?term=KEYWORD))
  - [RadLab (OSDR Radiation Dosimetry Database)](https://visualization.osdr.nasa.gov/radlab/gui/data-api/)
  - [Mars Trek](https://trek.nasa.gov/mars/)
  - [CSA: Space resources for STEM and youth organizations](https://www.asc-csa.gc.ca/eng/youth-educators/resources-stem-and-youth-organizations.asp)
  - [CSA: Food production on the moon and in remote areas](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/)
- Challenge reference: [Build a Junior Astronaut Mission Trainer (Resources)](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/?tab=resources)

NASA and CSA public data, educational toolkits, and public-domain imagery do not imply NASA or Canadian Space Agency endorsement. No NASA or CSA official insignia or logo (Meatball, Worm, or CSA mark) is used.

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
