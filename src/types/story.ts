/** Story node types (V/P/C/I/T/R/END) */
export type NodeKind = 'V' | 'P' | 'C' | 'I' | 'T' | 'R' | 'END'

/** Legacy-compatible node type names */
export type NodeType = 'VIDEO' | 'PAGE' | 'CHOICE' | 'IMAGE' | 'TEXT' | 'ROUTE_CLOSED' | 'ENDING'

export interface StoryNode {
  id: string
  type: NodeType
  title?: string
  chapter?: string
  video?: string
  poster?: string
  image?: string
  text?: string
  next?: string
  loopAtEnd?: boolean
  choices?: import('./choice').ChoiceItem[]
  page?: string
  payloadId?: string
  quote?: string
}
