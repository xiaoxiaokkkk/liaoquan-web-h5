<template>
  <div class="app-container">
    <div class="layout-content">
      <router-view v-slot="{ Component, route }">
        <!-- 根据子路由 meta.keepAlive 决定是否缓存 TabBar 页面
             使用 route.name 作为 key，避免多个 index.vue 组件共用同一个缓存实例 -->
        <keep-alive>
          <component
            v-if="route.meta.keepAlive"
            :is="Component"
            :key="route.name"
          />
        </keep-alive>
        <component
          v-if="!route.meta.keepAlive"
          :is="Component"
          :key="route.name"
        />
      </router-view>
    </div>
    <div class="layout-footer">
      <TabBar :data="tabbars" />
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'
import TabBar from '@/components/TabBar.vue'

// 导入图片资源
import homeActive from '@/assets/images/tabbar/home-active.png'
import homeUnactive from '@/assets/images/tabbar/home.png'

import msgActive from '@/assets/images/tabbar/msg-active.png'
import msgUnactive from '@/assets/images/tabbar/msg.png'

import orderActive from '@/assets/images/tabbar/order-active.png'
import orderUnactive from '@/assets/images/tabbar/order.png'

import mineActive from '@/assets/images/tabbar/mine-active.png'
import mineUnactive from '@/assets/images/tabbar/mine.png'
const tabbars = [
  {
    title: '首页',
    active: homeActive,
    unactive: homeUnactive,
    to: {
      name: 'LqIndex'
    },
    name: 'LqIndex'
  },
  {
    title: '消息',
    active: msgActive,
    unactive: msgUnactive,
    to: {
      name: 'Msg'
    },
    name: 'Msg'
  },
  {
    title: '订单',
    active: orderActive,
    unactive: orderUnactive,
    to: {
      name: 'Order'
    },
    name: 'Order'
  },
  {
    title: '我的',
    active: mineActive,
    unactive: mineUnactive,
    to: {
      name: 'Mine'
    },
    name: 'Mine'
  }
];
</script>

<style lang="scss" scoped>
@import "@/assets/css/common.scss";
</style>