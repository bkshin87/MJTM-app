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
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('getSession error:', error)
  }
  console.log('초기 세션:', data.session)

  const session = data.session
  isLoggedIn.value = !!session

  if (session?.user) {
    await loadProfile(session.user.id)
  }

  supabase.auth.onAuthStateChange((event, session) => {
    console.log('auth event:', event, session)
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
    console.error('signOut error:', error)
    showToast('로그아웃 중 오류가 발생했습니다.')
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
    <header class="header">
      <!-- 왼쪽: 로고 + 바로 아래 타이틀 -->
      <div class="logo-block">
        <h1 class="logo">
          <RouterLink to="/" class="logo-link">
            <img
              src="/images/home-logo.png"
              alt="홈"
              class="section-title-image"
            />
          </RouterLink>
        </h1>
        <span class="header-title">토목공학과 총동문회</span>
      </div>

      <!-- 오른쪽: 로그인/로그아웃/회원가입/이름 -->
      <div class="header-right header-right--only">
        <template v-if="!isLoggedIn">
          <button class="btn ghost" @click="handleLogin">로그인</button>
          <button class="btn ghost" @click="handleSignup">회원가입</button>
        </template>

        <template v-else>
          <span class="user-name">{{ displayName || '회원' }} 님</span>
          <button class="btn ghost" @click="handleLogout">로그아웃</button>
        </template>
      </div>
    </header>

    <main class="main">
      <RouterView />
    </main>

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
  color: #ffffff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 로고 80% 크기 */
.section-title-image {
  display: block;
  max-height: 32px; /* 기존 40px → 약 80% */
  width: auto;
}

/* 헤더: 좌측(로고+타이틀), 우측(로그인 영역) */
.header {
  padding: 8px 20px 10px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

/* 로고 + 타이틀 묶음 (로고 위, 타이틀 아래) */
.logo-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo {
  margin: 0;
}

.logo-link {
  text-decoration: none;
}

/* 로고 왼쪽 하단 타이틀 */
.header-title {
  margin-top: 15px;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

/* 오른쪽 영역 */
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  color: #4b5563;
}

/* 버튼 스타일 */
.btn.ghost {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid #cbd5f5;
  background: #e5edff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.main {
  padding: 0;
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
