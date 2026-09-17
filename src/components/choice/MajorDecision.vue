<template>
  <view class="majordecision-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** 重大命运选择面板 */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.majordecision-root { display: contents; }
</style>
