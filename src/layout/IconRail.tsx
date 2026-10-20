import { Globe2, MapPin, Search, Sparkles, Settings } from 'lucide-react'
import type { PanelId } from '../types'

interface IconRailProps {
  activePanel: PanelId | null
  onSelect: (panel: PanelId) => void
}

const items: { id: PanelId; icon: typeof Globe2; label: string }[] = [
  { id: 'global', icon: Globe2, label: 'Global layers' },
  { id: 'local', icon: MapPin, label: 'Local layers' },
  { id: 'search', icon: Search, label: 'Search' },
]

export default function IconRail({ activePanel, onSelect }: IconRailProps) {
  return (
    <nav className="fixed left-0 top-0 z-30 flex h-full w-16 flex-col items-center justify-between border-r border-border bg-background py-6">
      <div className="flex flex-col items-center gap-2">
        {items.map(({ id, icon: Icon, label }) => {
          const isActive = activePanel === id
          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              onClick={() => onSelect(id)}
              className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-card hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={1.75} />
            </button>
          )
        })}

        <button
          type="button"
          aria-label="Intelligence briefing"
          title="Intelligence briefing"
          onClick={() => onSelect('briefing')}
          className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${activePanel === 'briefing' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}
        >
          <Sparkles size={20} strokeWidth={1.75} />
        </button>
      </div>

      <button
        type="button"
        aria-label="Settings"
        onClick={() => onSelect('settings')}
        className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
          activePanel === 'settings'
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-card hover:text-foreground'
        }`}
      >
        <Settings size={20} strokeWidth={1.75} />
      </button>
    </nav>
  )
}