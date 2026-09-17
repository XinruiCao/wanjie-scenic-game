<template><view class="scenic-frame" :class="['scenic-frame--'+kind,{'scenic-frame--dark':skinStore.active.value==='dark'}]" aria-hidden="true"><view v-if="surface" class="scenic-frame__surface" :style="{clipPath:innerClip}"><ScenicSprite v-if="texture" class="scenic-frame__texture" :name="skinStore.active.value==='dark'?'metal':'paper'"/></view><ScenicSprite v-for="(piece,i) in pieces" :key="i" :name="assetName" :box="piece" :class="'piece piece-'+i"/></view></template>
<script setup lang="ts">
import {computed} from 'vue'
import ScenicSprite from './ScenicSprite.vue'
import {skinStore} from '../../store/skin'
import {scenicAssets,type ScenicAssetName} from '../../config/scenic-assets'
import {frameClipPath} from '../../config/scenic-frame-shapes'
const props=withDefaults(defineProps<{kind?:'button'|'panel'|'dialogue'|'chapter';active?:boolean;surface?:boolean;texture?:boolean}>(),{kind:'panel'})
const assetName=computed<ScenicAssetName>(()=>{
 const dark=skinStore.active.value==='dark'
 if(props.kind==='chapter')return dark?'darkPanel':'lightPanel'
 if(props.kind==='button')return dark?(props.active?'darkActive':'darkButton'):(props.active?'lightActive':'lightButton')
 if(props.kind==='dialogue')return dark?'darkDialogue':'lightDialogue'
 return dark?'darkPanel':'lightPanel'
})
const pieces=computed(()=>{
 const [x,y,w,h]=scenicAssets[assetName.value].box
 const button=props.kind==='button'||props.kind==='dialogue'
 const sx=Math.round(w*(button?.17:.16))
 const sy=Math.round(h*(button?.27:.20))
 // Preserve generated corner art and keep the transparent center completely open.
 return [[x,y,sx,sy],[x+sx,y,w-2*sx,sy],[x+w-sx,y,sx,sy],[x,y+sy,sx,h-2*sy],[x+w-sx,y+sy,sx,h-2*sy],[x,y+h-sy,sx,sy],[x+sx,y+h-sy,w-2*sx,sy],[x+w-sx,y+h-sy,sx,sy]]
})
const innerClip=computed(()=>{
 const [, , w, h]=scenicAssets[assetName.value].box
 const button=props.kind==='button'||props.kind==='dialogue'
 return frameClipPath(`${skinStore.active.value}-${button?'button':'panel'}`,{
  x:Math.round(w*(button?.17:.16))/w,y:Math.round(h*(button?.27:.20))/h,
  edgeX:button?36:props.kind==='chapter'?20:28,edgeY:button?18:props.kind==='chapter'?20:28,
 })
})
</script>
<style scoped>
.scenic-frame{position:absolute;inset:0;pointer-events:none;z-index:1;display:grid;grid-template-columns:28px 1fr 28px;grid-template-rows:28px 1fr 28px}.scenic-frame--button,.scenic-frame--dialogue{grid-template-columns:36px 1fr 36px;grid-template-rows:18px 1fr 18px}.scenic-frame--chapter{grid-template-columns:20px 1fr 20px;grid-template-rows:20px 1fr 20px}.piece{width:100%;height:100%;aspect-ratio:auto!important}.piece-4{grid-column:3}.piece-5{grid-column:1;grid-row:3}.piece-6{grid-column:2;grid-row:3}.piece-7{grid-column:3;grid-row:3}
.scenic-frame__surface{position:absolute;inset:0;background:var(--scenic-fill,var(--panel,#131b20e8))}.scenic-frame__texture{position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto!important;opacity:.14}.scenic-frame--dark .scenic-frame__texture{filter:invert(1);opacity:.1}
</style>
