<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

type Photo = {
  id: number
  title: string
  file_path: string | null
  fiel_name: string | null
  created_at: string
}

const router = useRouter()

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
    .from('album_photos')
    .select('id, title, file_path, created_at, description', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const q = searchQuery.value.trim()
  if (q) {
    // 제목 OR 내용 검색
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%`
    ) // 여러 컬럼 ilike 는 or() 사용[web:578][web:579]
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
      <!-- 상단 제목 + 검색 -->
      <section class="section-header">
        <div class="search-box-wrapper">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="제목/내용 검색"
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

      <!-- 리스트 + 페이징 -->
      <section v-else class="album-section">
        <ul class="album-list">
          <li
            v-for="photo in photos"
            :key="photo.id"
            class="album-row"
            @click="router.push({ name: 'album-detail', params: { id: photo.id } })"
          >
            <span class="album-title">{{ photo.title }}</span>
            <span class="album-date">
              {{ new Date(photo.created_at).toLocaleDateString('ko-KR') }}
            </span>
          </li>
        </ul>

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
          @click="router.push({ name: 'album-write' })"
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

.content {
  max-width: 980px;
  margin: 16px auto 24px;
  padding: 0 20px 16px;
}

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
  max-height: 28px;
  width: 60%;
}

.search-input {
  flex: 1 1 auto;
  min-width: 0;
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

.state-section {
  padding: 40px 0;
  text-align: center;
}

.state-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.album-section {
  margin-top: 8px;
  padding-bottom: 8px;
}

.album-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #e5e7eb;
}

.album-row {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 16px;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.album-title {
  font-size: 13px;
  color: #111827;
}

.album-date {
  font-size: 13px;
  color: #9ca3af;
  white-space: nowrap;
}

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

@media (max-width: 768px) {
  .content {
    padding: 0 16px 16px;
  }

  .search-box {
    width: 100%;
  }

  .album-row {
    grid-template-columns: 1fr auto;
    row-gap: 4px;
  }
}
</style>
