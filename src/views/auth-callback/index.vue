<template>
  <div class="auth-callback-page">登录中...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from '@nutui/nutui'
import { exchangeCrossDomainTicket } from '@/api/user'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

function normalizeRedirect(rawRedirect) {
  const value = rawRedirect ? String(rawRedirect) : ''
  if (value && value.startsWith('/') && !value.startsWith('//') && value !== '/login') {
    return value
  }
  return '/enter'
}

onMounted(async () => {
  const ticket = route.query.ticket ? String(route.query.ticket) : ''
  if (!ticket) {
    showToast.fail('登录票据缺失')
    router.replace('/login')
    return
  }

  try {
    const res = await exchangeCrossDomainTicket({ ticket })
    if (res?.code !== 0) {
      throw new Error(res?.msg || res?.message || '登录票据无效')
    }
    const userInfo = res?.data || null
    const token = userInfo?.loginToken || null
    if (!token) {
      throw new Error('登录票据兑换成功但未返回登录态')
    }
    userStore.login(token, userInfo)
    router.replace(normalizeRedirect(route.query.redirect))
  } catch (error) {
    console.error('跨域登录失败：', error)
    showToast.fail(error?.message || '跨域登录失败')
    router.replace('/login')
  }
})
</script>

<style scoped>
.auth-callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}
</style>
