<template>
  <view class="phoneshell-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Phone UI: PhoneShell */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.phoneshell-root { display: contents; }
</style>
