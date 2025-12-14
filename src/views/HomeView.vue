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

// 홈 화면 메뉴
const menus = [
  { title: '공지사항', icon: '📄', desc: '동문회 공식 소식', route: '/notice' },
  { title: '경조사', icon: '🎉', desc: '기쁜 일과 슬픈 일', route: '/event' },
  { title: '사진첩', icon: '📷', desc: '행사 및 추억 공유', route: '/album' },
  { title: '동문명부', icon: '👥', desc: '동문 정보 검색', route: '/members' },
]
</script>

<template>
  <div class="app">
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

        <div class="hero-meta">
          <!-- 필요하면 날짜 노출 -->
          <!-- <p class="hero-date">
            {{ new Date(latestNotice.created_at).toLocaleDateString() }}
          </p> -->
          <button
            class="hero-more-button"
            type="button"
            @click.stop="goToLatestNotice"
          >
            자세히 보기
          </button>
        </div>
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
            <!-- <div class="desc">{{ menu.desc }}</div> -->
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
  background: #ffffff; /* App.vue와 동일한 흰색 배경 */
  color: #222;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  padding-bottom: 10px;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 20px;
}

/* Hero Notice */
.hero-notice {
  background: #ffffff;
  border-radius: 18px;
  padding: 24px 28px;
  display: flex;
  flex-direction: column; /* 위: 텍스트, 아래: 버튼 */
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  border: 1px solid #e5e7eb;
}

/* 텍스트를 은은하게 */
.hero-text {
  margin-bottom: 8px;
}

.hero-text h2 {
  font-size: 18px;
  margin-bottom: 4px;
  color: #111827;
}

.hero-text p {
  font-size: 14px;
  color: #4b5563;
}

/* 아래쪽: 버튼을 오른쪽 하단으로 */
.hero-meta {
  margin-top: auto;              /* 위 내용을 위로 밀고, 이 블럭을 하단에 붙임 */
  display: flex;
  justify-content: flex-end;     /* 오른쪽 정렬 */
  align-items: center;
  gap: 8px;
}

.hero-date {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

/* 자세히 보기 버튼: 작고 은은하게 */
.hero-more-button {
  padding: 3px 10px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #cbd5f5;
  background: #e5edff;
  color: #1d4ed8;
  cursor: pointer;
  white-space: nowrap;
}

/* 공통 버튼 (기존) */
.btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn.primary {
  background: linear-gradient(135deg, #b0c1f7, #d8def3);
  color: #fff;
  border: none;
}

.btn.ghost {
  background: transparent;
  border: 1px solid #ccd3e0;
  color: #444;
}

/* Menu */
.menu-section {
  margin-top: 36px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.menu-card-link {
  text-decoration: none;
  color: inherit;
}

.menu-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 12px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  border: 1px solid #e5e7eb;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.08);
}

.menu-card .icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.menu-card .title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.menu-card .desc {
  font-size: 12px;
  color: #666;
}

/* PWA 설치 버튼 */
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
    padding: 20px 18px;
  }
}
</style>
