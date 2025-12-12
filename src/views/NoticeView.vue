<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Notice {
  id: number
  title: string
  subtitle: string
  date: string
}

const router = useRouter()

const notices: Notice[] = [
  {
    id: 1,
    title: '2026년 총동문회 어플 개시',
    subtitle: '명지대학교 토목공학과 총동문회 어플 제작 및 개시',
    date: '2025년 11월 23일',
  },
]

const goDetail = (id: number) => {
  router.push({ name: 'notice-detail', params: { id } })
}
</script>


<template>
  <div class="page">
    <main class="content">
      <section class="section-header">
        <h2 class="section-title">공지사항</h2>
        <button class="add-button">+ Add</button>
      </section>

      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input class="search-input" type="text" placeholder="검색" />
      </div>

      <ul class="notice-list">
        <li
          v-for="notice in notices"
          :key="notice.id"
          class="notice-item"
          @click="goDetail(notice.id)"
        >
          <p class="notice-date">{{ notice.date }}</p>
          <div class="notice-main">
            <div>
              <p class="notice-title">{{ notice.title }}</p>
              <p class="notice-subtitle">{{ notice.subtitle }}</p>
            </div>
            <span class="chevron">›</span>
          </div>
        </li>
      </ul>

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

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.add-button {
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  background: #0b74ff;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2b2b2b;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 16px;
}

.search-icon {
  font-size: 14px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #f5f5f5;
  font-size: 14px;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice-item {
  padding: 12px 10px;
  border-radius: 12px;
  background: #2b2b2b;
  margin-bottom: 10px;
}

.notice-date {
  margin: 0 0 4px;
  font-size: 12px;
  color: #7fbfff;
}

.notice-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.notice-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #b0b0b0;
}

.chevron {
  font-size: 20px;
  color: #888;
}

.empty-item {
  padding: 16px 10px;
  border-radius: 12px;
  background: #2b2b2b;
  text-align: center;
  font-size: 14px;
  color: #b0b0b0;
}
</style>
