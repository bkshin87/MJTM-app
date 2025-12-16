<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()

type Notice = {
  id: number
  title: string
  created_at: string
}

const notices = ref<Notice[]>([])
const loading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('notice')
    .select('id, title, created_at')
    .order('created_at', { ascending: false }) // 최신순
    .limit(4)                                  // 최근 4건만

  if (error) {
    console.error('notice fetch error:', error)
    notices.value = []
  } else {
    notices.value = (data ?? []) as Notice[]
  }

  loading.value = false
})

const goToNoticeDetail = (id: number) => {
  router.push({ name: 'notice-detail', params: { id } })
}
</script>

<template>
  <div class="page">
    <main class="content">
      <!-- 네비 탭 -->
      <nav class="tabs">
        <RouterLink to="/about" class="tab">동문회소개</RouterLink>
        <RouterLink to="/notice" class="tab">공지사항</RouterLink>
        <RouterLink to="/members" class="tab">동문명부</RouterLink>
        <RouterLink to="/album" class="tab">사진첩</RouterLink>
        <RouterLink to="/event" class="tab">경조사</RouterLink>
      </nav>

      <!-- 상단 큰 배너 -->
      <section class="hero">
        <div class="hero-image">
          <img src="/images/main.png" alt="배너 이미지" />
          <div class="hero-text-slot">
            자랑스러운 명지 토목인의 공간
          </div>
        </div>
      </section>

      <!-- 공지사항 영역 -->
      <section class="notice-section">
        <div class="notice-header">
          <h2 class="notice-heading">공지사항</h2>
          <button
            type="button"
            class="notice-add-btn"
            @click="router.push('/notice')"
          >
            +
          </button>
        </div>

        <ul class="notice-list">
          <li v-if="loading" class="notice-empty">
            불러오는 중입니다...
          </li>

          <li
            v-else
            v-for="n in notices"
            :key="n.id"
            class="notice-row"
            @click="goToNoticeDetail(n.id)"
          >
            <span class="notice-row-title">{{ n.title }}</span>
            <span class="notice-row-date">
              {{ new Date(n.created_at).toLocaleDateString('ko-KR') }}
            </span>
          </li>

          <li v-if="!loading && notices.length === 0" class="notice-empty">
            등록된 공지가 없습니다.
          </li>
        </ul>
      </section>

      <!-- 구인/구직 박스는 필요 시 주석 해제해서 사용 -->
      <!--
      <section class="recruit-section">
        <a
          href="https://www.naver.com"
          target="_blank"
          rel="noopener noreferrer"
          class="recruit-card recruit-link"
        >
          <div class="recruit-slot">
            구인/구직
          </div>
        </a>
      </section>
      -->
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  color: #111827;
}

/* 메인 컨텐츠 래퍼 (흰 카드 느낌) */
.content {
  max-width: 980px;
  margin: 0 auto 40px;
  padding: 0 20px 32px;
  background-color: #ffffff;
}

/* 탭 메뉴 */
.tabs {
  display: flex;
  /* 기존: justify-content: center;  → 가운데 정렬 대신 좌측 정렬 */
  justify-content: flex-start;
  gap: 28px;
  padding-top: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;

  overflow-x: auto;      /* 가로 스크롤 허용 */
  white-space: nowrap;   /* 줄바꿈 방지 */
  -webkit-overflow-scrolling: touch; /* 모바일 부드러운 스크롤 */
}

.tab {
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  color: #111827;
  padding-bottom: 7px;
  white-space: nowrap;    /* 각 탭 텍스트 줄바꿈 방지 */
  flex-shrink: 0;         /* 좁아져도 탭 폭 유지 */
}
.tab.router-link-active {
  color: #0b3b7a;
  border-bottom: 3px solid #0b3b7a;
}

/* 메인 배너 */
.hero {
  margin-top: 18px;
  margin-bottom: 24px;
}

.hero-image {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
}

.hero-image img {
  display: block;
  width: 100%;
  height: 210px;
  object-fit: cover;
}

/* 배너 중앙 텍스트 */
.hero-text-slot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.45);
  white-space: nowrap;
}

/* 공지사항 */
.notice-section {
  margin-top: 4px;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.notice-heading {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.notice-add-btn {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: none;
  background-color: #ffffff;
  color: #6b7280;
  font-size: 22px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}

.notice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #e5e7eb;
}

.notice-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 4px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.notice-row-title {
  font-size: 15px;
  color: #111827;
}

.notice-row-date {
  font-size: 13px;
  color: #9ca3af;
  white-space: nowrap;
}

/* 구인/구직 영역(현재 미사용) */
.recruit-section {
  margin-top: 28px;
}

.recruit-card {
  background-color: #eef1f7;
  border-radius: 16px;
  padding: 22px 20px;
}

.recruit-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.recruit-slot {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 600;
}

/* 모바일 */
@media (max-width: 768px) {
  .content {
    padding: 0 16px 28px;
  }

  .hero-image img {
    height: 190px;
  }
}
</style>
