import { createSSRApp } from 'vue'
import App from './App.vue'
import { skinStore } from './store/skin'
import './styles/theme.scss'

export function createApp() {
  const app = createSSRApp(App)
  app.mixin({ computed: { scenicSkin() { return skinStore.active.value } } })
  return { app }
}
