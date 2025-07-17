<template>
  <div class="p-6 space-y-6">
    <!-- 创意方案数据 -->
    <div>
      <h2 class="text-lg font-medium text-gray-800 mb-2">创意方案概览</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-lg shadow border">
          <h3 class="text-sm text-gray-500">创意方案总数</h3>
          <p class="text-2xl font-bold text-indigo-600">{{ creativeTotal }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <h3 class="text-sm text-gray-500">可认领创意</h3>
          <p class="text-2xl font-bold text-green-600">{{ creativeAvailable }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <h3 class="text-sm text-gray-500">已认领创意</h3>
          <p class="text-2xl font-bold text-yellow-600">{{ creativeClaimed }}</p>
        </div>
      </div>
    </div>


    <!-- 共创计划数据 -->
    <div>
      <h2 class="text-lg font-medium text-gray-800 mt-6 mb-2">共创计划概览</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-lg shadow border">
          <h3 class="text-sm text-gray-500">共创计划提交总数</h3>
          <p class="text-2xl font-bold text-indigo-600">{{ coCreateTotal }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <h3 class="text-sm text-gray-500">已生成点评</h3>
          <p class="text-2xl font-bold text-indigo-600">{{ aiGenerated }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <h3 class="text-sm text-gray-500">待生成点评</h3>
          <p class="text-2xl font-bold text-red-500">{{ aiPending }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <h3 class="text-sm text-gray-500">已审核通过</h3>
          <p class="text-2xl font-bold text-green-600">{{ approvedCount }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios'

const creativeTotal = ref(0)
const creativePending = ref(0)
const coCreateTotal = ref(0)
const creativeAvailable = ref(0)
const creativeClaimed = ref(0)
const aiGenerated = ref(0)
const aiPending = ref(0)
const approvedCount = ref(0)

// 云函数的公网 URL
const CLOUD_FUNCTION_URL = 'https://fc-mp-59e4dde5-1174-4f76-a0f3-a30c12706daf.next.bspapp.com/getCreativeStats'

// 可选：简单 Bearer 鉴权（建议云函数中设置校验逻辑）
const AUTH_TOKEN = 'your-secret-token'

onMounted(async () => {
  try {
    const res = await axios.get(CLOUD_FUNCTION_URL, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    })

    if (res.data.code === 0) {
      const data = res.data.data
      creativeTotal.value = data.creativeTotal
      creativePending.value = data.creativePending
      coCreateTotal.value = data.coCreateTotal
      aiGenerated.value = data.aiGenerated
      aiPending.value = data.aiPending
      approvedCount.value = data.approvedCount
      creativeAvailable.value = data.creativeAvailable
      creativeClaimed.value = data.creativeClaimed

    } else {
      console.error('获取统计数据失败：', res.data.msg)
    }
  } catch (err) {
    console.error('请求云函数失败：', err)
  }
})

</script>
