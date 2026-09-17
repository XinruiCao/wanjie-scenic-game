export type ScenicSkin = 'light' | 'dark'
export const themes = {
 light: { name: '山河新生', subtitle: '纸白 · 湖水青 · 重建', title: '万界开了，', tagline: '我在末日景区搞基建' },
 dark: { name: '余烬鎏金', subtitle: '黑铁 · 古金 · 守望', title: '万界开了，', tagline: '我在末日景区搞基建' },
} as const
// The current story's prologue finishes at this branching decision.
export const SKIN_UNLOCK_NODE = 'EP12'
