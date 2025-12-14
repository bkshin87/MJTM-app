<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const isLoggedIn = ref(false)

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  isLoggedIn.value = !!data.session

  supabase.auth.onAuthStateChange((_event, session) => {
    isLoggedIn.value = !!session
  })
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  isLoggedIn.value = false
  // 로그아웃 후 홈으로 이동 (원하면)
  router.push({ name: 'home' })
}

const handleLogin = () => {
  // 로그인 페이지 라우트 만들어 두었다는 가정 (예: /login)
  router.push({ name: 'login' })
}

const handleSignup = () => {
  router.push({ name: 'signup' })
}
</script>

<template>
  <div class="app">
    <header class="header">
      <!-- 1줄차: 로고 -->
      <h1 class="logo">
        <RouterLink to="/" class="tab">
          <img
            src="/images/home-logo.png"
            alt="홈"
            class="section-title-image"
          />
        </RouterLink>
      </h1>

      <!-- 2줄차: 좌측 타이틀 + 우측 사용자 영역 -->
      <div class="header-bottom">
        <div class="header-left">
          <span class="header-title">토목공학과 총동문회</span>
        </div>

        <div class="header-right header-right--only">
          <!-- 로그인 안 한 경우: 로그인 / 회원가입 -->
          <template v-if="!isLoggedIn">
            <button class="btn ghost" @click="handleLogin">로그인</button>
            <button class="btn ghost" @click="handleSignup">회원가입</button>
          </template>

          <!-- 로그인 한 경우: 이름 + 로그아웃 -->
          <template v-else>
            <span class="user-name">홍길동 님</span>
            <button class="btn ghost" @click="handleLogout">로그아웃</button>
          </template>
        </div>
      </div>
    </header>

    <!-- 필요 시 탭 네비는 추후 활성화
    <nav class="tab-nav">
      <RouterLink to="/" class="tab" active-class="active-tab">홈</RouterLink>
      <RouterLink to="/notice" class="tab" active-class="active-tab">공지사항</RouterLink>
    </nav>
    -->

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #ffffff;
  color: #f5f5f5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.section-title-image {
  display: block;
  max-height: 40px;
  width: auto;
}

.header {
  padding: 10px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  flex-direction: column;   /* 위: 로고 / 아래: 타이틀+유저 */
  gap: 8px;                 /* 두 줄 사이 간격 */
}

/* 두 번째 줄: 좌우 배치 */
.header-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

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
  border-radius: 999px;       /* 둥근 모서리 */
  border: 1px solid #cbd5f5;
  background: #e5edff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* 로고 한 줄 */
.logo {
  margin: 0;                  /* 개별 margin 대신 header의 gap 사용 */
}

.tab-nav {
  display: flex;
  background: #262626;
  padding: 8px 12px 10px;
  gap: 8px;
  border-bottom: 1px solid #333;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  border-radius: 999px;
  font-size: 13px;
  color: #cccccc;
  text-decoration: none;
}

.active-tab {
  background: #3a3a3a;
  color: #ffffff;
  font-weight: 600;
}

.logo-link {
  color: #f5f5f5;
  text-decoration: none;
}

.main {
  padding: 0;
}
</style>
