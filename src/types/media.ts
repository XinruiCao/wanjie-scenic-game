/** Media asset reference */
export type MediaKind = 'video' | 'poster' | 'image' | 'audio' | 'font'

export interface MediaAsset {
  id: string
  kind: MediaKind
  path: string
  chapter?: string
  labels?: string[]
}
