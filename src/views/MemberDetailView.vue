<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

type Member = {
  id: string
  entrance_year: string | null
  name: string
  phone: string | null
  company: string | null
  created_at: string
}

const route = useRoute()
const member = ref<Member | null>(null)
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  const id = route.params.id as string

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .maybeSingle()   // 0 또는 1건 조회 [web:396]

  if (error) {
    console.error('member detail error:', error)
    errorMessage.value = '동문 정보를 불러오는 중 오류가 발생했습니다.'
    loading.value = false
    return
  }

  if (!data) {
    errorMessage.value = '해당 동문 정보를 찾을 수 없습니다.'
    loading.value = false
    return
  }

  member.value = data as Member
  loading.value = false
})
</script>

<template>
  <div class="page">
    <main class="content">
      <section v-if="loading" class="state-section">
        <p class="state-text">동문 정보를 불러오는 중입니다...</p>
      </section>

      <section v-else-if="errorMessage" class="state-section">
        <p class="state-text">{{ errorMessage }}</p>
      </section>

      <section v-else-if="member" class="detail-card">
        <h2 class="detail-title">{{ member.name }}</h2>

        <dl class="detail-list">
          <div class="detail-row">
            <dt>입학년도</dt>
            <dd>{{ member.entrance_year || '-' }}</dd>
          </div>
          <div class="detail-row">
            <dt>전화번호</dt>
            <dd>{{ member.phone || '-' }}</dd>
          </div>
          <div class="detail-row">
            <dt>회사명</dt>
            <dd>{{ member.company || '-' }}</dd>
          </div>
        </dl>
      </section>
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

.content {
  max-width: 980px;
  margin: 16px auto 24px;
  padding: 0 20px 16px;
}

.state-section {
  padding: 40px 0;
  text-align: center;
}

.state-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.detail-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 18px;
}

.detail-title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 800;
}

.detail-list {
  margin: 0;
}

.detail-row {
  display: flex;
  gap: 16px;
  padding: 6px 0;
}

.detail-row dt {
  width: 80px;
  font-size: 13px;
  color: #6b7280;
}

.detail-row dd {
  margin: 0;
  font-size: 13px;
  color: #111827;
}
</style>
