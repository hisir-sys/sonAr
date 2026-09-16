import type {
  CustomLayerInterface,
} from 'maplibre-gl'

interface ShaderDescription {
  variantName: string
  vertexShaderPrelude: string
  define: string
}

interface DayNightLayer
  extends CustomLayerInterface {
  shaderMap: Map<
    string,
    WebGLProgram
  >

  buffer: WebGLBuffer | null

  aPos: number

  uSun:
    WebGLUniformLocation | null

  uColor:
    WebGLUniformLocation | null

  uAlpha:
    WebGLUniformLocation | null

  getShader: (
    gl: WebGL2RenderingContext,
    shaderDescription: ShaderDescription,
  ) => WebGLProgram
}

function getSunPosition() {
  const now = new Date()

  const julianDate =
    now.getTime() / 86400000 +
    2440587.5

  const days =
    julianDate - 2451545.0

  const meanLongitude =
    (280.460 +
      0.9856474 * days) %
    360

  const meanAnomaly =
    ((357.528 +
      0.9856003 * days) *
      Math.PI) /
    180

  const eclipticLongitude =
    meanLongitude +
    1.915 *
      Math.sin(meanAnomaly) +
    0.020 *
      Math.sin(
        2 * meanAnomaly,
      )

  const lambda =
    (eclipticLongitude *
      Math.PI) /
    180

  const obliquity =
    ((23.439 -
      0.0000004 * days) *
      Math.PI) /
    180

  const declination =
    Math.asin(
      Math.sin(obliquity) *
        Math.sin(lambda),
    )

  const rightAscension =
    Math.atan2(
      Math.cos(obliquity) *
        Math.sin(lambda),
      Math.cos(lambda),
    )

  const greenwichMeanSiderealTime =
    (280.46061837 +
      360.98564736629 *
        (julianDate -
          2451545.0)) %
    360

  const solarLongitude =
    ((rightAscension *
      180) /
      Math.PI -
      greenwichMeanSiderealTime +
      540) %
      360 -
    180

  return {
    longitude:
      (solarLongitude *
        Math.PI) /
      180,

    latitude:
      declination,
  }
}

function getSunVector() {
  const sun =
    getSunPosition()

  const cosLatitude =
    Math.cos(sun.latitude)

  return [
    cosLatitude *
      Math.cos(
        sun.longitude,
      ),

    cosLatitude *
      Math.sin(
        sun.longitude,
      ),

    Math.sin(
      sun.latitude,
    ),
  ]
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader =
    gl.createShader(type)

  if (!shader) {
    throw new Error(
      'SONAR: could not create shader',
    )
  }

  gl.shaderSource(
    shader,
    source,
  )

  gl.compileShader(shader)

  if (
    !gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS,
    )
  ) {
    const error =
      gl.getShaderInfoLog(
        shader,
      )

    gl.deleteShader(shader)

    throw new Error(
      `SONAR shader error: ${error}`,
    )
  }

  return shader
}

export function createDayNightLayer():
  CustomLayerInterface {
  const layer =
    {} as DayNightLayer

  layer.id =
    'sonar-day-night'

  layer.type =
    'custom'

  layer.renderingMode =
    '2d'

  layer.shaderMap =
    new Map()

  layer.buffer = null

  layer.aPos = -1

  layer.uSun = null

  layer.uColor = null

  layer.uAlpha = null

  layer.getShader = (
    gl,
    shaderDescription,
  ) => {
    const cached =
      layer.shaderMap.get(
        shaderDescription.variantName,
      )

    if (cached) {
      return cached
    }

    const vertexSource = `#version 300 es

      ${shaderDescription.vertexShaderPrelude}
      ${shaderDescription.define}

      in vec2 a_pos;

      out vec2 v_world;

      void main() {
        v_world = a_pos;

        gl_Position =
          projectTile(a_pos);
      }
    `

    const fragmentSource = `#version 300 es

      precision highp float;

      in vec2 v_world;

      uniform vec3 u_sun;
      uniform vec3 u_color;
      uniform float u_alpha;

      out vec4 fragColor;

      const float PI =
        3.141592653589793;

      void main() {

        /*
         * Keep the custom overlay away
         * from the extreme projection edges.
         */
        if (
          v_world.y <= 0.002 ||
          v_world.y >= 0.998
        ) {
          discard;
        }

        /*
         * Convert world coordinates
         * into longitude and latitude.
         */
        float longitude =
          (v_world.x - 0.5) *
          2.0 *
          PI;

        float latitude =
          atan(
            sinh(
              PI *
              (
                1.0 -
                2.0 *
                v_world.y
              )
            )
          );

        /*
         * Earth's surface normal.
         */
        vec3 surfaceNormal =
          normalize(
            vec3(
              cos(latitude) *
                cos(longitude),

              cos(latitude) *
                sin(longitude),

              sin(latitude)
            )
          );

        /*
         * Sun illumination.
         */
        float illumination =
          dot(
            surfaceNormal,
            normalize(u_sun)
          );

        /*
         * Soft night transition.
         */
        float night =
          1.0 -
          smoothstep(
            -0.22,
            0.12,
            illumination
          );

        /*
         * Subtle twilight band.
         */
        float twilight =
          1.0 -
          smoothstep(
            -0.30,
            0.04,
            illumination
          );

        /*
         * Blend night and twilight.
         */
        float darkness =
          mix(
            night,
            twilight,
            0.30
          );

        /*
         * Smoothly fade the custom layer
         * toward both polar projection edges.
         *
         * This removes the small circular
         * artifact without affecting the
         * main day/night boundary.
         */
        float polarFade =
          smoothstep(
            0.08,
            0.16,
            v_world.y
          ) *
          (
            1.0 -
            smoothstep(
              0.84,
              0.92,
              v_world.y
            )
          );

        /*
         * Final subtle darkness.
         */
        float alpha =
          darkness *
          u_alpha *
          0.55 *
          polarFade;

        fragColor =
          vec4(
            u_color,
            alpha
          );
      }
    `

    const vertexShader =
      createShader(
        gl,
        gl.VERTEX_SHADER,
        vertexSource,
      )

    const fragmentShader =
      createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentSource,
      )

    const program =
      gl.createProgram()

    if (!program) {
      gl.deleteShader(
        vertexShader,
      )

      gl.deleteShader(
        fragmentShader,
      )

      throw new Error(
        'SONAR: could not create day/night program',
      )
    }

    gl.attachShader(
      program,
      vertexShader,
    )

    gl.attachShader(
      program,
      fragmentShader,
    )

    gl.linkProgram(program)

    if (
      !gl.getProgramParameter(
        program,
        gl.LINK_STATUS,
      )
    ) {
      const error =
        gl.getProgramInfoLog(
          program,
        )

      gl.deleteProgram(
        program,
      )

      throw new Error(
        `SONAR program error: ${error}`,
      )
    }

    gl.deleteShader(
      vertexShader,
    )

    gl.deleteShader(
      fragmentShader,
    )

    layer.aPos =
      gl.getAttribLocation(
        program,
        'a_pos',
      )

    layer.uSun =
      gl.getUniformLocation(
        program,
        'u_sun',
      )

    layer.uColor =
      gl.getUniformLocation(
        program,
        'u_color',
      )

    layer.uAlpha =
      gl.getUniformLocation(
        program,
        'u_alpha',
      )

    layer.shaderMap.set(
      shaderDescription.variantName,
      program,
    )

    return program
  }

  layer.onAdd = (
    _map,
    gl,
  ) => {
    /*
     * Subdivided world mesh.
     *
     * The subdivision allows MapLibre
     * to project the effect smoothly
     * onto the globe.
     */
    const columns = 64
    const rows = 32

    const vertices: number[] = []

    for (
      let row = 0;
      row < rows;
      row++
    ) {
      /*
       * Small margin around the poles
       * prevents projection artifacts.
       */
      const y0 =
        Math.max(
          0.002,
          row / rows,
        )

      const y1 =
        Math.min(
          0.998,
          (row + 1) / rows,
        )

      for (
        let column = 0;
        column < columns;
        column++
      ) {
        const x0 =
          column / columns

        const x1 =
          (column + 1) /
          columns

        vertices.push(
          x0,
          y0,

          x1,
          y0,

          x0,
          y1,

          x0,
          y1,

          x1,
          y0,

          x1,
          y1,
        )
      }
    }

    layer.buffer =
      gl.createBuffer()

    if (!layer.buffer) {
      throw new Error(
        'SONAR: could not create day/night buffer',
      )
    }

    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      layer.buffer,
    )

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        vertices,
      ),
      gl.STATIC_DRAW,
    )

    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      null,
    )
  }

  layer.render = (
    gl,
    args,
  ) => {
    const program =
      layer.getShader(
        gl,
        args.shaderData,
      )

    gl.useProgram(program)

    /*
     * MapLibre projection uniforms.
     */
    gl.uniformMatrix4fv(
      gl.getUniformLocation(
        program,
        'u_projection_fallback_matrix',
      ),
      false,
      args
        .defaultProjectionData
        .fallbackMatrix,
    )

    gl.uniformMatrix4fv(
      gl.getUniformLocation(
        program,
        'u_projection_matrix',
      ),
      false,
      args
        .defaultProjectionData
        .mainMatrix,
    )

    gl.uniform4f(
      gl.getUniformLocation(
        program,
        'u_projection_tile_mercator_coords',
      ),
      ...args
        .defaultProjectionData
        .tileMercatorCoords,
    )

    gl.uniform4f(
      gl.getUniformLocation(
        program,
        'u_projection_clipping_plane',
      ),
      ...args
        .defaultProjectionData
        .clippingPlane,
    )

    gl.uniform1f(
      gl.getUniformLocation(
        program,
        'u_projection_transition',
      ),
      args
        .defaultProjectionData
        .projectionTransition,
    )

    /*
     * Current Sun direction.
     */
    const sun =
      getSunVector()

    gl.uniform3f(
      layer.uSun,
      sun[0],
      sun[1],
      sun[2],
    )

    /*
     * Dark navy night color.
     */
    gl.uniform3f(
      layer.uColor,
      0.025,
      0.045,
      0.075,
    )

    /*
     * Overall effect strength.
     */
    gl.uniform1f(
      layer.uAlpha,
      0.58,
    )

    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      layer.buffer,
    )

    gl.enableVertexAttribArray(
      layer.aPos,
    )

    gl.vertexAttribPointer(
      layer.aPos,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    )

    gl.disable(
      gl.DEPTH_TEST,
    )

    gl.disable(
      gl.CULL_FACE,
    )

    gl.enable(
      gl.BLEND,
    )

    gl.blendFunc(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
    )

    const vertexCount =
      64 *
      32 *
      6

    gl.drawArrays(
      gl.TRIANGLES,
      0,
      vertexCount,
    )

    gl.disableVertexAttribArray(
      layer.aPos,
    )

    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      null,
    )

    gl.disable(
      gl.BLEND,
    )
  }

  layer.onRemove = (
    _map,
    gl,
  ) => {
    if (layer.buffer) {
      gl.deleteBuffer(
        layer.buffer,
      )

      layer.buffer = null
    }

    layer.shaderMap.forEach(
      (program) => {
        gl.deleteProgram(
          program,
        )
      },
    )

    layer.shaderMap.clear()
  }

  return layer
}