<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const uploading = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const album = ref<AlbumPhoto | null>(null)
const titleInput = ref('')
const descriptionInput = ref('')

// 파일 업로드 상태
const files = ref<File[]>([])

// 미리보기용
const previews = ref<{ name: string; path: string; url: string }[]>([])
const imageUrl = ref<string | null>(null)

// textarea ref
const descriptionRef = ref<HTMLTextAreaElement | null>(null)

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files) return
  files.value = Array.from(target.files)
}

// textarea 자동 높이 조절
const autoResize = () => {
  const el = descriptionRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

// 앨범 정보 및 이미지 로드
const loadAlbum = async () => {
  const idParam = route.params.id
  const id = Number(idParam)

  if (Number.isNaN(id)) {
    errorMessage.value = '잘못된 사진첩 번호입니다.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('album_photos')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    console.error('load error', error)
    errorMessage.value = '사진첩을 불러오는 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  album.value = data as AlbumPhoto
  titleInput.value = album.value.title
  descriptionInput.value = album.value.description ?? ''

  await nextTick()
  autoResize()

  // 대표 이미지
  if (album.value.file_path) {
    const { data: urlData } = supabase.storage
      .from('album-photos')
      .getPublicUrl(album.value.file_path)
    imageUrl.value = urlData.publicUrl
  } else {
    imageUrl.value = null
  }

  await loadPreviews()
  loading.value = false
}

// 앨범 폴더 내 이미지 전체 미리보기
const loadPreviews = async () => {
  if (!album.value) return
  const dirPrefix = `${album.value.id}/`

  const { data: listData, error: listError } = await supabase.storage
    .from('album-photos')
    .list(dirPrefix, { limit: 100 })

  if (listError) {
    console.error('list error', listError)
    return
  }

  if (!listData) {
    previews.value = []
    return
  }

  previews.value = listData.map((item) => {
    const path = `${dirPrefix}${item.name}`
    const { data: urlData } = supabase.storage
      .from('album-photos')
      .getPublicUrl(path)
    return {
      name: item.name,
      path,
      url: urlData.publicUrl,
    }
  })
}

// 저장: 제목/내용 UPDATE + (새 파일 선택 시) 기존 파일 삭제 후 새 업로드
const saveAlbum = async () => {
  if (!album.value) return
  if (!titleInput.value.trim()) {
    alert('제목을 입력해 주세요.')
    return
  }

  loading.value = true
  uploading.value = false
  errorMessage.value = ''

  const id = album.value.id
  const dirPrefix = `${id}/`

  try {
    // 1) 제목/내용 업데이트
    const { error: updateError } = await supabase
      .from('album_photos')
      .update({
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('update error', updateError)
      throw new Error('사진첩 저장 중 오류가 발생했습니다.')
    }

    // 2) 새 파일이 선택된 경우에만 이미지 교체
    if (files.value.length > 0) {
      uploading.value = true

      // 2-1) 기존 파일 전체 삭제
      const { data: listData } = await supabase.storage
        .from('album-photos')
        .list(dirPrefix, { limit: 100 })

      if (listData && listData.length > 0) {
        const paths = listData.map((item) => `${dirPrefix}${item.name}`)
        await supabase.storage.from('album-photos').remove(paths)
      }

      // 2-2) 새 파일 업로드
      let firstPath: string | null = null
      let firstName: string | null = null

      for (const file of files.value) {
        const ext = file.name.split('.').pop() || ''
        const fileName = `${crypto.randomUUID()}.${ext}`
        const path = `${id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('album-photos')
          .upload(path, file)

        if (uploadError) {
          console.error('upload error', uploadError)
          errorMessage.value = '이미지 업로드 중 일부 오류가 발생했습니다.'
          continue
        }

        if (!firstPath) {
          firstPath = path
          firstName = file.name
        }
      }

      // 2-3) 대표 이미지 정보 갱신
      if (firstPath && firstName) {
        const { error: coverError } = await supabase
          .from('album_photos')
          .update({
            file_path: firstPath,
            file_name: firstName,
          })
          .eq('id', id)

        if (coverError) {
          console.error('cover update error', coverError)
        } else {
          const { data: urlData } = supabase.storage
            .from('album-photos')
            .getPublicUrl(firstPath)
          imageUrl.value = urlData.publicUrl
        }
      }

      files.value = []
      uploading.value = false
    }

    await loadPreviews()
    alert('저장되었습니다.')
    router.push({ name: 'album' })
  } catch (e: any) {
    console.error(e)
    errorMessage.value = e.message || '저장 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
    uploading.value = false
  }
}

// 삭제: 스토리지 파일 전체 + 게시글 삭제
const deleteAlbum = async () => {
  if (!album.value) return
  if (!confirm('정말로 이 사진첩을 삭제하시겠습니까?')) return

  deleting.value = true
  errorMessage.value = ''

  const id = album.value.id
  const dirPrefix = `${id}/`

  try {
    // 스토리지 파일 삭제
    const { data: listData, error: listError } = await supabase.storage
      .from('album-photos')
      .list(dirPrefix, { limit: 100 })

    if (listError) {
      console.error('list error', listError)
      throw new Error('이미지 목록을 불러오는 중 오류가 발생했습니다.')
    }

    if (listData && listData.length > 0) {
      const paths = listData.map((item) => `${dirPrefix}${item.name}`)
      const { error: removeError } = await supabase.storage
        .from('album-photos')
        .remove(paths)

      if (removeError) {
        console.error('remove error', removeError)
        throw new Error('이미지 삭제 중 오류가 발생했습니다.')
      }
    }

    // DB 행 삭제
    const { error: deleteError } = await supabase
      .from('album_photos')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('delete error', deleteError)
      throw new Error('게시글 삭제 중 오류가 발생했습니다.')
    }

    alert('삭제되었습니다.')
    router.push({ name: 'album' })
  } catch (e: any) {
    console.error(e)
    errorMessage.value = e.message || '삭제 중 오류가 발생했습니다.'
  } finally {
    deleting.value = false
  }
}

const cancelWrite = () => {
  router.push({ name: 'album' })
}

onMounted(() => {
  loadAlbum()
})
</script>

<template>
  <div class="page">
    <main class="content">
      <section v-if="loading && !album" class="card">
        <p class="info-text">사진첩을 불러오는 중입니다...</p>
      </section>

      <section v-else-if="errorMessage" class="card">
        <p class="info-text">{{ errorMessage }}</p>
      </section>

      <section v-else-if="album" class="detail-wrapper">
        <!-- 제목 -->
        <section class="card header-card">
          <input
            v-model="titleInput"
            class="title-input"
            type="text"
            placeholder="사진첩 제목을 입력하세요."
          />
        </section>

        <!-- 본문 + 미리보기 -->
        <section class="card content-card">
          <textarea
            v-model="descriptionInput"
            class="content-textarea"
            placeholder="사진첩 내용을 입력하세요."
            ref="descriptionRef"
            @input="autoResize"
          ></textarea>

          <div v-if="previews.length" class="preview-grid">
            <div
              v-for="img in previews"
              :key="img.path"
              class="preview-item"
            >
              <img :src="img.url" :alt="img.name" />
            </div>
          </div>

          <p class="notice-date">
            {{ new Date(album.created_at).toLocaleString() }}
          </p>
        </section>

        <!-- 본문 바깥 하단: 좌측 첨부, 우측 저장/삭제/목록 -->
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

          <!-- 우측: 저장/삭제/목록 -->
          <div class="actions">
            <button
              type="button"
              class="action-btn primary"
              :disabled="uploading || loading || deleting"
              @click="saveAlbum"
            >
              {{ uploading || loading ? '저장 중...' : '저장' }}
            </button>
            <button
              type="button"
              class="action-btn danger"
              :disabled="uploading || loading || deleting"
              @click="deleteAlbum"
            >
              {{ deleting ? '삭제 중...' : '삭제' }}
            </button>
            <button
              type="button"
              class="action-btn"
              :disabled="uploading || loading || deleting"
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
  max-height: none;
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  gap: 8px;
}

/* textarea: 높이 자동, 스크롤 없음 */
.content-textarea {
  width: 100%;
  border: none;
  outline: none;
  font-size: 12px;
  color: #4b5563;
  white-space: pre-wrap;
  resize: none;
  overflow-y: hidden; /* 스크롤 숨김[web:565][web:577] */
}

/* 미리보기: 한 줄에 하나씩 큰 썸네일 */
.preview-grid {
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.preview-item {
  width: 100%;
  height: 220px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.notice-date {
  margin-top: 4px;
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
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

/* 저장/삭제/목록 버튼: 우측 */
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
