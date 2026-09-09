import type { PanelId } from '../types'
import GlobalLayersPanel from '../panels/GlobalLayersPanel'
import LocalLayersPanel from '../panels/LocalLayersPanel'
import SearchPanel from '../panels/SearchPanel'
import SettingsPanel from '../panels/SettingsPanel'

interface PanelContainerProps {
  activePanel: PanelId | null
  onClose: () => void
}

export default function PanelContainer({ activePanel, onClose }: PanelContainerProps) {
  const isOpen = activePanel !== null

  return (
    <div
      className={`fixed left-16 top-0 z-20 h-full w-80 border-r border-border bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+4rem)]'
      }`}
    >
      {activePanel === 'global' && <GlobalLayersPanel onClose={onClose} />}
      {activePanel === 'local' && <LocalLayersPanel onClose={onClose} />}
      {activePanel === 'search' && <SearchPanel onClose={onClose} />}
      {activePanel === 'settings' && <SettingsPanel onClose={onClose} />}
    </div>
  )
}