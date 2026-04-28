<template>
  <nut-tabbar bottom safe-area-inset-bottom placeholder unactive-color="#999" active-color="#F9505B" v-model="activeName">
    <nut-tabbar-item
      v-for="(item, index) in data" 
      :key="index"
      :name="item.name"
      :tab-title="item.title"
    >
      <template #icon="slotProps">
        <img :src="getImageSrc(item, slotProps.active)" alt="" />
      </template>
    </nut-tabbar-item>
  </nut-tabbar>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Tabbar, TabbarItem } from '@nutui/nutui'
import { getSavedHomeRouteParams } from '@/utils/homeRouteParams'
// import { Home, Category, Find, Cart, My } from '@nutui/icons-vue-taro';

const props = defineProps( {
  data : {
    type : Array,
    required : true
  },
})

const route = useRoute()
const router = useRouter()
const activeName = ref('First');

// 根据当前路由设置激活的 tab
const updateActiveTab = () => {
  const currentRouteName = route.name
  // 查找匹配的 tab
  const matchedTab = props.data.find(item => item.name === currentRouteName)
  if (matchedTab) {
    activeName.value = matchedTab.name
  }
}

// 初始化时设置
onMounted(() => {
  updateActiveTab()
})

// 监听路由变化
watch(() => route.name, () => {
  updateActiveTab()
}, { immediate: true })

// Tab 切换：不要堆历史记录（微信里堆出可回退/前进历史后，底部会出现导航栏）
// 这里用 replace，Tab 切换符合“同层级切换”的语义
watch(
  () => activeName.value,
  (nextName) => {
    const matchedTab = props.data.find((item) => item.name === nextName)
    if (!matchedTab || !matchedTab.to) return
    // to 可能是 string（'/home'）也可能是 route location 对象（{ name: 'Home' }）
    // 用 resolve 统一成 fullPath，避免重复跳转造成循环
    let targetLocation = matchedTab.to

    // 切回首页（Home/First）时：把首次进入首页的 query（merchantId/userId/tab 等）带回去，避免 tabbar 切换丢参
    if (matchedTab.name === 'Home' || matchedTab.name === 'First') {
      const saved = getSavedHomeRouteParams()
      if (saved && Object.keys(saved).length > 0) {
        if (typeof targetLocation === 'string') {
          targetLocation = { path: targetLocation, query: saved }
        } else {
          // 以显式传入的 query 优先，其余用 saved 补齐
          targetLocation = { ...targetLocation, query: { ...saved, ...(targetLocation.query || {}) } }
        }
      }
    }

    const targetFullPath = router.resolve(targetLocation).fullPath
    if (route.fullPath === targetFullPath) return
    router.replace(targetLocation)
  }
)

// 获取图片路径
const getImageSrc = (item, isActive) => {
  // 直接返回导入的图片路径（已经是处理过的 URL）
  return isActive ? item.active : item.unactive
}
</script>

<style scoped lang="scss">

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #F9505B;
}
</style>