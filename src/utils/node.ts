/** Node id helpers */
export function isVideoNode(id: string) {
  return id.startsWith('V_') || id.startsWith('V')
}

export function isEndingNode(id: string) {
  return id.startsWith('END')
}

