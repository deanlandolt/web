<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

/**
 * AsciiArt — a rotating shape rendered as shaded, colored ASCII art that fills
 * the viewport as a background element. Pure math: no three.js, no WebGL — just
 * trigonometry, a character ramp, and per-character hue.
 *
 * Based on the classic donut.c approach (Andy Sloane): sample the torus
 * surface, compute a surface normal at each point, dot it with a light
 * direction for diffuse shading, and map the luminance to a character from
 * ' .:-=+*#%@'. A depth buffer ensures only the nearest surface points are
 * drawn (hidden-surface removal). Backfaces are dimmed (not culled) to keep
 * the silhouette solid while reducing see-through bleed.
 *
 * Color: hue is determined by position around the ring (phi angle), producing
 * rainbow bands that rotate visibly as the torus spins — making the topology
 * obvious. Lightness tracks the diffuse luminance.
 *
 * The grid is large (160×60) so the torus floats in a wide field of space
 * and never gets clipped at the edges. The <pre> is fixed-position, filling
 * the viewport behind the hero content. Drag to rotate; idles with a slow
 * auto-spin plus a gentle tilt wobble. Honors prefers-reduced-motion.
 */

const stage = ref<HTMLPreElement | null>(null)
const grid = ref<HTMLElement | null>(null)

// Character grid resolution — large so the torus sits in a wide field.
const COLS = 160
const ROWS = 60
// Character ramp: sparse (space) to dense (@). Luminance maps here.
const RAMP = ' .:-=+*#%@'

// Torus parameters.
const R1 = 1.0 // minor radius (tube thickness)
const R2 = 2.0 // major radius (center of tube to torus center)
const K2 = 5.0 // distance from camera to torus center
// K1: projection scale. Fixed (not derived from COLS) so the torus is a
// reasonable size within the large grid — about 100 chars wide, 48 tall.
const K1 = 80

// Sampling resolution around the torus surface.
const THETA_STEPS = 120
const PHI_STEPS = 120

let raf = 0
let mounted = true
let dragging = false
let last = { x: 0, y: 0 }
let idleTimer = 0
let startTime = 0
let lastFrame = 0
let prefersReducedMotion = false

// Per-character span grid (created once on mount, updated each frame).
let spans: HTMLSpanElement[] = []

const rot = { x: 0.5, y: 0 }
const target = { x: 0.5, y: 0 }

/**
 * Map luminance (-1..1) and phi (0..2π) to an HSL color string.
 * Hue from phi → rainbow bands around the ring.
 * Lightness from luminance → 3D shading.
 * Backfaces (nz ≤ 0) are dimmed to reduce see-through.
 */
function shadeColor(lum: number, phi: number, nz: number): string {
  const l = Math.max(0, Math.min(1, (lum + 1) * 0.5))
  const hue = ((phi / (Math.PI * 2)) * 360) % 360
  const lightness = 15 + l * 55
  const dim = nz <= 0 ? 0.2 : 1.0
  return `hsl(${hue.toFixed(0)},75%,${(lightness * dim).toFixed(0)}%)`
}

function renderFrame(): void {
  if (!spans.length) return
  const A = rot.x
  const B = rot.y
  const cosA = Math.cos(A),
    sinA = Math.sin(A)
  const cosB = Math.cos(B),
    sinB = Math.sin(B)

  // Light direction (normalized): upper-left-front.
  const lx = 0,
    ly = -0.7071,
    lz = 0.7071

  // Reset grid — clear text and color for all cells.
  const total = COLS * ROWS
  for (let i = 0; i < total; i++) {
    const s = spans[i]
    if (s.textContent !== ' ') s.textContent = ' '
    if (s.style.color !== '') s.style.color = ''
  }

  const zBuf = new Float64Array(total).fill(-Infinity)

  for (let ti = 0; ti < THETA_STEPS; ti++) {
    const theta = (ti / THETA_STEPS) * Math.PI * 2
    const ct = Math.cos(theta),
      st = Math.sin(theta)

    for (let pi = 0; pi < PHI_STEPS; pi++) {
      const phi = (pi / PHI_STEPS) * Math.PI * 2
      const cp = Math.cos(phi),
        sp = Math.sin(phi)

      // Point on torus surface.
      const circleX = R2 + R1 * ct
      let x = circleX * cp
      let y = R1 * st
      let z = circleX * sp

      // Surface normal (outward from tube center).
      let nx = ct * cp
      let ny = st
      let nz = ct * sp

      // Rotate around Y by B (spin).
      const x1 = x * cosB - z * sinB
      const z1 = x * sinB + z * cosB
      x = x1
      z = z1
      const nx1 = nx * cosB - nz * sinB
      const nz1 = nx * sinB + nz * cosB
      nx = nx1
      nz = nz1

      // Rotate around X by A (tilt).
      const y2 = y * cosA - z * sinA
      const z2 = y * sinA + z * cosA
      y = y2
      z = z2
      const ny2 = ny * cosA - nz * sinA
      const nz2 = ny * sinA + nz * cosA
      ny = ny2
      nz = nz2

      const ooz = 1 / (z + K2)
      const sx = Math.floor(COLS / 2 + K1 * ooz * x)
      const sy = Math.floor(ROWS / 2 - K1 * ooz * y)

      if (sx < 0 || sx >= COLS || sy < 0 || sy >= ROWS) continue

      const idx = sy * COLS + sx
      if (ooz > zBuf[idx]) {
        zBuf[idx] = ooz
        let lum = nx * lx + ny * ly + nz * lz
        // Dim backfaces to reduce bleed-through while keeping silhouette.
        if (nz <= 0) lum *= 0.3
        const li = Math.max(
          0,
          Math.min(
            RAMP.length - 1,
            Math.floor((lum + 1) * 0.5 * (RAMP.length - 1))
          )
        )
        const ch = RAMP[li]
        const s = spans[idx]
        if (ch !== ' ') {
          s.textContent = ch
          s.style.color = shadeColor(lum, phi, nz)
        }
      }
    }
  }
}

function animate(t: number): void {
  if (!mounted) return
  raf = requestAnimationFrame(animate)
  // Throttle to ~30fps to keep the per-character color updates light.
  if (t - lastFrame < 33) return
  lastFrame = t
  if (!dragging && !prefersReducedMotion) {
    idleTimer++
    if (idleTimer > 30) {
      // Slow spin.
      target.y += 0.0025
      // Gentle tilt wobble — sinusoidal bob over ~16s. Kept within the
      // safe band (0.35..0.65) so the torus tips but never flips.
      const dt = (t - startTime) * 0.001
      target.x = 0.5 + Math.sin(dt * 0.38) * 0.15
    }
  }
  rot.x += (target.x - rot.x) * 0.06
  rot.y += (target.y - rot.y) * 0.06
  renderFrame()
}

function pointerDown(e: PointerEvent) {
  dragging = true
  last = { x: e.clientX, y: e.clientY }
  idleTimer = 0
  ;(e.target as Element).setPointerCapture?.(e.pointerId)
}
function pointerMove(e: PointerEvent) {
  if (!dragging) return
  target.y += (e.clientX - last.x) * 0.008
  target.x += (e.clientY - last.y) * 0.008
  // Clamp tilt so the torus tips but never flips over — keep the top
  // face visible at all times. 0.15..0.85 rad ≈ 8.5°..49° from horizontal.
  target.x = Math.max(0.15, Math.min(0.85, target.x))
  last = { x: e.clientX, y: e.clientY }
  idleTimer = 0
}
function pointerUp() {
  dragging = false
}

onMounted(() => {
  if (!stage.value || !grid.value) return
  prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  startTime = performance.now()

  // Build the per-character span grid once. Each frame we only update
  // textContent and style.color — no innerHTML parsing, so it's fast.
  const el = grid.value
  const frag = document.createDocumentFragment()
  spans = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const s = document.createElement('span')
      s.textContent = ' '
      frag.appendChild(s)
      spans.push(s)
    }
    frag.appendChild(document.createTextNode('\n'))
  }
  el.appendChild(frag)

  el.addEventListener('pointerdown', pointerDown)
  window.addEventListener('pointermove', pointerMove)
  window.addEventListener('pointerup', pointerUp)
  animate(performance.now())
})

onBeforeUnmount(() => {
  mounted = false
  cancelAnimationFrame(raf)
  window.removeEventListener('pointermove', pointerMove)
  window.removeEventListener('pointerup', pointerUp)
})
</script>

<template>
  <pre
    ref="stage"
    class="dl-ascii-art"
    aria-label="A rotating, colorfully shaded ASCII-art shape — drag to rotate"
    role="img"
  ><code ref="grid"></code></pre>
</template>
