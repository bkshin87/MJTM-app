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
const company = ref('')   // 회사명 추가


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
  })

  if (signUpError) {
    loading.value = false
    console.error(signUpError)
    errorMessage.value =
      signUpError.message || '회원가입 중 오류가 발생했습니다.'
    return
  }

  const user = signUpData.user
  if (!user) {
    loading.value = false
    errorMessage.value = '회원 정보 생성에 실패했습니다.'
    return
  }

  // 2) members 테이블에 동문 정보 저장
  const { error: profileError } = await supabase.from('members').insert({
    id: user.id,
    name: name.value,
    entrance_year: entranceYear.value,
    phone: phone.value,
    company: company.value,   // 회사명 저장
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

  router.push({ name: 'login' })
}
</script>

<template>
  <div class="page">
    <main class="content">
      <section class="signup-section">
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
          <label class="field">
            <span class="label">회사명</span>
            <input
              v-model="company"
              type="company"
              class="input"
              placeholder=""
            />
          </label>
          <!-- Auth 정보 -->
          <label class="field">
            <span class="label">이메일</span>
            <input
              v-model="email"
              type="email"
              class="input"
              placeholder="myongji@example.com"
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
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

/* App.vue 헤더/탭 아래 여백 + 폭은 홈/로그인과 동일 */
.content {
  max-width: 980px;
  margin: 24px auto 0;
  padding: 0 20px;
}

/* 회원가입 섹션 */
.signup-section {
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

/* 인풋: 로그인 페이지와 동일 스타일 */
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

/* 메시지 */
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

/* 버튼: 진한 남색 긴 pill */
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

/* 모바일 */
@media (max-width: 768px) {
  .content {
    padding: 0 16px;
  }
}
</style>
