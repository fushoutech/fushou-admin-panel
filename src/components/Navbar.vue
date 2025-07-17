<template>
  <nav class="bg-gray-900 px-8 py-4 flex justify-between items-center shadow-sm">
    <div class="flex items-center space-x-3">
      <div class="text-2xl font-bold text-white tracking-wide">
        扶兽信息管理系统
      </div>
      <img
        src="https://mp-59e4dde5-1174-4f76-a0f3-a30c12706daf.cdn.bspapp.com/innorise-v1/logo/fushou_tech_white.png"
        alt="Logo"
        class="h-8 object-contain"
      />
    </div>

    <!-- 右侧导航 -->
    <div class="flex space-x-6 text-sm font-medium text-white items-center">
      <RouterLink to="/" class="hover:text-indigo-400 transition">
        概览
      </RouterLink>
      <RouterLink to="/ai-suggest" class="hover:text-indigo-400 transition">
        共创计划
      </RouterLink>
      <RouterLink to="/creative-list" class="hover:text-indigo-400 transition">
        创意卡片
      </RouterLink>

      <!-- 分隔线 -->
      <div class="w-px h-4 bg-white opacity-30"></div>

      <!-- 退出按钮 -->
      <button @click="handleLogout" class="hover:text-red-400 transition">
        退出
      </button>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('uni_id_token')
  location.reload()
  router.push('/login') // 跳转回登录页
}
</script>
