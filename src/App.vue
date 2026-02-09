<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { canInstallPwa, deferredPromptEvent, setDeferredPrompt } from '@/pwaInstall'

const router = useRouter()

const isLoggedIn = ref(false)
const displayName = ref('')
const toastMessage = ref('')
const toastVisible = ref(false)
const checkingSession = ref(true)

const canInstall = computed(() => canInstallPwa.value)

const installApp = async () => {
  if (!deferredPromptEvent) return

  const result = await deferredPromptEvent.prompt()
  console.log('PWA install outcome:', result.outcome)
  setDeferredPrompt(null)
}

let toastTimer: number | null = null

// members 테이블에서 프로필 불러오기
const loadProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('members')
    .select('name')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('loadProfile error:', error)
    displayName.value = ''
    return
  }

  displayName.value = data?.name || ''
}

// 초기 세션 체크 + 첫 화면 분기
onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  isLoggedIn.value = !!session

  if (session?.user) {
    await loadProfile(session.user.id)
    // 이미 로그인 상태인데 /login 이면 메인으로
    if (router.currentRoute.value.name === 'login') {
      await router.replace({ name: 'home' })
    }
  } else {
    displayName.value = ''
    // 비로그인인데 public 이 아닌 페이지면 로그인으로
    const cur = router.currentRoute.value
    if (!cur.meta?.public && cur.name !== 'login') {
      await router.replace({ name: 'login' })
    }
  }

  // 이후 로그인/로그아웃 상태 변경 감지
  supabase.auth.onAuthStateChange(async (_event, session) => {
    isLoggedIn.value = !!session
    if (session?.user) {
      await loadProfile(session.user.id)
    } else {
      displayName.value = ''
    }
  })

  // Service Worker에서 메시지 수신 (NAVIGATE 등)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[APP] received message from SW:', event.data)
      if (event.data?.type === 'NAVIGATE') {
        router.push(event.data.path)
      }
    })
  }

  checkingSession.value = false
})

const showToast = (message: string, duration = 2000) => {
  toastMessage.value = message
  toastVisible.value = true
  if (toastTimer) {
    window.clearTimeout(toastTimer)
  }
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false
  }, duration)
}

// 🔐 로그아웃
const handleLogout = async () => {
  try {
    // 1) 현재 세션 확인 (있든 없든 signOut 시도)
    const {
      data: { session },
    } = await supabase.auth.getSession()
    console.log('[LOGOUT] current session:', session)

    const { error } = await supabase.auth.signOut({
      scope: 'global', // 확실하게 서버 세션까지 끊기 시도[web:73][web:71]
    })

    if (error) {
      console.error('[LOGOUT] signOut error', error)

      // 403 + 세션 관련 에러는 클라이언트 쪽에서 직접 정리
      if (error.status === 403 || /session/i.test(error.message || '')) {
        console.warn('[LOGOUT] forcing local cleanup due to 403/session error')
      } else {
        showToast('로그아웃 중 오류가 발생했습니다.')
        return
      }
    }

    // 2) 로컬 스토리지/세션 강제 정리 (supabase-js 캐시 포함)[web:73][web:89]
    try {
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_URL + '-auth-token')
    } catch (e) {
      console.warn('[LOGOUT] localStorage clear error', e)
    }

    // 3) Vue 상태 정리
    isLoggedIn.value = false
    displayName.value = ''

    showToast('로그아웃되었습니다.')

    // 4) 로그인 페이지로 보내고, 새로고침으로 세션 완전히 초기화
    await router.push({ name: 'login' })
    window.location.reload()
  } catch (e) {
    console.error('[LOGOUT] unexpected error', e)
    showToast('로그아웃 중 오류가 발생했습니다.')
  }
}


// ---- Web Push 등록 유틸 ----
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// 🔔 알림 허용 버튼에서 호출
const registerPush = async () => {
  try {
    console.log('[PUSH] start')

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('이 브라우저에서는 푸시 알림을 지원하지 않습니다.')
      return
    }

    const permission = await Notification.requestPermission()
    console.log('[PUSH] permission', permission)
    if (permission !== 'granted') {
      alert('알림 권한이 허용되지 않았습니다.')
      return
    }

    // 1) Service Worker 등록
    await navigator.serviceWorker.register('/sw.js')
    console.log('[PUSH] sw registered')

    // 2) active 상태가 될 때까지 기다렸다가 registration 사용
    const reg = await navigator.serviceWorker.ready
    console.log('[PUSH] sw ready', reg)

    // 기존 구독 있으면 재사용
    let subscription = await reg.pushManager.getSubscription()
    console.log('[PUSH] existing subscription', subscription)

    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(
        'BFj54ewp0yTATJuoII21sJgeSh9B0ikWCPr3IHMujO2RtQKXqrGNq0P-Cx9-Dn4B0Iu2pVSYOhH3Uk-PNF2oQhc',
      )
      console.log('[PUSH] subscribing...')
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })
      console.log('[PUSH] subscribed', subscription)
    }

    const subJson = subscription.toJSON()
    console.log('[PUSH] sub json', subJson)

    const endpoint = subscription.endpoint
    const p256dh = subJson.keys?.p256dh
    const auth = subJson.keys?.auth

    if (!p256dh || !auth) {
      console.error('[PUSH] missing keys', subJson)
      alert('푸시 구독 정보를 가져오지 못했습니다.')
      return
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    console.log('[PUSH] session', session)

    if (!session?.user) {
      alert('로그인 후 알림을 등록할 수 있습니다.')
      return
    }

    console.log('[PUSH] inserting to supabase...')
    const { error } = await supabase.from('push_subscriptions').insert({
      user_id: session.user.id,
      endpoint,
      p256dh,
      auth,
    })

    if (error) {
      console.error('[PUSH] insert error', error)
      alert('알림 등록 중 오류가 발생했습니다.')
      return
    }

    console.log('[PUSH] done')
    alert('알림이 등록되었습니다.')
  } catch (e) {
    console.error('registerPush error', e)
    alert('알림 등록 중 오류가 발생했습니다.')
  }
}
</script>

<template>
  <div class="app">
    <!-- 상단 헤더 -->
    <header class="global-header">
      <div class="global-header-inner">
        <div class="header-top-row">
          <RouterLink to="/" class="logo-link">
            <img
              src="/images/home-logo.png"
              alt="명지대학교 로고"
              class="logo-image"
            />
          </RouterLink>

          <div class="auth-area">
            <template v-if="isLoggedIn">
              <span class="user-name">{{ displayName || '회원' }} 님</span>
              <button class="auth-btn primary" @click="handleLogout">
                로그아웃
              </button>
            </template>
          </div>
        </div>

        <div class="header-bottom-row">
          <span class="logo-subtitle">토목공학과 총동문회</span>
        </div>
      </div>
    </header>

    <!-- 공통 상단 탭 -->
    <nav class="tabs">
      <RouterLink to="/about" class="tab">동문회소개</RouterLink>
      <RouterLink to="/notice" class="tab">공지사항</RouterLink>
      <RouterLink to="/event" class="tab">경조사</RouterLink>
      <RouterLink to="/album" class="tab">사진첩</RouterLink>
      <RouterLink to="/members" class="tab">동문명부</RouterLink>
    </nav>

    <!-- 페이지별 콘텐츠 -->
    <main class="main">
      <div v-if="checkingSession" class="loading">로딩 중...</div>
      <RouterView v-else />
    </main>

    <!-- 전역 푸터 -->
    <footer class="footer">
      <div class="footer-inner">
        <p class="footer-title">[ 명지대학교 토목공학과 총동문회 ]</p>
        <div class="footer-meta">
          <span>관리자 : 김토목</span>
          <span>TEL : 010-1234-5678</span>
          <span>MAIL : MAIL@MAIL.COM</span>
        </div>

        <div class="footer-app-download">
          <button @click="installApp" type="button" class="app-download-btn">
            다운로드
          </button>
          <button
            @click="registerPush"
            type="button"
            class="app-download-btn"
          >
            알림 허용
          </button>
        </div>
      </div>
    </footer>

    <!-- 토스트 -->
    <div v-if="toastVisible" class="toast">
      {{ toastMessage }}
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #ffffff;
  color: #111827;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  display: flex;
  flex-direction: column;
}

.global-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.global-header-inner {
  max-width: 980px;
  margin: 0 auto;
  padding: 14px 20px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-bottom-row {
}

.logo-link {
  text-decoration: none;
}

.logo-image {
  display: block;
  height: 40px;
  width: 150px;
}

.logo-subtitle {
  margin-top: 6px;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
}

.auth-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  color: #4b5563;
}

.auth-btn {
  min-width: 58px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #0b3b7a;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  background-color: #ffffff;
  color: #0b3b7a;
}

.auth-btn.primary {
  background-color: #0b3b7a;
  color: #ffffff;
}

.tabs {
  display: flex;
  justify-content: flex-start;
  gap: 26px;
  padding-top: 12px;
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding-left: 14px;
  padding-right: 14px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.tab {
  font-family: 'Noto Sans KR', system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', sans-serif;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-decoration: none;
  color: #111827;
  padding-bottom: 7px;
  white-space: nowrap;
  flex: 0 0 auto;
}

.tab.router-link-active {
  color: #0b3b7a;
  border-bottom: 3px solid #0b3b7a;
}

.main {
  flex: 1;
  padding: 0;
}

.loading {
  padding: 40px 0;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.footer {
  background-color: #f3f4f6;
  border-top: 1px solid #e5e7eb;
}

.footer-inner {
  max-width: 980px;
  margin: 0 auto;
  padding: 14px 20px 18px;
  text-align: left;
  font-size: 11px;
  color: #6b7280;
  position: relative;
}

.footer-app-download {
  position: absolute;
  right: 20px;
  bottom: 14px;
  display: flex;
  gap: 8px;
}

.app-download-btn {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #0b3b7a;
  background: #0b3b7a;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.footer-title {
  margin: 0 0 4px;
  font-weight: 500;
}

.footer-meta {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.footer-meta span {
  margin: 0;
  white-space: nowrap;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.9);
  color: #ffffff;
  font-size: 12px;
  z-index: 9999;
}
</style>
