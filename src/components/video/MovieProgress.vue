<template>
  <view class="movieprogress-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Video UI: MovieProgress */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.movieprogress-root { display: contents; }
</style>
