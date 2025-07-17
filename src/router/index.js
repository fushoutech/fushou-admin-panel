import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import AiSuggest from '@/views/AiSuggest.vue'
import CreativeList from '@/views/CreativeList.vue'
import Login from '@/views/Login.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Home', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/ai-suggest', name: 'AiSuggest', component: AiSuggest, meta: { requiresAuth: true } },
  { path: '/creative-list', name: 'CreativeList', component: CreativeList },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 添加登录守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('uni_id_token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
