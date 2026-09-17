<template>
  <view class="loadingline-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Common UI: LoadingLine */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.loadingline-root { display: contents; }
</style>
