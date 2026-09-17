<script setup>
defineProps({label:String,modelValue:String})
const emit=defineEmits(['change'])
const colors=[{name:'薄荷绿',value:'#83cdb5'},{name:'天空蓝',value:'#7ab8ff'},{name:'紫色',value:'#b59aff'},{name:'玫瑰粉',value:'#f18eaf'},{name:'珊瑚橙',value:'#f1a477'},{name:'金色',value:'#e6c66e'}]
</script>
<template>
<section class="color-picker" @click.stop>
  <div class="color-heading">{{label}}</div>
  <div class="swatches">
    <button v-for="color in colors" :key="color.value" class="swatch" :style="{background:color.value}" :aria-label="label+'：'+color.name" :title="color.name" :aria-pressed="modelValue===color.value" @click="emit('change',color.value)"></button>
  </div>
  <div class="color-actions">
    <label class="custom-color">自定义<input type="color" :aria-label="label+'：自定义'" :value="modelValue" @change="emit('change',$event.target.value)"></label>
    <button class="reset-color" @click="emit('change',null)">恢复默认</button>
  </div>
</section>
</template>
<style scoped>
.color-picker{padding:12px 0;border-bottom:1px solid #40524b}.color-heading{font-size:12px;color:#b9cec4;margin-bottom:10px}.swatches{display:flex;gap:8px}.color-picker .swatch{display:block;flex:1;width:23px;height:24px;min-width:0;border:2px solid transparent;border-radius:5px;padding:0;box-shadow:inset 0 0 0 1px #ffffff30}.color-picker .swatch[aria-pressed=true]{outline:2px solid #eefbf4;outline-offset:2px}.color-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px}.custom-color{display:flex;gap:8px;align-items:center;margin:0;font-size:11px;color:#b9cec4}.custom-color input{margin:0;width:30px;height:25px;border:1px solid #688378;padding:1px;cursor:pointer}.color-picker .reset-color{width:auto;font-size:11px;padding:5px 7px;border:1px solid #40564c;background:transparent}.color-picker .reset-color:hover{background:#3c524b}
</style>
