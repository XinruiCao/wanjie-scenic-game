/** Settings store (placeholder) */
import { reactive } from 'vue'

export const settingsStore = reactive({
  subtitles: true,
  muted: false,
  choiceCountdown: true,
  skipSeenOnNgPlus: true,
  haptic: true,
  showNodeId: false,
})

