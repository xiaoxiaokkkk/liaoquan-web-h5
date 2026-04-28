<template>
  <div class="login-page padding-left-right-15">
    <div class="login-page-content">
      <div class="page-top">
        <div class="top-logo">
          <img src="@/assets/images/logo.png" alt="logo">
        </div>
        <div class="top-title">
          特有料
        </div>
      </div>
      <div class="page-content mt-20">
        <nut-button
          class="login-btn wechat-btn"
          color="#28C445"
          block
          :loading="isLoading"
          :disabled="isLoading"
          @click="handleWeChatLogin"
        >
          微信登录
        </nut-button>
      </div>
    </div>
    <div class="login-footer">
      <nut-checkbox v-model="checked" icon-size="18" color="#F9505B">我已阅读并同意 <router-link to="/serviceAgreement" class="checkbox-link" @click.stop>《服务协议》</router-link> 和 <router-link to="/privacyPolicy" class="checkbox-link" @click.stop>《隐私政策》</router-link></nut-checkbox>
    </div>
  </div>
</template>
<script setup>
import { showToast } from '@nutui/nutui'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { wechatLogin } from '@/api/user'
import { isWeChatBrowser } from '@/utils/common'

const checked = ref(false)
const isLoading = ref(false)

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const REDIRECT_CACHE_KEY = 'postLoginRedirect'

// 需要和后端 WXH5LoginConst.APP_ID 对应；前端必须用同一个 appid 去拼授权链接
const WECHAT_APP_ID = import.meta.env.VITE_WECHAT_APP_ID || ''

function getOrCreateDeviceId() {
  const key = 'deviceId'
  let v = localStorage.getItem(key)
  if (!v) {
    v = `web_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(key, v)
  }
  return v
}

function buildWeChatOAuthUrl({ appId, redirectUri, state }) {
  const base = 'https://open.weixin.qq.com/connect/oauth2/authorize'
  const params = new URLSearchParams({
    appid: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'snsapi_userinfo',
    state: state || 'STATE'
  })
  return `${base}?${params.toString()}#wechat_redirect`
}

async function doWeChatLogin(code) {
  isLoading.value = true
  try {
    const params = {
      code: code,
      isH5: 1,
      channel: 'h5',
      imei: getOrCreateDeviceId()
    }
    const res = await wechatLogin(params)
    console.log('params:', params)
    console.log('res:', res)
    // 接口返回格式：{code: 0, data: user}，user 里有 loginToken 字段
    if (res?.code !== 0) {
      throw new Error(res?.msg || res?.message || '微信授权失败')
    }
    console.log('res?.data:', res?.data)
    // data 就是 user 对象，从 user.loginToken 获取 token
    const userInfo = res?.data || null
    const token = userInfo?.loginToken || null
    if (!token) {
      console.error('微信登录响应缺少loginToken：', res)
      throw new Error('登录成功但未返回loginToken')
    }

    userStore.login(token, userInfo)
    showToast.success('登录成功')

    // 登录成功后：优先跳回登录前要去的页面；否则去首页
    // 注意：不要把 BASE_URL/basePath 拼进路由跳转里（router 已经通过 createWebHistory(base) 处理过），否则会命中 404
    const basePrefix = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') // 例如 '/webh5'
    const rawRedirect =
      (route.query.redirect ? String(route.query.redirect) : '') ||
      (sessionStorage.getItem(REDIRECT_CACHE_KEY) || '')
    let redirectPath = rawRedirect

    // 仅允许站内相对路径，避免 open redirect
    if (redirectPath && redirectPath.startsWith('/')) {
      // 兼容外部错误拼出来的 '/webh5/home' 这种带 base 的路径
      if (basePrefix && basePrefix !== '/' && redirectPath.startsWith(`${basePrefix}/`)) {
        redirectPath = redirectPath.slice(basePrefix.length) || '/'
      }
    } else {
      redirectPath = ''
    }

    router.replace(redirectPath || '/home')
    // 清理缓存，避免下次误用
    sessionStorage.removeItem(REDIRECT_CACHE_KEY)
  } finally {
    isLoading.value = false
  }
}

function handleWeChatLogin() {
  if (isLoading.value) return

  if (!checked.value) {
    showToast.text('请先阅读并同意服务协议与隐私政策')
    return
  }

  // if (!isWeChatBrowser()) {
  //   showToast.text('请在微信内打开后使用微信登录')
  //   return
  // }

  if (!WECHAT_APP_ID) {
    showToast.fail('未配置微信APP_ID（VITE_WECHAT_APP_ID）')
    return
  }

  // 缓存登录前的目标地址（包含 merchantId 等 query），用于微信授权回调后恢复
  const rawRedirect = route.query.redirect ? String(route.query.redirect) : ''
  if (rawRedirect) {
    sessionStorage.setItem(REDIRECT_CACHE_KEY, rawRedirect)
  } else {
    sessionStorage.removeItem(REDIRECT_CACHE_KEY)
  }

  // 使用 Vite 注入的 BASE_URL（等同于构建时的 base），避免手拼出错
  // 例如 base='/webh5/' 时，回调就是 https://域名/webh5/login
  const baseUrl = import.meta.env.BASE_URL || '/'
  // 回调地址尽量保持干净，只回到 /login；redirect 通过 sessionStorage 恢复
  const redirectUri = new URL(`${baseUrl}login`, window.location.origin).toString()

  console.log('redirectUri (encoded):', redirectUri)
  
  const state = 'h5_login'
  const url = buildWeChatOAuthUrl({ appId: WECHAT_APP_ID, redirectUri, state })
  console.log('url:', url)
  window.location.href = url
}

onMounted(() => {
  // 微信回调：/login?code=xxx&state=xxx
  const code = route.query.code ? String(route.query.code) : ''
  console.log('code:', code)
  if (code) {
    // 如果微信回调丢了 redirect（常见），从 sessionStorage 里恢复
    const cachedRedirect = sessionStorage.getItem(REDIRECT_CACHE_KEY) || ''
    if (!route.query.redirect && cachedRedirect) {
      const nextQuery0 = { ...route.query, redirect: cachedRedirect }
      delete nextQuery0.code
      delete nextQuery0.state
      router.replace({ path: '/login', query: nextQuery0 }).finally(() => {
        console.log('开始调用后端接口:', code)
        doWeChatLogin(code).catch((err) => {
          console.error('微信登录失败：', err)
          showToast.fail(err?.message || '微信登录失败')
        })
      })
      return
    }

    // 先把 code 从地址栏清掉，避免刷新重复登录；然后再调用接口
    const nextQuery = { ...route.query }
    delete nextQuery.code
    delete nextQuery.state
    router.replace({ path: '/login', query: nextQuery }).finally(() => {
      console.log('开始调用后端接口:', code)
      doWeChatLogin(code).catch((err) => {
        console.error('微信登录失败：', err)
        showToast.fail(err?.message || '微信登录失败')
      })
    })
  }
})

</script>
<style lang="scss" scoped>
@import "./login.scss";
</style>