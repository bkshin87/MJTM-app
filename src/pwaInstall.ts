// src/pwaInstall.ts
import { ref } from 'vue'

export const canInstallPwa = ref(false)
export let deferredPromptEvent: BeforeInstallPromptEvent | null = null

export function setDeferredPrompt(e: BeforeInstallPromptEvent | null) {
  deferredPromptEvent = e
  canInstallPwa.value = !!e
}
