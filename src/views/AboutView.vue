<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
</script>

<template>
  <div class="page">
    <main class="content">
      <!-- 공통 상단 탭 -->
      <!--<MainTabs />-->
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100%;
  background: #ffffff;
  color: #111827;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

/* 본문 폭 */
.content {
  max-width: 980px;
  margin: 16px auto 24px;
  padding: 0 20px 16px;
}


</style>
