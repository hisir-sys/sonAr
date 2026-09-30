import { useState } from 'react'

import Globe from '../globe/Globe'
import IconRail from './IconRail'
import PanelContainer from './PanelContainer'

import type {
  PanelId,
  ProjectionMode,
  ImageryMode,
} from '../types'

const projectionModes: {
  id: ProjectionMode
  label: string
}[] = [
  { id: '3d', label: '3D' },
  { id: '2d', label: '2D' },
]

const imageryModes: {
  id: ImageryMode
  label: string
}[] = [
  { id: 'map', label: 'MAP' },
  { id: 'sat', label: 'SAT' },
]

interface SearchLocation {
  lat: number
  lon: number
  name: string
}

export default function MainScreen() {
  const [activePanel, setActivePanel] =
    useState<PanelId | null>(null)

  const [projectionMode, setProjectionMode] =
    useState<ProjectionMode>('3d')

  const [imageryMode, setImageryMode] =
    useState<ImageryMode>('map')

  const [searchLocation, setSearchLocation] =
    useState<SearchLocation | null>(null)

  const handleSelect = (panel: PanelId) => {
    setActivePanel((current) =>
      current === panel ? null : panel,
    )
  }

  const handleLocationSelect = (
    location: SearchLocation,
  ) => {
    setSearchLocation(location)

    // Close the search panel after selecting a result.
    setActivePanel(null)
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <Globe
        projectionMode={projectionMode}
        imageryMode={imageryMode}
        searchLocation={searchLocation}
      />

      <IconRail
        activePanel={activePanel}
        onSelect={handleSelect}
      />

      <PanelContainer
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
        onLocationSelect={handleLocationSelect}
      />

      {/* Projection + imagery controls */}
      <div className="fixed bottom-6 left-24 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 backdrop-blur-sm">
          {projectionModes.map(({ id, label }) => {
            const active =
              projectionMode === id

            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setProjectionMode(id)
                }
                className={`rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                  active
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 backdrop-blur-sm">
          {imageryModes.map(({ id, label }) => {
            const active =
              imageryMode === id

            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setImageryMode(id)
                }
                className={`rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                  active
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="fixed bottom-0 left-16 right-0 z-10 flex items-center justify-between border-t border-border/50 bg-background/60 px-4 py-1.5 text-[10px] text-muted-foreground backdrop-blur-sm">
        <span>sonAr</span>

        <span>
          {projectionMode.toUpperCase()} ·{' '}
          {imageryMode.toUpperCase()}
        </span>

        <span>Signal Intelligence</span>
      </div>
    </div>
  )
}