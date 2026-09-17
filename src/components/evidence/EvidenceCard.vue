<template>
  <view class="evidencecard-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Evidence UI: EvidenceCard */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.evidencecard-root { display: contents; }
</style>
