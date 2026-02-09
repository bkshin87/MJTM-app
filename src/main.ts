import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setDeferredPrompt } from './pwaInstall'

declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms?: string[]
    readonly userChoice?: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>
    prompt: () => Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

// PWA 설치 이벤트
window.addEventListener('beforeinstallprompt', (event: BeforeInstallPromptEvent) => {
  console.log('[PWA] beforeinstallprompt fired')
  event.preventDefault()
  setDeferredPrompt(event)
})

window.addEventListener('appinstalled', () => {
  console.log('[PWA] appinstalled')
  setDeferredPrompt(null)
})

// 서비스워커에서 보내는 로그 수신 (sw.js의 postMessage용)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    const data = event.data
    if (!data) return

    if (data.type === 'SW_LOG') {
      const msg = String(data.message ?? '')
      console.log('[SW_LOG_FROM_SW]', msg)

      try {
        const prev = localStorage.getItem('sw_logs') || ''
        localStorage.setItem('sw_logs', prev + msg + '\n')
      } catch (e) {
        console.error('[SW_LOG] localStorage error:', e)
      }
    }
  })
}

const app = createApp(App)

app.use(router)

app.mount('#app')
