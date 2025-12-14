<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { canInstallPwa, deferredPromptEvent, setDeferredPrompt } from '@/pwaInstall'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const canInstall = computed(() => canInstallPwa.value)

type Notice = {
  id: number
  title: string
  content: string
  created_at: string
}

const latestNotice = ref<Notice | null>(null)

const installApp = async () => {
  if (!deferredPromptEvent) return

  const result = await deferredPromptEvent.prompt()
  console.log('PWA install outcome:', result.outcome)
  setDeferredPrompt(null)
}

onMounted(async () => {
  const { data, error } = await supabase
    .from('notice')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('supabase error:', error)
    return
  }

  latestNotice.value = (data && data.length > 0 ? data[0] : null) as Notice | null
})

const goToLatestNotice = () => {
  if (!latestNotice.value) return
  router.push({ name: 'notice-detail', params: { id: latestNotice.value.id } })
}

// 홈 화면 메뉴 (아이콘/텍스트는 그대로 사용)
const menus = [
  { title: '공지사항', icon: '📄', desc: '동문회 공식 소식', route: '/notice' },
  { title: '경조사', icon: '🎉', desc: '기쁜 일과 슬픈 일', route: '/event' },
  { title: '사진첩', icon: '📷', desc: '행사 및 추억 공유', route: '/album' },
  { title: '동문명부', icon: '👥', desc: '동문 정보 검색', route: '/members' },
]
</script>

<template>
  <div class="app">
    <!-- Header -->
    <!--<header class="header">
      <div class="header-left">

      </div>

      <div class="header-right header-right--only">
        <span class="user-name">홍길동 님</span>
        <button class="btn ghost">로그아웃</button>
      </div>
    </header>-->

    <!-- Main -->
    <main class="container">
      <!-- Hero Notice (최근 공지) -->
      <section
        v-if="latestNotice"
        class="hero-notice"
        @click="goToLatestNotice"
      >
        <div class="hero-text">
          <h2>동문회 주요 공지</h2>
          <p>{{ latestNotice.title }}</p>
        </div>
        <button class="btn primary">자세히 보기</button>
      </section>

      <!-- 최근 공지가 없을 때 기본 문구 -->
      <section v-else class="hero-notice">
        <div class="hero-text">
          <h2>동문회 주요 공지</h2>
          <p>등록된 공지가 없습니다.</p>
        </div>
      </section>

      <!-- Menu Cards -->
      <section class="menu-section">
        <RouterLink
          v-for="menu in menus"
          :key="menu.title"
          :to="menu.route"
          class="menu-card-link"
        >
          <div class="menu-card">
            <div class="icon">{{ menu.icon }}</div>
            <div class="title">{{ menu.title }}</div>
            <!--<div class="desc">{{ menu.desc }}</div>-->
          </div>
        </RouterLink>
      </section>
    </main>

    <!-- PWA 설치 버튼 -->
    <button
      v-if="canInstall"
      @click="installApp"
      class="install-button"
    >
      앱 설치하기
    </button>
  </div>
</template>

<style scoped>
/* Reset */
* {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fb, #eef1f7);
  color: #222;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  padding-bottom: 10px; /* 하단 여백 추가 */
}

/* Header */
.header {
  height: 64px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 오른쪽 정렬 */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e6e9f0;
}


.logo {
  height: 36px;
}

.site-title {
  font-size: 18px;
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-name {
  font-size: 14px;
  color: #555;
}

/* Buttons */
.btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn.primary {
  background: linear-gradient(135deg, #4f7cff, #2f5bff);
  color: #fff;
  border: none;
}

.btn.ghost {
  background: transparent;
  border: 1px solid #ccd3e0;
  color: #444;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 20px;
}

/* Hero Notice */
.hero-notice {
  background: linear-gradient(135deg, #2f5bff, #6a8bff);
  color: #fff;
  border-radius: 18px;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 16px 40px rgba(47, 91, 255, 0.25);
  cursor: pointer;
}

.hero-text h2 {
  font-size: 20px;
  margin-bottom: 6px;
}

.hero-text p {
  font-size: 14px;
  opacity: 0.9;
}

/* Menu */
.menu-section {
  margin-top: 36px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.menu-card-link {
  text-decoration: none;
  color: inherit;
}

.menu-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px 16px;          /* 기존 26px 22px → 줄임 */
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
  cursor: pointer;
}

.menu-card:hover {
  transform: translateY(-4px); /* 살짝만 띄우기 */
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.08);
}

.menu-card .icon {
  font-size: 28px;             /* 기존 34px → 줄임 */
  margin-bottom: 10px;
}

.menu-card .title {
  font-size: 14px;             /* 기존 16px → 줄임 */
  font-weight: 700;
  margin-bottom: 4px;
}

.menu-card .desc {
  font-size: 12px;             /* 기존 13px → 줄임 */
  color: #666;
}

/* PWA 설치 버튼 (기존 스타일 유지 가능) */
.install-button {
  position: fixed;
  right: 16px;
  bottom: 16px;
  padding: 10px 16px;
  border-radius: 999px;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-notice {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
}
</style>
