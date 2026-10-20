import { useEffect, useState } from 'react'
import * as maplibregl from 'maplibre-gl'

import Globe from '../globe/Globe'
import IconRail from './IconRail'
import PanelContainer from './PanelContainer'
import MapDataLayers from '../data/MapDataLayers'
import { DEFAULT_LAYERS, useIntelligenceData, type LayerKey, type LayerState, type MapCenter } from '../data/useIntelligenceData'

import type { PanelId, ProjectionMode, ImageryMode } from '../types'

const projectionModes: { id: ProjectionMode; label: string }[] = [
  { id: '3d', label: '3D' },
  { id: '2d', label: '2D' },
]
const imageryModes: { id: ImageryMode; label: string }[] = [
  { id: 'map', label: 'MAP' },
  { id: 'sat', label: 'SAT' },
]

interface SearchLocation { lat: number; lon: number; name: string }

function readDayNightPreference(): boolean {
  try { return localStorage.getItem('sonar-day-night') !== 'false' } catch { return true }
}

function readLayerPreferences(): LayerState {
  try {
    const saved = localStorage.getItem('sonar-layer-preferences')
    return saved ? { ...DEFAULT_LAYERS, ...JSON.parse(saved) } : DEFAULT_LAYERS
  } catch {
    return DEFAULT_LAYERS
  }
}

export default function MainScreen() {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null)
  const [projectionMode, setProjectionMode] = useState<ProjectionMode>('3d')
  const [imageryMode, setImageryMode] = useState<ImageryMode>('map')
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const [center, setCenter] = useState<MapCenter>({ lat: 20, lon: 0 })
  const [activeLayers, setActiveLayers] = useState<LayerState>(readLayerPreferences)
  const [dayNightEnabled, setDayNightEnabled] = useState(readDayNightPreference)
  const [refreshKey, setRefreshKey] = useState(0)
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const { data, statuses } = useIntelligenceData(activeLayers, center, refreshKey)

  useEffect(() => {
    try { localStorage.setItem('sonar-layer-preferences', JSON.stringify(activeLayers)) } catch { /* Storage can be unavailable in private contexts. */ }
  }, [activeLayers])
  useEffect(() => {
    try { localStorage.setItem('sonar-day-night', String(dayNightEnabled)) } catch { /* Storage can be unavailable in private contexts. */ }
  }, [dayNightEnabled])

  const handleSelect = (panel: PanelId) => setActivePanel((current) => current === panel ? null : panel)
  const handleLocationSelect = (location: SearchLocation) => {
    setSearchLocation(location)
    setCenter({ lat: location.lat, lon: location.lon })
    setActivePanel(null)
  }
  const handleMapReady = (instance: maplibregl.Map) => setMap(instance)
  const handleMapCenterChange = (next: MapCenter) => setCenter((current) =>
    Math.abs(current.lat - next.lat) < 0.03 && Math.abs(current.lon - next.lon) < 0.03 ? current : next)
  const handleToggleLayer = (key: LayerKey, enabled: boolean) =>
    setActiveLayers((current) => ({ ...current, [key]: enabled }))

  const enabledCount = Object.values(activeLayers).filter(Boolean).length
  const readyCount = Object.values(statuses).filter((status) => status.state === 'ready').length

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <Globe
        projectionMode={projectionMode}
        imageryMode={imageryMode}
        searchLocation={searchLocation}
        onMapReady={handleMapReady}
        onMapCenterChange={handleMapCenterChange}
        dayNightEnabled={dayNightEnabled}
      />
      <MapDataLayers map={map} data={data} activeLayers={activeLayers} />

      <IconRail activePanel={activePanel} onSelect={handleSelect} />

      <PanelContainer
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
        onLocationSelect={handleLocationSelect}
        activeLayers={activeLayers}
        onToggleLayer={handleToggleLayer}
        statuses={statuses}
        data={data}
        center={center}
        selectedLocation={searchLocation}
        dayNightEnabled={dayNightEnabled}
        onDayNightChange={setDayNightEnabled}
        onResetLayers={() => setActiveLayers(DEFAULT_LAYERS)}
        onRefresh={() => setRefreshKey((value) => value + 1)}
        geminiApiKey={geminiApiKey}
        onGeminiApiKeyChange={setGeminiApiKey}
        projectionMode={projectionMode}
        imageryMode={imageryMode}
      />

      <div className="fixed bottom-7 left-20 z-10 flex max-w-[calc(100vw-6rem)] items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-border bg-background/85 p-1 backdrop-blur-sm">
          {projectionModes.map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={projectionMode === id} onClick={() => setProjectionMode(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${projectionMode === id ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-background/85 p-1 backdrop-blur-sm">
          {imageryModes.map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={imageryMode === id} onClick={() => setImageryMode(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${imageryMode === id ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-16 right-0 z-10 flex items-center justify-between gap-2 border-t border-border/50 bg-background/75 px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-sm">
        <span>sonAr</span>
        <span>{projectionMode.toUpperCase()} · {imageryMode.toUpperCase()}</span>
        <span className="hidden sm:inline">© OpenStreetMap · {imageryMode === 'sat' ? 'Imagery © Esri' : 'MapLibre demo tiles'}</span>
        <span>{enabledCount} layers · {readyCount} online</span>
      </div>
    </div>
  )
}
