import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import type { ProjectionMode, ImageryMode } from '../types'
import { mapStyle, satStyle } from './style'

interface GlobeProps {
  projectionMode: ProjectionMode
  imageryMode: ImageryMode
}

export default function Globe({
  projectionMode,
  imageryMode,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const loadedRef = useRef(false)

  /*
   * CREATE MAP ONCE
   */
  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,

      // Start with MAP imagery.
      style: mapStyle,

      center: [0, 20],
      zoom: 1.6,

      minZoom: 0.5,
      maxZoom: 18,

      attributionControl: false,
      renderWorldCopies: false,

      // Keep rendering efficient.
      fadeDuration: 0,
      crossSourceCollisions: false,
    })

    mapRef.current = map

    map.once('load', () => {
      loadedRef.current = true

      map.setProjection({
        type: projectionMode === '3d' ? 'globe' : 'mercator',
      })
    })

    return () => {
      loadedRef.current = false
      map.remove()
      mapRef.current = null
    }
  }, [])

  /*
   * CHANGE PROJECTION ONLY
   *
   * 3D <-> 2D does NOT reload the map.
   * This makes switching much smoother.
   */
  useEffect(() => {
    const map = mapRef.current

    if (!map || !loadedRef.current) return

    map.setProjection({
      type: projectionMode === '3d' ? 'globe' : 'mercator',
    })
  }, [projectionMode])

  /*
   * CHANGE IMAGERY ONLY
   *
   * MAP <-> SAT requires changing the style,
   * but we do it only when imagery actually changes.
   */
  useEffect(() => {
    const map = mapRef.current
    const container = containerRef.current

    if (!map || !container || !loadedRef.current) return

    const newStyle =
      imageryMode === 'sat'
        ? satStyle
        : mapStyle

    container.style.opacity = '0'

    const handleStyleLoad = () => {
      // Restore the currently selected projection
      // after the new imagery has loaded.
      map.setProjection({
        type: projectionMode === '3d' ? 'globe' : 'mercator',
      })

      requestAnimationFrame(() => {
        container.style.opacity = '1'
      })
    }

    map.once('style.load', handleStyleLoad)

    map.setStyle(newStyle, {
      diff: false,
    })

    return () => {
      map.off('style.load', handleStyleLoad)
    }
  }, [imageryMode, projectionMode])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      style={{
        background: '#000000',
        transition: 'opacity 250ms ease',
      }}
    />
  )
}