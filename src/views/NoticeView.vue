<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

type Notice = {
  id: number
  title: string
  content: string
  created_at: string
  author?: string | null
}

const router = useRouter()

const notices = ref<Notice[]>([])
const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

// 페이징 상태
const page = ref(1)
const pageSize = 10          // 필요하면 10으로 변경
const totalCount = ref(0)
const totalPages = ref(1)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

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

function handleSearch() {
  page.value = 1
  fetchNotices()
}

onMounted(fetchNotices)

watch(page, async () => {
  await fetchNotices()
  scrollToTop()
})
</script>

<template>
  <div class="page">
    <main class="content">
      <template>
        <nav class="tabs">
          <RouterLink to="/about" class="tab">동문회소개</RouterLink>
          <RouterLink to="/notice" class="tab">공지사항</RouterLink>
          <RouterLink to="/members" class="tab">동문명부</RouterLink>
          <RouterLink to="/album" class="tab">사진첩</RouterLink>
          <RouterLink to="/event" class="tab">경조사</RouterLink>
        </nav>
      </template>
      <!-- 상단 제목 + 검색 -->
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

      <!-- 로딩/에러/빈 상태 -->
      <section v-if="loading" class="state-section">
        <p class="state-text">공지 목록을 불러오는 중입니다...</p>
      </section>

      <section v-else-if="errorMessage" class="state-section">
        <p class="state-text">{{ errorMessage }}</p>
      </section>

      <section v-else-if="notices.length === 0" class="state-section">
        <p class="state-text">검색 조건에 맞는 공지가 없습니다.</p>
      </section>

      <!-- 리스트 -->
      <section v-else class="notice-section">
        <ul class="notice-list">
          <li
            v-for="notice in notices"
            :key="notice.id"
            class="notice-row"
            @click="router.push({ name: 'notice-detail', params: { id: notice.id } })"
          >
            <span class="notice-title">{{ notice.title }}</span>
            <span class="notice-author">관리자</span>
            <span class="notice-date">
              {{ new Date(notice.created_at).toLocaleDateString('ko-KR') }}
            </span>
          </li>
        </ul>

        <!-- 페이징 (리스트 바로 아래 고정) -->
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

        <!-- 필요하면 등록 버튼은 아래에 따로 배치 -->
        <!--
        <div class="write-area">
          <button
            type="button"
            class="write-button"
            @click="router.push({ name: 'notice-write' })"
          >
            등록
          </button>
        </div>
        -->
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  color: #111827;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

/* 본문 폭: 홈/로그인과 맞춤 */
.content {
  max-width: 980px;
  margin: 24px auto;
  padding: 0 20px;
}

/* 상단 제목 + 검색창 */
.section-header {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  white-space: nowrap;
}

/* 검색 박스: 시안처럼 긴 인풋 + 파란 버튼 */
.search-box {
  display: flex;
  align-items: center;
  margin-left: auto;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  max-width: 360px;     /* 너무 넓어지지 않게 상한선만 주기 */
  width: 100%;
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
  flex: 0 0 48px;       /* ✅ 항상 48px 폭 확보 */
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

/* 리스트 전체 */
.notice-section {
  margin-top: 8px;
}

/* 리스트 UL */
.notice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #e5e7eb;
}

/* 한 줄: 제목 / 작성자 / 날짜 */
.notice-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  column-gap: 16px;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.notice-title {
  font-size: 13px;
  color: #111827;
}

.notice-author {
  font-size: 13px;
  color: #6b7280;
}

.notice-date {
  font-size: 13px;
  color: #9ca3af;
  white-space: nowrap;
}

/* 페이징 (pill 버튼 스타일) */
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

/* 비활성 버튼: 흐리게 */
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

/* 모바일 */
@media (max-width: 768px) {
  .content {
    padding: 0 16px;
  }

  .notice-row {
    grid-template-columns: 1fr auto;
    row-gap: 4px;
  }

  .notice-author {
    display: none;
  }
}
</style>
