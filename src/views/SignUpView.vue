<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleSignUp = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = '이메일과 비밀번호를 입력해 주세요.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
    return
  }

  loading.value = true

  // const { data, error } = await supabase.auth.signUp({
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    // 필요하면 메타데이터 추가 가능
    // options: { data: { name: '홍길동' } }
  }) // 이메일/비밀번호 회원가입 예시[web:711][web:710]

  loading.value = false

  if (error) {
    console.error(error)
    errorMessage.value = error.message || '회원가입 중 오류가 발생했습니다.'
    return
  }

  successMessage.value = '회원가입이 완료되었습니다. 이메일을 확인해 주세요.'
  // 원하면 자동으로 로그인 페이지로 이동:
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="page">
    <main class="content">
      <section class="card">
        <h2 class="title">회원가입</h2>

        <form class="form" @submit.prevent="handleSignUp">
          <label class="field">
            <span class="label">이메일</span>
            <input v-model="email" type="email" class="input" placeholder="you@example.com" />
          </label>

          <label class="field">
            <span class="label">비밀번호</span>
            <input v-model="password" type="password" class="input" />
          </label>

          <label class="field">
            <span class="label">비밀번호 확인</span>
            <input v-model="confirmPassword" type="password" class="input" />
          </label>

          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>

          <button class="submit-btn" type="submit" :disabled="loading">
            {{ loading ? '가입 중...' : '회원가입' }}
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
}

.content {
  max-width: 400px;
  margin: 40px auto;
  padding: 0 20px;
}

.card {
  background: #f3f4f6;
  border-radius: 14px;
  padding: 20px 22px;
}

.title {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 13px;
  color: #4b5563;
}

.input {
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

.input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.15);
}

.error {
  margin: 0;
  font-size: 13px;
  color: #b91c1c;
}

.success {
  margin: 0;
  font-size: 13px;
  color: #15803d;
}

.submit-btn {
  margin-top: 4px;
  padding: 8px 0;
  border-radius: 999px;
  border: none;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
