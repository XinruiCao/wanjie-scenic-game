<template><view class="scenic-sprite" :style="{aspectRatio:`${rect[2]} / ${rect[3]}`}" aria-hidden="true"><image class="scenic-sprite__image" :src="asset.src" mode="scaleToFill" :style="imageStyle"/></view></template>
<script setup lang="ts">
import {computed} from 'vue'
import {scenicAssets,type ScenicAssetName} from '../../config/scenic-assets'
const props=defineProps<{name:ScenicAssetName;box?:readonly number[]}>()
const asset=computed(()=>scenicAssets[props.name])
// Bounds only remove empty alpha margins. The source remains an unchanged standalone PNG.
const rect=computed(()=>props.box||asset.value.box)
const imageStyle=computed(()=>{const [x,y,w,h]=rect.value;return {width:asset.value.size[0]/w*100+'%',height:asset.value.size[1]/h*100+'%',left:-x/w*100+'%',top:-y/h*100+'%'}})
</script>
<style scoped>.scenic-sprite{position:relative;display:block;overflow:hidden;pointer-events:none;min-width:0}.scenic-sprite__image{position:absolute!important;max-width:none!important;max-height:none!important;display:block;pointer-events:none}</style>
