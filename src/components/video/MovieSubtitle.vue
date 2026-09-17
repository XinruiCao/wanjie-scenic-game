<template>
  <view class="moviesubtitle-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Video UI: MovieSubtitle */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.moviesubtitle-root { display: contents; }
</style>
