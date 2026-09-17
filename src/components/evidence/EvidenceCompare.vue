<template>
  <view class="evidencecompare-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Evidence UI: EvidenceCompare */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.evidencecompare-root { display: contents; }
</style>
