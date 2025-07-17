<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 登录后才显示 Navbar -->
    <Navbar v-if="isLoggedIn" />
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Navbar from './components/Navbar.vue'

// 判断是否已登录（这里用 localStorage 存的 adminToken 为例）
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('uni_id_token')
})
</script>
