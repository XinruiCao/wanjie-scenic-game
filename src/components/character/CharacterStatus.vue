<template>
  <view class="characterstatus-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Character UI: CharacterStatus */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.characterstatus-root { display: contents; }
</style>
