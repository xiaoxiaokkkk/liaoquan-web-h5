<template>
  <div class="home-page">
    <!-- 顶部蓝色栏 -->
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
    <div class="home-topbar">
      <div class="topbar-left" @click="showAddWechat">
        <img class="top-wechat-icon" :src="imgWechat" alt="联系Ta" />
        <span>联系Ta</span>
      </div>
      <div class="topbar-right" @click="onSwitchMerchant">
        <img class="top-switch-icon" :src="imgSwitch" alt="切换商家" />
        <span>切换商家</span>
      </div>
    </div>

    <!-- 头部背景（截图中红色渐变+底纹） -->
    <div class="home-top-bg" :style="{ backgroundImage: `url(${imgTopBg})` }">
      <div class="home-topbar">
        <div class="topbar-left" @click="showAddWechat">
          <img class="top-wechat-icon" :src="imgWechat" alt="联系Ta" />
          <span>联系Ta</span>
        </div>
        <div class="topbar-right" @click="onSwitchMerchant">
          <img class="top-switch-icon" :src="imgSwitch" alt="切换商家" />
          <span>切换商家</span>
        </div>
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
        <div class="merchant-divider" />
        <div class="merchant-actions">
          <nut-grid direction="horizontal" :border="false">
            <nut-grid-item text="公众号" @click="onOfficialAccountClick"><img class="action-icon" :src="imgWechatPublic" alt="公众号" /></nut-grid-item>
            <nut-grid-item text="推广TA" @click="customToast('下载app，获得推广收益，体验完整版')"><img class="action-icon" :src="imgInvite" alt="推广TA" /></nut-grid-item>
            <nut-grid-item text="私信TA" @click="customToast('下载app，解锁私信功能，体验完整版')"><img class="action-icon" :src="imgWechat2" alt="私信TA" /></nut-grid-item>
            <nut-grid-item text="投诉TA" @click="customToast('下载app，体验完整版')"><img class="action-icon" :src="imgEmail" alt="投诉她" /></nut-grid-item>
          </nut-grid>
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
            <nut-tab-pane title="包时套餐" pane-key="package">
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
            </nut-tab-pane>
          </nut-tabs>

          <!-- <div class="filter-trigger" @click="toggleFilter">
            <span class="filter-text">筛选</span>
            <img class="filter-icon" :src="imgSelect" alt="筛选" />
            <nut-popover
              v-model:visible="filterVisible"
              location="bottom-end"
              :list="filterOptions"
              @choose="onFilterChoose"
            />
          </div> -->
        </div>

        
      </div>
    </div>

    
    <nut-dialog
      teleport="#app"
      title="应用商店搜索：特有料，体验完整版"
      content="app链接"
      v-model:visible="visibleDownloadApp"
      custom-class="custom-dialog"
      pop-class="custom-dialog"
      :noOkBtn="true"
    > 
      <div class="download-app-content">
        <nut-button size="small" plain color="#F9505B" @click="openUrl(iosUrl)">下载ios版</nut-button>
        <nut-button size="small" color="#F9505B" @click="openUrl(androidUrl)">下载安卓版</nut-button>
      </div>
    </nut-dialog>
    <nut-dialog
      teleport="#app"
      :title="null"
      :content="null"
      v-model:visible="visibleAddWechat"
      custom-class="custom-dialog"
      pop-class="custom-wechat"
      okText="保存二维码"
      @ok="saveWeChat(merchant.weChatPicture)"
    >
      <div class="add-wechat-content">
        <img class="qr-code-img" :src="merchant.weChatPicture" alt="商家微信" />
        <div class="app-content-title">添加商家微信，微信号：{{ merchant.weChat }}</div>
      </div>
    </nut-dialog>
    <nut-dialog
      teleport="#app"
      :title="null"
      :content="null"
      v-model:visible="visibleOfficialAccount"
      custom-class="custom-dialog"
      pop-class="custom-wechat"
      okText="保存二维码"
      @ok="saveWeChat(merchant.officialQrcodeImg)"
    >
      <div class="add-wechat-content">
        <img class="qr-code-img" :src="merchant.officialQrcodeImg" alt="公众号二维码" />
        <div class="app-content-title">关注公众号</div>
      </div>
    </nut-dialog>
  </div>
  <!-- 右侧滑入：搜索商家 -->
  <SearchMch v-model:visible="searchMchVisible" @select="onMerchantSelected" />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from '@nutui/nutui'
import { getUserInfo, bindPromotion, addAttention } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { saveLastMerchant } from '@/api/content'
import { mergeHomeRouteParams, saveHomeRouteParams } from '@/utils/homeRouteParams'
import { 
  iosUrl, 
  androidUrl, 
  isIOS, 
  isWeChatBrowser, 
  tryWeChatOpenUrl, 
  tryAnchorOpen, 
  copyToClipboard, 
  convertToItmsApps 
} from '@/utils/common'

import ContentList from '@/views/contentlist/index.vue'
import PackageList from '@/views/packagelist/index.vue'
import DiscardList from '@/views/discardlist/index.vue'
import SearchMch from '@/views/searchmch/index.vue'

// 图片：统一用 import，确保 Vite 打包后可显示
import imgTopBg from '@/assets/images/home/top-bg.png'
import imgWechat2 from '@/assets/images/home/wechat-2.png'
import imgSwitch from '@/assets/images/home/switch.png'
import imgWechatPublic from '@/assets/images/home/wechat-public.png'
import imgInvite from '@/assets/images/home/invite.png'
import imgWechat from '@/assets/images/home/wechat.png'
import imgEmail from '@/assets/images/home/email.png'
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

const filterVisible = ref(false)
const filterValue = ref('all')
const filterOptions = computed(() => [
  { name: '全部', value: 'all' },
  { name: '免费', value: 'free' },
  { name: '公开', value: 'public' },
  { name: '预售', value: 'presell' },
  { name: '付费', value: 'pay' }
])

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

// 2.添加关注
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

// 3.绑定推广关系
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
  // await fetchMerchant()
})

// 弹窗提示下载app
const visibleDownloadApp = ref(false)
function showDownloadApp() {
  visibleDownloadApp.value = true
}

// 
const customToast = (message) => {
  showToast.text(message, {duration: 2000})
}

// 弹窗提示添加商家微信
const visibleAddWechat = ref(false)
function showAddWechat() {
  visibleAddWechat.value = true
}

// 弹窗提示公众号二维码
const visibleOfficialAccount = ref(false)
function showOfficialAccount() {
  visibleOfficialAccount.value = true
}

// 公众号点击事件
function onOfficialAccountClick() {
  if (merchant.value?.officialQrcodeImg) {
    showOfficialAccount()
  } else {
    customToast('该商户尚未上传公众号')
  }
}

// 右侧滑入：搜索商家
const searchMchVisible = ref(false)


//
const saveWeChat = async (picUrl) => {
  try {
    if (!picUrl) {
      showToast.fail('图片地址为空', {duration: 2000})
      return
    }

    // 说明：
    // - 直接 fetch 跨域图片会被 CORS 拦截
    // - Canvas 绘制跨域图片会导致 tainted canvas，无法导出
    // 所以这里通过 Vite/Nginx 同源代理 `/__cdn__` 转发到 cdn.hnstylor.cn，再进行下载
    let fetchUrl = picUrl
    try {
      const u = new URL(picUrl)
      if (u.hostname === 'cdn.hnstylor.cn') {
        fetchUrl = `/__cdn__${u.pathname}${u.search || ''}`
      }
    } catch (_) {
      // picUrl 不是完整 URL 时，保持原样
    }

    const response = await fetch(fetchUrl)
    if (!response.ok) {
      throw new Error(`下载失败：${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    const ext =
      contentType.includes('png') ? 'png' :
      contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' :
      contentType.includes('webp') ? 'webp' :
      'png'

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `wechat-qrcode.${ext}`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)

      showToast.success('保存成功', {duration: 2000})
  } catch (error) {
    console.error('保存二维码失败:', error)
      showToast.fail('保存失败（需服务端开启代理或 CDN 开启 CORS）', {duration: 2000})
  }
}


// 下载app
const openUrl = (url) => {
  if (!url) {
    showToast.fail('下载地址为空', {duration: 2000})
    return
  }
  
  // 判断是否为 APK 下载链接
  const isApkUrl = url.includes('.apk')
  
  // 微信浏览器中，即使是 iOS 设备，也使用 https 链接（微信不支持 itms-apps:// 协议）
  if (isWeChatBrowser()) {
    // 你的场景必须在微信内（走微信授权），iOS 微信通常会拦截外链直达 App Store
    // 所以：iOS 下直接复制链接，并提示用户去 Safari 打开
    if (isIOS() && url.includes('apps.apple.com')) {
      copyToClipboard(url).then((ok) => {
        if (ok) {
          showToast.success('已复制 iOS 下载链接，请打开 Safari 粘贴访问', {duration: 2000})
        } else {
          showToast.fail('复制失败，请长按链接手动复制', {duration: 2000})
        }
      })
      return
    }

    // 微信浏览器中，APK 下载统一复制链接
    if (isApkUrl) {
      copyToClipboard(url).then((ok) => {
        if (ok) {
          showToast.success('已复制下载链接，请点击右上角"..."选择"在浏览器中打开"进行下载', {duration: 2000})
        } else {
          showToast.fail('复制失败，请长按链接手动复制', {duration: 2000})
        }
      })
      return
    }

    // 非 iOS（或非 App Store 链接）：仍尝试微信内打开
    const ok = tryWeChatOpenUrl(url) || tryAnchorOpen(url)
    if (!ok) {
      try {
        window.location.href = url
      } catch (_) {
        // ignore
      }
    }
    return
  }
  
  // 非微信浏览器：如果是 iOS 设备且是 App Store 链接，转换为 itms-apps:// 协议直接跳转
  if (isIOS() && url.includes('apps.apple.com')) {
    const itmsUrl = convertToItmsApps(url)
    // itms-apps:// 协议会直接打开 App Store 应用
    window.location.href = itmsUrl
  } else if (isApkUrl) {
    // 对于 APK 文件，统一复制链接
    copyToClipboard(url).then((ok) => {
      if (ok) {
        showToast.success('已复制下载链接，请在浏览器中粘贴访问', {duration: 2000})
      } else {
        showToast.fail('复制失败，请长按链接手动复制', {duration: 2000})
      }
    })
  } else {
    // 非 iOS 设备或非 App Store 链接，使用 window.open
    window.open(url, '_blank')
  }
}


const goDownload = () => {
  window.location.href = 'http://192.168.3.13:3000/webh5/downloadapp'
}


// 切换商家
const onSwitchMerchant = () => {
  searchMchVisible.value = true
}

function onMerchantSelected(item) {
  const id = item?.uid ?? item?.merchantId
  if (!id) return
  // 更新 home 的 query，让 ContentList 自动监听 merchantId 刷新
  router.replace({
    name: 'Home',
    query: {
      ...route.query,
      merchantId: String(id)
    }
  })
  fetchSaveLastMerchant(id)
}

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
@import './home.scss';
</style>


