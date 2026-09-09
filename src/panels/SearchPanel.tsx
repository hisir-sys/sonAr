import { X } from 'lucide-react'

export default function SearchPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Search
        </h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>
      <input
        type="text"
        placeholder="Search a city or place..."
        autoFocus
        className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}