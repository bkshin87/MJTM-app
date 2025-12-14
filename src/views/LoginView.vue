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
  }) // 이메일/비밀번호 로그인[web:779][web:710]

  loading.value = false

  if (error) {
    console.error(error)
    errorMessage.value = error.message || '로그인에 실패했습니다.'
    return
  }

  alert('환영합니다.')
  // 로그인 성공 시 홈으로 이동 (또는 원하는 페이지)
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="page">
    <main class="content">
      <section class="card">
        <h2 class="title">로그인</h2>

        <form class="form" @submit.prevent="handleLogin">
          <label class="field">
            <span class="label">이메일</span>
            <input
              v-model="email"
              type="email"
              class="input"
              placeholder="you@example.com"
            />
          </label>

          <label class="field">
            <span class="label">비밀번호</span>
            <input
              v-model="password"
              type="password"
              class="input"
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
