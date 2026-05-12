<template>
  <div class="auth-callback-page">登录中...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from '@nutui/nutui'
import { exchangeCrossDomainTicket } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { savePromotionParams, savePromotionParamsFromUrl } from '@/utils/promotionParams'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

function savePromotionFromRedirect(rawRedirect) {
  try {
    const redirectUrl = new URL(String(rawRedirect || ''), window.location.origin)
    savePromotionParams({
      merchantId: redirectUrl.searchParams.get('merchantId'),
      userId: redirectUrl.searchParams.get('userId')
    })
  } catch (_) {
    // ignore
  }
}

function normalizeRedirect(rawRedirect) {
  const value = rawRedirect ? String(rawRedirect) : ''
  if (value && value.startsWith('/') && !value.startsWith('//') && value !== '/login') {
    return value
  }
  return '/lqindex'
}

onMounted(async () => {
  savePromotionParamsFromUrl()
  savePromotionFromRedirect(route.query.redirect)
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
    console.log('exchange ticket res:', res)
    console.log('exchange userInfo:', userInfo)
    const token = userInfo?.loginToken || null
    if (!token) {
      throw new Error('登录票据兑换成功但未返回登录态')
    }
    userStore.login(token, userInfo)
    console.log('auth callback redirect:', route.query.redirect)
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
