<template><view class="skin-switch" role="group" aria-label="界面皮肤"><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" :class="{chosen:skinStore.active.value==='light'}" :aria-pressed="skinStore.active.value==='light'" @click="skinStore.select('light')">☼ 山河新生</button><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" :class="{chosen:skinStore.active.value==='dark',locked:!skinStore.unlocked.value}" :aria-disabled="!skinStore.unlocked.value" :aria-pressed="skinStore.active.value==='dark'" @click="selectDark">{{skinStore.unlocked.value?'☾':'◇'}} 余烬鎏金<text v-if="!skinStore.unlocked.value" class="lock-note">通关序章解锁</text></button></view></template>
<script setup lang="ts">
import {activateFocused} from '../../utils/keyboard'
import { skinStore } from '../../store/skin'
function selectDark(){if(!skinStore.select('dark'))uni.showToast({title:'完成序章的关键抉择后，自动开启深色皮肤',icon:'none'})}
</script>
<style scoped>
.skin-switch{display:flex;gap:4px;border:1px solid var(--line);padding:4px;background:var(--panel);align-items:stretch}.skin-switch button{background:transparent;color:var(--muted);font:12px 'Songti SC',serif;margin:0;padding:9px 13px;border-radius:0;line-height:1.5;min-height:40px;cursor:pointer}.skin-switch button.chosen{background:var(--gold);color:var(--on-accent)}.skin-switch .locked{opacity:.65}.lock-note{display:block;font:9px sans-serif;letter-spacing:1px}
</style>
