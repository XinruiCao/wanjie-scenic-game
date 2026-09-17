<template>
  <view class="characterportrait-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Character UI: CharacterPortrait */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.characterportrait-root { display: contents; }
</style>
