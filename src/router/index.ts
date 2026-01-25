import { createRouter, createWebHistory } from 'vue-router'

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
    },

    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },

    // 공지 목록
    {
      path: '/notice',
      name: 'notice',
      component: NoticeView,
    },
    // 공지 상세 (id로 조회)
    {
      path: '/notice/:id',
      name: 'notice-detail',
      component: NoticeDetailView,
    },
    // 공지 작성 (새 글 작성용)
    {
      path: '/notice/write',
      name: 'notice-write',
      component: NoticeWriteView,
    },

    // 경조사
    {
      path: '/event',
      name: 'event',
      component: EventView,
    },
    // 경조사 상세 (id로 조회)
    {
      path: '/events/:id',
      name: 'event-detail',
      component: () => import('@/views/EventDetailView.vue'),
    },
    // 경조사 작성 (새 글 작성용)
    {
      path: '/events/write',
      name: 'event-write',
      component: () => import('@/views/EventWriteView.vue'),
    },

    // 사진첩
    {
      path: '/album',
      name: 'album',
      component: AlbumView,
    },
    {
      path: '/album/:id',
      name: 'album-detail',
      component: () => import('@/views/AlbumDetailView.vue'),
    },
    {
      path: '/album/write',
      name: 'album-write',
      component: () => import('@/views/AlbumWriteView.vue'),
    },

    // 동문명부 목록
    {
      path: '/members',
      name: 'members',
      component: MemberView,
    },
    // 동문 상세
    {
      path: '/members/:id',
      name: 'member-detail',
      component: MemberDetailView,
    },

    // 회원가입
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
    // 로그인
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
