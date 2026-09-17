export type FrameShape = 'light-button' | 'dark-button' | 'light-panel' | 'dark-panel'
export interface FrameSlices { x: number; y: number; edgeX: number; edgeY: number }

// Inner silhouettes in the trimmed PNG's coordinate space. These stop underneath
// the inner metal rim; decorative tips and transparent outer corners stay clear.
const silhouettes: Record<FrameShape, ReadonlyArray<readonly [number, number]>> = {
  'light-button': [[.056,.145],[.944,.145],[.978,.28],[.978,.72],[.944,.855],[.056,.855],[.022,.72],[.022,.28]],
  'dark-button': [[.12,.065],[.88,.065],[.898,.2],[.922,.37],[.934,.5],[.922,.63],[.898,.8],[.88,.935],[.12,.935],[.102,.8],[.078,.63],[.066,.5],[.078,.37],[.102,.2]],
  'light-panel': [[.075,.068],[.925,.068],[.96,.13],[.96,.87],[.925,.932],[.075,.932],[.04,.87],[.04,.13]],
  'dark-panel': [[.095,.065],[.905,.065],[.94,.12],[.961,.18],[.961,.82],[.94,.88],[.905,.935],[.095,.935],[.06,.88],[.039,.82],[.039,.18],[.06,.12]],
}

function mapAxis(value: number, slice: number, edge: number, length: number) {
  if (value <= slice) return value / slice * edge
  if (value >= 1 - slice) return length - (1 - value) / slice * edge
  return edge + (value - slice) / (1 - 2 * slice) * (length - 2 * edge)
}

export function framePolygon(shape: FrameShape, width: number, height: number, slices: FrameSlices) {
  return silhouettes[shape].map(([x, y]) => [mapAxis(x, slices.x, slices.edgeX, width), mapAxis(y, slices.y, slices.edgeY, height)] as const)
}

function cssAxis(value: number, slice: number, edge: number) {
  if (value <= slice) return `${(value / slice * edge).toFixed(3)}px`
  if (value >= 1 - slice) return `calc(100% - ${((1 - value) / slice * edge).toFixed(3)}px)`
  const t = (value - slice) / (1 - 2 * slice)
  return `calc(${(t * 100).toFixed(3)}% + ${(edge * (1 - 2 * t)).toFixed(3)}px)`
}

export function frameClipPath(shape: FrameShape, slices: FrameSlices) {
  return 'polygon(' + silhouettes[shape].map(([x, y]) => `${cssAxis(x, slices.x, slices.edgeX)} ${cssAxis(y, slices.y, slices.edgeY)}`).join(',') + ')'
}
