import {nodeBackground} from './backgrounds'
export interface MediaAsset { video: string; poster?: string; loop?: boolean }
const ids = ['V_M01','V_M02_A','V_M02_B','V_M02_C','V_M03','V_TRUST','V_PHONE','V_FATHER','V_M05','V_NO_PROOF','V_EVIDENCE','V_LEAVE','V_M04','V_A01','V_A03','V_B01','V_B03','V_C01','V_C03','V_D01','V_E01','V_E03','V_F01','V_F03','V_TRUE']
export const media: Record<string,MediaAsset> = Object.fromEntries(ids.map(id=>[id,{video:`/static/videos/prologue/${id}.mp4`,poster:nodeBackground(id),loop:false}]))

export const mediaCatalog = Object.entries(media).flatMap(([id,asset])=>[{id,kind:'video' as const,path:asset.video},...(asset.poster?[{id:id+'_poster',kind:'poster' as const,path:asset.poster}]:[])])
