import { useEffect, useState } from 'react'

export type LayerKey =
  | 'weather'
  | 'earthquakes'
  | 'fires'
  | 'airQuality'
  | 'transit'
  | 'pointsOfInterest'
  | 'chargers'
  | 'flights'
  | 'launches'

export type LayerState = Record<LayerKey, boolean>
export type GeoFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: Record<string, string | number | boolean | null>
}
export type FeatureCollection = { type: 'FeatureCollection'; features: GeoFeature[] }
export type LayerStatus = { state: 'idle' | 'loading' | 'ready' | 'error'; message: string; updatedAt?: string; source?: string }
export type LayerStatuses = Record<LayerKey, LayerStatus>
export type MapCenter = { lat: number; lon: number }

export const DEFAULT_LAYERS: LayerState = {
  weather: false,
  earthquakes: true,
  fires: false,
  airQuality: false,
  transit: false,
  pointsOfInterest: false,
  chargers: false,
  flights: false,
  launches: false,
}

export const EMPTY_FEATURES: FeatureCollection = { type: 'FeatureCollection', features: [] }

const initialStatuses = (): LayerStatuses => ({
  weather: { state: 'idle', message: 'Layer disabled' },
  earthquakes: { state: 'idle', message: 'Layer disabled' },
  fires: { state: 'idle', message: 'Layer disabled' },
  airQuality: { state: 'idle', message: 'Layer disabled' },
  transit: { state: 'idle', message: 'Layer disabled' },
  pointsOfInterest: { state: 'idle', message: 'Layer disabled' },
  chargers: { state: 'idle', message: 'Layer disabled' },
  flights: { state: 'idle', message: 'Layer disabled' },
  launches: { state: 'idle', message: 'Layer disabled' },
})

function pointFeature(lon: number, lat: number, properties: GeoFeature['properties']): GeoFeature {
  return { type: 'Feature', geometry: { type: 'Point', coordinates: [lon, lat] }, properties }
}

function asCollection(features: GeoFeature[]): FeatureCollection {
  return { type: 'FeatureCollection', features }
}

type JsonRecord = Record<string, unknown>

function asRecord(value: unknown): JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {}
}

function arrayOfRecords(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map(asRecord) : []
}

async function fetchJson(url: string, signal: AbortSignal): Promise<JsonRecord> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`)
  return asRecord(await response.json())
}

async function loadLayer(key: LayerKey, center: MapCenter, signal: AbortSignal): Promise<{ data: FeatureCollection; source: string }> {
  if (key === 'flights') {
    const url = new URL(`https://api.adsb.lol/v2/lat/${center.lat}/lon/${center.lon}/dist/250`)
    const data = await fetchJson(url.toString(), signal)
    const aircraft = arrayOfRecords(data.ac)
    const features = aircraft.flatMap((item) => {
      const lat = Number(item.lat)
      const lon = Number(item.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return []
      return [pointFeature(lon, lat, {
        title: String(item.flight ?? item.r ?? item.hex ?? 'Aircraft'),
        callsign: String(item.flight ?? '').trim(),
        registration: String(item.r ?? ''),
        altitudeFt: Number(item.alt_baro ?? 0),
        groundSpeedKt: Number(item.gs ?? 0),
        headingDeg: Number(item.track ?? 0),
        aircraftType: String(item.t ?? ''),
        icao24: String(item.hex ?? ''),
        seenSeconds: Number(item.seen ?? 0),
        source: 'adsb.lol',
        url: 'https://globe.adsbexchange.com/',
      })]
    })
    return { data: asCollection(features), source: 'adsb.lol · aircraft near map center (live feed)' }
  }

  if (key === 'launches') {
    const url = new URL('https://ll.thespacedevs.com/2.3.0/launch/upcoming/')
    url.searchParams.set('limit', '30')
    url.searchParams.set('mode', 'normal')
    const data = await fetchJson(url.toString(), signal)
    const results = arrayOfRecords(data.results)
    const features = results.flatMap((item) => {
      const pad = asRecord(item.pad)
      const location = asRecord(pad.location)
      const lat = Number(pad.latitude ?? location.latitude)
      const lon = Number(pad.longitude ?? location.longitude)
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return []
      return [pointFeature(lon, lat, {
        title: String(item.name ?? 'Upcoming launch'),
        net: String(item.net ?? ''),
        status: String(asRecord(item.status).name ?? 'Scheduled'),
        provider: String(asRecord(item.launch_service_provider).name ?? 'Unknown provider'),
        pad: String(pad.name ?? ''),
        source: 'The Space Devs · Launch Library 2',
        url: String(item.url ?? 'https://thespacedevs.com/'),
      })]
    })
    return { data: asCollection(features), source: 'The Space Devs · scheduled launch pads' }
  }
  if (key === 'earthquakes') {
    const data = await fetchJson('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson', signal)
    const features = arrayOfRecords(data.features)
      .filter((feature) => asRecord(feature.geometry).type === 'Point')
      .map((feature) => {
        const geometry = asRecord(feature.geometry)
        const coordinates = Array.isArray(geometry.coordinates) ? geometry.coordinates : []
        const properties = asRecord(feature.properties)
        return pointFeature(Number(coordinates[0]), Number(coordinates[1]), {
          title: String(properties.title ?? 'Earthquake'),
          magnitude: Number(properties.mag ?? 0),
          place: String(properties.place ?? 'Location unavailable'),
          time: Number(properties.time ?? 0),
          url: String(properties.url ?? 'https://earthquake.usgs.gov/earthquakes/map/'),
          source: 'USGS Earthquake Hazards Program',
        })
      })
    return { data: asCollection(features), source: 'USGS · earthquakes from the past 24 hours' }
  }

  if (key === 'fires') {
    const data = await fetchJson('https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&limit=200', signal)
    const features: GeoFeature[] = []
    for (const event of arrayOfRecords(data.events)) {
      const geometry = arrayOfRecords(event.geometry).reverse().find((item) => item.type === 'Point' && Array.isArray(item.coordinates))
      if (!geometry || !Array.isArray(geometry.coordinates)) continue
      const coordinates = geometry.coordinates
      const sources = arrayOfRecords(event.sources)
      features.push(pointFeature(Number(coordinates[0]), Number(coordinates[1]), {
        title: String(event.title ?? 'Wildfire event'),
        date: String(geometry.date ?? ''),
        url: String(sources[0]?.url ?? 'https://eonet.gsfc.nasa.gov/'),
        source: 'NASA EONET',
      }))
    }
    return { data: asCollection(features), source: 'NASA EONET · open wildfire events' }
  }

  if (key === 'weather') {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', String(center.lat))
    url.searchParams.set('longitude', String(center.lon))
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code')
    url.searchParams.set('timezone', 'UTC')
    const data = await fetchJson(url.toString(), signal)
    const current = asRecord(data.current)
    return { data: asCollection([pointFeature(center.lon, center.lat, {
      title: 'Current weather at map center',
      temperatureC: Number(current.temperature_2m ?? 0),
      humidityPercent: Number(current.relative_humidity_2m ?? 0),
      windKmh: Number(current.wind_speed_10m ?? 0),
      weatherCode: Number(current.weather_code ?? -1),
      time: String(current.time ?? ''),
      source: 'Open-Meteo',
    })]), source: 'Open-Meteo · current conditions' }
  }

  if (key === 'airQuality') {
    const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality')
    url.searchParams.set('latitude', String(center.lat))
    url.searchParams.set('longitude', String(center.lon))
    url.searchParams.set('current', 'european_aqi,us_aqi,pm2_5,pm10')
    url.searchParams.set('timezone', 'UTC')
    const data = await fetchJson(url.toString(), signal)
    const current = asRecord(data.current)
    return { data: asCollection([pointFeature(center.lon, center.lat, {
      title: 'Air quality at map center',
      europeanAqi: Number(current.european_aqi ?? -1),
      usAqi: Number(current.us_aqi ?? -1),
      pm25: Number(current.pm2_5 ?? -1),
      pm10: Number(current.pm10 ?? -1),
      time: String(current.time ?? ''),
      source: 'Open-Meteo Air Quality',
    })]), source: 'Open-Meteo · modeled air quality' }
  }

  const radius = 18000
  const selector = key === 'transit'
    ? 'node(around:RADIUS,LAT,LON)[public_transport];node(around:RADIUS,LAT,LON)[highway=bus_stop];node(around:RADIUS,LAT,LON)[railway=station];'
    : key === 'chargers'
      ? 'node(around:RADIUS,LAT,LON)[amenity=charging_station];'
      : 'node(around:RADIUS,LAT,LON)[amenity~"^(hospital|school|police|fire_station|pharmacy|shelter)$"];node(around:RADIUS,LAT,LON)[tourism];'
  const query = `[out:json][timeout:20];(${selector.replaceAll('RADIUS', String(radius)).replaceAll('LAT', String(center.lat)).replaceAll('LON', String(center.lon))});out center 80;`
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams({ data: query }),
  })
  if (!response.ok) throw new Error(`OpenStreetMap Overpass returned HTTP ${response.status}`)
  const data = await response.json()
  const features = arrayOfRecords(data.elements).flatMap((element) => {
    const centerPoint = asRecord(element.center)
    const lat = Number(element.lat ?? centerPoint.lat)
    const lon = Number(element.lon ?? centerPoint.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return []
    const tags = asRecord(element.tags)
    return [pointFeature(lon, lat, {
      title: String(tags.name ?? tags.amenity ?? tags.public_transport ?? tags.railway ?? 'Map feature'),
      kind: key,
      source: 'OpenStreetMap',
      url: `https://www.openstreetmap.org/${String(element.type ?? 'node')}/${String(element.id ?? '')}`,
    })]
  })
  return { data: asCollection(features), source: 'OpenStreetMap · nearby mapped features' }
}

export function useIntelligenceData(activeLayers: LayerState, center: MapCenter, refreshKey = 0) {
  const { lat, lon } = center
  const [data, setData] = useState<Record<LayerKey, FeatureCollection>>({
    weather: EMPTY_FEATURES,
    earthquakes: EMPTY_FEATURES,
    fires: EMPTY_FEATURES,
    airQuality: EMPTY_FEATURES,
    transit: EMPTY_FEATURES,
    pointsOfInterest: EMPTY_FEATURES,
    chargers: EMPTY_FEATURES,
    flights: EMPTY_FEATURES,
    launches: EMPTY_FEATURES,
  })
  const [statuses, setStatuses] = useState<LayerStatuses>(initialStatuses)

  useEffect(() => {
    const controller = new AbortController()
    const enabled = (Object.keys(activeLayers) as LayerKey[]).filter((key) => activeLayers[key])
    const disabled = (Object.keys(activeLayers) as LayerKey[]).filter((key) => !activeLayers[key])
    // This is the loading-state transition for a newly started external request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatuses((current) => {
      const next = { ...current }
      for (const key of disabled) next[key] = { state: 'idle', message: 'Layer disabled' }
      for (const key of enabled) next[key] = { state: 'loading', message: 'Fetching latest source data…' }
      return next
    })

    void Promise.all(enabled.map(async (key) => {
      try {
        const result = await loadLayer(key, { lat, lon }, controller.signal)
        if (controller.signal.aborted) return
        setData((current) => ({ ...current, [key]: result.data }))
        setStatuses((current) => ({
          ...current,
          [key]: { state: 'ready', message: `${result.data.features.length} mapped features`, source: result.source, updatedAt: new Date().toISOString() },
        }))
      } catch (error) {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : 'Unknown data-source error'
        setStatuses((current) => ({ ...current, [key]: { state: 'error', message: `Could not load data: ${message}` } }))
      }
    }))

    return () => controller.abort()
  }, [activeLayers, lat, lon, refreshKey])

  return { data, statuses }
}
