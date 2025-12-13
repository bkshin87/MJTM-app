<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="logo"><RouterLink to="/" class="tab">명지대학교 토목공학과 총동문회</RouterLink></h1>
    </header>

    <!--<nav class="tab-nav">
      <RouterLink to="/" class="tab" active-class="active-tab">홈</RouterLink>
      <RouterLink to="/notice" class="tab" active-class="active-tab">공지사항</RouterLink>
      나중에 경조사 / 사진첩 / 동문명부 추가
    </nav>
    -->

    <main class="main">
      <RouterView /> <!--HomeView.vue-->
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #1f1f1f;
  color: #f5f5f5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.header {
  padding: 10px 16px 4px;
  background: #262626;
  border-bottom: 1px solid #333;
}

.logo {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.tab-nav {
  display: flex;
  background: #262626;
  padding: 8px 12px 10px;
  gap: 8px;
  border-bottom: 1px solid #333;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  border-radius: 999px;
  font-size: 13px;
  color: #cccccc;
  text-decoration: none;
}

.active-tab {
  background: #3a3a3a;
  color: #ffffff;
  font-weight: 600;
}

.logo-link {
  color: #f5f5f5;
  text-decoration: none;
}
.main {
  padding: 0;
}
</style>
