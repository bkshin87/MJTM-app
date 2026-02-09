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

  // 로그인 성공 → 다른 모든 기기 세션 종료 (현재 세션 제외)
  await supabase.auth.signOut({ scope: 'others' })

  alert('환영합니다.')
  router.push({ name: 'home' })
}

// 아직 페이지 없음: 비어 있는 함수만
const handleFindAccount = () => {
  // TODO: 아이디/비밀번호 찾기 페이지 제작 후 라우팅 추가
}

const goSignup = () => {
  router.push({ name: 'signup' })
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

          <!-- 하단 링크 영역 -->
          <div class="link-row">
            <button
              type="button"
              class="text-link"
              @click="handleFindAccount"
            >
              아이디/비밀번호찾기
            </button>
            <button
              type="button"
              class="text-link"
              @click="goSignup"
            >
              회원가입
            </button>
          </div>
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

.content {
  max-width: 980px;
  margin: 24px auto 0;
  padding: 0 20px;
}

.login-section {
  margin-top: 16px;
}

.title {
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

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

.error {
  margin: 0;
  font-size: 13px;
  color: #b91c1c;
}

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

/* 로그인 버튼 아래 링크 2개 */
.link-row {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.text-link {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 13px;
  color: #4b5563;
  text-decoration: underline;
  cursor: pointer;
}

.text-link:hover {
  color: #111827;
}

@media (max-width: 768px) {
  .content {
    padding: 0 16px;
  }
}
</style>
