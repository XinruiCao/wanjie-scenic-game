/** A directly opened or refreshed archive page may have no in-app back stack. */
export function goBack(){if(getCurrentPages().length>1)uni.navigateBack();else uni.reLaunch({url:'/pages/home/index'})}
