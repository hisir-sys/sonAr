import { X } from 'lucide-react'

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Settings
        </h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">More settings coming soon.</p>
    </div>
  )
}