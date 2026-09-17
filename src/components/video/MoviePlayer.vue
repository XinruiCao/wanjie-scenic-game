<template><view class="movie"><video v-if="!failed" :id="'movie-'+nodeId" class="media" :src="video" :poster="poster || nodeBackground(nodeId)" :autoplay="!paused" :loop="loop" :controls="false" :muted="muted" object-fit="cover" @ended="finish" @error="fallback" @playing="loaded" @timeupdate="timeUpdate" @loadedmetadata="metadata" @waiting="waiting" @stalled="waiting"/><AssetImage v-else class="media" :src="poster || nodeBackground(nodeId)"/><view class="movie-shade"/><view class="movie-caption"><text v-if="subtitles!==false" class="title">{{title}}</text><text v-if="failed&&developerMode" class="dev">DEV · VIDEO PLACEHOLDER · {{nodeId}}</text><AssetButton v-if="failed&&!loop" :disabled="!ready" variant="active" @click="finish">{{ready?'继续剧情':'剧情载入中…'}}</AssetButton></view></view></template>
<script setup lang="ts">
import {ref,onMounted,onUnmounted,watch} from 'vue'
import AssetImage from '../common/AssetImage.vue'
import AssetButton from '../common/AssetButton.vue'
import {nodeBackground} from '../../data/backgrounds'
const props=defineProps<{nodeId:string;video?:string;poster?:string;title?:string;developerMode:boolean;paused?:boolean;subtitles?:boolean;muted?:boolean;loop?:boolean}>()
const emit=defineEmits<{ended:[];'media-error':[string];progress:[number,number]}>()
const localVideos=import.meta.glob("/src/static/videos/**/*.{mp4,webm,mov}",{eager:true,query:"?url",import:"default"});
const exists=!!props.video&&(Object.keys(localVideos).some(k=>k.replace("/src","")===props.video)||/^https?:/.test(props.video));
const failed=ref(!exists),ready=ref(false),posterFailed=ref(false);let done=false;let timer:ReturnType<typeof setTimeout>;let watchdog:ReturnType<typeof setTimeout>
let duration=0
function loaded(){clearTimeout(watchdog)}
function metadata(e:Event|{detail:{duration:number}}){duration='detail' in e?e.detail.duration:(e.target as HTMLVideoElement)?.duration||0;emit('progress',0,duration)}
function timeUpdate(e:Event|{detail:{currentTime:number;duration:number}}){loaded();const d='detail' in e?e.detail:e.target as HTMLVideoElement;duration=d.duration||duration;emit('progress',d.currentTime||0,duration)}
function seek(time:number){uni.createVideoContext('movie-'+props.nodeId).seek(time)}
defineExpose({seek})
function waiting(){clearTimeout(watchdog);watchdog=setTimeout(fallback,4000)}
function fallback(){if(failed.value)return;clearTimeout(watchdog);failed.value=true;emit('media-error',props.nodeId);timer=setTimeout(()=>ready.value=true,1500)}
function finish(){if(props.loop)return;if(done || (failed.value&&!ready.value))return;done=true;emit('ended')}
watch(()=>props.paused,paused=>{const ctx=uni.createVideoContext('movie-'+props.nodeId);paused?ctx.pause():ctx.play()})
onMounted(()=>{if(!exists){emit('media-error',props.nodeId);timer=setTimeout(()=>ready.value=true,1500)}else watchdog=setTimeout(fallback,4000)})
onUnmounted(()=>{clearTimeout(timer);clearTimeout(watchdog)})
</script><style scoped>.movie,.media{position:absolute;inset:0;width:100%;height:100%}.movie-shade{position:absolute;inset:0;background:linear-gradient(0deg,#040506bd,transparent 45%,#04050633)}.movie-caption{position:absolute;left:12%;right:12%;bottom:9%;display:flex;flex-direction:column;align-items:center;text-align:center}.title{font-size:20px;line-height:1.8;letter-spacing:.08em;text-shadow:0 2px 10px #000}.dev{font-size:9px;color:#bea580;margin:10px}.movie-caption .asset-button{margin-top:15px}</style>
