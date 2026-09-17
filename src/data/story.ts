import type { Condition } from '../types/condition'
import runtimeStory from './story.runtime.json'
export type NodeType = 'VIDEO' | 'PAGE' | 'CHOICE' | 'ROUTE_CLOSED' | 'ENDING'

export interface ChoiceItem {
  hint?: string
  outcome?: string
  id: string
  text: string
  next: string
  set?: Record<string, string | number | boolean>
  add?: Record<string, number>
  condition?: Condition
  disabled?: boolean
  defaultChoice?: boolean
  locked?: boolean
  evidenceIds?: string[]
  require?: Record<string, string | number | boolean>
}

export interface StoryNode {
  episode?: number
  chapterId?: string
  scene?: string
  location?: string
  effects?: {set?: Record<string,string|number|boolean>; add?: Record<string,number>}
  id: string
  type: NodeType
  title?: string
  chapter?: string
  video?: string
  poster?: string
  next?: string
  loopAtEnd?: boolean
  choices?: ChoiceItem[]
  page?: 'phone' | 'evidence' | 'destiny' | 'character'
  payloadId?: string
  quote?: string
  description?: string
  reason?: string
  returnNodeId?: string
  chapterStartNodeId?: string
  condition?: Condition
  countdown?: number
}

export const story = runtimeStory as unknown as Record<string, StoryNode>
export const endings = Object.values(story).filter(n => n.type === 'ENDING').map(n => n.id)
