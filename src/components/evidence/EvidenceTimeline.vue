<template>
  <view class="evidencetimeline-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Evidence UI: EvidenceTimeline */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.evidencetimeline-root { display: contents; }
</style>
