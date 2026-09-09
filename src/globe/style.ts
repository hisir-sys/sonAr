import type { StyleSpecification } from 'maplibre-gl'

export const mapStyle: StyleSpecification = {
  version: 8,

  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },

  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
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
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
    },
  ],
}