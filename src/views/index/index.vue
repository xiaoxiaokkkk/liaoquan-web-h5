<template>
  <div class="index-page">
    <!-- 顶部蓝色栏 -->
    <nut-noticebar :left-icon="false" :scrollable="false" background="#4979f2" color="#fff">
      <template #left-icon>
      </template>
      <span>获取APP，应用商店搜索：</span>
      <template #right-icon>
        <img src="@/assets/images/logo.png" alt="logo" style="width: 20px; height: 20px">
        <span style="margin-left: 5px; margin-right: 10px;">特有料</span>
        <nut-button size="mini" color="#F9505B" @click="$router.push('/downloadapp')">获取</nut-button>
      </template>
    </nut-noticebar>

    <!-- 头部背景（截图中红色渐变+底纹） -->
    <div class="home-top-bg" :style="{ backgroundImage: `url(${imgTopBg})` }">
      <div class="home-topbar">
        <!-- <div class="topbar-left" @click="showAddWechat">
          <img class="top-wechat-icon" :src="imgWechat" alt="联系Ta" />
          <span>联系Ta</span>
        </div>
        <div class="topbar-right" @click="onSwitchMerchant">
          <img class="top-switch-icon" :src="imgSwitch" alt="切换商家" />
          <span>切换商家</span>
        </div> -->
      </div>
    </div>

    <div class="scroll-view">
      <!-- 商家信息卡片 -->
      <div class="card merchant-card">
        <div class="merchant-main">
          <img class="merchant-avatar" :src="merchant.photo || imgDefaultAvatar" alt="avatar" />
          <div class="merchant-info">
            <div class="merchant-name">{{ merchant.nickName }}</div>
            <div class="merchant-desc">{{ merchant.personSign }}</div>
          </div>
        </div>
      </div>

      <!-- 内容区卡片 -->
      <div class="card content-card">
        <div class="content-tabs-row" >
          <nut-tabs v-model="activeTab" color="#F74B2B" align="left" animated-time="0">
            <nut-tab-pane title="TA料" pane-key="material">
              <!-- 搜索 + 列表 抽到子组件 -->
              <ContentList
                style="flex: 1; min-height: 0;"
                :merchant-id="merchantId || 1"
                :tab-key="activeTab"
                :filter-value="filterValue"
              />
            </nut-tab-pane>
            <!-- <nut-tab-pane title="包时套餐" pane-key="package">
              <PackageList
                style="flex: 1; min-height: 0;"
                :merchant-id="merchantId || 1"
                :tab-key="activeTab"
              />
            </nut-tab-pane>
            <nut-tab-pane title="优惠卡" pane-key="discard">
              <DiscardList
                style="flex: 1; min-height: 0;"
                :tab-key="activeTab"
                :merchant-id="merchantId || 1"
              />
            </nut-tab-pane> -->
          </nut-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from '@nutui/nutui'
import { getUserInfo, bindPromotion, addAttention } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { saveLastMerchant } from '@/api/content'
import { mergeHomeRouteParams, saveHomeRouteParams } from '@/utils/homeRouteParams'
import { runUserBlackCheck } from '@/utils/blackCheck'
// import { 
//   iosUrl, 
//   androidUrl, 
//   isIOS, 
//   isWeChatBrowser, 
//   tryWeChatOpenUrl, 
//   tryAnchorOpen, 
//   copyToClipboard, 
//   convertToItmsApps 
// } from '@/utils/common'

import ContentList from '@/views/contentlist/index.vue'
// import PackageList from '@/views/packagelist/index.vue'
// import DiscardList from '@/views/discardlist/index.vue'
// import SearchMch from '@/views/searchmch/index.vue'

// 图片：统一用 import，确保 Vite 打包后可显示
import imgTopBg from '@/assets/images/home/top-bg.png'
// import imgWechat2 from '@/assets/images/home/wechat-2.png'
// import imgSwitch from '@/assets/images/home/switch.png'
// import imgWechatPublic from '@/assets/images/home/wechat-public.png'
// import imgInvite from '@/assets/images/home/invite.png'
// import imgWechat from '@/assets/images/home/wechat.png'
// import imgEmail from '@/assets/images/home/email.png'
import imgDefaultAvatar from '@/assets/images/avatar@1x.png'
// 搜索/列表相关图片已下沉到 ContentList

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const merchant = ref({})

// 商家ID
const merchantId = ref(undefined)

// 推广人ID
const superiorId = ref(undefined)

// 当前选中的tab
const currentTab = ref(undefined)

const activeTab = ref('material')

function syncHomeParams() {
  const merged = mergeHomeRouteParams(route)
  // 持久化（路由优先，后续 tabbar 切换会从 localStorage 带回）
  saveHomeRouteParams({ query: merged })

  merchantId.value = merged.merchantId
  superiorId.value = merged.userId
  currentTab.value = merged.tab
  if (merged.tab) activeTab.value = merged.tab
}

// route 更新（包括从 TabBar 切回 Home）时同步参数
watch(
  () => route.fullPath,
  () => {
    syncHomeParams()
  },
  { immediate: true }
)

const filterValue = ref('all')

// 获取用户信息
const fetchUserInfo = async () => {
  const userid = userStore.userInfo.userid
  const res = await getUserInfo({ userid: userid })
  if (res?.code !== 0) {
    throw new Error(res?.msg || res?.message || '获取用户信息失败')
  }
  userStore.setUserInfo(res?.data)
}
fetchUserInfo();

// 1.获取商家信息
const fetchMerchantInfo = async () => {
  try {
    const res = await getUserInfo({ userid: merchantId.value })
    if (res?.code !== 0) {
      throw new Error(res?.msg || res?.message || '获取商家信息失败')
    }
    merchant.value = res?.data
  } catch (error) {
    console.error(error)
  } finally {
    fetchAddAttention()
    fetchSaveLastMerchant(merchantId.value)
  }
}
watch(
  () => merchantId.value,
  (id, prev) => {
    if (!id || id === prev) return
    fetchMerchantInfo()
  },
  { immediate: true }
)


const fetchAddAttention = async () => {
  try {
    const params = {
      userid: userStore.userInfo.userid,
      friendid: merchantId.value
    }
    const { code, msg } = await addAttention(params)
    if (code === 0 || code === '0') {
      return
    } else {
      if (msg.indexOf('关注过') !== -1) {
        console.log('关注过')
      } else {
        throw new Error(msg || '添加关注失败')
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    fetchBindPromotion()
  }
}

const fetchBindPromotion = async () => {
  if (!superiorId.value || superiorId.value === undefined || superiorId.value === 'undefined') {
    console.log('推广人ID为空，不需要绑定')
    return
  }
  const params = {
    superiorId: superiorId.value,
    merchantId: merchantId.value,
    userId: userStore.userInfo.userid
  }
  console.log('params', params)
  const { code, msg, message } = await bindPromotion(params)
  if (code !== 0 && code !== '0') {
    throw new Error(msg || message || '绑定推广关系失败')
  }
}

watch(activeTab, () => {
  // 截图里 Tab 只是切换列表类型，这里先复用同一接口+过滤
  // 列表由 ContentList 内部监听 tabKey 变化后自动刷新
})

onMounted(async () => {
  await runUserBlackCheck()
})

onActivated(async () => {
  await runUserBlackCheck()
})

const customToast = (message) => {
  showToast.text(message, {duration: 2000})
}

// 右侧滑入：搜索商家
const searchMchVisible = ref(false)

// 保存最后一次访问的商户
const fetchSaveLastMerchant = async (merchantId) => {
  try {
    // merchantId 需要用long类型传递，所以需要转换为long类型
    const merchantIdLong = Number(merchantId)
    const { code, message } = await saveLastMerchant(merchantIdLong)
    if (code !== '0' && code !== 0) {
      throw new Error(message || '保存最后一次访问的商户失败')
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped lang="scss">
@import './index.scss';
</style>


