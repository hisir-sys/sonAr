import { RotateCcw, X } from 'lucide-react'
import type { ImageryMode, ProjectionMode } from '../types'

interface Props {
  onClose: () => void
  dayNightEnabled: boolean
  onDayNightChange: (enabled: boolean) => void
  onResetLayers: () => void
  projectionMode: ProjectionMode
  imageryMode: ImageryMode
  geminiApiKey: string
  onGeminiApiKeyChange: (value: string) => void
}

export default function SettingsPanel({ onClose, dayNightEnabled, onDayNightChange, onResetLayers, projectionMode, imageryMode, geminiApiKey, onGeminiApiKeyChange }: Props) {
  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Settings</h2>
          <p className="mt-1 text-[10px] text-muted-foreground/60">Display and data preferences</p>
        </div>
        <button type="button" aria-label="Close settings" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card/40 p-3">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>
              <span className="block text-xs font-medium text-foreground">Day / night shading</span>
              <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">Solar-position overlay on the globe</span>
            </span>
            <input type="checkbox" checked={dayNightEnabled} onChange={(event) => onDayNightChange(event.target.checked)} className="h-4 w-4 accent-primary" />
          </label>
        </div>

        <div className="rounded-lg border border-border bg-card/40 p-3">
          <p className="text-xs font-medium text-foreground">Current view</p>
          <div className="mt-2 flex gap-2">
            <span className="rounded border border-border px-2 py-1 text-[10px] text-muted-foreground">{projectionMode.toUpperCase()} projection</span>
            <span className="rounded border border-border px-2 py-1 text-[10px] text-muted-foreground">{imageryMode.toUpperCase()} imagery</span>
          </div>
          <p className="mt-2 text-[10px] leading-4 text-muted-foreground">Use the controls at the bottom of the globe to switch projection and imagery. Layer points are retained when the basemap changes.</p>
        </div>

        <div className="rounded-lg border border-border bg-card/40 p-3">
          <p className="text-xs font-medium text-foreground">Layer preferences</p>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Your layer toggles are saved in this browser. Reset returns to the default set (earthquakes enabled).</p>
          <button type="button" onClick={onResetLayers} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-foreground transition-colors hover:bg-card">
            <RotateCcw size={13} /> Reset layer preferences
          </button>
        </div>

        <div className="rounded-lg border border-border bg-card/40 p-3">
          <p className="text-xs font-medium text-foreground">Gemini AI briefing</p>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Optional: add your own Gemini API key to generate a source-grounded briefing. The key is held in memory only and is not saved in this browser.</p>
          <input type="password" value={geminiApiKey} onChange={(event) => onGeminiApiKeyChange(event.target.value)} autoComplete="off" placeholder="Paste Gemini API key" aria-label="Gemini API key" className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
          <p className="mt-2 text-[9px] leading-4 text-amber-200/80">The key is sent directly from this browser to Google when you generate a briefing. Use a restricted key and clear this field when finished. Never commit it to GitHub.</p>
        </div>

        <div className="rounded-lg border border-border/60 p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Data handling</p>
          <p className="mt-2 text-[10px] leading-4 text-muted-foreground">SONAR requests public feeds directly from USGS, NASA EONET, Open-Meteo and OpenStreetMap Overpass. Network access and provider rate limits can affect availability.</p>
        </div>
      </div>
    </div>
  )
}
