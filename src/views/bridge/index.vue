<template>
  <div class="bridge-page">正在跳转...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  buildAuthLoginUrl,
  buildMainTargetUrl,
  getThreeStepAuthOrigin,
  getThreeStepMainOrigin
} from '@/utils/threeStepRedirect'
import { savePromotionParams, savePromotionParamsFromUrl } from '@/utils/promotionParams'

const route = useRoute()
const router = useRouter()

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
  console.log('bridge route.query:', route.query)
  console.log('bridge redirectUrl:', redirectUrl)
  const authLoginUrlObj = new URL(buildAuthLoginUrl({
    authOrigin,
    basePath: import.meta.env.BASE_URL || '/webh5/',
    redirectUrl
  }))
  ;['merchantId', 'userId'].forEach((key) => {
    const value = route.query?.[key]
    if (value !== undefined && value !== null) {
      authLoginUrlObj.searchParams.set(key, Array.isArray(value) ? String(value[0] || '') : String(value))
    }
  })
  const authLoginUrl = authLoginUrlObj.toString()
  console.log('bridge authOrigin:', authOrigin)
  console.log('bridge mainOrigin:', mainOrigin)
  console.log('bridge authLoginUrl:', authLoginUrl)
  console.log('bridge redirectUrl:', redirectUrl)
  
  window.location.replace(authLoginUrl)
})
</script>

<style scoped>
.bridge-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}
</style>
