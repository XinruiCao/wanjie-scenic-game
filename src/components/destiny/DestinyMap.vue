<template>
  <view class="destinymap-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Destiny UI: DestinyMap */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.destinymap-root { display: contents; }
</style>
