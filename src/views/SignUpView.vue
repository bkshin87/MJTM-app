<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()

// Auth용
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// members 테이블용
const name = ref('')
const entranceYear = ref<number | null>(null)
const phone = ref('')

// UI 상태
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleSignUp = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !password.value || !name.value) {
    errorMessage.value = '이메일, 비밀번호, 이름을 모두 입력해 주세요.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
    return
  }

  loading.value = true

  // 1) Supabase Auth 회원 생성
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  }) // 이메일/비밀번호 회원가입[web:711]

  if (signUpError) {
    loading.value = false
    console.error(signUpError)
    errorMessage.value = signUpError.message || '회원가입 중 오류가 발생했습니다.'
    return
  }

  const user = signUpData.user
  if (!user) {
    loading.value = false
    errorMessage.value = '회원 정보 생성에 실패했습니다.'
    return
  }

  // 2) members 테이블에 동문 정보 저장
  const { error: profileError } = await supabase
    .from('members')
    .insert({
      id: user.id,                    // auth.users.id와 1:1 매칭
      name: name.value,
      entrance_year: entranceYear.value,
      phone: phone.value,
    })

  loading.value = false

  if (profileError) {
    console.error(profileError)
    errorMessage.value =
      '회원 프로필 저장 중 오류가 발생했습니다. 관리자에게 문의해 주세요.'
    return
  }

  successMessage.value = '회원가입이 완료되었습니다.'
  alert(
    '회원가입이 완료되었습니다.\n이메일로 전송된 인증 메일을 확인하고, 링크를 눌러 가입을 완료해 주세요.'
  )

  // 원하면 로그인 페이지로 이동
  router.push({ name: 'login' })
}
</script>


<template>
  <div class="page">
    <main class="content">
      <section class="card">
        <h2 class="title">회원가입</h2>

        <form class="form" @submit.prevent="handleSignUp">
          <!-- members 정보 -->
          <label class="field">
            <span class="label">이름</span>
            <input v-model="name" type="text" class="input" />
          </label>

          <label class="field">
            <span class="label">입학년도</span>
            <input
              v-model.number="entranceYear"
              type="number"
              class="input"
              placeholder="예: 2005"
            />
          </label>

          <label class="field">
            <span class="label">전화번호</span>
            <input
              v-model="phone"
              type="text"
              class="input"
              placeholder="010-0000-0000"
            />
          </label>

          <!-- Auth 정보 -->
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

