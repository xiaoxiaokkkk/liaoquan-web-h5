<template>
  <div class="order-page">
    <nut-noticebar :left-icon="false" :scrollable="false" background="#4979f2" color="#fff">
      <template #left-icon>
      </template>
      <span>下载APP，应用商店搜索：</span>
      <template #right-icon>
        <img src="@/assets/images/logo.png" alt="logo" style="width: 20px; height: 20px">
        <span style="margin-left: 5px; margin-right: 10px;">特有料</span>
        <nut-button size="mini" color="#F9505B" @click="$router.push('/downloadapp')">下载</nut-button>
      </template>
    </nut-noticebar>
    <!-- 顶部标签页 -->
    <div class="order-tabs">
      <nut-tabs v-model="activeTab" color="#F9505B" align="left">
        <nut-tab-pane title="即时订单" pane-key="instant">
          <OrderList :order-type="'instant'" />
        </nut-tab-pane>
        <nut-tab-pane title="包时订单" pane-key="pkg">
          <OrderList :order-type="'pkg'" />
        </nut-tab-pane>
        <!-- <nut-tab-pane title="套餐订单" pane-key="package">
          <OrderList :order-type="'package'" />
        </nut-tab-pane> -->
      </nut-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import OrderList from '../orderlist/index.vue'

const activeTab = ref('instant')
const route = useRoute()

function normalizeOrderTab(value) {
  const v = String(value || '').toLowerCase()
  if (v === 'pkg' || v === 'instant') return v
  return 'instant'
}

watch(
  () => route.query?.tab,
  (tab) => {
    activeTab.value = normalizeOrderTab(tab)
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
@import './order.scss';
</style>
