import type { StyleSpecification } from 'maplibre-gl'

export const mapStyle: StyleSpecification = {
  version: 8,

  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },

    maplibre: {
      type: 'vector',
      url: 'https://demotiles.maplibre.org/tiles/tiles.json',
    },
  },

  layers: [
    {
      id: 'space',
      type: 'background',
      paint: {
        'background-color': '#000000',
      },
    },

    {
      id: 'ocean-base',
      type: 'raster',
      source: 'osm',
      paint: {
        'raster-opacity': 0.72,
        'raster-saturation': -1,
        'raster-contrast': -0.15,

        // ONLY CHANGE: tune the ocean toward the reference
        'raster-brightness-min': 0.35,
        'raster-brightness-max': 0.72,
      },
    },

    {
      id: 'countries-fill',
      type: 'fill',
      source: 'maplibre',
      'source-layer': 'countries',
      paint: {
        'fill-color': '#252a30',
        'fill-opacity': 0.96,
      },
    },

    {
      id: 'countries-border',
      type: 'line',
      source: 'maplibre',
      'source-layer': 'countries',
      paint: {
        'line-color': '#596169',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          0.35,
          2,
          0.45,
          4,
          0.65,
          6,
          0.85,
          10,
          1.1,
        ],
        'line-opacity': 0.65,
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
    },
  ],
}

export const satStyle: StyleSpecification = {
  version: 8,

  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri',
    },
  },

  layers: [
    {
      id: 'satellite-background',
      type: 'background',
      paint: {
        'background-color': '#000000',
      },
    },

    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
      paint: {
        'raster-opacity': 0.82,
        'raster-saturation': -0.35,
        'raster-contrast': 0.15,
        'raster-brightness-min': 0,
        'raster-brightness-max': 0.65,
      },
    },
  ],
}