<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

type EventItem = {
  id: number
  type: string | null        // '1' | '2'
  title: string
  description: string | null
  event_date: string | null
  location: string | null
  created_at: string
  created_by: string | null
  congratulatory_flower: string | null
  condolence_flower: string | null
  condolence_flag: string | null
  members?: {
    name: string | null
  } | null
}

const route = useRoute()
const router = useRouter()

const eventItem = ref<EventItem | null>(null)
const loading = ref(true)
const errorMessage = ref('')

// 입력 상태
const titleInput = ref('')
const contentInput = ref('')
const typeInput = ref<'1' | '2' | ''>('')

// 체크박스 상태
const congratulatoryChecked = ref(false)
const condolenceFlowerChecked = ref(false)
const condolenceFlagChecked = ref(false)

// 현재 로그인 사용자
const currentUserId = ref<string | null>(null)
const isOwner = computed(
  () =>
    !!eventItem.value &&
    !!currentUserId.value &&
    eventItem.value.created_by === currentUserId.value,
)

// 유형에 따른 체크박스 노출
const showCongratulatory = computed(() => typeInput.value === '1') // 경사
const showCondolence = computed(() => typeInput.value === '2') // 조사

onMounted(async () => {
  const { data: userData } = await supabase.auth.getUser()
  currentUserId.value = userData.user?.id ?? null

  const idParam = route.params.id
  const id = Number(idParam)

  if (Number.isNaN(id)) {
    errorMessage.value = '잘못된 경조사 번호입니다.'
    loading.value = false
    return
  }

  const { data, error } = await supabase
    .from('events')
    .select(
      `
      *,
      members:created_by ( name )
      `,
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('supabase error:', error)
    errorMessage.value = '경조사 상세를 불러오는 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  if (!data) {
    errorMessage.value = '해당 경조사를 찾을 수 없습니다.'
    loading.value = false
    return
  }

  eventItem.value = data as EventItem
  titleInput.value = eventItem.value.title
  contentInput.value = eventItem.value.description ?? ''
  typeInput.value = (eventItem.value.type as '1' | '2') ?? ''

  // DB 플래그 → 체크박스 초기값
  congratulatoryChecked.value = !!eventItem.value.congratulatory_flower
  condolenceFlowerChecked.value = !!eventItem.value.condolence_flower
  condolenceFlagChecked.value = !!eventItem.value.condolence_flag

  loading.value = false
})

// 저장 버튼
const saveEvent = async () => {
  if (!eventItem.value) return

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
    .update({
      title: titleInput.value.trim(),
      description: contentInput.value.trim(),
      type: typeInput.value,
      congratulatory_flower: congratulatoryChecked.value ? 'x' : '',
      condolence_flower: condolenceFlowerChecked.value ? 'x' : '',
      condolence_flag: condolenceFlagChecked.value ? 'x' : '',
    })
    .eq('id', eventItem.value.id)
    .select(
      `
      *,
      members:created_by ( name )
      `,
    )
    .maybeSingle()

  if (error) {
    console.error('supabase update error:', error)
    errorMessage.value = '경조사 수정 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  if (data) {
    eventItem.value = data as EventItem
    alert('수정되었습니다.')
  }

  loading.value = false
}

// 체크박스 토글 시 개별 필드 업데이트
const updateFlagField = async (
  field: 'congratulatory_flower' | 'condolence_flower' | 'condolence_flag',
  checked: boolean,
) => {
  if (!eventItem.value) return

  const payload: Record<string, string> = {}
  payload[field] = checked ? 'x' : ''

  const { error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', eventItem.value.id)

  if (error) {
    console.error('supabase flag update error:', error)
    alert('상태 업데이트 중 오류가 발생했습니다.')
    return
  }

  ;(eventItem.value as any)[field] = checked ? 'x' : ''
}

// 체크박스 변경 watch
watch(congratulatoryChecked, (val) => {
  updateFlagField('congratulatory_flower', val)
})
watch(condolenceFlowerChecked, (val) => {
  updateFlagField('condolence_flower', val)
})
watch(condolenceFlagChecked, (val) => {
  updateFlagField('condolence_flag', val)
})

// 삭제
const deleteEvent = async () => {
  if (!eventItem.value) return
  if (!confirm('정말 삭제하시겠습니까?')) return

  loading.value = true
  errorMessage.value = ''

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventItem.value.id)

  if (error) {
    console.error('supabase delete error:', error)
    errorMessage.value = '경조사 삭제 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  alert('삭제되었습니다.')
  loading.value = false
  router.push({ name: 'event' })
}
</script>

<template>
  <div class="page">
    <main class="content">
      <section v-if="loading" class="card">
        <p class="info-text">경조사 상세를 불러오는 중입니다...</p>
      </section>

      <section v-else-if="errorMessage" class="card">
        <p class="info-text">{{ errorMessage }}</p>
      </section>

      <section v-else-if="eventItem" class="detail-wrapper">
        <!-- 제목 (공지와 동일 카드/인풋) -->
        <section class="card header-card">
          <input
            v-model="titleInput"
            class="notice-title-input"
            type="text"
            placeholder="경조사 제목을 입력하세요."
          />
        </section>

        <!-- 유형 선택 -->
        <section class="type-row">
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

        <!-- 본문 (공지와 동일 카드/textarea + 메타) -->
        <section class="card content-card">
          <textarea
            v-model="contentInput"
            class="notice-content-textarea"
            placeholder="경조사 내용을 입력하세요."
          ></textarea>
          <p class="notice-date">
            {{ new Date(eventItem.created_at).toLocaleString() }}
            <span v-if="eventItem.members?.name">
              · 작성자: {{ eventItem.members.name }}
            </span>
          </p>
        </section>

        <!-- 체크박스 + 버튼 -->
        <div class="actions">
          <div class="buttons" v-if="isOwner">
            <button type="button" class="action-btn primary" @click="saveEvent">저장</button>
            <button type="button" class="action-btn danger" @click="deleteEvent">삭제</button>
          </div>

          <div class="checks">
            <label v-if="showCongratulatory" class="check-label">
              <input type="checkbox" v-model="congratulatoryChecked" />
              축하화환
            </label>

            <label v-if="showCondolence" class="check-label">
              <input type="checkbox" v-model="condolenceFlowerChecked" />
              근조화환
            </label>

            <label v-if="showCondolence" class="check-label">
              <input type="checkbox" v-model="condolenceFlagChecked" />
              근조기
            </label>
          </div>
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

/* 공통 카드 스타일 (공지와 동일) */
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

/* 유형 선택 줄 */
.type-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
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

/* 본문 카드 / textarea / 날짜 (공지와 동일) */
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

.notice-date {
  margin: 8px 0 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
}

/* 체크박스 + 버튼 영역 */
.actions {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.checks {
  display: flex;
  gap: 12px;
}

.check-label {
  font-size: 12px;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 4px;
}

.buttons {
  display: flex;
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

@media (max-width: 768px) {
  .content {
    padding: 0 16px;
  }

  .actions {
    flex-direction: column;
    align-items: flex-end;
  }

  .checks {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
