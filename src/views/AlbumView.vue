<script setup lang="ts">
import { ref } from 'vue'

type Photo = {
  id: number
  title: string
  url: string
}

const photos = ref<Photo[]>([
  { id: 1, title: '정기모임 1', url: 'https://picsum.photos/400/300?random=1' },
  { id: 2, title: '정기모임 2', url: 'https://picsum.photos/400/300?random=2' },
  { id: 3, title: '체육대회',   url: 'https://picsum.photos/400/300?random=3' },
  { id: 4, title: '송년회',     url: 'https://picsum.photos/400/300?random=4' },
  { id: 5, title: '동문 모임',  url: 'https://picsum.photos/400/300?random=5' },
  { id: 6, title: '번개 모임',  url: 'https://picsum.photos/400/300?random=6' },
])
</script>

<template>
  <div class="page">
    <main class="content">
      <section class="section-header">
        <h2 class="section-title">사진첩</h2>
        <p class="section-desc">동문들의 순간을 사진으로 기록합니다.</p>
      </section>

      <section v-if="photos.length === 0" class="card">
        <p class="empty-text">등록된 사진이 없습니다.</p>
      </section>

      <section v-else class="gallery">
        <article
          v-for="photo in photos"
          :key="photo.id"
          class="photo-card"
        >
          <img :src="photo.url" :alt="photo.title" class="photo-img" />
          <div class="photo-info">
            <p class="photo-title">{{ photo.title }}</p>
          </div>
        </article>
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
  padding: 0 20px 40px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
}

.section-desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

/* 기본 카드 */
.card {
  background: #f3f4f6;
  border-radius: 14px;
  padding: 16px 18px;
}

.empty-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* 사진 그리드 */
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
  object-fit: cover; /* 비율 유지 + 잘라내기 */
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
</style>
