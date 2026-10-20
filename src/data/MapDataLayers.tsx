import { useEffect } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { FeatureCollection, LayerKey, LayerState } from './useIntelligenceData'

const layerColors: Record<LayerKey, string> = {
  earthquakes: '#ff5d5d',
  fires: '#ff9c45',
  weather: '#65b9ff',
  airQuality: '#b59bff',
  transit: '#68d9c3',
  pointsOfInterest: '#e8e8e8',
  chargers: '#e6d36d',
  flights: '#62e6ff',
  launches: '#ff7ad9',
}

const layerLabels: Record<LayerKey, string> = {
  earthquakes: 'Earthquakes',
  fires: 'Wildfire events',
  weather: 'Current weather',
  airQuality: 'Air quality',
  transit: 'Transit',
  pointsOfInterest: 'Points of interest',
  chargers: 'EV chargers',
  flights: 'Aircraft',
  launches: 'Space launches',
}

interface MapDataLayersProps {
  map: maplibregl.Map | null
  data: Record<LayerKey, FeatureCollection>
  activeLayers: LayerState
}

export default function MapDataLayers({ map, data, activeLayers }: MapDataLayersProps) {
  useEffect(() => {
    if (!map) return

    const keys = Object.keys(activeLayers) as LayerKey[]
    const sync = () => {
      for (const key of keys) {
        const sourceId = `sonar-data-${key}`
        const layerId = `sonar-points-${key}`
        const source = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined
        if (source) {
          source.setData(data[key] as never)
        } else {
          map.addSource(sourceId, { type: 'geojson', data: data[key] as never })
        }

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': key === 'earthquakes'
                ? ['interpolate', ['linear'], ['get', 'magnitude'], 0, 3, 3, 5, 5, 8, 7, 11]
                : key === 'fires' ? 5 : key === 'flights' ? 3 : key === 'launches' ? 7 : 5,
              'circle-color': layerColors[key],
              'circle-opacity': 0.88,
              'circle-stroke-color': '#0a0a0a',
              'circle-stroke-width': 1.2,
              'circle-blur': 0.08,
            },
          })
        }

        map.setLayoutProperty(layerId, 'visibility', activeLayers[key] ? 'visible' : 'none')
      }
    }

    const handleMapClick = (event: maplibregl.MapMouseEvent) => {
      const visibleLayers = keys
        .filter((key) => activeLayers[key] && map.getLayer(`sonar-points-${key}`))
        .map((key) => `sonar-points-${key}`)
      if (!visibleLayers.length) return
      const feature = map.queryRenderedFeatures(event.point, { layers: visibleLayers })[0]
      if (!feature) return

      const key = keys.find((item) => `sonar-points-${item}` === feature.layer.id)
      const properties = feature.properties ?? {}
      const content = document.createElement('div')
      content.style.cssText = 'min-width:180px;max-width:260px;font:12px/1.5 Inter,system-ui,sans-serif;color:#111'
      const heading = document.createElement('strong')
      heading.textContent = String(properties.title ?? (key ? layerLabels[key] : 'Map feature'))
      heading.style.cssText = 'display:block;font-size:13px;margin-bottom:6px'
      content.appendChild(heading)

      const preferred = key === 'earthquakes'
        ? ['magnitude', 'place', 'time']
        : key === 'fires'
          ? ['date']
          : key === 'weather'
            ? ['temperatureC', 'humidityPercent', 'windKmh', 'time']
            : key === 'airQuality'
              ? ['usAqi', 'europeanAqi', 'pm25', 'pm10', 'time']
              : key === 'flights'
                ? ['callsign', 'registration', 'altitudeFt', 'groundSpeedKt', 'headingDeg', 'aircraftType', 'seenSeconds']
                : key === 'launches'
                  ? ['net', 'status', 'provider', 'pad']
                  : ['kind']
      for (const name of preferred) {
        const value = properties[name]
        if (value === undefined || value === null || value === '') continue
        const row = document.createElement('div')
        const label = name === 'temperatureC' ? 'Temperature °C'
          : name === 'humidityPercent' ? 'Humidity %'
            : name === 'windKmh' ? 'Wind km/h'
              : name === 'usAqi' ? 'US AQI'
                : name === 'europeanAqi' ? 'European AQI'
                  : name === 'pm25' ? 'PM2.5'
                    : name === 'pm10' ? 'PM10'
                      : name.charAt(0).toUpperCase() + name.slice(1)
        row.textContent = `${label}: ${String(value)}`
        content.appendChild(row)
      }
      const sourceLabel = document.createElement('small')
      sourceLabel.textContent = String(properties.source ?? '')
      sourceLabel.style.cssText = 'display:block;margin-top:7px;color:#555'
      content.appendChild(sourceLabel)

      if (typeof properties.url === 'string' && properties.url.startsWith('https://')) {
        const link = document.createElement('a')
        link.href = properties.url
        link.target = '_blank'
        link.rel = 'noreferrer'
        link.textContent = 'Open source'
        link.style.cssText = 'display:block;margin-top:6px;color:#245bb5'
        content.appendChild(link)
      }

      new maplibregl.Popup({ closeButton: true, maxWidth: '300px' })
        .setLngLat(event.lngLat)
        .setDOMContent(content)
        .addTo(map)
    }

    sync()
    map.on('style.load', sync)
    map.on('click', handleMapClick)
    return () => {
      map.off('style.load', sync)
      map.off('click', handleMapClick)
    }
  }, [map, data, activeLayers])

  return null
}
