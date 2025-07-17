<template>
    <div class="p-6 space-y-4">
        <!-- 顶栏 + 新增按钮 -->
        <div class="flex justify-between items-center">
            <button class="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-900"
                @click="handleAdd">新增创意</button>
        </div>

        <!-- 筛选器 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-2 rounded shadow">
            <input v-model="filters.keyword" type="text" placeholder="关键词搜索..."
                class="border h-10 text-sm px-3 py-2 rounded w-full" />

            <select v-model="filters.industry" class="border h-10 text-sm px-3 py-2 rounded w-full">
                <option value="">全部行业</option>
                <option v-for="cat in industryOptions" :key="cat" :value="cat">{{ cat }}</option>
            </select>

            <select v-model="filters.difficulty" class="border h-10 text-sm px-3 py-2 rounded w-full">
                <option value="">全部难度</option>
                <option value="入门">入门</option>
                <option value="普通">普通</option>
                <option value="较高">较高</option>
            </select>

            <button class="bg-black text-white text-sm h-10 rounded px-4 py-2 w-full" @click="fetchList(1)">筛选</button>
        </div>

        <!-- 表格展示 -->
        <div class="overflow-x-auto bg-white shadow rounded">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">标题</th>
                        <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">难度</th>
                        <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">启动资金</th>
                        <th class="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">创建时间</th>
                        <th class="px-4 py-2 text-center text-sm font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in list" :key="item._id" class="hover:bg-gray-50">
                        <td class="px-4 py-2 text-sm font-medium text-gray-900">{{ item.title }}</td>
                        <td class="px-4 py-2 text-sm text-gray-700">{{ item.difficultyLevel }}</td>
                        <td class="px-4 py-2 text-sm text-gray-700">{{ item.estimatedStartupCost || '-' }}</td>
                        <td class="px-4 py-2 text-sm text-gray-700">{{ formatDate(item.createdAt) }}</td>
                        <td class="px-4 py-2 text-sm text-center space-x-2">
                            <button class="text-indigo-600 hover:underline" @click="editItem(item)">编辑</button>
                            <button class="text-red-600 hover:underline" @click="deleteItem(item._id)">删除</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 空状态 -->
            <div v-if="!loading && list.length === 0" class="text-center text-sm text-gray-500 py-6">暂无数据</div>
            <div v-if="loading" class="text-center text-sm text-gray-500 py-6">加载中...</div>
        </div>

        <!-- 分页器 -->
        <div v-if="totalPages > 1" class="flex justify-between items-center space-x-4 px-4 py-4">
            <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">每页显示</span>
                <select v-model.number="pageSize" @change="handlePageSizeChange"
                    class="border text-sm rounded px-2 py-1">
                    <option :value="10">10 条</option>
                    <option :value="20">20 条</option>
                    <option :value="50">50 条</option>
                </select>
            </div>

            <div class="flex items-center space-x-2">
                <button class="px-3 py-1 text-sm border rounded" :disabled="currentPage === 1"
                    @click="changePage(currentPage - 1)">上一页</button>
                <span class="text-sm">第 {{ currentPage }} / {{ totalPages }} 页</span>
                <button class="px-3 py-1 text-sm border rounded" :disabled="currentPage === totalPages"
                    @click="changePage(currentPage + 1)">下一页</button>
            </div>
        </div>

        <!-- 编辑抽屉 -->
        <!-- 抽屉包裹 + 背景 -->
        <div v-if="showEditDrawer" class="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-end"
            @click.self="showEditDrawer = false">

            <!-- 编辑抽屉 -->
            <div class="w-full max-w-xl h-full bg-white shadow-lg overflow-y-auto p-6" @click.stop>
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-center">
                        <h2 class="text-lg font-semibold">编辑创意方案</h2>
                        <button class="text-gray-500 text-sm hover:text-gray-800"
                            @click="showEditDrawer = false">关闭</button>
                    </div>

                    <div class="space-y-4">
                        <!-- 标题 -->
                        <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
                        <input v-model="editForm.title" placeholder="请输入标题"
                            class="w-full border px-3 py-2 rounded text-sm" />
                    </div>

                    <!-- 难度 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">难度</label>
                        <select v-model="editForm.difficultyLevel" class="w-full border px-3 py-2 rounded text-sm">
                            <option disabled value="">请选择难度</option>
                            <option value="入门">入门</option>
                            <option value="普通">普通</option>
                            <option value="较高">较高</option>
                        </select>
                    </div>

                    <!-- 启动资金 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">预估启动资金</label>
                        <input v-model="editForm.estimatedStartupCost" placeholder="如 5000 元"
                            class="w-full border px-3 py-2 rounded text-sm" />
                    </div>

                    <!-- 创意摘要 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">创意概述</label>
                        <textarea v-model="editForm.summary" placeholder="一句话概括创意亮点"
                            class="w-full border px-3 py-2 rounded text-sm" rows="2"></textarea>
                    </div>

                    <!-- 详细描述 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                        <textarea v-model="editForm.fullDescription" placeholder="详细描述创意内容"
                            class="w-full border px-3 py-2 rounded text-sm" rows="6"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">创业性格标签（可多选）</label>
                        <Multiselect v-model="editForm.normalizedPersonality" :options="personalityOptions"
                            :multiple="true" :taggable="true" placeholder="请选择创业性格" class="text-sm" />
                    </div>

                    <!-- 所属行业 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">所属行业（可多选）</label>
                        <Multiselect v-model="editForm.normalizedIndustryCategory" :options="industryOptions"
                            :multiple="true" :taggable="true" placeholder="请选择行业" class="text-sm" />
                    </div>

                    <!-- 创业动机标签 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">创业动机标签（可多选）</label>
                        <Multiselect v-model="editForm.normalizedMotivation" :options="motivationOptions"
                            :multiple="true" :taggable="true" placeholder="请选择创业动机" class="text-sm" />
                    </div>

                    <!-- 可用资源标签 -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">可用资源标签（可多选）</label>
                        <Multiselect v-model="editForm.normalizedResources" :options="resourceOptions" :multiple="true"
                            :taggable="true" placeholder="请选择可用资源" class="text-sm" />
                    </div>

                    <!-- 保存按钮 -->
                    <div class="pt-2">
                        <button class="bg-black text-sm text-white px-4 py-2 rounded hover:bg-gray-800"
                            @click="handleSave">
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios'

import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

const showEditDrawer = ref(false)
const editForm = ref({
    _id: '',
    title: '',
    difficultyLevel: '',
    estimatedStartupCost: '',
    summary: '',
    fullDescription: '',
    normalizedIndustryCategory: [],
})

const list = ref([])
const filters = ref({ keyword: '', industry: '', difficulty: '' })
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalPages = ref(1)

const personalityOptions = ['创意型创作者',
    '实干型执行者',
    '技术型创业者',
    '技术型创业者新手探索者',
    '新手探索者',
    '服务协作型',
    '服务协作型新手探索者',
    '自由职业者型',
    '自由职业者型服务协作型']

const industryOptions = ref(["艺术与设计", "AI与科技工具", "教研与科学", "其他/待归类", "本地与社区服务", "电商与消费", "金融与区块链", "法律与咨询", "企业服务与SaaS", "交通与出行", "媒体与广告", "健康与医疗", "生产与制造", "宠物与家庭生活", "女性与时尚", "娱乐与游戏", "职业发展与招聘", "安全与隐私", "环保与新能源", "旅游与住宿", "体育与健身", "内容与创作", "农业与食品", "可持续与循环经济", "航空航天与工业", "建筑与房地产", "教育与培训", "社交与关系匹配", "老龄服务与照护", "音乐与音频"])

const motivationOptions = [
    "社会影响", "技术变现", "低成本试水", "帮助他人/企业", "解决问题", "兴趣驱动"
]

const resourceOptions = [
    "人脉关系", "时间空间", "资金预算", "知识经验", "渠道资产", "硬件设备", "辅助资源", "软件工具", "技能能力"
]

const fetchList = async (page = 1) => {
    loading.value = true
    currentPage.value = page
    try {
        const res = await axios.post('/getCreativeList', {
            page,
            pageSize: pageSize.value,
            filters: filters.value
        })
        if (res.data.code === 0) {
            list.value = res.data.data || []
            const total = res.data.pagination?.total || 0
            totalPages.value = Math.ceil(total / pageSize.value)
        } else {
            alert('加载失败：' + res.data.msg)
        }
    } catch (err) {
        alert('加载失败：' + (err?.response?.data?.message || err.message))
    } finally {
        loading.value = false
    }
}

const changePage = (page) => {
    if (page < 1 || page > totalPages.value) return
    fetchList(page)
}

const handlePageSizeChange = () => {
    fetchList(1)
}

const formatDate = (d) => new Date(d).toLocaleString('zh-CN', { hour12: false })

const deleteItem = async (id) => {
    if (!confirm('确定删除该创意？')) return
    const res = await axios.post('/deleteCreativeCard', { id })
    if (res.data.code === 0) {
        await fetchList(currentPage.value)
    } else {
        alert('删除失败：' + res.data.msg)
    }
}

const editItem = (item) => {
    editForm.value = { ...item }
    showEditDrawer.value = true
}

const handleAdd = () => {
    editForm.value = {
        _id: '',
        title: '',
        difficultyLevel: '',
        estimatedStartupCost: '',
        summary: '',
        fullDescription: '',
        normalizedIndustryCategory: '',
        normalizedPersonality: [],
        normalizedMotivation: [],
        normalizedResources: [],
    }
    showEditDrawer.value = true
}

const handleSave = async () => {
    const isEdit = !!editForm.value._id
    const url = isEdit ? '/updateCreativeCard' : '/addCreativeCard'

    let payload
    if (isEdit) {
        payload = {
            id: editForm.value._id,
            data: {
                title: editForm.value.title,
                summary: editForm.value.summary,
                fullDescription: editForm.value.fullDescription,
                normalizedIndustryCategory: editForm.value.normalizedIndustryCategory,
                normalizedPersonality: editForm.value.normalizedPersonality,
                normalizedMotivation: editForm.value.normalizedMotivation,
                normalizedResources: editForm.value.normalizedResources,
                difficultyLevel: editForm.value.difficultyLevel,
                estimatedStartupCost: editForm.value.estimatedStartupCost
            }
        }
    } else {
        payload = { ...editForm.value }
    }

    const res = await axios.post(url, payload)
    if (res.data.code === 0) {
        showEditDrawer.value = false
        fetchList(currentPage.value)
    } else {
        alert('保存失败：' + res.data.msg)
    }
}

onMounted(() => {
    fetchList()
})
</script>

<style scoped>
th,
td {
    white-space: nowrap;
}
</style>
