import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NoticeView from '../views/NoticeView.vue'
import NoticeDetailView from '../views/NoticeDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
  ],
})

export default router
