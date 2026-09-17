<template>
  <view class="phoneoverlay-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Phone UI: PhoneOverlay */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.phoneoverlay-root { display: contents; }
</style>
