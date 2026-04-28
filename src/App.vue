<template>
  <router-view v-slot="{ Component, route }">
    <!-- 根据路由 meta.keepAlive 决定是否缓存页面
         使用 route.name 作为 key，避免多个组件共用同一个缓存实例 -->
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
</template>
<script setup>
</script>
<style lang="scss">
@import "@/assets/css/custom.scss";
</style>