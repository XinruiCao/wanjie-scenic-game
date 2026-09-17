<template>
  <view class="choicecountdown-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** 选项倒计时 */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.choicecountdown-root { display: contents; }
</style>
