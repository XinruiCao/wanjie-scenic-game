<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { gameStore } from './store/game'

onLaunch(() => {
  gameStore.hydrate()
})
</script>

<style lang="scss">
@use "./styles/theme.scss";
@use "./styles/asset-theme.scss";
@use "./styles/responsive.scss";
@use "./styles/animations.scss";
@use "./styles/scenic.scss";
page { background: #08090b; color: #f2efe8; }
</style>
