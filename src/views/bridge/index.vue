<template>
  <div class="bridge-page">
    <p>正在跳转...</p>
    <p v-if="showManual && jumpUrl" class="manual-hint">
      若未自动跳转，请
      <a class="manual-link" :href="jumpUrl">点击这里继续</a>
    </p>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  buildMainAuthCheckUrl,
  buildMainTargetUrl,
  getThreeStepAuthOrigin,
  getThreeStepMainOrigin
} from '@/utils/threeStepRedirect'
import { savePromotionParams, savePromotionParamsFromUrl } from '@/utils/promotionParams'

const route = useRoute()
const router = useRouter()

const jumpUrl = ref('')
const showManual = ref(false)

/** 微信等 WebView 对首屏立即跨域 replace 不稳定，稍延迟再跳；仍失败则展示手动链接 */
const REDIRECT_DELAY_MS = 150
const MANUAL_HINT_DELAY_MS = 4000

let redirectTimer
let manualHintTimer

onMounted(() => {
  const authOrigin = getThreeStepAuthOrigin()
  const mainOrigin = getThreeStepMainOrigin()
  if (!authOrigin || !mainOrigin) {
    router.replace({ path: '/error' })
    return
  }

  const redirectUrl = buildMainTargetUrl(route.query, mainOrigin, import.meta.env.BASE_URL || '/webh5/')
  savePromotionParams(route.query)
  savePromotionParamsFromUrl()
  const authCheckUrl = buildMainAuthCheckUrl({
    mainOrigin,
    basePath: import.meta.env.BASE_URL || '/webh5/',
    redirectUrl,
    query: route.query
  })
  jumpUrl.value = authCheckUrl

  redirectTimer = window.setTimeout(() => {
    window.location.replace(authCheckUrl)
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
.bridge-page {
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
