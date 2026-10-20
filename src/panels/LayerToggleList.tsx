import type { LayerKey, LayerState, LayerStatuses } from '../data/useIntelligenceData'

const definitions: Record<LayerKey, { title: string; description: string }> = {
  flights: { title: 'Aircraft', description: 'Public ADS-B aircraft reports near map center' },
  launches: { title: 'Space launches', description: 'Scheduled launch-pad locations, not live vehicle tracking' },
  weather: { title: 'Weather', description: 'Temperature, humidity and wind at map center' },
  earthquakes: { title: 'Earthquakes', description: 'USGS events from the past 24 hours' },
  fires: { title: 'Wildfire events', description: 'Open wildfire events from NASA EONET' },
  airQuality: { title: 'Air quality', description: 'AQI and particulate estimates at map center' },
  transit: { title: 'Transit stops', description: 'Nearby public transport stops and stations' },
  pointsOfInterest: { title: 'Points of interest', description: 'Nearby public services and mapped places' },
  chargers: { title: 'EV chargers', description: 'Nearby mapped charging stations' },
}

interface LayerToggleListProps {
  keys: LayerKey[]
  activeLayers: LayerState
  statuses: LayerStatuses
  onToggle: (key: LayerKey, enabled: boolean) => void
}

export default function LayerToggleList({ keys, activeLayers, statuses, onToggle }: LayerToggleListProps) {
  return (
    <div className="flex flex-col gap-2">
      {keys.map((key) => {
        const definition = definitions[key]
        const status = statuses[key]
        const statusColor = status.state === 'ready' ? 'bg-emerald-400'
          : status.state === 'loading' ? 'bg-amber-300'
            : status.state === 'error' ? 'bg-red-400' : 'bg-muted-foreground/40'
        return (
          <div key={key} className="rounded-lg border border-border/70 bg-card/40 p-3 transition-colors hover:border-border">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={activeLayers[key]} onChange={(event) => onToggle(key, event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 text-xs font-medium text-foreground">
                  {definition.title}
                  <span className="flex shrink-0 items-center gap-1.5 text-[9px] font-normal uppercase tracking-wider text-muted-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
                    {activeLayers[key] ? status.state : 'off'}
                  </span>
                </span>
                <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{definition.description}</span>
                {activeLayers[key] && status.message && (
                  <span className={`mt-1.5 block text-[9px] leading-4 ${status.state === 'error' ? 'text-red-300' : 'text-muted-foreground/70'}`}>{status.message}</span>
                )}
                {activeLayers[key] && status.source && <span className="mt-1 block text-[9px] text-muted-foreground/50">Source: {status.source}</span>}
                {activeLayers[key] && status.updatedAt && <span className="mt-1 block text-[9px] text-muted-foreground/50">Updated {new Date(status.updatedAt).toLocaleTimeString()}</span>}
              </span>
            </label>
          </div>
        )
      })}
    </div>
  )
}
