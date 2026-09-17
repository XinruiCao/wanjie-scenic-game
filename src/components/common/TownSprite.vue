<template><view class="town-sprite" :style="style" aria-hidden="true"/></template>
<script setup lang="ts">
import {computed} from 'vue';import {townSprites} from '../../data/town';
const props=defineProps<{name:string}>();const style=computed(()=>{const a=townSprites[props.name]||townSprites.board;const [x,y,w,h]=a.box,[sw,sh]=a.size;return {aspectRatio:`${w}/${h}`,backgroundImage:`url(/static/scenic/town/${a.sheet}.png)`,backgroundSize:`${sw/w*100}% ${sh/h*100}%`,backgroundPosition:`${x/(sw-w)*100}% ${y/(sh-h)*100}%`}})
</script>
<style scoped>.town-sprite{display:block;background-repeat:no-repeat;background-color:transparent;pointer-events:none;width:100%}</style>
