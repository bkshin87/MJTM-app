<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

interface NoticeDetail {
  id: number
  title: string
  content: string
  date: string
  writer: string
}

// 라우트에서 /notice/:id 의 id 값 읽기
const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

// 임시 더미 데이터 (나중에 API/DB로 교체 예정)
const dummyNotices: NoticeDetail[] = [
  {
    id: 1,
    title: '2026년 총동문회 어플 개시',
    content:
      '명지대학교 토목공학과 총동문회 공식 어플리케이션 개시 안내입니다. 추후 공지사항, 경조사, 사진첩, 동문명부 기능이 제공될 예정입니다.',
    date: '2025년 11월 23일',
    writer: '운영진',
  },
]

// URL 의 id 와 같은 공지를 찾기
const notice = dummyNotices.find((n) => n.id === id)

const goBack = () => {
  router.push({ name: 'notice' })
}
</script>

<template>
  <div class="page">
    <main class="content" v-if="notice">
      <button class="back-button" @click="goBack">← 공지사항 목록</button>

      <p class="date">{{ notice.date }}</p>
      <h2 class="title">{{ notice.title }}</h2>
      <p class="writer">작성자: {{ notice.writer }}</p>

      <div class="divider" />

      <p class="body">
        {{ notice.content }}
      </p>
    </main>

    <main class="content" v-else>
      <button class="back-button" @click="goBack">← 공지사항 목록</button>
      <p>해당 공지사항을 찾을 수 없습니다.</p>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #1f1f1f;
  color: #f5f5f5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.content {
  padding: 16px;
}

.back-button {
  margin-bottom: 16px;
  padding: 6px 10px;
  border-radius: 999px;
  border: none;
  background: #2b2b2b;
  color: #f5f5f5;
  cursor: pointer;
  font-size: 13px;
}

.date {
  margin: 0 0 4px;
  font-size: 12px;
  color: #7fbfff;
}

.title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
}

.writer {
  margin: 0 0 12px;
  font-size: 13px;
  color: #b0b0b0;
}

.divider {
  height: 1px;
  background: #333;
  margin-bottom: 12px;
}

.body {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #e0e0e0;
}
</style>
