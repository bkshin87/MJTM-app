import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setDeferredPrompt } from './pwaInstall'

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  }
}

window.addEventListener('beforeinstallprompt', (event: Event) => {
  console.log('[PWA] beforeinstallprompt fired')
  event.preventDefault()
  setDeferredPrompt(event as BeforeInstallPromptEvent)
})

window.addEventListener('appinstalled', () => {
  console.log('[PWA] appinstalled')
  setDeferredPrompt(null)
})

const app = createApp(App)
app.use(router)
app.mount('#app')
