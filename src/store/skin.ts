import { computed } from 'vue'
import { gameStore } from './game'
import { themes, type ScenicSkin } from '../config/themes'
const unlocked = computed(() => !!gameStore.state.metaFlags.darkSkinUnlocked)
const active = computed<ScenicSkin>(() => unlocked.value && gameStore.state.metaFlags.scenicSkin === 'dark' ? 'dark' : 'light')
export const skinStore = {
 unlocked, active, theme: computed(() => themes[active.value]),
 select(skin: ScenicSkin) {
  if (skin === 'dark' && !unlocked.value) return false
  gameStore.state.metaFlags.scenicSkin = skin
  gameStore.persist()
  return true
 }
}
