<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

type Notice = {
  id: number
  title: string
  content: string
  created_at: string
}

const router = useRouter()

// 새 글이므로 초기값만 필요
const notice = ref<Notice | null>(null)
const loading = ref(true)
const errorMessage = ref('')

// 입력용 상태
const titleInput = ref('')
const contentInput = ref('')

// 초기 마운트 시 빈 폼만 준비
onMounted(() => {
  loading.value = false
})

// 저장 버튼
const saveNotice = async () => {
  if (!titleInput.value.trim()) {
    alert('제목을 입력해 주세요.')
    return
  }

  loading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('notice')
    .insert({
      title: titleInput.value.trim(),
      content: contentInput.value.trim(),
    })
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('supabase insert error:', error)
    errorMessage.value = '공지 저장 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  if (data) {
    notice.value = data as Notice
    alert('저장되었습니다.')
    // 저장 후 상세 페이지로 이동 (id 기준)
    router.push({ name: 'notice-detail', params: { id: data.id } })
  } else {
    loading.value = false
  }
}

// 삭제 버튼 (새 글 작성 화면에서는 비활성화하거나 목록으로 이동 정도만)
const deleteDraft = () => {
  // 단순히 목록으로 돌아가기
  router.push({ name: 'notice' })
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
        <!-- 상단: 제목 입력 영역 -->
        <section class="card header-card">
          <input
            v-model="titleInput"
            class="notice-title-input"
            type="text"
            placeholder="공지사항 제목을 입력하세요."
          />
        </section>

        <!-- 하단: 본문 입력 영역 -->
        <section class="card content-card">
          <textarea
            v-model="contentInput"
            class="notice-content-textarea"
            placeholder="공지사항 내용을 입력하세요."
          ></textarea>
          <!-- 새 글이니까 날짜는 안 보여줘도 되고, 필요하면 저장 후 표시 가능 -->
          <p v-if="notice" class="notice-date">
            {{ new Date(notice.created_at).toLocaleString() }}
          </p>
        </section>

        <div class="actions">
          <button type="button" class="action-btn primary" @click="saveNotice">
            저장
          </button>
          <button type="button" class="action-btn danger" @click="deleteDraft">
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

/* 공통 카드 스타일 */
.card {
  background: #f3f4f6;
  border-radius: 14px;
  padding: 16px 18px;
  margin-top: 12px;
}

/* 로딩/에러 텍스트 */
.info-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* 상세 전체 래퍼 */
.detail-wrapper {
  margin-top: 8px;
}

/* 상단 타이틀 영역 카드 */
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

/* 하단 본문 카드 */
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
</style>
