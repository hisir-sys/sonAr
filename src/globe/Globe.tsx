import { useEffect, useRef, useState, useCallback } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './navigation.css'

import type { ProjectionMode, ImageryMode } from '../types'
import type { MapCenter } from '../data/useIntelligenceData'
import { mapStyle, satStyle } from './style'
import { createDayNightLayer } from './dayNight'

export interface SearchLocation {
  lat: number
  lon: number
  name: string
}

interface GlobeProps {
  projectionMode: ProjectionMode
  imageryMode: ImageryMode
  searchLocation?: SearchLocation | null
  onMapReady?: (map: maplibregl.Map) => void
  onMapCenterChange?: (center: MapCenter) => void
  dayNightEnabled?: boolean
}

export default function Globe({
  projectionMode,
  imageryMode,
  searchLocation,
  onMapReady,
  onMapCenterChange,
  dayNightEnabled = true,
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const projectionRef = useRef<ProjectionMode>(projectionMode)
  const readyRef = useRef(false)
  const pendingLocationRef = useRef<SearchLocation | null>(null)
  const onMapReadyRef = useRef(onMapReady)
  const onMapCenterChangeRef = useRef(onMapCenterChange)
  const dayNightEnabledRef = useRef(dayNightEnabled)

  const [bearing, setBearing] = useState(0)
  const [scaleLabel, setScaleLabel] = useState('300 km')
  const [scaleWidth, setScaleWidth] = useState(90)

  useEffect(() => { projectionRef.current = projectionMode }, [projectionMode])
  useEffect(() => { onMapReadyRef.current = onMapReady }, [onMapReady])
  useEffect(() => { onMapCenterChangeRef.current = onMapCenterChange }, [onMapCenterChange])
  useEffect(() => { dayNightEnabledRef.current = dayNightEnabled }, [dayNightEnabled])

  const syncNavigationState = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    setBearing(map.getBearing())
    const zoom = map.getZoom()
    if (zoom < 1.5) { setScaleLabel('3000 km'); setScaleWidth(112) }
    else if (zoom < 2.5) { setScaleLabel('1000 km'); setScaleWidth(108) }
    else if (zoom < 3.5) { setScaleLabel('500 km'); setScaleWidth(100) }
    else if (zoom < 4.5) { setScaleLabel('300 km'); setScaleWidth(92) }
    else if (zoom < 5.5) { setScaleLabel('100 km'); setScaleWidth(84) }
    else if (zoom < 7) { setScaleLabel('50 km'); setScaleWidth(76) }
    else if (zoom < 9) { setScaleLabel('20 km'); setScaleWidth(68) }
    else { setScaleLabel('50 km'); setScaleWidth(58) }
  }, [])

  const applyRuntimeConfig = useCallback(() => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    try {
      map.setProjection(projectionRef.current === '3d' ? { type: 'globe' } : { type: 'mercator' })
      if (dayNightEnabledRef.current) {
        if (!map.getLayer('sonar-day-night')) {
          const firstOverlay = ['earthquakes', 'fires', 'weather', 'airQuality', 'transit', 'pointsOfInterest', 'chargers']
            .map((key) => 'sonar-points-' + key)
            .find((layerId) => Boolean(map.getLayer(layerId)))
          map.addLayer(createDayNightLayer(), firstOverlay)
        }
      } else if (map.getLayer('sonar-day-night')) {
        map.removeLayer('sonar-day-night')
      }
      syncNavigationState()
      map.resize()
      map.triggerRepaint()
    } catch (error) {
      console.error('SONAR: configuration sync failed', error)
    }
  }, [syncNavigationState])

  useEffect(() => {
    if (!containerRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: imageryMode === 'sat' ? satStyle : mapStyle,
      center: [0, 20],
      zoom: 1.35,
      minZoom: 0.5,
      maxZoom: 18,
      attributionControl: false,
      renderWorldCopies: false,
      fadeDuration: 0,
      crossSourceCollisions: false,
    })
    mapRef.current = map

    const syncCenter = () => {
      const current = map.getCenter()
      onMapCenterChangeRef.current?.({ lat: current.lat, lon: current.lng })
    }
    const handleStyleLoad = () => {
      readyRef.current = true
      applyRuntimeConfig()
      onMapReadyRef.current?.(map)
      syncCenter()
      const pendingLocation = pendingLocationRef.current
      if (pendingLocation) {
        map.flyTo({ center: [pendingLocation.lon, pendingLocation.lat], zoom: 5, duration: 1400, essential: true })
        pendingLocationRef.current = null
      }
    }
    const handleResize = () => map.resize()
    map.on('style.load', handleStyleLoad)
    map.on('move', syncNavigationState)
    map.on('moveend', syncCenter)
    window.addEventListener('resize', handleResize)

    return () => {
      readyRef.current = false
      window.removeEventListener('resize', handleResize)
      map.off('style.load', handleStyleLoad)
      map.off('move', syncNavigationState)
      map.off('moveend', syncCenter)
      map.remove()
      mapRef.current = null
    }
  // The map is intentionally created once; later imagery/projection changes are handled by dedicated effects.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (readyRef.current) applyRuntimeConfig()
  }, [projectionMode, dayNightEnabled, applyRuntimeConfig])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    readyRef.current = false
    const nextStyle = imageryMode === 'sat' ? satStyle : mapStyle
    const handleStyleSwitch = () => {
      readyRef.current = true
      applyRuntimeConfig()
      onMapReadyRef.current?.(map)
      const current = map.getCenter()
      onMapCenterChangeRef.current?.({ lat: current.lat, lon: current.lng })
      const pendingLocation = pendingLocationRef.current
      if (pendingLocation) {
        map.flyTo({ center: [pendingLocation.lon, pendingLocation.lat], zoom: 5, duration: 1400, essential: true })
        pendingLocationRef.current = null
      }
    }
    map.once('style.load', handleStyleSwitch)
    map.setStyle(nextStyle, { diff: false })
    return () => { map.off('style.load', handleStyleSwitch) }
  }, [imageryMode, applyRuntimeConfig])

  useEffect(() => {
    if (!searchLocation) return
    pendingLocationRef.current = searchLocation
    const map = mapRef.current
    if (!map || !readyRef.current) return
    map.flyTo({ center: [searchLocation.lon, searchLocation.lat], zoom: 5, duration: 1400, essential: true })
    pendingLocationRef.current = null
  }, [searchLocation])

  const zoomIn = () => mapRef.current?.zoomIn({ duration: 350 })
  const zoomOut = () => mapRef.current?.zoomOut({ duration: 350 })
  const resetCompass = () => mapRef.current?.easeTo({ bearing: 0, pitch: 0, duration: 450 })

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full" style={{ width: '100%', height: '100%', background: '#000000' }}>
      <div className="sonar-navigation">
        <button type="button" className="sonar-nav-button sonar-compass" onClick={resetCompass} aria-label="Reset compass" title="Reset orientation">
          <span className="sonar-compass-arrow" style={{ transform: `rotate(${bearing}deg)` }}>↑</span>
        </button>
        <div className="sonar-nav-divider" />
        <button type="button" className="sonar-nav-button" onClick={zoomIn} aria-label="Zoom in">+</button>
        <button type="button" className="sonar-nav-button" onClick={zoomOut} aria-label="Zoom out">−</button>
      </div>
      <div className="sonar-scale">
        <span className="sonar-scale-label">{scaleLabel}</span>
        <div className="sonar-scale-line" style={{ width: `${scaleWidth}px` }}><span /><span /></div>
      </div>
    </div>
  )
}
