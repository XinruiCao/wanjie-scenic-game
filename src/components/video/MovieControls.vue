<template>
  <view class="moviecontrols-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Video UI: MovieControls */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.moviecontrols-root { display: contents; }
</style>
