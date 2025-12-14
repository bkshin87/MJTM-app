<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

type Notice = {
  id: number
  title: string
  content: string
  created_at: string
}

const router = useRouter()

const notices = ref<Notice[]>([])
const loading = ref(false)
const errorMessage = ref('')

// 검색 상태
const searchQuery = ref('')

// 페이징 상태
const page = ref(1)
const pageSize = 5
const totalCount = ref(0)
const totalPages = ref(1)

async function fetchNotices() {
  loading.value = true
  errorMessage.value = ''

  const from = (page.value - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('notice')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const q = searchQuery.value.trim()
  if (q) {
    // 제목 OR 내용에서 검색 (대소문자 무시)
    query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('supabase error:', error)
    errorMessage.value = '공지 데이터를 불러오는 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  notices.value = data ?? []
  totalCount.value = count ?? 0
  totalPages.value = Math.max(1, Math.ceil(totalCount.value / pageSize))
  loading.value = false
}

// 검색 버튼/엔터로 검색할 때 1페이지부터 다시 조회
function handleSearch() {
  page.value = 1
  fetchNotices()
}

onMounted(fetchNotices)

watch(page, () => {
  fetchNotices()
})
</script>




<template>
  <div class="page">
    <main class="content">
      <section class="section-header">
        <h2 class="section-title">공지사항</h2>

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
      </section>

      <section v-if="loading" class="card">
        <p class="welcome-text">공지 목록을 불러오는 중입니다...</p>
      </section>

      <section v-else-if="errorMessage" class="card">
        <p class="welcome-text">{{ errorMessage }}</p>
      </section>

      <section v-else-if="notices.length === 0" class="card">
        <p class="welcome-text">검색 조건에 맞는 공지가 없습니다.</p>
      </section>

      <section v-else class="list">
        <article
          v-for="notice in notices"
          :key="notice.id"
          class="card notice-item"
          @click="router.push({ name: 'notice-detail', params: { id: notice.id } })"
        >
          <h3 class="notice-title">{{ notice.title }}</h3>
          <p class="notice-date">
            {{ new Date(notice.created_at).toLocaleString() }}
          </p>
          <!-- 필요하면 내용 일부 노출
          <p class="notice-content">
            {{ notice.content }}
          </p>
          -->
        </article>

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
    </main>
  </div>
</template>



<style scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  color: #111827;
}

.content {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

/* 헤더: 제목 + 검색창 우측 배치 */
.section-header {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  white-space: nowrap; /* 줄바꿈 방지 */
}

/* 검색 박스 */
.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 1;   /* 필요하면 줄어들 수 있게 */
}

.search-input {
  height: 32px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  font-size: 13px;
  min-width: 80px; /* 기존보다 살짝 줄여서 여유 확보 */
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
}

.search-button {
  height: 32px;
  width: 32px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #e5edff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 카드: 흰 바탕 위 연그레이 박스 */
.card {
  background: #f3f4f6;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 12px;
}

.welcome-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 공지 아이템 카드 */
.notice-item {
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  border: 1px solid #e5e7eb;
}

.notice-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.notice-date {
  margin: 0 0 8px;
  font-size: 12px;
  color: #9ca3af;
}

.notice-content {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
}

/* 페이징 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.page-button {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #cbd5f5;
  background: #e5edff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.page-button:disabled {
  opacity: 0.4;
  cursor: default;
}

.page-info {
  font-size: 12px;
  color: #6b7280;
}

</style>
