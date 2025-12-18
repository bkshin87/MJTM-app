<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'

type Member = {
  id: string
  entrance_year: string | null   // 🔹 학번/입학년도
  name: string
  phone: string | null
  company: string | null
  created_at: string
}

const members = ref<Member[]>([])
const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')

// 페이징 상태
const page = ref(1)
const pageSize = 5      // 페이지당 동문 수
const totalCount = ref(0)
const totalPages = ref(1)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function fetchMembers() {
  loading.value = true
  errorMessage.value = ''

  const from = (page.value - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('members')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true }) // 🔹 이름 가나다 순
    .range(from, to)

  const q = searchQuery.value.trim()
  if (q) {
    // 입학년도(학번) / 이름 / 전화번호 / 회사명 OR 검색
    query = query.or(
      `entrance_year.ilike.%${q}%,name.ilike.%${q}%,phone.ilike.%${q}%,company.ilike.%${q}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('members fetch error:', error)
    errorMessage.value = '동문 데이터를 불러오는 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  members.value = (data ?? []) as Member[]
  totalCount.value = count ?? 0
  totalPages.value = Math.max(1, Math.ceil(totalCount.value / pageSize))
  loading.value = false
}

function handleSearch() {
  page.value = 1
  fetchMembers()
}

onMounted(fetchMembers)

watch(page, async () => {
  await fetchMembers()
  scrollToTop()
})
</script>

<template>
  <div class="page">
    <main class="content">
      <!-- 상단 제목 + 검색 -->
      <section class="section-header">
        <h2 class="section-title">동문명부</h2>

        <div class="search-box-wrapper">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="입학년도 / 이름 / 전화번호 / 회사명 검색"
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
        <p class="state-text">동문 명부를 불러오는 중입니다...</p>
      </section>

      <section v-else-if="errorMessage" class="state-section">
        <p class="state-text">{{ errorMessage }}</p>
      </section>

      <section v-else-if="members.length === 0" class="state-section">
        <p class="state-text">검색 조건에 맞는 동문이 없습니다.</p>
      </section>

      <!-- 리스트 -->
      <section v-else class="member-section">
        <ul class="member-list">
          <li
            v-for="m in members"
            :key="m.id"
            class="member-row"
            @click="$router.push({ name: 'member-detail', params: { id: m.id } })"
          >
            <span class="member-col name">
              {{ m.name }}
            </span>
            <span class="member-col entrance-year">
              {{ m.entrance_year || '-' }}
            </span>
            <span class="member-col phone">
              {{ m.phone || '-' }}
            </span>
            <span class="member-col company">
              {{ m.company || '-' }}
            </span>
          </li>
        </ul>

        <!-- 페이징 -->
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
  min-height: 100%;
  background: #ffffff;
  color: #111827;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

/* 공지/사진첩과 동일 레이아웃 */
.content {
  max-width: 980px;
  margin: 16px auto 24px;
  padding: 0 20px 16px;
}

/* 상단 제목 + 검색창 */
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
  width: 100%;
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

/* 동문 리스트 */
.member-section {
  margin-top: 8px;
  padding-bottom: 8px;
}

.member-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #e5e7eb;
}

.member-row {
  display: grid;
  grid-template-columns: 1.1fr 0.7fr 1fr 1.2fr;
  column-gap: 12px;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid #f3f4f6;
}

.member-col {
  font-size: 13px;
  color: #111827;
}

.member-col.entrance-year,
.member-col.phone {
  color: #4b5563;
}

/* 페이징 (공지사항과 동일) */
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

/* 모바일 */
@media (max-width: 768px) {
  .content {
    padding: 0 16px 16px;
  }

  .member-row {
    grid-template-columns: 1fr;
    row-gap: 4px;
    align-items: flex-start;
  }

  .member-col {
    font-size: 13px;
  }
}
</style>
