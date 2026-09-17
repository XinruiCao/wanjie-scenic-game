<template>
  <view class="evidenceviewer-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Evidence UI: EvidenceViewer */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.evidenceviewer-root { display: contents; }
</style>
