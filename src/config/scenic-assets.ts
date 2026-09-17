/** Every runtime element is an independent generated RGBA PNG, never a reference-sheet crop. */
import generated from './generated-scenic-assets.json'
export interface ScenicAsset {src:string;size:readonly number[];box:readonly number[]}
export const scenicAssets = {
 lightTitle:generated['light-title'],darkTitle:generated['dark-title'],
 lightButton:generated['light-button'],lightActive:generated['light-button'],
 darkButton:generated['dark-button'],darkActive:generated['dark-button'],
 lightPanel:generated['light-panel'],darkPanel:generated['dark-panel'],
 lightDialogue:generated['light-button'],darkDialogue:generated['dark-button'],
 paper:generated.grain,metal:generated.grain,leather:generated.grain,
 goldFlare:generated['gold-flare'],blueGlow:generated['gold-flare'],
 stamp:generated.seal,ticket:generated.seal,compass:generated['icon-routes'],
 lightCharacters:generated['icon-characters'],darkCharacters:generated['icon-characters'],
 lightRoutes:generated['icon-routes'],darkRoutes:generated['icon-routes'],
 lightArchive:generated['icon-archive'],darkArchive:generated['icon-archive'],
 lightGallery:generated['icon-gallery'],darkGallery:generated['icon-gallery'],
} as const satisfies Record<string,ScenicAsset>
export type ScenicAssetName=keyof typeof scenicAssets
