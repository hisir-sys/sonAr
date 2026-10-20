# SONAR

SONAR is an original open-source spatial-intelligence console inspired by the broader live-globe experience of projects such as [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view). Built with React, TypeScript, Vite and MapLibre GL JS, it combines a dark instrument-panel interface, monochrome and satellite basemaps, 2D/3D projection switching, solar day/night shading, live place search, aircraft tracking, current International Space Station position, scheduled space-launch locations, and source-attributed environmental/geographic layers. It does not reuse God's Eye View source code or assets.

## Requirements

- Node.js 22.12+ (Vite 8 requires a recent Node release)
- npm
- Internet access for map tiles, geocoding and public data feeds

## Run locally

```bash
git clone https://github.com/hisir-sys/sonAr.git
cd sonAr
npm ci
npm run dev
```

Open the local URL printed by Vite. To verify a production build and lint the source:

```bash
npm run build
npm run lint
npm run preview
```

No API key is required for the included public feeds. The application is a browser client; provider availability, CORS policy, rate limits and network connectivity can affect individual layers. A failed feed is shown as an error for that layer rather than being treated as a successful empty result.

## Controls

- **Global layers:** nearby aircraft from adsb.lol, upcoming launch-pad locations from The Space Devs, the current ISS position from Where the ISS at? (ISS only; not general satellite tracking), earthquakes, wildfire events, current weather, and air quality.
- **Local layers:** nearby public-transit features, points of interest/public services, and EV chargers around the current map center.
- **Search:** live place suggestions; choosing a result flies the globe to the location.
- **Intelligence briefing:** summarizes successfully loaded source records and provides context/limitations.
- **Settings:** toggle day/night shading and reset saved layer preferences.
- **2D / 3D:** switch between Mercator and globe projection.
- **MAP / SAT:** switch between the monochrome OpenStreetMap-based style and Esri World Imagery.

Layer preferences are saved in the current browser's local storage. Use Settings to restore defaults. Data can be refreshed from the briefing panel or with **R**. Aircraft and ISS positions poll independently every 60 seconds while enabled; the other feeds refresh when enabled, when the relevant map location changes, or when you request a refresh. Clicking a mapped point opens its available properties and a source link.

### Keyboard shortcuts

- **/** — open place search
- **G** — global layers
- **L** — local layers
- **B** — intelligence briefing
- **S** — settings
- **R** — refresh active feeds
- **0** — return to the global view
- **Esc** — close the active panel

## Data sources and meaning

| Layer | Source | What it represents |
| --- | --- | --- |
| Aircraft | [adsb.lol](https://adsb.lol/) | Public ADS-B aircraft reports near the current map center; coverage and freshness depend on receivers and the public endpoint. This is not military or complete worldwide coverage. |
| Upcoming launches | [The Space Devs / Launch Library 2](https://thespacedevs.com/) | Scheduled launch records plotted at launch-pad coordinates; this is a launch schedule, not a live rocket tracker. |
| ISS tracker | [Where the ISS at?](https://wheretheiss.at/) | Current reported position of the International Space Station only; this is not general satellite tracking. |
| Earthquakes | [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson) | USGS's past-24-hour GeoJSON feed; magnitudes and locations are source-reported. |
| Wildfire events | [NASA EONET](https://eonet.gsfc.nasa.gov/) | Open wildfire events that have point geometries available in the EONET feed. This is not a live fire perimeter. |
| Weather | [Open-Meteo](https://open-meteo.com/) | Current weather fields for the current map-center coordinate. |
| Air quality | [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) | Modeled AQI and particulate estimates at the current map center, not a regulatory monitoring-station observation. |
| Local map features | [OpenStreetMap](https://www.openstreetmap.org/) via [Overpass API](https://overpass-api.de/) | Community-mapped local features within roughly 18 km of the map center; coverage varies by area. |
| Place suggestions | [Photon](https://photon.komoot.io/) / OpenStreetMap | Geocoding and place suggestions. |
| MAP basemap | [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) and MapLibre demo vector tiles | A stylized map with country borders. |
| SAT basemap | [Esri World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9) | Satellite/aerial imagery. Attribution and usage terms are governed by the provider. |

Data timestamps come from source records where available. The app also records when a feed request completed. A successful response does not imply every event is independently verified.

## Briefing: evidence versus analysis

The observed-data summary is deterministic and source-grounded. An optional Gemini-backed section can generate a natural-language analysis from successfully loaded records when you supply your own Gemini API key in Settings. The AI prompt asks the model to separate source observations, cautious analysis, and verification gaps; its output is still fallible and must not be treated as verified fact. The key stays in application memory and is not saved to local storage, but it is sent directly from the browser to Google and can be inspected in browser developer tools. Use a restricted key, clear it when finished, and never commit it or place it in a `VITE_*` environment variable. Free-tier availability and quotas depend on Google's current terms.

## Reliability notes

- Each feed has independent loading, success and error status.
- Layer toggles control map visibility and can be switched without changing the basemap.
- Overlays are reattached after MAP/SAT style changes.
- Public endpoints may throttle or be temporarily unavailable; refresh from the briefing panel.
- The app currently uses public endpoints directly from the browser. For a production deployment, consider a small server-side cache/proxy for rate limiting, normalized timestamps, and more reliable provider access.
- This GitHub change should be built and linted locally before release; the map should also be manually checked in both projections and both imagery modes.

## Technology

React 19 · TypeScript · Vite 8 · MapLibre GL JS · Tailwind CSS
