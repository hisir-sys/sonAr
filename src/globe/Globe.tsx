import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import type {
  ProjectionMode,
  ImageryMode,
} from '../types'

import {
  mapStyle,
  satStyle,
} from './style'

interface GlobeProps {
  projectionMode: ProjectionMode
  imageryMode: ImageryMode
}

export default function Globe({
  projectionMode,
  imageryMode,
}: GlobeProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null)

  const mapRef =
    useRef<maplibregl.Map | null>(null)

  const projectionRef =
    useRef<ProjectionMode>(projectionMode)

  const imageryRef =
    useRef<ImageryMode>(imageryMode)

  const readyRef =
    useRef(false)

  /*
   * Always keep the latest projection available
   * to MapLibre callbacks.
   */
  useEffect(() => {
    projectionRef.current =
      projectionMode
  }, [projectionMode])

  /*
   * Create MapLibre once.
   */
  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const map =
      new maplibregl.Map({
        container: containerRef.current,

        style:
          imageryMode === 'sat'
            ? satStyle
            : mapStyle,

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

    /*
     * Apply the currently selected projection.
     */
    const applyProjection = () => {
      if (!readyRef.current) {
        return
      }

      if (
        projectionRef.current === '3d'
      ) {
        map.setProjection({
          type: 'globe',
        })
      } else {
        map.setProjection({
          type: 'mercator',
        })
      }

      map.resize()
      map.triggerRepaint()
    }

    /*
     * Every time a style finishes loading,
     * restore the selected projection.
     */
    const handleStyleLoad = () => {
      console.log(
        'SONAR: style loaded',
      )

      readyRef.current = true

      applyProjection()
    }

    map.on(
      'style.load',
      handleStyleLoad,
    )

    const handleResize = () => {
      map.resize()
    }

    window.addEventListener(
      'resize',
      handleResize,
    )

    return () => {
      readyRef.current = false

      window.removeEventListener(
        'resize',
        handleResize,
      )

      map.off(
        'style.load',
        handleStyleLoad,
      )

      map.remove()

      mapRef.current = null
    }
  }, [])

  /*
   * 3D / 2D
   *
   * This is completely independent from MAP / SAT.
   */
  useEffect(() => {
    const map = mapRef.current

    if (
      !map ||
      !readyRef.current
    ) {
      return
    }

    console.log(
      'SONAR projection:',
      projectionMode,
    )

    if (
      projectionMode === '3d'
    ) {
      map.setProjection({
        type: 'globe',
      })
    } else {
      map.setProjection({
        type: 'mercator',
      })
    }

    map.resize()
    map.triggerRepaint()
  }, [projectionMode])

  /*
   * MAP / SAT
   */
  useEffect(() => {
    const map = mapRef.current

    if (
      !map ||
      !readyRef.current
    ) {
      return
    }

    /*
     * Do NOT compare against imageryRef here.
     * React already tells us that imageryMode changed.
     */
    console.log(
      'SONAR imagery:',
      imageryMode,
    )

    const nextStyle =
      imageryMode === 'sat'
        ? satStyle
        : mapStyle

    /*
     * Update the ref so future style loads know
     * which imagery is selected.
     */
    imageryRef.current =
      imageryMode

    /*
     * Keep the current projection.
     */
    const selectedProjection =
      projectionRef.current

    /*
     * When the new style finishes loading,
     * restore the current 3D/2D mode.
     */
    const handleNewStyle = () => {
      console.log(
        'SONAR new style ready:',
        imageryMode,
      )

      if (
        selectedProjection === '3d'
      ) {
        map.setProjection({
          type: 'globe',
        })
      } else {
        map.setProjection({
          type: 'mercator',
        })
      }

      map.resize()
      map.triggerRepaint()
    }

    map.once(
      'style.load',
      handleNewStyle,
    )

    map.setStyle(
      nextStyle,
      {
        diff: false,
      },
    )
  }, [imageryMode])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      style={{
        width: '100%',
        height: '100%',
        background: '#000000',
      }}
    />
  )
}