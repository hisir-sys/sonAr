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

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target
      const typing = target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (typing || event.altKey || event.ctrlKey || event.metaKey) return
      const key = event.key.toLowerCase()
      if (key === 'escape') { setActivePanel(null); return }
      if (key === '/') { event.preventDefault(); setActivePanel('search'); return }
      if (key === 'g') { setActivePanel('global'); return }
      if (key === 'l') { setActivePanel('local'); return }
      if (key === 'b') { setActivePanel('briefing'); return }
      if (key === 's') { setActivePanel('settings'); return }
      if (key === 'r') { setRefreshKey((value) => value + 1); return }
      if (key === '0') {
        map?.flyTo({ center: [0, 20], zoom: 1.35, bearing: 0, pitch: 0, duration: 900 })
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [map])

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

      <header className="pointer-events-none fixed left-20 right-4 top-4 z-10 flex items-start justify-between gap-3 sm:left-24 sm:right-6">
        <div className="sonar-live-surface pointer-events-auto flex items-center gap-3 rounded-xl border border-border/80 bg-background/85 px-3 py-2.5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-4">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10">
            <span className="sonar-live-dot absolute h-2 w-2 rounded-full bg-cyan-300/70" />
            <span className="relative h-2 w-2 rounded-full bg-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-[0.22em] text-foreground">SONAR</span>
              <span className="rounded border border-cyan-300/30 px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.16em] text-cyan-200">LIVE INTELLIGENCE</span>
            </div>
            <p className="mt-0.5 text-[9px] tracking-wide text-muted-foreground">GLOBAL SITUATIONAL AWARENESS</p>
          </div>
        </div>

        <div className="hidden pointer-events-auto items-center gap-4 rounded-xl border border-border/80 bg-background/85 px-4 py-3 text-[10px] backdrop-blur-xl md:flex">
          <div>
            <p className="text-muted-foreground">MAP CENTER</p>
            <p className="mt-1 font-mono text-foreground">{center.lat.toFixed(3)}° {center.lat >= 0 ? 'N' : 'S'} · {Math.abs(center.lon).toFixed(3)}° {center.lon >= 0 ? 'E' : 'W'}</p>
          </div>
          <div className="h-7 w-px bg-border" />
          <div>
            <p className="text-muted-foreground">ACTIVE LAYERS</p>
            <p className="mt-1 font-mono text-cyan-200">{enabledCount.toString().padStart(2, '0')} ENABLED</p>
          </div>
          <div className="h-7 w-px bg-border" />
          <div>
            <p className="text-muted-foreground">FEED STATUS</p>
            <p className="mt-1 font-mono text-foreground">{readyCount.toString().padStart(2, '0')} READY</p>
          </div>
        </div>
      </header>

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

      <div className="fixed bottom-16 left-20 z-10 flex items-center gap-1.5 sm:left-24">
        <button type="button" onClick={() => setRefreshKey((value) => value + 1)} title="Refresh active data (R)" className="rounded-lg border border-cyan-300/20 bg-background/85 px-3 py-2 text-[10px] font-semibold tracking-[0.14em] text-cyan-100 backdrop-blur-xl transition hover:border-cyan-200/50 hover:bg-cyan-300/10">↻ REFRESH <span className="text-muted-foreground">R</span></button>
        <button type="button" onClick={() => map?.flyTo({ center: [0, 20], zoom: 1.35, bearing: 0, pitch: 0, duration: 900 })} title="Return to global view (0)" className="rounded-lg border border-border bg-background/85 px-3 py-2 text-[10px] font-semibold tracking-[0.14em] text-foreground backdrop-blur-xl transition hover:border-cyan-200/40">GLOBAL VIEW <span className="text-muted-foreground">0</span></button>
        <span className="hidden rounded-lg border border-border/70 bg-background/70 px-2.5 py-2 text-[9px] tracking-wide text-muted-foreground lg:inline">/ SEARCH · G GLOBAL · L LOCAL · B BRIEFING · S SETTINGS</span>
      </div>

      <div className="fixed bottom-0 left-16 right-0 z-10 flex items-center justify-between gap-2 border-t border-border/50 bg-background/75 px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-sm">
        <span>SONAR · OPEN-SOURCE SPATIAL INTELLIGENCE</span>
        <span>{projectionMode.toUpperCase()} · {imageryMode.toUpperCase()}</span>
        <span className="hidden sm:inline">{imageryMode === 'sat' ? 'Borders © MapLibre · Imagery © Esri' : '© OpenStreetMap · MapLibre demo tiles'}</span>
        <span>{enabledCount} layers · {readyCount} online</span>
      </div>
    </div>
  )
}
