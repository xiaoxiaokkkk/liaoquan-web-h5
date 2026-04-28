<template>
  <div class="coupons-page">
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
    <Navbar title="我的优惠券" left="left" color="#000" />
    <!-- 顶部标签页 -->
    <div class="coupons-tabs">
      <nut-tabs v-model="activeTab" color="#F9505B">
        <nut-tab-pane title="未使用" pane-key="unused">
          <CouponsList :coupons-type="'unused'" />
        </nut-tab-pane>
        <nut-tab-pane title="已使用" pane-key="used">
          <CouponsList :coupons-type="'used'" />
        </nut-tab-pane>
        <nut-tab-pane title="已过期" pane-key="expired">
          <CouponsList :coupons-type="'expired'" />
        </nut-tab-pane>
      </nut-tabs>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import Navbar from '@/components/Navbar.vue';
import CouponsList from '../couponslist/index.vue';

const activeTab = ref('unused');

</script>
<style scoped lang="scss">
@import './coupons.scss';
</style>