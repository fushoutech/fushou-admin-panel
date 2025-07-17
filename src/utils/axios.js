import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://fc-mp-59e4dde5-1174-4f76-a0f3-a30c12706daf.next.bspapp.com',
  timeout: 10000
})

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('uni_id_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(response => {
  if (response.data?.code === 401) {
    localStorage.removeItem('uni_id_token')
    alert('登录已过期，请重新登录')
    window.location.href = '/login'
  }
  return response
}, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('uni_id_token')
    alert('登录已过期，请重新登录')
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

export default instance
