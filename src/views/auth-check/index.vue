<template>
  <div class="auth-check-page">
    <p>正在检查登录状态...</p>
    <p v-if="showManual && jumpUrl" class="manual-hint">
      若未自动跳转，请
      <a class="manual-link" :href="jumpUrl">点击这里继续</a>
    </p>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { savePromotionParams, savePromotionParamsFromUrl } from '@/utils/promotionParams'
import {
  buildAuthLoginUrl,
  buildMainTargetUrl,
  getThreeStepAuthOrigin,
  isAllowedExternalRedirect,
  normalizeInternalRedirectPath,
  sanitizeExternalRedirectPath
} from '@/utils/threeStepRedirect'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const jumpUrl = ref('')
const showManual = ref(false)

const REDIRECT_DELAY_MS = 150
const MANUAL_HINT_DELAY_MS = 4000

let redirectTimer
let manualHintTimer

function getQueryStringValue(key) {
  const value = route.query?.[key]
  if (Array.isArray(value)) return value[0] ? String(value[0]) : ''
  return value ? String(value) : ''
}

function getRedirectUrl() {
  const rawRedirect = getQueryStringValue('redirect')
  if (rawRedirect) return rawRedirect
  return buildMainTargetUrl(route.query, window.location.origin, import.meta.env.BASE_URL || '/webh5/')
}

function isCurrentOriginRedirect(redirectUrl) {
  try {
    return new URL(redirectUrl).origin === window.location.origin
  } catch (_) {
    return false
  }
}

function getInternalRedirectPath(redirectUrl) {
  if (isAllowedExternalRedirect(redirectUrl) || isCurrentOriginRedirect(redirectUrl)) {
    return sanitizeExternalRedirectPath(redirectUrl, import.meta.env.BASE_URL || '/webh5/')
  }
  return normalizeInternalRedirectPath(redirectUrl, import.meta.env.BASE_URL || '/webh5/')
}

function savePromotionFromRedirect(redirectUrl) {
  try {
    const url = new URL(redirectUrl, window.location.origin)
    savePromotionParams({
      merchantId: url.searchParams.get('merchantId'),
      userId: url.searchParams.get('userId')
    })
  } catch (_) {
    // ignore invalid redirect
  }
}

function appendPromotionParamsToAuthUrl(authUrl) {
  const url = new URL(authUrl)
  ;['merchantId', 'userId'].forEach((key) => {
    const value = getQueryStringValue(key)
    if (value) url.searchParams.set(key, value)
  })
  return url.toString()
}

onMounted(() => {
  const redirectUrl = getRedirectUrl()
  savePromotionParams(route.query)
  savePromotionFromRedirect(redirectUrl)
  savePromotionParamsFromUrl()

  userStore.initFromStorage()
  if (userStore.getToken) {
    const redirectPath = getInternalRedirectPath(redirectUrl)
    router.replace(redirectPath)
    return
  }

  const authOrigin = getThreeStepAuthOrigin()
  if (!authOrigin) {
    router.replace({ path: '/error' })
    return
  }

  const authLoginUrl = appendPromotionParamsToAuthUrl(
    buildAuthLoginUrl({
      authOrigin,
      basePath: import.meta.env.BASE_URL || '/webh5/',
      redirectUrl
    })
  )
  jumpUrl.value = authLoginUrl

  redirectTimer = window.setTimeout(() => {
    window.location.replace(authLoginUrl)
  }, REDIRECT_DELAY_MS)

  manualHintTimer = window.setTimeout(() => {
    showManual.value = true
  }, MANUAL_HINT_DELAY_MS)
})

onUnmounted(() => {
  if (redirectTimer) window.clearTimeout(redirectTimer)
  if (manualHintTimer) window.clearTimeout(manualHintTimer)
})
</script>

<style scoped>
.auth-check-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  color: #666;
  font-size: 14px;
}

.manual-hint {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: #999;
}

.manual-link {
  color: #4979f2;
  text-decoration: underline;
}
</style>
