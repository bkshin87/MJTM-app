import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

import HomeView from '../views/HomeView.vue'

import AboutView from '../views/AboutView.vue'

import NoticeView from '../views/NoticeView.vue'
import NoticeDetailView from '../views/NoticeDetailView.vue'
import NoticeWriteView from '../views/NoticeWriteView.vue'

import EventView from '../views/EventView.vue'      // 경조사
import AlbumView from '../views/AlbumView.vue'      // 사진첩
import MemberView from '../views/MemberView.vue'    // 동문명부
import MemberDetailView from '../views/MemberDetailView.vue'

import SignUpView from '../views/SignUpView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      // 로그인 필요 (메인화면)
      meta: { requiresAuth: true },
    },

    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { requiresAuth: true },
    },

    // 공지 목록
    {
      path: '/notice',
      name: 'notice',
      component: NoticeView,
      meta: { requiresAuth: true },
    },
    // 공지 상세
    {
      path: '/notice/:id',
      name: 'notice-detail',
      component: NoticeDetailView,
      meta: { requiresAuth: true },
    },
    // 공지 작성
    {
      path: '/notice/write',
      name: 'notice-write',
      component: NoticeWriteView,
      meta: { requiresAuth: true },
    },

    // 경조사
    {
      path: '/event',
      name: 'event',
      component: EventView,
      meta: { requiresAuth: true },
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: () => import('@/views/EventDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events/write',
      name: 'event-write',
      component: () => import('@/views/EventWriteView.vue'),
      meta: { requiresAuth: true },
    },

    // 사진첩
    {
      path: '/album',
      name: 'album',
      component: AlbumView,
      meta: { requiresAuth: true },
    },
    {
      path: '/album/:id',
      name: 'album-detail',
      component: () => import('@/views/AlbumDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/album/write',
      name: 'album-write',
      component: () => import('@/views/AlbumWriteView.vue'),
      meta: { requiresAuth: true },
    },

    // 동문명부
    {
      path: '/members',
      name: 'members',
      component: MemberView,
      meta: { requiresAuth: true },
    },
    {
      path: '/members/:id',
      name: 'member-detail',
      component: MemberDetailView,
      meta: { requiresAuth: true },
    },

    // 회원가입 (public)
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
      meta: { public: true },
    },
    // 로그인 (public)
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

// 전역 라우트 가드: 로그인 필요 여부 체크
router.beforeEach(async (to) => {
  const isPublic = !!to.meta.public
  const requiresAuth = !!to.meta.requiresAuth

  const {
    data: { session },
  } = await supabase.auth.getSession() // 현재 세션 조회[web:622]

  // 이미 로그인 상태인데 로그인/회원가입 페이지로 가면 홈으로
  if (session && (to.name === 'login' || to.name === 'signup')) {
    return { name: 'home' }
  }

  // 로그인 필요한데 세션이 없으면 로그인으로
  if (requiresAuth && !session) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  // public 페이지는 그냥 통과
  if (isPublic) return true

  // 그 외에는 그대로 진행
  return true
})

export default router
