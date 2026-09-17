const warm:HTMLVideoElement[]=[]
export function clearPreload(){for(const video of warm.splice(0)){video.removeAttribute('src');video.load()}}
export function queuePreload(urls:string[]){
 // #ifdef H5
 if(typeof document==='undefined')return
 clearPreload()
 for(const url of [...new Set(urls)].slice(0,3)){const video=document.createElement('video');video.preload='metadata';video.muted=true;video.src=url;warm.push(video)}
 // #endif
}
