<template>
  <view class="videolooplayer-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Video UI: VideoLoopLayer */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.videolooplayer-root { display: contents; }
</style>
