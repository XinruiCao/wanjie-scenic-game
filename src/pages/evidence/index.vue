<template><view :data-skin="scenicSkin" class="visual-page safe"><SceneBackdrop :src="backgrounds.hospital7" :shade=".7" fractured/><TopBar title="线索档案" eyebrow="THE DETAILS REMAIN" @back="back" @settings="settings"/><view class="visual-content"><EvidenceScene :saved="saved" @save="save"/></view></view></template><script setup lang="ts">
import {goBack} from '../../utils/navigation'

import { ref } from 'vue'; import TopBar from '../../components/TopBar.vue'; import {gameStore} from '../../store/game'
import SceneBackdrop from '../../components/common/SceneBackdrop.vue';import EvidenceScene from '../../components/evidence/EvidenceScene.vue';import {backgrounds} from '../../data/backgrounds'
const saved=ref(false); function back(){goBack()}; function settings(){uni.navigateTo({url:'/pages/settings/index'})}
function save(){saved.value=true; gameStore.addClue('ring_tracker'); const n=gameStore.getNode(); if(n.type==='PAGE' && n.page==='evidence' && n.next){gameStore.setNode(n.next);uni.reLaunch({url:'/pages/play/index'})}}
</script>
