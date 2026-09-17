<template><view class="asset-image" :aria-label="alt" :style="{'--asset-position':position}"><image v-if="resolved && !failed" class="asset-image__image" :src="resolved" :mode="mode" :lazy-load="lazy" @error="onError"/><view v-else-if="dev" class="asset-image__missing">MISSING ASSET · {{asset || src}}</view></view></template>
<script setup lang="ts">
import {computed,ref,watch} from 'vue'
import {assetPaths} from '../../config/ui-assets'
const props=withDefaults(defineProps<{asset?:string;src?:string;fallback?:string;alt?:string;fit?:'cover'|'contain'|'fill';lazy?:boolean;position?:string}>(),{fit:'cover',lazy:true,alt:'',position:'center'})
const failed=ref(false),usingFallback=ref(false),dev=import.meta.env.DEV
const resolve=(key?:string)=>key?(assetPaths[key] || (key.startsWith('/')?key:undefined)):undefined
const resolved=computed(()=>resolve(usingFallback.value?props.fallback:(props.asset||props.src)) || resolve(props.fallback))
const mode=computed(()=>({cover:'aspectFill',contain:'aspectFit',fill:'scaleToFill'} as const)[props.fit])
function onError(){if(props.fallback&&!usingFallback.value)usingFallback.value=true;else failed.value=true}
watch(()=>[props.asset,props.src,props.fallback],()=>{failed.value=false;usingFallback.value=false})
</script><style scoped>:where(.asset-image){position:relative;width:100%;height:100%;overflow:hidden;pointer-events:none}.asset-image__image{width:100%;height:100%;display:block}.asset-image__missing{font-size:10px;color:#e8ba7b;background:#18120b;padding:4px}.asset-image__image :deep(div){background-position:var(--asset-position,center)!important}.asset-image__image :deep(img){object-position:var(--asset-position,center)} </style>
