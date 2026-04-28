<template>
  <div class="error-page">
    <nut-noticebar :left-icon="false" :scrollable="false" background="#4979f2" color="#fff">
      <template #left-icon>
      </template>
      <span>下载APP，应用商店搜索：</span>
      <template #right-icon>
        <img src="@/assets/images/logo.png" alt="logo" style="width: 20px; height: 20px">
        <span style="margin-left: 5px;">特有料</span>
        <nut-button size="small" color="#F9505B" @click="$router.push('/downloadapp')">下载</nut-button>
      </template>
    </nut-noticebar>
    <Navbar title="页面不存在" left="left" backgroundColor="transparent" />
    <div class="error-content">
      <div class="error-icon">
        <div class="icon-text">404</div>
      </div>
      <div class="error-title">页面走丢了</div>
      <div class="error-desc">
        抱歉，您访问的页面不存在或已被移除
      </div>
      <div class="error-actions">
        <nut-button class="btn-primary" color="linear-gradient(to right, #15A291 40%, #42E2CE 100%)" @click="goHome">
          返回首页
        </nut-button>
        <nut-button class="btn-secondary" @click="goBack">
          返回上一页
        </nut-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()

const goHome = () => {
  router.push('/login')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
@import './error.scss';
</style>

<style lang="scss">
@import "@/assets/css/custom.scss";
</style>