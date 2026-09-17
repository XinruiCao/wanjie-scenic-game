import type {DouyinAPI} from './native'
type Direction='portrait'|'landscape'
/** Physical device axes, not the canvas axes. Ignore flat/shaking/diagonal poses. */
export function gravityDirection({x,y,z}:{x:number;y:number;z:number}):Direction|undefined {
 if(![x,y,z].every(Number.isFinite))return
 const ax=Math.abs(x),ay=Math.abs(y),az=Math.abs(z),m=Math.hypot(x,y,z)
 if(m<.65||m>1.35||Math.max(ax,ay)<.65||az>.8||Math.abs(ax-ay)<.3)return
 return ax>ay?'landscape':'portrait'
}
export class AutoOrientation {
 private epoch=0
 private running=false
 private enabled=false
 private pending=false
 private candidate?:Direction
 private since=0
 private cooldown=0
 constructor(private api:DouyinAPI,private resized:()=>void,private now=()=>Date.now()){}
 private sample=(value:{x:number;y:number;z:number})=>{
  if(!this.enabled||this.pending||this.now()<this.cooldown)return
  const direction=gravityDirection(value)
  if(!direction){this.candidate=undefined;return}
  const info=this.api.getSystemInfoSync(),current=info.windowWidth>info.windowHeight?'landscape':'portrait'
  if(direction===current){this.candidate=undefined;return}
  if(direction!==this.candidate){this.candidate=direction;this.since=this.now();return}
  if(this.now()-this.since<600)return
  this.pending=true;this.candidate=undefined
  try{this.api.setDeviceOrientation!({value:direction,success:()=>{this.pending=false;this.cooldown=this.now()+1200;this.resized()},fail:()=>{this.pending=false;this.pause()}})}catch{this.pending=false;this.pause()}
 }
 resume(){
  if(this.running)return
  const a=this.api
  if(!a.canIUse?.('setDeviceOrientation')||!a.setDeviceOrientation||!a.onAccelerometerChange||!a.offAccelerometerChange||!a.startAccelerometer||!a.stopAccelerometer)return
  this.running=true;this.enabled=true;this.candidate=undefined
  const epoch=++this.epoch
  try{a.startAccelerometer({success:()=>{if(this.running&&this.epoch===epoch)a.onAccelerometerChange!(this.sample)},fail:()=>{if(this.epoch===epoch)this.pause()}})}catch{this.pause()}
 }
 pause(){
  this.epoch++;this.enabled=false;this.candidate=undefined
  if(!this.running)return
  this.running=false
  this.api.offAccelerometerChange?.(this.sample)
  try{this.api.stopAccelerometer?.({})}catch{/* unsupported hosts keep their current orientation */}
 }
}
