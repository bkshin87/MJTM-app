import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

import AboutView from '../views/AboutView.vue'

import NoticeView from '../views/NoticeView.vue'
import NoticeDetailView from '../views/NoticeDetailView.vue'

import EventView from '../views/EventView.vue'      // 경조사
import AlbumView from '../views/AlbumView.vue'      // 사진첩
import MemberView from '../views/MemberView.vue'    // 동문명부
import MemberDetailView from '../views/MemberDetailView.vue'    // 동문명부

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
    {
      path: '/notice',
      name: 'notice',
      component: NoticeView,
    },
    {
      path: '/notice/:id',          // 동적 상세 페이지
      name: 'notice-detail',
      component: NoticeDetailView,
    },
    {
      path: '/event',
      name: 'event',
      component: EventView,
    },
    {
      path: '/album',
      name: 'album',
      component: AlbumView,
    },
    {
      path: '/members',
      name: 'members',
      component: MemberView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/members/:id',
      name: 'member-detail',
      component: MemberDetailView
    },
  ],
    //scrollBehavior(to, from, savedPosition) {
    scrollBehavior() {
    // 브라우저 뒤로가기 등은 기존 위치 유지, 그 외에는 top: 0
    //if (savedPosition) {
    //  return savedPosition
    //}
    return { top: 0 }
  },
})

export default router
