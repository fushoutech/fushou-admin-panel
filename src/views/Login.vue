<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded shadow-md w-80">
            <h2 class="text-xl font-semibold mb-4">登录后台</h2>
            <input v-model="username" placeholder="用户名" class="w-full border mb-3 px-3 py-2 rounded" />
            <input v-model="password" type="password" placeholder="密码" class="w-full border mb-3 px-3 py-2 rounded" />
            <button @click="handleLogin" class="w-full bg-indigo-600 text-white py-2 rounded">登录</button>
            <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
    try {
        const res = await axios.post(
            'https://fc-mp-59e4dde5-1174-4f76-a0f3-a30c12706daf.next.bspapp.com/web-login',
            {
                username: username.value,
                password: password.value
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

        if (res.data.code === 0) {
            localStorage.setItem('uni_id_token', res.data.token)
            router.push('/')
            setTimeout(() => {
                location.reload() // 等待路由跳转生效后再刷新
            }, 100)
        } else {
            error.value = res.data.msg || '登录失败'
        }
    } catch (err) {
        error.value = '登录出错'
        console.error(err)
    }
}
</script>