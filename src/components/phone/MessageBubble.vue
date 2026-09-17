<template>
  <view class="messagebubble-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Phone UI: MessageBubble */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.messagebubble-root { display: contents; }
</style>
