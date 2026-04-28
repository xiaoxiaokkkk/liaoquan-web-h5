<template>
  <div class="discard-page">
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
    <Navbar title="优惠卡" left="left" color="#000" />

    <div class="discard-tabs">
      <nut-tabs v-model="activeTab" color="#F9505B">
        <nut-tab-pane title="已生效" pane-key="active">
          <UserDiscard style="flex: 1; min-height: 0;" tab-type="active" />
        </nut-tab-pane>
        <nut-tab-pane title="已过期" pane-key="expired">
          <UserDiscard style="flex: 1; min-height: 0;" tab-type="expired" />
        </nut-tab-pane>
      </nut-tabs>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { ref } from 'vue'
import UserDiscard from './components/UserDiscard.vue'

const activeTab = ref('active')
</script>

<style lang="scss" scoped>
@import './discard.scss';
</style>

