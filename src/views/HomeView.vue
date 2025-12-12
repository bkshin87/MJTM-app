<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>


<template>
  <div class="page">
    <main class="content">
      <section class="section-header">
        <h2 class="section-title">홈</h2>
      </section>

      <section class="card">
        <p class="welcome-title">MJTM 동문회 메인</p>
        <p class="welcome-text">
          공지사항, 경조사, 사진첩, 동문명부 정보를 한 곳에서 확인할 수 있습니다.
        </p>
      </section>

      <section class="grid">
        <RouterLink to="/notice" class="grid-link">
          <div class="grid-card">
            <p class="grid-title">공지사항</p>
            <p class="grid-text">중요한 알림과 소식을 확인하세요.</p>
          </div>
        </RouterLink>
        <div class="grid-card">
          <p class="grid-title">경조사</p>
          <p class="grid-text">동문 경조사 소식을 공유합니다.</p>
        </div>
        <div class="grid-card">
          <p class="grid-title">사진첩</p>
          <p class="grid-text">행사 사진과 추억을 모아보세요.</p>
        </div>
        <div class="grid-card">
          <p class="grid-title">동문명부</p>
          <p class="grid-text">연락처와 소속을 한눈에.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #1f1f1f;
  color: #f5f5f5;
}

.content {
  padding: 16px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.card {
  background: #2b2b2b;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
}

.welcome-title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
}

.welcome-text {
  margin: 0;
  font-size: 14px;
  color: #b0b0b0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.grid-card {
  background: #2b2b2b;
  border-radius: 12px;
  padding: 12px;
}

.grid-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
}

.grid-text {
  margin: 0;
  font-size: 13px;
  color: #b0b0b0;
}

.grid-link {
  color: #f5f5f5;
  text-decoration: none;
}

.grid-link:hover {
  text-decoration: underline;
}

</style>
