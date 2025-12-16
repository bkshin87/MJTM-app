<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = '이메일과 비밀번호를 입력해 주세요.'
    return
  }

  loading.value = true

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  loading.value = false

  if (error) {
    console.error(error)
    errorMessage.value = error.message || '로그인에 실패했습니다.'
    return
  }

  alert('환영합니다.')
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="page">
    <main class="content">
      <section class="login-section">
        <h2 class="title">로그인</h2>

        <form class="form" @submit.prevent="handleLogin">
          <label class="field">
            <span class="label">이메일</span>
            <input
              v-model="email"
              type="email"
              class="input"
              placeholder=""
            />
          </label>

          <label class="field">
            <span class="label">비밀번호</span>
            <input
              v-model="password"
              type="password"
              class="input"
              placeholder=""
            />
          </label>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

          <button class="submit-btn" type="submit" :disabled="loading">
            {{ loading ? '로그인 중...' : '로그인' }}
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  color: #111827;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

/* 전체 레이아웃: 상단 헤더/탭 아래로 여백 주고 왼쪽 정렬 */
.content {
  max-width: 980px;
  margin: 24px auto 0;
  padding: 0 20px;
}

/* 로그인 섹션 */
.login-section {
  margin-top: 16px;
}

.title {
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

/* 폼 레이아웃 */
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

/* 인풋: 흰 배경, 연한 회색 보더, 둥근 모서리 */
.input {
  height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  background-color: #ffffff;
}

.input:focus {
  border-color: #1d4ed8;
  outline: none;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15);
}

/* 에러 메시지 */
.error {
  margin: 0;
  font-size: 13px;
  color: #b91c1c;
}

/* 로그인 버튼: 진한 남색 긴 pill, 왼쪽 여백 없이 전체 폭 */
.submit-btn {
  margin-top: 12px;
  width: 100%;
  padding: 12px 0;
  border-radius: 999px;
  border: none;
  background: #0b3b7a;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

/* 모바일 약간 여백 조정 */
@media (max-width: 768px) {
  .content {
    padding: 0 16px;
  }
}
</style>
