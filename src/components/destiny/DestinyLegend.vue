<template>
  <view class="destinylegend-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Destiny UI: DestinyLegend */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.destinylegend-root { display: contents; }
</style>
