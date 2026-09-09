import { X } from 'lucide-react'

const layers = ['Transit stops', 'Bike lanes / EV chargers', 'Points of interest', 'Detailed weather']

export default function LocalLayersPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Local Layers
        </h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {layers.map((layer) => (
          <label key={layer} className="flex items-center gap-3 text-sm text-foreground">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
            {layer}
          </label>
        ))}
      </div>
    </div>
  )
}