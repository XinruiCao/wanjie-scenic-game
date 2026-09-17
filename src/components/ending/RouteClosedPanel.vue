<template>
  <view class="routeclosedpanel-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Ending UI: RouteClosedPanel */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.routeclosedpanel-root { display: contents; }
</style>
