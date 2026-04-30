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
  const authLoginUrl = buildAuthLoginUrl({
    authOrigin,
    basePath: import.meta.env.BASE_URL || '/webh5/',
    redirectUrl
  })
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
