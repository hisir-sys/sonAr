import type { PanelId, ProjectionMode, ImageryMode } from '../types'
import type { FeatureCollection, LayerKey, LayerState, LayerStatuses, MapCenter } from '../data/useIntelligenceData'

import GlobalLayersPanel from '../panels/GlobalLayersPanel'
import LocalLayersPanel from '../panels/LocalLayersPanel'
import SearchPanel from '../panels/SearchPanel'
import SettingsPanel from '../panels/SettingsPanel'
import BriefingPanel from '../panels/BriefingPanel'

interface Props {
  activePanel: PanelId | null
  onClose: () => void
  onLocationSelect: (location: { lat: number; lon: number; name: string }) => void
  activeLayers: LayerState
  onToggleLayer: (key: LayerKey, enabled: boolean) => void
  statuses: LayerStatuses
  data: Record<LayerKey, FeatureCollection>
  center: MapCenter
  selectedLocation: { lat: number; lon: number; name: string } | null
  dayNightEnabled: boolean
  onDayNightChange: (enabled: boolean) => void
  onResetLayers: () => void
  onRefresh: () => void
  projectionMode: ProjectionMode
  imageryMode: ImageryMode
  geminiApiKey: string
  onGeminiApiKeyChange: (value: string) => void
}

export default function PanelContainer({
  activePanel,
  onClose,
  onLocationSelect,
  activeLayers,
  onToggleLayer,
  statuses,
  data,
  center,
  selectedLocation,
  dayNightEnabled,
  onDayNightChange,
  onResetLayers,
  onRefresh,
  projectionMode,
  imageryMode,
  geminiApiKey,
  onGeminiApiKeyChange,
}: Props) {
  const isOpen = activePanel !== null

  return (
    <div className={`fixed left-16 top-0 z-20 h-[calc(100%-1.75rem)] w-[min(20rem,calc(100vw-4rem))] border-r border-border bg-background/95 backdrop-blur-xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+4rem)]'}`}>
      {activePanel === 'global' && <GlobalLayersPanel onClose={onClose} activeLayers={activeLayers} statuses={statuses} onToggle={onToggleLayer} />}
      {activePanel === 'local' && <LocalLayersPanel onClose={onClose} activeLayers={activeLayers} statuses={statuses} onToggle={onToggleLayer} />}
      {activePanel === 'search' && <SearchPanel onClose={onClose} onLocationSelect={onLocationSelect} />}
      {activePanel === 'briefing' && <BriefingPanel onClose={onClose} activeLayers={activeLayers} statuses={statuses} data={data} center={center} selectedLocation={selectedLocation} onRefresh={onRefresh} geminiApiKey={geminiApiKey} />}
      {activePanel === 'settings' && <SettingsPanel onClose={onClose} dayNightEnabled={dayNightEnabled} onDayNightChange={onDayNightChange} onResetLayers={onResetLayers} projectionMode={projectionMode} imageryMode={imageryMode} geminiApiKey={geminiApiKey} onGeminiApiKeyChange={onGeminiApiKeyChange} />}
    </div>
  )
}
