<template>
  <div class="enter-page">
    <button class="enter-btn" @click="handleEnter">进入</button>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const handleEnter = () => {
  router.push({
    path: '/lqindex',
    query: {
      ...route.query,
      from: 'enter-page',
      source: 'button'
    }
  })
}
</script>

<style scoped>
.enter-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.enter-btn {
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  /*background: #1677ff;*/
  background: rgb(249, 80, 91);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}
</style>
