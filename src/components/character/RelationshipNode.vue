<template>
  <view class="relationshipnode-root">
    <slot />
  </view>
</template>
<script setup lang="ts">
/** Character UI: RelationshipNode */
defineProps<{ title?: string }>();
</script>
<style scoped lang="scss">
.relationshipnode-root { display: contents; }
</style>
