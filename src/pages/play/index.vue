<template><view :data-skin="scenicSkin" class="visual-page player" :class="{'controls-hidden':!controlsVisible&&!node.choices,'has-choice':!!node.choices,'phone-open':node.page==='phone'}" @mousemove="wake" @touchstart="wake" @keydown="keyControl" tabindex="-1"><SceneBackdrop v-if="!filmNode||node.id==='P028'" :src="nodeBackground(node.id)" :shade=".4"/>
<MoviePlayer v-if="filmNode&&node.id!=='P028'" ref="movie" :key="filmNode.id" :node-id="filmNode.id" :video="filmNode.video" :poster="filmNode.poster" :title="node.choices?'':filmNode.title" :loop="!!node.choices" :developer-mode="s.developerMode" :paused="paused||portrait" :subtitles="subtitles" :muted="muted" @ended="filmEnded" @progress="(t,d)=>{elapsed=t;duration=d}" @media-error="mediaError=$event"/>
<view class="hud"><view class="film-heading"><text class="mono">{{node.id}} · {{s.currentChapterId}}</text><text>{{node.title}}</text></view><view class="player-controls"><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" class="icon-control" :aria-pressed="auto" @click="auto=!auto"><AssetImage :src="uiAssets.icons.play" fit="contain"/>自动 {{auto?'开':'关'}}</button><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" class="icon-control" :aria-pressed="subtitles" @click="subtitles=!subtitles"><AssetImage :src="uiAssets.icons.subtitles" fit="contain"/>字幕</button><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" class="icon-control" @click="settings"><AssetImage :src="uiAssets.icons.settings" fit="contain"/>设置</button><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" class="icon-control" @click="home"><AssetImage :src="uiAssets.icons.back" fit="contain"/>返回</button></view></view>
<view v-if="filmNode&&node.id!=='P028'" class="transport"><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" class="icon-control pause-button" :aria-label="paused?'播放':'暂停'" @click="paused=!paused"><AssetImage :src="paused?uiAssets.icons.play:uiAssets.icons.pause" fit="contain"/></button><text class="time mono">{{formatTime(elapsed)}} / {{formatTime(duration)}}</text><slider class="film-progress" :value="duration?elapsed/duration*100:0" :disabled="!duration" :block-size="8" activeColor="#d6c9af" backgroundColor="#ffffff30" @change="seek"/><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" class="icon-control" :aria-label="muted?'打开声音':'静音'" @click="muted=!muted"><AssetImage :src="uiAssets.icons.sound" fit="contain"/></button><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" class="icon-control" aria-label="全屏" @click="fullscreen"><AssetImage :src="uiAssets.icons.fullscreen" fit="contain"/></button></view>
<AssetButton v-if="awaitingContinue&&!node.choices" class="manual-continue" @click="advance">继续剧情</AssetButton>
<ChoiceOverlay v-if="node.choices" :key="node.id" :major="node.id==='P028'" :title="node.title" :choices="choices" :countdown="node.countdown" :paused="paused||portrait" :developer-mode="s.developerMode" @select="select"/>
<view v-else-if="node.page==='phone'" class="story-interaction"><PhoneScene :description="node.description" @continue="advance"/></view><view v-else-if="node.page==='evidence'" class="story-interaction"><EvidenceScene save-label="保存线索并继续" @save="advance"/></view><AssetPanel v-else-if="node.type==='PAGE'" class="page-card"><text class="title">{{node.title}}</text><text class="body">{{node.description}}</text><AssetButton @click="advance">{{node.payloadId?'保存线索并继续':'继续剧情'}}</AssetButton></AssetPanel>
<AssetImage class="player-line" :src="uiAssets.decorations.line" fit="fill"/><view v-if="error" class="error glass"><text>{{error}}</text><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" @click="home">返回首页</button></view>
<view v-if="node.type==='VIDEO'||!!node.choices" class="rotate-notice"><text class="rotate-symbol">↻</text><text>横屏，进入这段人生</text><text>请旋转设备，保留完整电影画面</text><AssetButton @click="home">返回首页</AssetButton></view>
<view v-if="s.developerMode" class="debug"><AssetButton @click="debug=!debug">Debug</AssetButton><scroll-view v-if="debug" scroll-y class="debug-panel"><text selectable>{{debugText}}</text><input v-model="jumpId" placeholder="输入节点 ID"/><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" @click="jump">跳到节点</button><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" @click="clear">清除存档</button><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" @click="increment">增加周目</button><button role="button" tabindex="0" @keydown.enter.prevent="activateFocused" @keydown.space.prevent="activateFocused" @click="unlockAll">解锁全部 Ending（调试）</button></scroll-view></view>
</view></template>
<script setup lang="ts">
import {activateFocused} from '../../utils/keyboard';

import PhoneScene from '../../components/phone/PhoneScene.vue'
import EvidenceScene from '../../components/evidence/EvidenceScene.vue'
import AssetImage from '../../components/common/AssetImage.vue'
import AssetButton from '../../components/common/AssetButton.vue'
import AssetPanel from '../../components/common/AssetPanel.vue'
import SceneBackdrop from '../../components/common/SceneBackdrop.vue'
import {settingsStore} from '../../store/settings'
import {uiAssets} from '../../config/ui-assets'
import {nodeBackground} from '../../data/backgrounds'
import {queuePreload,clearPreload} from '../../utils/preload'
import {computed,ref,watch,onMounted,onUnmounted} from 'vue'
import {onShow} from '@dcloudio/uni-app'
import {gameStore,storyEngine} from '../../store/game'
import {endings,story} from '../../data/story'
import MoviePlayer from '../../components/video/MoviePlayer.vue'
import ChoiceOverlay from '../../components/choice/ChoiceOverlay.vue'
const paused=ref(false),subtitles=computed({get:()=>settingsStore.subtitles,set:v=>settingsStore.subtitles=v}),muted=computed({get:()=>settingsStore.muted,set:v=>settingsStore.muted=v})
function settings(){uni.navigateTo({url:'/pages/settings/index'})}
const s=gameStore.state,node=computed(()=>storyEngine.getNode()),choices=computed(()=>storyEngine.getVisibleChoices());const error=ref(''),mediaError=ref(''),debug=ref(false),jumpId=ref('')
const debugText=computed(()=>JSON.stringify({currentNodeId:node.value.id,type:node.value.type,flags:s.flags,stats:s.stats,lastChoice:s.choiceHistory.at(-1),visitedNodes:s.visitedNodes,availableChoices:choices.value,mediaError:mediaError.value},null,2))
function dispatch(){const type=node.value.type;if(type==='ENDING'||type==='ROUTE_CLOSED')uni.redirectTo({url:`/pages/${type==='ENDING'?'ending':'route-closed'}/index?id=${node.value.id}`})}
watch(()=>s.currentNodeId,dispatch);onShow(dispatch)
function run(fn:()=>unknown){try{error.value='';fn()}catch(e){error.value=String(e)}}
function advance(){awaitingContinue.value=false;run(()=>storyEngine.advance())}function select(id:string){run(()=>storyEngine.applyChoice(id))}function jump(){run(()=>storyEngine.enter(jumpId.value))}
function home(){uni.reLaunch({url:'/pages/home/index'})}function clear(){gameStore.clearSave();home()}function increment(){s.playthrough++;gameStore.persist()}
function unlockAll(){s.unlockedEndings=[...endings];for(const id of endings)s.endingUnlockedAt[id] ||= Date.now();gameStore.persist()}

const portrait=ref(false);
const controlsVisible=ref(true),auto=ref(true),elapsed=ref(0),duration=ref(0),awaitingContinue=ref(false),movie=ref<InstanceType<typeof MoviePlayer>|null>(null)
const filmNode=computed(()=>node.value.type==='VIDEO'?node.value:node.value.choices?[...s.history].reverse().map(h=>story[h.node]).find(n=>n?.type==='VIDEO'):undefined)
const localCandidates=import.meta.glob('/src/static/videos/**/*.{mp4,webm,mov}',{eager:true,query:'?url',import:'default'})
watch(()=>node.value.id,()=>{const next=node.value.choices?node.value:story[node.value.next||''];const urls=(next?.choices||[]).filter(c=>!c.disabled).map(c=>story[c.next]?.video).filter((v):v is string=>!!v&&Object.keys(localCandidates).some(k=>k.replace('/src','')===v));queuePreload(urls)},{immediate:true})
let idle:ReturnType<typeof setTimeout>
function wake(){controlsVisible.value=true;clearTimeout(idle);idle=setTimeout(()=>controlsVisible.value=false,3000)}
function keyControl(e:KeyboardEvent){wake();if(e.key==='Escape'){paused.value=!paused.value;e.preventDefault()}}
function filmEnded(){if(node.value.choices)return;if(auto.value)advance();else awaitingContinue.value=true}
function formatTime(t:number){return Math.floor(t/60).toString().padStart(2,'0')+':'+Math.floor(t%60).toString().padStart(2,'0')}
function seek(e:{detail:{value:number}}){movie.value?.seek(duration.value*e.detail.value/100)}
function fullscreen(){// #ifdef H5
 const el=document.querySelector('.player') as HTMLElement|null
 if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else el?.requestFullscreen?.().catch(()=>{})
 // #endif
}
watch(()=>node.value.id,()=>{wake();elapsed.value=0;duration.value=0;awaitingContinue.value=false})
let mediaQuery:MediaQueryList|undefined;function orientation(){portrait.value=mediaQuery?.matches||false}
onMounted(()=>{wake();
// #ifdef H5
mediaQuery=window.matchMedia('(orientation: portrait)');orientation();mediaQuery.addEventListener('change',orientation);
// #endif
});onUnmounted(()=>{clearPreload();clearTimeout(idle);mediaQuery?.removeEventListener('change',orientation)})
</script><style scoped>
.player{position:fixed;inset:0;min-height:0;background:#08090b}.hud{position:absolute;top:var(--ui-safe-y);left:var(--ui-safe-x);right:var(--ui-safe-x);display:flex;justify-content:space-between;gap:20px;z-index:35;pointer-events:none;transition:opacity .4s}.film-heading{display:flex;flex-direction:column;gap:8px;color:#d2c8b7;font-size:12px;max-width:45%}.film-heading>text:last-child{font:clamp(14px,1.4vw,22px) 'Songti SC',serif;color:#eee5d7}.player-controls{display:flex;gap:20px;pointer-events:auto;align-items:flex-start}.player-controls .icon-control{min-height:30px;font-size:11px;color:#d2c8b7}.player-controls :deep(.asset-image){width:18px;height:18px;opacity:.8}.transport{position:absolute;z-index:35;bottom:max(20px,env(safe-area-inset-bottom));left:var(--ui-safe-x);right:var(--ui-safe-x);display:flex;align-items:center;gap:16px;transition:opacity .4s}.transport .icon-control{min-height:44px;min-width:32px}.transport :deep(.asset-image){width:23px;height:23px;opacity:.85}.pause-button{width:44px;border:1px solid #f2efe855;border-radius:50%;justify-content:center}.time{font-size:10px;color:#d0c8ba;white-space:nowrap}.film-progress{flex:1;margin:0 8px}.controls-hidden .hud,.controls-hidden .transport{opacity:0;pointer-events:none}.controls-hidden:focus-within .hud,.controls-hidden:focus-within .transport{opacity:1;pointer-events:auto}.player-line{position:absolute;bottom:0;left:5%;width:90%;height:3px;opacity:.25;pointer-events:none}.manual-continue{position:absolute;bottom:20%;left:calc(50% - 70px);z-index:25}.story-interaction{position:absolute;inset:75px 0 15px;overflow:auto;z-index:var(--z-ui)}.phone-open :deep(.scene-backdrop){filter:brightness(.8) blur(1px)}.page-card{position:absolute;top:30%;left:8%;width:min(560px,80%);z-index:20}.title,.body{display:block;line-height:1.9;margin-bottom:25px}.title{font:28px 'Songti SC',serif}.body{color:#d4cec2}.debug{position:absolute;right:8px;bottom:4px;z-index:var(--z-debug)}.debug>.asset-button{min-width:50px;min-height:22px;padding:2px 10px;font-size:9px;opacity:.35}.debug-panel{width:min(340px,90vw);height:60vh;background:#101116f5;padding:15px}.debug-panel text{white-space:pre-wrap;font:11px monospace}.debug-panel input{background:#333;margin:10px 0}.debug-panel button{font-size:12px}.error{position:absolute;inset:25%;z-index:50;padding:30px}.rotate-notice{display:none}
@media(max-height:540px) and (orientation:landscape){.hud{top:12px}.film-heading{font-size:9px;gap:4px}.player-controls{gap:13px}.transport{bottom:5px;gap:10px}.transport .icon-control{min-height:34px}.pause-button{width:34px}.story-interaction{inset:48px 0 0}.film-heading>text:last-child{font-size:13px}.player :deep(.movie-caption){bottom:16%}}
@media(orientation:portrait){.rotate-notice{position:absolute;inset:0;z-index:55;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:#08090b8c;text-align:center;padding:30px;backdrop-filter:blur(2px)}.rotate-symbol{font-size:64px;color:#cbaf79}.rotate-notice>text:nth-child(2){font:26px 'Songti SC',serif}.rotate-notice>text:nth-child(3){font-size:12px;color:#ccc}.hud,.transport{visibility:hidden}}
</style>