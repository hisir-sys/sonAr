import { useEffect, useRef, useState } from 'react'

import * as maplibregl from 'maplibre-gl'

import 'maplibre-gl/dist/maplibre-gl.css'

import './navigation.css'

import type {
  ProjectionMode,
  ImageryMode,
} from '../types'

import {
  mapStyle,
  satStyle,
} from './style'

import { createDayNightLayer } from './dayNight'

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
    useRef<ProjectionMode>(
      projectionMode,
    )

  const readyRef =
    useRef(false)

  const [bearing, setBearing] =
    useState(0)

  const [scaleLabel, setScaleLabel] =
    useState('300 km')

  const [scaleWidth, setScaleWidth] =
    useState(90)

  /*
   * Keep latest projection available
   * to the MapLibre lifecycle.
   */
  useEffect(() => {
    projectionRef.current =
      projectionMode
  }, [projectionMode])

  /*
   * Create MapLibre ONCE.
   */
  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const map =
      new maplibregl.Map({
        container:
          containerRef.current,

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
     * -----------------------------
     * Navigation state
     * -----------------------------
     */

    const updateNavigation =
      () => {
        setBearing(
          map.getBearing(),
        )

        const zoom =
          map.getZoom()

        /*
         * Visual scale indicator.
         *
         * This is intentionally a
         * SONAR-style approximation,
         * not MapLibre's default widget.
         */
        if (zoom < 1.5) {
          setScaleLabel('3000 km')
          setScaleWidth(112)
        } else if (zoom < 2.5) {
          setScaleLabel('1000 km')
          setScaleWidth(108)
        } else if (zoom < 3.5) {
          setScaleLabel('500 km')
          setScaleWidth(100)
        } else if (zoom < 4.5) {
          setScaleLabel('300 km')
          setScaleWidth(92)
        } else if (zoom < 5.5) {
          setScaleLabel('100 km')
          setScaleWidth(84)
        } else if (zoom < 7) {
          setScaleLabel('50 km')
          setScaleWidth(76)
        } else if (zoom < 9) {
          setScaleLabel('20 km')
          setScaleWidth(68)
        } else {
          setScaleLabel('5 km')
          setScaleWidth(58)
        }
      }

    /*
     * -----------------------------
     * Day / night
     * -----------------------------
     */

    const addDayNight =
      () => {
        if (
          !readyRef.current
        ) {
          return
        }

        if (
          map.getLayer(
            'sonar-day-night',
          )
        ) {
          return
        }

        try {
          map.addLayer(
            createDayNightLayer(),
          )

          console.log(
            'SONAR: day/night layer added',
          )
        } catch (error) {
          console.error(
            'SONAR: failed to add day/night layer',
            error,
          )
        }
      }

    /*
     * -----------------------------
     * Projection
     * -----------------------------
     */

    const applyProjection =
      () => {
        /*
         * VERY IMPORTANT:
         *
         * Never call setProjection
         * before style.load.
         */
        if (
          !readyRef.current
        ) {
          return
        }

        try {
          if (
            projectionRef.current ===
            '3d'
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
        } catch (error) {
          console.error(
            'SONAR: projection error',
            error,
          )
        }
      }

    /*
     * -----------------------------
     * Initial style load
     * -----------------------------
     */

    const handleStyleLoad =
      () => {
        console.log(
          'SONAR: style loaded',
        )

        /*
         * Mark MapLibre ready BEFORE
         * calling setProjection.
         */
        readyRef.current =
          true

        applyProjection()

        addDayNight()

        updateNavigation()

        map.resize()

        map.triggerRepaint()
      }

    map.on(
      'style.load',
      handleStyleLoad,
    )

    /*
     * -----------------------------
     * Navigation events
     * -----------------------------
     */

    map.on(
      'rotate',
      updateNavigation,
    )

    map.on(
      'zoom',
      updateNavigation,
    )

    /*
     * -----------------------------
     * Window resize
     * -----------------------------
     */

    const handleResize =
      () => {
        map.resize()
      }

    window.addEventListener(
      'resize',
      handleResize,
    )

    /*
     * -----------------------------
     * Cleanup
     * -----------------------------
     */

    return () => {
      readyRef.current =
        false

      window.removeEventListener(
        'resize',
        handleResize,
      )

      map.off(
        'style.load',
        handleStyleLoad,
      )

      map.off(
        'rotate',
        updateNavigation,
      )

      map.off(
        'zoom',
        updateNavigation,
      )

      map.remove()

      mapRef.current =
        null
    }
  }, [])

  /*
   * -----------------------------
   * Projection switching
   * -----------------------------
   */

  useEffect(() => {
    const map =
      mapRef.current

    /*
     * This was the source of your
     * "Style is not done loading"
     * error.
     */
    if (
      !map ||
      !readyRef.current
    ) {
      return
    }

    try {
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
    } catch (error) {
      console.error(
        'SONAR: projection switch failed',
        error,
      )
    }
  }, [projectionMode])

  /*
   * -----------------------------
   * Imagery switching
   * -----------------------------
   */

  useEffect(() => {
    const map =
      mapRef.current

    if (
      !map ||
      !readyRef.current
    ) {
      return
    }

    const nextStyle =
      imageryMode === 'sat'
        ? satStyle
        : mapStyle

    const selectedProjection =
      projectionRef.current

    /*
     * The new style must finish
     * loading BEFORE projection
     * or day/night are applied.
     */
    const handleNewStyle =
      () => {
        console.log(
          'SONAR: new style ready',
          imageryMode,
        )

        readyRef.current =
          true

        try {
          if (
            selectedProjection ===
            '3d'
          ) {
            map.setProjection({
              type: 'globe',
            })
          } else {
            map.setProjection({
              type: 'mercator',
            })
          }

          /*
           * Re-add day/night because
           * setStyle removes custom layers.
           */
          if (
            !map.getLayer(
              'sonar-day-night',
            )
          ) {
            map.addLayer(
              createDayNightLayer(),
            )
          }

          map.resize()

          map.triggerRepaint()

          updateNavigationAfterStyle()
        } catch (error) {
          console.error(
            'SONAR: style switch failed',
            error,
          )
        }
      }

    const updateNavigationAfterStyle =
      () => {
        const zoom =
          map.getZoom()

        if (zoom < 1.5) {
          setScaleLabel('3000 km')
          setScaleWidth(112)
        } else if (zoom < 2.5) {
          setScaleLabel('1000 km')
          setScaleWidth(108)
        } else if (zoom < 3.5) {
          setScaleLabel('500 km')
          setScaleWidth(100)
        } else if (zoom < 4.5) {
          setScaleLabel('300 km')
          setScaleWidth(92)
        } else if (zoom < 5.5) {
          setScaleLabel('100 km')
          setScaleWidth(84)
        } else if (zoom < 7) {
          setScaleLabel('50 km')
          setScaleWidth(76)
        } else if (zoom < 9) {
          setScaleLabel('20 km')
          setScaleWidth(68)
        } else {
          setScaleLabel('5 km')
          setScaleWidth(58)
        }
      }

    map.once(
      'style.load',
      handleNewStyle,
    )

    /*
     * During setStyle, the style is
     * temporarily NOT ready.
     */
    readyRef.current =
      false

    map.setStyle(
      nextStyle,
      {
        diff: false,
      },
    )
  }, [imageryMode])

  /*
   * -----------------------------
   * Custom controls
   * -----------------------------
   */

  const zoomIn =
    () => {
      mapRef.current?.zoomIn({
        duration: 350,
      })
    }

  const zoomOut =
    () => {
      mapRef.current?.zoomOut({
        duration: 350,
      })
    }

  const resetCompass =
    () => {
      mapRef.current?.easeTo({
        bearing: 0,
        pitch: 0,
        duration: 450,
      })
    }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      style={{
        width: '100%',
        height: '100%',
        background:
          '#000000',
      }}
    >

      {/* SONAR navigation */}

      <div className="sonar-navigation">

        <button
          type="button"
          className="sonar-nav-button sonar-compass"
          onClick={resetCompass}
          aria-label="Reset compass"
          title="Reset orientation"
        >
          <span
            className="sonar-compass-arrow"
            style={{
              transform:
                `rotate(${bearing}deg)`,
            }}
          >
            ↑
          </span>
        </button>

        <div className="sonar-nav-divider" />

        <button
          type="button"
          className="sonar-nav-button"
          onClick={zoomIn}
          aria-label="Zoom in"
        >
          +
        </button>

        <button
          type="button"
          className="sonar-nav-button"
          onClick={zoomOut}
          aria-label="Zoom out"
        >
          −
        </button>

      </div>

      {/* SONAR scale */}

      <div className="sonar-scale">

        <span className="sonar-scale-label">
          {scaleLabel}
        </span>

        <div
          className="sonar-scale-line"
          style={{
            width:
              `${scaleWidth}px`,
          }}
        >
          <span />
          <span />
        </div>

      </div>

    </div>
  )
}