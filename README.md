# sonAr

An open-source 3D globe dashboard showing live global environmental data
(air quality, wildfires, earthquakes, weather) that transitions into local
city-level data (transit, bike lanes/EV chargers, points of interest) as
you zoom in.

## Status
🚧 In progress — currently building the splash/intro screen.

## Running it locally
1. Install the **Live Server** extension in VS Code.
2. Open this folder in VS Code.
3. Right-click `index.html` → "Open with Live Server".
4. It'll open in your browser and auto-refresh every time you save a file.

## Folder structure
```
sonAr/
├── index.html        # main HTML file
├── css/
│   └── style.css     # all styling + animations
├── js/
│   └── script.js      # all JavaScript logic
├── assets/            # images/icons will go here later
└── README.md
```

## Roadmap
- [x] Splash screen animation
- [ ] Basic 3D globe (MapLibre GL)
- [ ] Global layers: air quality, wildfires, earthquakes, weather
- [ ] Zoom-triggered transition to local view
- [ ] Local layers: transit, bike/EV, points of interest
- [ ] AI daily briefing + smart alerts (v2)

## License
MIT
