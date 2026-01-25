<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

type AlbumPhoto = {
  id: number
  title: string
  description: string | null
  file_path: string | null
  file_name: string | null
  created_at: string
  created_by: string | null
}

const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')

const album = ref<AlbumPhoto | null>(null)
const titleInput = ref('')
const descriptionInput = ref('')

// 파일 업로드 상태
const files = ref<File[]>([])
const uploading = ref(false)

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files) return
  files.value = Array.from(target.files)
}

// 저장
const saveAlbum = async () => {
  if (!titleInput.value.trim()) {
    alert('제목을 입력해 주세요.')
    return
  }

  loading.value = true
  errorMessage.value = ''

  // 1) 글 먼저 저장 (이미지 없이도 가능)
  const { data: row, error: insertError } = await supabase
    .from('album_photos')
    .insert({
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
    })
    .select('*')
    .maybeSingle()

  if (insertError || !row) {
    console.error('insert error', insertError)
    errorMessage.value = '사진첩 저장 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  album.value = row as AlbumPhoto

  // 2) 파일이 있으면 전부 업로드하고, 첫 번째 성공 파일을 대표 이미지로 사용
  if (files.value.length > 0 && album.value) {
    uploading.value = true

    try {
      let firstPath: string | null = null
      let firstName: string | null = null

      for (const file of files.value) {
        const ext = file.name.split('.').pop() || ''
        const fileName = `${crypto.randomUUID()}.${ext}`
        const path = `${album.value.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('album-photos') // 버킷 이름
          .upload(path, file)

        if (uploadError) {
          console.error('upload error', uploadError)
          errorMessage.value = '이미지 업로드 중 오류가 발생했습니다.'
          continue
        }

        if (!firstPath) {
          firstPath = path
          firstName = file.name
        }
      }

      if (firstPath && firstName) {
        const { data: updated, error: updateError } = await supabase
          .from('album_photos')
          .update({
            file_path: firstPath,
            file_name: firstName,
          })
          .eq('id', album.value.id)
          .select('*')
          .maybeSingle()

        if (updateError) {
          console.error('update error', updateError)
          errorMessage.value = '이미지 정보 저장 중 오류가 발생했습니다.'
        } else if (updated) {
          album.value = updated as AlbumPhoto
        }
      }
    } catch (e) {
      console.error(e)
      errorMessage.value = '이미지 업로드 중 오류가 발생했습니다.'
    } finally {
      uploading.value = false
    }
  }

  loading.value = false
  alert('저장되었습니다.')
  router.push({ name: 'album' })
}

// 취소
const cancelWrite = () => {
  router.push({ name: 'album' })
}
</script>

<template>
  <div class="page">
    <main class="content">
      <section v-if="loading" class="card">
        <p class="info-text">사진첩을 저장하는 중입니다...</p>
      </section>

      <section v-else-if="errorMessage" class="card">
        <p class="info-text">{{ errorMessage }}</p>
      </section>

      <section v-else class="detail-wrapper">
        <!-- 제목 -->
        <section class="card header-card">
          <input
            v-model="titleInput"
            class="title-input"
            type="text"
            placeholder="사진첩 제목을 입력하세요."
          />
        </section>

        <!-- 본문 -->
        <section class="card content-card">
          <textarea
            v-model="descriptionInput"
            class="content-textarea"
            placeholder="사진첩 내용을 입력하세요."
          ></textarea>
        </section>

        <!-- 본문 바깥 하단: 좌측 첨부, 우측 저장/취소 -->
        <section class="footer-row">
          <!-- 좌측: 첨부하기 버튼 -->
          <div class="attach-area">
            <label class="attach-button">
              첨부하기
              <input
                type="file"
                accept="image/*"
                multiple
                @change="onFileChange"
              />
            </label>
            <span v-if="files.length" class="attach-info">
              선택된 파일: {{ files.length }}개
            </span>
          </div>

          <!-- 우측: 저장/취소 버튼 -->
          <div class="actions">
            <button
              type="button"
              class="action-btn primary"
              :disabled="uploading || loading"
              @click="saveAlbum"
            >
              {{ uploading || loading ? '저장 중...' : '저장' }}
            </button>
            <!-- <button
              type="button"
              class="action-btn danger"
              @click="cancelWrite"
            >
              목록
            </button> -->
            <button
              type="button"
              class="action-btn"
              @click="cancelWrite"
            >
              목록
            </button>
          </div>
        </section>
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

.title-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  padding: 0;
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

.content-textarea {
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

/* 본문 바깥 하단 줄 */
.footer-row {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

/* 첨부하기 버튼: 좌측 */
.attach-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attach-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}

.attach-button input[type='file'] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.attach-info {
  font-size: 11px;
  color: #9ca3af;
}

/* 저장/취소 버튼: 우측 */
.actions {
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

  .footer-row {
    flex-direction: column;
    align-items: flex-end;
  }

  .attach-area {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
