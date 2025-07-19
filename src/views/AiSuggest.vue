<template>
  <div class="p-6 space-y-4">
    <!-- 顶栏 + 批量操作按钮 -->
    <div class="flex justify-between items-center">
      <button class="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-50"
        :disabled="selected.length === 0 || submitting" @click="handleGenerate">
        {{ submitting ? '生成中...' : '批量生成点评' }}
      </button>
    </div>

    <!-- 筛选器 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-2 rounded shadow">
      <input v-model="filterInputs.keyword" type="text" placeholder="搜索项目名称..."
        class="border h-10 text-sm px-3 py-2 rounded w-full" />
      <select v-model="filterInputs.status" class="border h-10 text-sm px-3 py-2 rounded w-full">
        <option value="">全部状态</option>
        <option value="pending">待处理</option>
        <option value="ai_reviewed">已生成</option>
        <option value="approved">已确认</option>
        <option value="rejected">已退回</option>
      </select>
      <button class="bg-black text-white text-sm h-10 rounded px-4 py-2 w-full" @click="applyFilters">
        筛选
      </button>
    </div>

    <!-- 表格展示 -->
    <div class="overflow-x-auto bg-white shadow rounded">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2">
              <input type="checkbox" @change="toggleAll" :checked="isAllSelected" />
            </th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">项目名称</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">提交人</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">提交时间</th>
            <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">状态</th>
            <th class="px-4 py-2 text-center text-sm font-medium text-gray-500 uppercase">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredForms" :key="item._id" class="hover:bg-gray-50">
            <td class="px-4 py-2">
              <input type="checkbox" v-model="selected" :value="item._id" />
            </td>
            <td class="px-4 py-2 text-sm font-medium text-gray-900">{{ item.reportInfo?.projectName || '未命名项目' }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ item.userInfo?.nickname || '匿名用户' }}</td>
            <td class="px-4 py-2 text-sm text-gray-700">{{ formatTime(item.submittedAt) }}</td>
            <td class="px-4 py-2 text-sm" :class="statusColorClass(item.status)">{{ statusText(item.status) }}</td>
            <td class="px-4 py-2 text-sm text-center space-x-2">
              <button v-if="item.status === 'pending'" class="text-indigo-600 hover:underline"
                @click="generateSingle(item._id)" :disabled="generatingIds.includes(item._id)">
                {{ generatingIds.includes(item._id) ? '生成中...' : '生成点评' }}
              </button>
              <button class="text-gray-600 hover:underline" @click="goToDetail(item)">详情</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页器 -->
      <div v-if="totalPages >= 1" class="flex justify-between items-center space-x-4 px-4 py-4">
        <!-- 每页数量选择 -->
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">每页显示</span>
          <select v-model.number="pageSize" @change="handlePageSizeChange" class="border text-sm rounded px-2 py-1">
            <option :value="10">10 条</option>
            <option :value="20">20 条</option>
            <option :value="50">50 条</option>
          </select>
        </div>

        <!-- 翻页按钮 -->
        <div class="flex items-center space-x-2">
          <button class="px-3 py-1 text-sm border rounded" :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)">
            上一页
          </button>
          <span class="text-sm">第 {{ currentPage }} / {{ totalPages }} 页</span>
          <button class="px-3 py-1 text-sm border rounded" :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)">
            下一页
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && filteredForms.length === 0" class="text-center text-sm text-gray-500 py-6">暂无数据</div>
      <div v-if="loading" class="text-center text-sm text-gray-500 py-6">加载中...</div>
    </div>
  </div>

  <!-- 抽屉包裹 + 背景 -->
  <div v-if="detailVisible" class="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-end"
    @click.self="detailVisible = false">
    <!-- 抽屉面板 -->
    <div class="w-full max-w-xl h-full bg-white shadow-lg overflow-y-auto p-6" @click.stop>

      <!-- 抽屉头部 -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">共创信息详情</h2>
        <button class="text-gray-500 text-sm hover:text-gray-800" @click="detailVisible = false">关闭</button>
      </div>

      <!-- Tab切换 -->
      <div class="flex border-b mb-4 space-x-6 text-sm font-medium">
        <button @click="activeTab = 'original'"
          :class="activeTab === 'original' ? 'border-b-2 border-black text-black' : 'text-gray-500'" class="py-2">
          报告信息
        </button>
        <button @click="activeTab = 'coCreation'"
          :class="activeTab === 'coCreation' ? 'border-b-2 border-black text-black' : 'text-gray-500'" class="py-2">
          共创信息
        </button>
        <button @click="activeTab = 'remark'"
          :class="activeTab === 'remark' ? 'border-b-2 border-black text-black' : 'text-gray-500'" class="py-2">
          点评
        </button>
      </div>

      <!-- Tab内容区域 -->
      <div class="space-y-6 text-sm text-gray-700">
        <!-- 原始报告 -->
        <div v-if="activeTab === 'original'" class="space-y-5">
          <div v-for="key in ['projectName', 'nickname', 'submittedAt', 'created_at', 'summary']" :key="key">
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              {{ reportFieldLabelMap[key] || key }}
            </label>

            <textarea v-if="renderReportField(key, currentItem).length > 30"
              :value="renderReportField(key, currentItem)" disabled
              class="w-full text-sm border border-gray-300 rounded-md bg-gray-100 px-3 py-2 text-gray-800 resize-none cursor-not-allowed"
              rows="3" />

            <input v-else :value="renderReportField(key, currentItem)" type="text" disabled
              class="w-full text-sm border border-gray-300 rounded-md bg-gray-100 px-3 py-2 text-gray-800 cursor-not-allowed" />
          </div>
        </div>

        <!-- 共创信息 -->
        <div v-if="activeTab === 'coCreation'" class="space-y-6">
          <!-- 用户补充信息 -->
          <div>
            <h3 class="text-base font-semibold mb-4">用户补充信息：</h3>
            <div class="space-y-5">
              <div v-for="(field, key) in currentItem.data" :key="key">
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                  {{ fieldLabelMap[key] || key }}
                </label>

                <textarea v-if="renderFieldValue(field).length > 30" :value="renderFieldValue(field)" disabled
                  class="w-full text-sm border border-gray-300 rounded-md bg-gray-100 px-3 py-2 text-gray-800 resize-none cursor-not-allowed"
                  rows="3" />

                <input v-else :value="renderFieldValue(field)" type="text" disabled
                  class="w-full text-sm border border-gray-300 rounded-md bg-gray-100 px-3 py-2 text-gray-800 cursor-not-allowed" />

              </div>
            </div>
          </div>
        </div>

        <!-- 改为统一名称 -->
<div v-if="activeTab === 'remark'" class="space-y-6 text-sm text-gray-700">
  <!-- AI点评 -->
  <div class="border rounded p-4 bg-gray-50">
    <h3 class="text-base font-semibold mb-2">智能点评（AI生成，可编辑）</h3>
    <textarea v-model="editableAiRemark" rows="6" class="w-full border rounded p-2 text-sm"></textarea>
    <div class="text-right mt-2">
      <button @click="saveAiRemark" :disabled="saving" class="bg-black text-white px-4 py-2 rounded text-sm">
        {{ saving ? '保存中...' : '保存 AI 点评' }}
      </button>
    </div>
  </div>

  <!-- 人工点评 -->
  <div class="border rounded p-4 bg-gray-50">
    <h3 class="text-base font-semibold mb-2">人工点评（人工撰写，权威参考）	</h3>
    <textarea v-model="editableHumanRemark" rows="6" class="w-full border rounded p-2 text-sm"></textarea>
    <div class="text-right mt-2">
      <button @click="saveHumanRemark" :disabled="saving" class="bg-black text-white px-4 py-2 rounded text-sm">
        {{ saving ? '保存中...' : '保存人工点评' }}
      </button>
    </div>
  </div>
</div>

      </div>
    </div>
  </div>

  <!-- 自定义确认弹窗 -->
  <div v-if="confirmVisible" class="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div class="bg-white rounded shadow-xl max-w-sm w-full p-6 space-y-4">
      <h2 class="text-lg font-semibold">确认生成点评？</h2>
      <p class="text-sm text-gray-600">确定为该项目生成 AI 点评？生成后可修改内容，但将标记为“已生成”。</p>
      <div class="flex justify-end space-x-2">
        <button class="px-4 py-1 text-sm text-gray-600 hover:text-gray-800" @click="confirmVisible = false">取消</button>
        <button class="px-4 py-1 text-sm bg-black text-white rounded hover:bg-gray-800"
          @click="confirmAction()">确认生成</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/utils/axios' // 用封装好的 axios，不再传 token

const activeTab = ref('original')
const generatingIds = ref([])

const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = ref(20)

const forms = ref([])
const selected = ref([])
const loading = ref(false)
const submitting = ref(false)
const saving = ref(false)

const filterInputs = ref({ keyword: '', status: '' })
const filters = ref({ keyword: '', status: '' })

const detailVisible = ref(false)
const currentItem = ref(null)
const editableAiRemark = ref('')
const editableHumanRemark = ref('')

const confirmVisible = ref(false)
const confirmItemId = ref(null)
const confirmAction = ref(null)

const formatTime = (isoString) => {
  if (!isoString) return '无'
  return new Date(isoString).toLocaleString('zh-CN', { hour12: false })
}

const reportFieldLabelMap = {
  projectName: '项目名称',
  nickname: '提交人',
  submittedAt: '表单提交时间',
  created_at: '报告创建时间',
  summary: '项目简介'
}

const fieldLabelMap = {
  unclearPoints: '你读完报告后，还有哪些问题仍不清晰？',
  supportOptions: '你希望我们在哪些方向协助你进一步完善？',
  offline: '是否愿意线下参与共创活动？',
  offlineArea: '所在城市',
  offlineTopics: '你还有什么想补充说明的吗？',
  extra: '你希望线下共创活动重点讨论哪些问题？'
}

const renderFieldValue = (field) => {
  const val = field?.text || field?.value

  if (Array.isArray(val)) {
    return val.map(v => v?.text || '').filter(Boolean).join('，')
  }

  if (typeof val === 'object' && val !== null) {
    return val.text || ''
  }

  return val || ''
}

const renderReportField = (key, item) => {
  switch (key) {
    case 'projectName':
      return item.reportInfo?.projectName || '未命名'
    case 'nickname':
      return item.userInfo?.nickname || '匿名用户'
    case 'submittedAt':
      return formatTime(item.submittedAt)
    case 'created_at':
      return formatTime(item.reportInfo?.created_at)
    case 'summary':
      return item.reportInfo?.summary || '无'
    default:
      return ''
  }
}

const applyFilters = () => {
  filters.value = { ...filterInputs.value }
  fetchForms(1)
}

const fetchForms = async (page = 1) => {
  loading.value = true
  currentPage.value = page
  try {
    const res = await axios.post('/submitCocreationForm', {
      page,
      pageSize: pageSize.value
    })

    if (res.data.code === 0) {
      forms.value = res.data.data || []
      const total = res.data.pagination?.total || 0
      totalPages.value = Math.ceil(total / pageSize.value)
    } else {
      alert('加载失败：' + res.data.msg)
    }
  } catch (err) {
    console.error('请求失败：', err)
    alert('加载失败：' + (err?.response?.data?.message || err.message))
  } finally {
    loading.value = false
  }
}

const handleGenerate = async () => {
  if (selected.value.length === 0) return
  submitting.value = true
  try {
    const res = await axios.post('/triggerAIGenerate', {
      ids: selected.value
    })
    if (res.data.code === 0) {
      alert('生成任务已提交')
      selected.value = []
      await fetchForms()
    } else {
      alert('生成失败：' + res.data.msg)
    }
  } catch (err) {
    console.error('提交失败：', err)
    alert('提交失败：' + (err?.response?.data?.message || err.message))
  } finally {
    submitting.value = false
  }
}

const saveAiRemark = async () => {
  if (!currentItem.value?._id) return
  saving.value = true
  try {
    const res = await axios.post('/saveAiRemark', {
      id: currentItem.value._id,
      aiRemark: editableAiRemark.value || ''
    })
    if (res.data.code === 0) {
      alert('保存成功')
      currentItem.value.aiRemark = editableAiRemark.value
      await fetchForms()
    } else {
      alert('保存失败：' + res.data.msg)
    }
  } catch (err) {
    console.error('保存失败：', err)
    alert('保存失败：' + (err?.response?.data?.message || err.message))
  } finally {
    saving.value = false
  }
}

const saveHumanRemark = async () => {
  if (!currentItem.value?._id) return
  saving.value = true
  try {
    const res = await axios.post('/saveHumanRemark', {
      id: currentItem.value._id,
      humanRemark: editableHumanRemark.value || ''
    })
    if (res.data.code === 0) {
      alert('保存成功')
      currentItem.value.humanRemark = editableHumanRemark.value
      await fetchForms()
    } else {
      alert('保存失败：' + res.data.msg)
    }
  } catch (err) {
    console.error('保存失败：', err)
    alert('保存失败：' + (err?.response?.data?.message || err.message))
  } finally {
    saving.value = false
  }
}

const generateSingle = (id) => {
  confirmItemId.value = id
  confirmAction.value = () => executeGenerate(id)
  confirmVisible.value = true
}

const executeGenerate = async (id) => {
  generatingIds.value.push(id)
  confirmVisible.value = false
  try {
    const res = await axios.post('/triggerAIGenerate', {
      ids: [id]
    })
    if (res.data.code === 0) {
      await fetchForms()
    } else {
      alert('生成失败：' + res.data.msg)
    }
  } catch (err) {
    alert('生成失败：' + (err?.response?.data?.message || err.message))
  } finally {
    generatingIds.value = generatingIds.value.filter(x => x !== id)
  }
}

const goToDetail = (item) => {
  currentItem.value = item
  editableAiRemark.value = item.aiRemark || '',
  editableHumanRemark.value = item.manualRemark || ''

  detailVisible.value = true
}

const toggleAll = () => {
  const ids = filteredForms.value.map(i => i._id)
  if (isAllSelected.value) {
    selected.value = []
  } else {
    selected.value = [...ids]
  }
}

const isAllSelected = computed(() => {
  const ids = filteredForms.value.map(i => i._id)
  return ids.length > 0 && ids.every(id => selected.value.includes(id))
})

const filteredForms = computed(() => {
  return forms.value.filter(item => {
    const matchKeyword = filters.value.keyword === '' || item.reportInfo?.projectName?.includes(filters.value.keyword)
    const matchStatus = filters.value.status === '' || item.status === filters.value.status
    return matchKeyword && matchStatus
  })
})

const statusText = (status) => {
  switch (status) {
    case 'pending': return '待处理'
    case 'ai_reviewed': return '已生成'
    case 'approved': return '已确认'
    case 'rejected': return '已退回'
    default: return '未知状态'
  }
}

const statusColorClass = (status) => {
  switch (status) {
    case 'pending': return 'text-yellow-600'
    case 'ai_reviewed': return 'text-blue-600'
    case 'approved': return 'text-green-600'
    case 'rejected': return 'text-red-600'
    default: return 'text-gray-500'
  }
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  fetchForms(page)
}

const handlePageSizeChange = () => {
  currentPage.value = 1
  fetchForms(1)
}

onMounted(() => {
  fetchForms()
})
</script>
