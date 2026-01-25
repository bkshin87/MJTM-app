<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

type EventItem = {
  id: number
  type: string | null      // '1' | '2' | '3' 저장
  title: string
  description: string | null
  event_date: string | null
  location: string | null
  created_at: string
  created_by: string | null
}

const router = useRouter()

// 상태
const eventItem = ref<EventItem | null>(null)
const loading = ref(true)
const errorMessage = ref('')

const titleInput = ref('')
const contentInput = ref('')
const typeInput = ref<'1' | '2' | '3' | ''>('')   // 셀렉트 박스 값

onMounted(() => {
  loading.value = false
})

// 저장
const saveEvent = async () => {
  if (!titleInput.value.trim()) {
    alert('제목을 입력해 주세요.')
    return
  }

  if (!typeInput.value) {
    alert('경조사 유형을 선택해 주세요.')
    return
  }

  loading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('events')
    .insert({
      title: titleInput.value.trim(),
      description: contentInput.value.trim(),
      type: typeInput.value,        // ✅ 1/2/3 저장
    })
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('supabase insert error:', error)
    errorMessage.value = '경조사 저장 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  if (data) {
    eventItem.value = data as EventItem
    alert('저장되었습니다.')
    // 등록 후 리스트 첫 페이지로 이동
    router.push({ name: 'event' })
  } else {
    loading.value = false
  }
}

// 취소
const cancelWrite = () => {
  router.push({ name: 'event' })
}
</script>

<template>
  <div class="page">
    <main class="content">
      <section v-if="loading" class="card">
        <p class="info-text">화면을 준비하는 중입니다...</p>
      </section>

      <section v-else-if="errorMessage" class="card">
        <p class="info-text">{{ errorMessage }}</p>
      </section>

      <section v-else class="detail-wrapper">
        <!-- 상단: 제목 입력 -->
        <section class="card header-card">
          <input
            v-model="titleInput"
            class="notice-title-input"
            type="text"
            placeholder="경조사 제목을 입력하세요."
          />
        </section>

        <!-- 제목과 본문 사이, 왼쪽에 타입 선택 박스 -->
        <section class="type-card">
          <!--<label class="type-label" for="event-type-select">유형</label>-->
          <select
            id="event-type-select"
            v-model="typeInput"
            class="type-select"
          >
            <option value="" disabled>유형을 선택하세요</option>
            <option value="1">경사</option>
            <option value="2">조사</option>
          </select>
        </section>

        <!-- 하단: 본문 -->
        <section class="card content-card">
          <textarea
            v-model="contentInput"
            class="notice-content-textarea"
            placeholder="경조사 내용을 입력하세요."
          ></textarea>
          <p v-if="eventItem" class="notice-date">
            {{ new Date(eventItem.created_at).toLocaleString() }}
          </p>
        </section>

        <div class="actions">
          <button type="button" class="action-btn primary" @click="saveEvent">
            저장
          </button>
          <button type="button" class="action-btn danger" @click="cancelWrite">
            취소
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

/* 공통 카드 */
.card {
  background: #f3f4f6;
  border-radius: 14px;
  padding: 16px 18px;
  margin-top: 12px;
}

.info-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.detail-wrapper {
  margin-top: 8px;
}

/* 제목 카드 */
.header-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  min-height: 15px;
  max-height: 15px;
}

.notice-title-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  padding: 0;
}

/* 타입 선택 카드: 제목과 본문 사이, 왼쪽 정렬 */
.type-card {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-label {
  font-size: 13px;
  color: #4b5563;
}

.type-select {
  min-width: 120px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  background: #ffffff;
  color: #111827;
}

/* 본문 카드 */
.content-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  min-height: 300px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
}

.notice-content-textarea {
  flex: 1;
  width: 100%;
  border: none;
  outline: none;
  font-size: 12px;
  color: #4b5563;
  resize: none;
  white-space: pre-wrap;
  overflow-y: auto;
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

.action-btn.primary {
  border-color: #0b3b7a;
  background: #0b3b7a;
  color: #ffffff;
}

.action-btn.danger {
  border-color: #dc2626;
  color: #dc2626;
}

.notice-date {
  margin: 8px 0 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
}

/* 모바일 */
@media (max-width: 768px) {
  .content {
    padding: 0 16px;
  }

  .type-card {
    justify-content: flex-start;
  }
}
</style>
