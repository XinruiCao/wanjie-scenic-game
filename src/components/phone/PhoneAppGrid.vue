<template>
  <view class="phoneappgrid-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Phone UI: PhoneAppGrid */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.phoneappgrid-root { display: contents; }
</style>
