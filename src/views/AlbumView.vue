<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'

type Photo = {
  id: number
  title: string
  image_path: string
  created_at: string
}

const photos = ref<Photo[]>([])
const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

// 페이징 상태 (페이지당 5건)
const page = ref(1)
const pageSize = 5
const totalCount = ref(0)
const totalPages = ref(1)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function fetchPhotos() {
  loading.value = true
  errorMessage.value = ''

  const from = (page.value - 1) * pageSize
  const to = from + pageSize - 1

let query = supabase
  .from('album_photos')  // 🔹 실제 테이블명
  .select('id, title, image_path, created_at', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range(from, to)

  const q = searchQuery.value.trim()
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('album fetch error:', error)
    errorMessage.value = '사진 데이터를 불러오는 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  photos.value = (data ?? []) as Photo[]
  totalCount.value = count ?? 0
  totalPages.value = Math.max(1, Math.ceil(totalCount.value / pageSize))
  loading.value = false
}

function handleSearch() {
  page.value = 1
  fetchPhotos()
}

onMounted(fetchPhotos)

watch(page, async () => {
  await fetchPhotos()
  scrollToTop()
})
</script>

<template>
  <div class="page">
    <main class="content">
      <!-- 상단 제목 + 검색 (공지사항과 동일 구조) -->
      <section class="section-header">
        <!--<h2 class="section-title">사진첩</h2>-->

        <div class="search-box-wrapper">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="제목 검색"
              @keyup.enter="handleSearch"
            />
            <button class="search-button" type="button" @click="handleSearch">
              🔍
            </button>
          </div>
        </div>
      </section>

      <!-- 로딩/에러/빈 상태 -->
      <section v-if="loading" class="state-section">
        <p class="state-text">사진 목록을 불러오는 중입니다...</p>
      </section>

      <section v-else-if="errorMessage" class="state-section">
        <p class="state-text">{{ errorMessage }}</p>
      </section>

      <section v-else-if="photos.length === 0" class="state-section">
        <p class="state-text">검색 조건에 맞는 사진이 없습니다.</p>
      </section>

      <!-- 사진 리스트 + 페이징 -->
      <section v-else class="album-section">
        <!-- 사진 그리드 (기존 그대로) -->
        <section class="gallery">
          <article
            v-for="photo in photos"
            :key="photo.id"
            class="photo-card"
          >
            <img :src="photo.image_path" :alt="photo.title" class="photo-img" />
            <div class="photo-info">
              <p class="photo-title">{{ photo.title }}</p>
            </div>
          </article>
        </section>

        <!-- 페이징 (공지사항과 동일 스타일) -->
        <div class="pagination">
          <button
            class="page-button"
            :disabled="page === 1"
            @click="page = 1"
          >
            처음
          </button>
          <button
            class="page-button"
            :disabled="page === 1"
            @click="page = page - 1"
          >
            이전
          </button>

          <span class="page-info">
            {{ page }} / {{ totalPages }}
          </span>

          <button
            class="page-button"
            :disabled="page === totalPages"
            @click="page = page + 1"
          >
            다음
          </button>
          <button
            class="page-button"
            :disabled="page === totalPages"
            @click="page = totalPages"
          >
            마지막
          </button>
        </div>
      </section>
      <!-- 등록 버튼 -->
      <div class="actions">
        <button
          type="button"
          class="action-btn"
          @click="router.push({ name: 'notice-write' })"
        >
          등록
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100%;
  background: #ffffff;
  color: #111827;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

/* Notice/Signup과 동일한 폭/여백 */
.content {
  max-width: 980px;
  margin: 16px auto 24px;
  padding: 0 20px 16px;
}

/* 상단 제목 + 검색창 (공지사항과 동일) */
.section-header {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  white-space: nowrap;
}

/* 검색 박스: 제목 아래, 오른쪽 정렬 */
.search-box-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.search-box {
  display: flex;
  align-items: center;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  max-width: 360px;
  max-height : 28px;
  width: 60%;
}

.search-input {
  flex: 1 1 auto;       /* ✅ 폭 줄어들 때 같이 줄어들도록 */
  min-width: 0;         /* ✅ flex 아이템이 실제로 줄어들 수 있게 */
  height: 40px;
  padding: 0 14px;
  border: none;
  font-size: 14px;
  outline: none;
}

.search-button {
  flex: 0 0 48px;
  height: 40px;
  border: none;
  background: #0b3b7a;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 상태 메시지 */
.state-section {
  padding: 40px 0;
  text-align: center;
}

.state-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* 리스트 전체 래퍼 */
.album-section {
  margin-top: 8px;
  padding-bottom: 8px;
}

/* 사진 그리드 (기존 유지) */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

/* 개별 사진 카드 */
.photo-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
}

.photo-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.photo-info {
  padding: 8px 10px;
}

.photo-title {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* 공지와 같은 페이징 스타일 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.page-button {
  min-width: 52px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #dbe3ff;
  font-size: 13px;
  cursor: pointer;
  background: #e5edff;
  color: #0b3b7a;
}

.page-button:disabled {
  background: #f3f4ff;
  color: #cbd5f5;
  border-color: #e5e7fb;
  cursor: default;
}

.page-info {
  font-size: 13px;
  color: #9ca3af;
}

/* 버튼 영역 */
.actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn {
  min-width: 60px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}

/* 모바일 */
@media (max-width: 768px) {
  .content {
    padding: 0 16px 16px;
  }

  .search-box {
    width: 100%;
  }
}
</style>
