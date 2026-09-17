/**
 * Story module entry.
 * Compatible bridge: re-exports legacy data from src/data/story.ts
 * until nodes/choices/endings are fully migrated.
 */
export {
  story,
  endings,
  type NodeType,
  type ChoiceItem,
  type StoryNode,
} from '../data/story'

export const storyVersion = 'legacy-bridge-0.1.0'
