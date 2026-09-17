<template>
  <view class="appmodal-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Common UI: AppModal */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.appmodal-root { display: contents; }
</style>
