<template>
  <view class="safearea-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Common UI: SafeArea */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.safearea-root { display: contents; }
</style>
