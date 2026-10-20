import { Sparkles, X, RefreshCw } from 'lucide-react'
import type { LayerKey, LayerState, LayerStatuses, FeatureCollection, MapCenter } from '../data/useIntelligenceData'

interface Props {
  onClose: () => void
  activeLayers: LayerState
  statuses: LayerStatuses
  data: Record<LayerKey, FeatureCollection>
  center: MapCenter
  selectedLocation: { lat: number; lon: number; name: string } | null
  onRefresh: () => void
}

function getFeatureValue(feature: FeatureCollection['features'][number], key: string): string | number | null {
  const value = feature.properties[key]
  return typeof value === 'string' || typeof value === 'number' ? value : null
}

export default function BriefingPanel({ onClose, activeLayers, statuses, data, center, selectedLocation, onRefresh }: Props) {
  const enabled = (Object.keys(activeLayers) as LayerKey[]).filter((key) => activeLayers[key])
  const ready = enabled.filter((key) => statuses[key].state === 'ready')
  const errors = enabled.filter((key) => statuses[key].state === 'error')
  const quakes = data.earthquakes.features
  const strongerQuakes = quakes.filter((feature) => Number(feature.properties.magnitude ?? 0) >= 4)
  const fires = data.fires.features
  const weather = data.weather.features[0]
  const air = data.airQuality.features[0]
  const weatherTemp = weather ? getFeatureValue(weather, 'temperatureC') : null
  const usAqi = air ? getFeatureValue(air, 'usAqi') : null
  const pm25 = air ? getFeatureValue(air, 'pm25') : null

  const observations: string[] = []
  if (activeLayers.earthquakes && statuses.earthquakes.state === 'ready') {
    observations.push(strongerQuakes.length
      ? `USGS lists ${strongerQuakes.length} earthquake event(s) of magnitude 4 or greater in the current 24-hour feed, among ${quakes.length} mapped events.`
      : `USGS currently returns ${quakes.length} mapped earthquake event(s) in its past-24-hour feed; none in the feed reaches magnitude 4.`)
  }
  if (activeLayers.fires && statuses.fires.state === 'ready') {
    observations.push(`NASA EONET currently lists ${fires.length} open wildfire event location(s) that could be mapped from point geometries.`)
  }
  if (activeLayers.weather && statuses.weather.state === 'ready' && weather) {
    observations.push(`Open-Meteo reports ${weatherTemp}°C at the map center for ${String(weather.properties.time ?? 'its latest timestamp')} (UTC).`)
  }
  if (activeLayers.airQuality && statuses.airQuality.state === 'ready' && air) {
    observations.push(`Open-Meteo air-quality model reports US AQI ${usAqi} and PM2.5 ${pm25} µg/m³ at the map center for ${String(air.properties.time ?? 'its latest timestamp')} (UTC).`)
  }
  if (activeLayers.transit && statuses.transit.state === 'ready') observations.push(`OpenStreetMap returned ${data.transit.features.length} mapped transit feature(s) around the map center.`)
  if (activeLayers.pointsOfInterest && statuses.pointsOfInterest.state === 'ready') observations.push(`OpenStreetMap returned ${data.pointsOfInterest.features.length} mapped points of interest around the map center.`)
  if (activeLayers.chargers && statuses.chargers.state === 'ready') observations.push(`OpenStreetMap returned ${data.chargers.features.length} mapped EV charging station(s) around the map center.`)

  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Intelligence Briefing</h2>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground/60">Source-grounded situational summary</p>
        </div>
        <button type="button" aria-label="Close briefing" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-card/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected area</span>
          <button type="button" onClick={onRefresh} className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground"><RefreshCw size={11} /> Refresh data</button>
        </div>
        <p className="mt-1 text-xs font-medium text-foreground">{selectedLocation?.name ?? 'Current map center'}</p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">{center.lat.toFixed(3)}°, {center.lon.toFixed(3)}°</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[9px]">
          <span className="rounded border border-border px-2 py-1 text-muted-foreground">{enabled.length} layers enabled</span>
          <span className="rounded border border-border px-2 py-1 text-muted-foreground">{ready.length} sources ready</span>
          {errors.length > 0 && <span className="rounded border border-red-400/30 px-2 py-1 text-red-300">{errors.length} source error(s)</span>}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <section>
          <h3 className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Observed in source data</h3>
          {observations.length ? (
            <ul className="space-y-2">
              {observations.map((observation, index) => <li key={index} className="border-l border-primary/50 pl-3 text-xs leading-5 text-foreground/85">{observation}</li>)}
            </ul>
          ) : (
            <p className="rounded-md border border-border/60 bg-card/30 p-3 text-xs leading-5 text-muted-foreground">
              Enable one or more layers and wait for the source status to become ready. This section will only summarize successfully loaded data.
            </p>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Analyst notes</h3>
          <div className="space-y-2 text-xs leading-5 text-muted-foreground">
            {strongerQuakes.length > 0 && activeLayers.earthquakes && <p>Review the higher-magnitude events on the globe first. Magnitude alone does not establish damage or local impact; open the USGS source for event-specific context.</p>}
            {fires.length > 0 && activeLayers.fires && <p>Wildfire points indicate reported open events, not a verified fire perimeter or real-time fire-front position.</p>}
            {activeLayers.weather && <p>Weather values describe the selected map-center coordinate, not every location in the visible map.</p>}
            {activeLayers.airQuality && <p>Air-quality values are model estimates. They should not be treated as a regulatory station measurement or a health diagnosis.</p>}
            {!strongerQuakes.length && !fires.length && !activeLayers.weather && !activeLayers.airQuality && <p>Map points are observations from the selected feeds. Proximity, severity and impact require local context and additional verification.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-border/60 bg-card/30 p-3">
          <h3 className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Method & confidence</h3>
          <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
            The current briefing is a deterministic, source-grounded synthesis of loaded feed records. It is not an external large-language-model response, does not infer unobserved events, and does not replace source verification.
          </p>
          {enabled.map((key) => (
            <div key={key} className="mt-2 flex items-start justify-between gap-3 border-t border-border/40 pt-2 text-[9px]">
              <span className="text-muted-foreground">{statuses[key].source ?? key}</span>
              <span className={statuses[key].state === 'error' ? 'text-red-300' : statuses[key].state === 'ready' ? 'text-emerald-300' : 'text-muted-foreground'}>{statuses[key].state}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
