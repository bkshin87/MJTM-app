<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'


const router = useRouter()


type Notice = {
  id: number
  title: string
  created_at: string
}

type AlbumItem = {
  id: number
  title: string
  created_at: string
}

const notices = ref<Notice[]>([])
const albums = ref<AlbumItem[]>([])
const loadingNotice = ref(true)
const loadingAlbum = ref(true)

onMounted(async () => {
  // 공지사항
  const { data: noticeData, error: noticeError } = await supabase
    .from('notice')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(4)

  if (noticeError) {
    console.error('notice fetch error:', noticeError)
    notices.value = []
  } else {
    notices.value = (noticeData ?? []) as Notice[]
  }
  loadingNotice.value = false

  // 사진첩 (album 테이블 가정)
  const { data: albumData, error: albumError } = await supabase
    .from('album_photos')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(4)

  if (albumError) {
    console.error('album fetch error:', albumError)
    albums.value = []
  } else {
    albums.value = (albumData ?? []) as AlbumItem[]
  }
  loadingAlbum.value = false
})

const goToNoticeDetail = (id: number) => {
  router.push({ name: 'notice-detail', params: { id } })
}

const goToAlbumDetail = (id: number) => {
  router.push({ name: 'album-detail', params: { id } })
}
</script>

<template>
  <div class="page">
    <main class="content">
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
          <li v-if="loadingNotice" class="notice-empty">
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

          <li
            v-if="!loadingNotice && notices.length === 0"
            class="notice-empty"
          >
            등록된 공지가 없습니다.
          </li>
        </ul>
      </section>

      <!-- 사진첩 영역 (공지와 동일한 스타일) -->
      <section class="notice-section album-section">
        <div class="notice-header">
          <h2 class="notice-heading">사진첩</h2>
          <button
            type="button"
            class="notice-add-btn"
            @click="router.push('/album')"
          >
            +
          </button>
        </div>

        <ul class="notice-list">
          <li v-if="loadingAlbum" class="notice-empty">
            불러오는 중입니다...
          </li>

          <li
            v-else
            v-for="a in albums"
            :key="a.id"
            class="notice-row"
            @click="goToAlbumDetail(a.id)"
          >
            <span class="notice-row-title">{{ a.title }}</span>
            <span class="notice-row-date">
              {{ new Date(a.created_at).toLocaleDateString('ko-KR') }}
            </span>
          </li>

          <li
            v-if="!loadingAlbum && albums.length === 0"
            class="notice-empty"
          >
            등록된 사진이 없습니다.
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

/* 공지사항 / 사진첩 공통 */
.notice-section {
  margin-top: 4px;
}

.album-section {
  margin-top: 24px; /* 공지와 약간 간격 */
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.notice-heading {
  margin: 0;
  font-size: 18px;
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

.notice-empty {
  padding: 8px 4px;
  font-size: 14px;
  color: #6b7280;
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
