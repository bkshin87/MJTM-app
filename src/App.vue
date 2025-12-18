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

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  const session = data.session
  isLoggedIn.value = !!session

  if (session?.user) {
    await loadProfile(session.user.id)
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    isLoggedIn.value = !!session
    if (session?.user) {
      loadProfile(session.user.id)
    } else {
      displayName.value = ''
    }
  })
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

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
    return
  }
  showToast('로그아웃되었습니다.')
  router.push({ name: 'home' })
}

const handleLogin = () => {
  router.push({ name: 'login' })
}

const handleSignup = () => {
  router.push({ name: 'signup' })
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
            <template v-if="!isLoggedIn">
              <button class="auth-btn" @click="handleLogin">로그인</button>
              <button class="auth-btn primary" @click="handleSignup">
                회원가입
              </button>
            </template>

            <template v-else>
              <span class="user-name">{{ displayName || '회원' }} 님</span>
              <button class="auth-btn primary" @click="handleLogout">
                로그아웃
              </button>
            </template>
          </div>
        </div>

        <!-- 헤더 아래 텍스트 -->
        <div class="header-bottom-row">
          <span class="logo-subtitle">토목공학과 총동문회</span>
        </div>
      </div>
    </header>

    <!-- 공통 상단 탭 -->
    <nav class="tabs">
      <RouterLink to="/about" class="tab">동문회소개</RouterLink>
      <RouterLink to="/notice" class="tab">공지사항</RouterLink>
      <RouterLink to="/members" class="tab">동문명부</RouterLink>
      <RouterLink to="/album" class="tab">사진첩</RouterLink>
      <RouterLink to="/event" class="tab">경조사</RouterLink>
    </nav>

    <!-- 페이지별 콘텐츠 -->
    <main class="main">
      <RouterView />
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

        <!-- 앱 다운로드 버튼 -->
        <div class="footer-app-download">
          <!--<button v-if="canInstall" @click="installApp" type="button" class="app-download-btn">-->
            <button @click="installApp" type="button" class="app-download-btn">
            <!--앱 다운로드 (iOS / Android)-->
            다운로드
          </button>
        </div>
      </div>
    </footer>

    <!-- 로그아웃 토스트 -->
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
  flex-direction: column; /* 헤더-메인-푸터 수직 배치 */
}

/* 상단 헤더 */
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

/* 1행: 로고와 버튼 한 줄 */
.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 2행: 로고 아래 텍스트 */
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

/* 로고 아래 “토목공학과 총동문회” */
.logo-subtitle {
  margin-top: 6px;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
}

/* 우측 로그인/회원가입 영역 */
.auth-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  color: #4b5563;
}

/* 버튼 스타일 */
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

/* 탭 메뉴 – 헤더보다 살짝 가는 굵기 */
.tabs {
  display: flex;
  justify-content: flex-start;
  gap: 26px;
  padding-top: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;

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

/* 메인 영역: 남는 공간을 채워서 footer를 항상 아래로 */
.main {
  flex: 1;
  padding: 0;
}

/* 푸터 */
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
  position: relative; /* 자식 버튼을 오른쪽 아래에 붙이기 위해 */
}

/* 앱 다운로드 버튼 영역 */
.footer-app-download {
  position: absolute;
  right: 20px;
  bottom: 14px;
}

/* 버튼 스타일 */
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

/* 토스트 */
.toast {
  position: fixed;
  right: 16px;
  bottom: 24px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.9);
  color: #f9fafb;
  font-size: 13px;
  z-index: 1000;
}
</style>
