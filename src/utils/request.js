// src/utils/request.js
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'

function redirectToLoginWithReturn() {
  const current = router.currentRoute?.value
  const currentFullPath = current?.fullPath || '/'
  if (current?.path === '/login') return

  router.push({
    path: '/login',
    query: { redirect: currentFullPath }
  })
}

// 创建一个 Axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL_PREFIX || '/chatserver', // 从环境变量读取基础API地址，便于不同环境切换
  timeout: 30 * 1000, // 请求超时时间
  // 你可以在这里添加其他通用配置，例如 headers
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 使用 Pinia store 获取 token
    const userStore = useUserStore()
    const token = userStore.getToken
    // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3eiIsImlzcyI6InFpbmdxdWV3YW5nbHVvIiwiZXhwIjoxNzcxMTQ5Nzk0LCJ1c2VyIjoiblR6YVRYUUdjdlpPNHl2Q2grUjRHMkFWck1WZTB4WVNwMktmNTYwaFJ2N2l2NndDWE5JTXJCd0NYaHJMNFI0bml5RldpTWdkOVEwcCt3K1BKWG9GeGJyN0JRc1VhemlzNGNqd2FzenE0ZTA9IiwiaWF0IjoxNzY4NDcxMzk0fQ.dDzdv6WNlreTi-rOha2RjoZGCqMrYOdH4rUdOCrB7mY';
    if (token) {
      config.headers['UTOKEN'] = token
    }
    // 如果是 FormData，让 axios 自动设置 Content-Type（包括 boundary）
    // 不要手动设置，否则会覆盖 boundary 导致上传失败
    if (config.data instanceof FormData) {
      // 删除手动设置的 Content-Type，让 axios 自动处理
      delete config.headers['Content-Type']
    }
    // URLSearchParams 也需要让 axios 自动处理 Content-Type
    // 但如果用户显式设置了 Content-Type，则保留用户的设置
    if (config.data instanceof URLSearchParams && !config.headers['Content-Type']) {
      // axios 会自动将 URLSearchParams 转换为 application/x-www-form-urlencoded
      // 这里不需要手动设置，让 axios 自动处理
    }
    // 为 GET 请求添加防止缓存的 headers
    if (config.method === 'get' || config.method === 'GET') {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
      config.headers['Pragma'] = 'no-cache'
      config.headers['Expires'] = '0'
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 处理业务状态码为 401 的情况
    if (response.data.code === 401) {
      console.error('未授权，请重新登录')
      const userStore = useUserStore()
      userStore.logout()
      redirectToLoginWithReturn()
    }
    return response.data
  },
  (error) => {
    // 处理 HTTP 错误
    console.error('HTTP Error:', error)
    
    if (error.response && error.response.status) {
      const userStore = useUserStore()
      
      switch (error.response.status) {
        case 401:
        case 403:
          console.error('登录过期或未授权，请重新登录')
          userStore.logout()
          redirectToLoginWithReturn()
          break
        case 404:
          console.error('请求的资源不存在')
          router.push('/error')
          break
        default:
          console.error('网络请求错误:', error.message)
      }
    }
    
    return Promise.reject(error)
  }
)

/**
 * 封装GET请求
 * @param {string} url 请求地址
 * @param {Object} params URL查询参数，对应axios的params
 * @returns {Promise}
 */
export function get(url, params = {}) {
  // 添加时间戳参数防止缓存
  const timestamp = Date.now()
  return service({
    url,
    method: 'get',
    params: {
      ...params,
      _t: timestamp, // 添加时间戳参数
    },
  })
}

/**
 * 封装POST请求
 * @param {string} url 请求地址
 * @param {Object} data 请求体数据
 * @param {Object} config 其他Axios配置（例如特定的headers）
 * @returns {Promise}
 */
export function post(url, data = {}, config = {}) {
  // 合并用户自定义配置（如headers）
  return service({
    url,
    method: 'post',
    data, // 注意：POST请求的参数放在`data`键下
    ...config,
  })
}

export default service