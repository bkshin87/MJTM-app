<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const isLoggedIn = ref(false)
const displayName = ref('')
const toastMessage = ref('')
const toastVisible = ref(false)
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
    <!-- 상단 헤더: (로고 + 버튼) 한 줄, 아래에 텍스트 -->
    <header class="global-header">
      <div class="global-header-inner">
        <!-- 1행: 로고와 버튼들이 한 줄에 정렬 -->
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

        <!-- 2행: 로고 아래 텍스트 -->
        <div class="header-bottom-row">
          <span class="logo-subtitle">토목공학과 총동문회</span>
        </div>
      </div>
    </header>

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
  background: #ffffff;   /* 회색 → 흰색으로 변경 */
  color: #111827;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  display: flex;
  flex-direction: column;
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
  flex-direction: column; /* 위/아래 두 줄 */
  gap: 8px;
}

/* 1행: 로고와 버튼 한 줄 */
.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center; /* 로고 세로 가운데와 버튼 정렬 */
}

/* 2행: 로고 아래 텍스트 */
.header-bottom-row {
  /* 필요하면 여백 조정 */
}

.logo-link {
  text-decoration: none;
}

.logo-image {
  display: block;
  height: 40px;
  width: auto;
}

/* 로고와 텍스트 사이 간격 */
.logo-subtitle {
  margin-top: 6px;
  font-size: 17px;
  font-weight: 600;
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
  min-width: 58px;          /* 88px → 약 2/3 */
  padding: 4px 10px;        /* 6px 16px → 2/3 정도로 축소 */
  border-radius: 999px;
  border: 1px solid #0b3b7a;
  font-size: 12px;          /* 글자도 살짝 줄이기 */
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

/* 메인 영역: 헤더/푸터 사이를 채우도록 */
.main {
  flex: 1;
  padding: 0;
}

/* 푸터: 화면 전체 폭 */
.footer {
  background-color: #f3f4f6;
  border-top: 1px solid #e5e7eb;
}

.footer-inner {
  max-width: 980px;
  margin: 0 auto;
  padding: 14px 20px 18px;
  text-align: left;        /* 가운데 → 왼쪽 정렬 */
  font-size: 11px;
  color: #6b7280;
}

.footer-title {
  margin: 0 0 4px;
  font-weight: 500;
}

.footer-meta {
  display: flex;
  flex-direction: column;      /* 세로로 쌓기 */
  gap: 0;                      /* span 사이 추가 간격 제거 */
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
