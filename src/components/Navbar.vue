<template>
  <nut-navbar 
    class="navbar" 
    :style="navbarStyle"
  >
    <template #left>
      <Left v-if="left === 'left'" class="navbar-left-icon" @click="handleLeft" :color="color" />
      <div class="navbar-title" :style="{ color }" @click="titleBack ? handleLeft() : ''">
        <span>{{ title }}</span>
      </div>
    </template>
    <template #right>
      <Right v-if="right === 'right'" @click="handleRight" :color="color" width="19px" height="19px" />
      <Ask v-if="right === 'Ask'" @click="handleRight" :color="color" width="19px" height="19px" />
      <img v-if="right === 'img'" :src="image" alt="" class="image-icon" style="width: 20px; cursor: pointer;" @click="handleRight" />
    </template>
  </nut-navbar>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Left, Ask, Right } from '@nutui/icons-vue'

const router = useRouter()

const emit = defineEmits(['right', 'left'])

const props = defineProps({
  left: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  right: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  // 标题与图标颜色
  color: {
    type: String,
    default: '#000'
  },
  // 自定义返回路径，如果提供则跳转到指定路径，否则使用 router.back()
  backPath: {
    type: [String, Object],
    default: null
  },
  // 是否自动执行返回操作，如果为 false，则只触发 left 事件，不执行默认返回
  // 适用于父组件监听 @left 事件并自己处理返回逻辑的场景
  autoBack: {
    type: Boolean,
    default: true
  },
  titleBack:{
    type: Boolean,
    default: false
  }
  // 背景色，支持颜色值或 'transparent'
  // backgroundColor: {
  //   type: String,
  //   default: 'transparent'
  // }
})

const navbarStyle = computed(() => {
  if (props.backgroundColor) {
    return {
      '--nut-navbar-background': props.backgroundColor
    }
  }
  return {}
})

const handleLeft = () => {
  // 触发 left 事件，让父组件可以监听并自定义处理
  emit('left')
  
  // 如果 autoBack 为 false，则不执行默认返回，由父组件在 @left 事件中处理
  if (!props.autoBack) {
    return
  }
  
  // 如果提供了 backPath，跳转到指定路径
  if (props.backPath) {
    router.push(props.backPath)
  } else {
    // 否则使用默认的返回上一页
    router.back()
  }
}

const handleRight = () => {
  console.log('handleRight')
  emit('right')
}

</script>
<style scoped lang="scss">
.navbar-left-icon {
  margin-right: 14px;
}
.navbar-title {
  font-weight: 500;
  font-size: 18px;
  color: #000;
  line-height: 26px;
}

:deep(.nut-navbar__title) {
  color: #000 !important;
}

// 使用深度选择器覆盖 NutUI navbar 的背景色
:deep(.nut-navbar) {
  // background: v-bind('props.backgroundColor') !important;
  border-bottom: none !important;
  box-shadow: none !important;
}
</style>