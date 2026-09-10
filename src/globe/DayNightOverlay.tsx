import { useEffect, useRef } from 'react'

interface DayNightOverlayProps {
  enabled?: boolean
}

export default function DayNightOverlay({
  enabled = true,
}: DayNightOverlayProps) {
  const overlayRef =
    useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const overlay =
      overlayRef.current

    if (!overlay) {
      return
    }

    /*
     * Very subtle night-side treatment.
     *
     * This is intentionally low opacity so it does not
     * change your existing map/country colors.
     */
    overlay.style.background = `
      radial-gradient(
        ellipse 58% 70% at 72% 50%,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 4, 12, 0.04) 38%,
        rgba(0, 3, 10, 0.16) 62%,
        rgba(0, 2, 8, 0.34) 82%,
        rgba(0, 0, 0, 0.52) 100%
      )
    `
  }, [enabled])

  if (!enabled) {
    return null
  }

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2]"
    />
  )
}