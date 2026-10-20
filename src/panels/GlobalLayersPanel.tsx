import { X } from 'lucide-react'
import type { LayerKey, LayerState, LayerStatuses } from '../data/useIntelligenceData'
import LayerToggleList from './LayerToggleList'

interface Props {
  onClose: () => void
  activeLayers: LayerState
  statuses: LayerStatuses
  onToggle: (key: LayerKey, enabled: boolean) => void
}

export default function GlobalLayersPanel({ onClose, activeLayers, statuses, onToggle }: Props) {
  const keys: LayerKey[] = ['earthquakes', 'fires', 'weather', 'airQuality']
  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Global Layers</h2>
          <p className="mt-1 text-[10px] text-muted-foreground/60">Live environmental signals</p>
        </div>
        <button type="button" aria-label="Close global layers" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
      </div>
      <div className="mb-4 mt-3 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-[10px] leading-4 text-muted-foreground">
        Enable a layer to fetch source data and render its points on the globe. Click a point for details and source links.
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <LayerToggleList keys={keys} activeLayers={activeLayers} statuses={statuses} onToggle={onToggle} />
      </div>
    </div>
  )
}