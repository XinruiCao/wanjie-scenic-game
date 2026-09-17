/** uni-app wraps event.currentTarget; use the focused H5 element for activation. */
export function activateFocused(){
 // #ifdef H5
 if(typeof document!=='undefined')(document.activeElement as HTMLElement|null)?.click()
 // #endif
}
