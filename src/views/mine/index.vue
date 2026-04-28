<template>
  <div class="mine-page">
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
    <div class="mine-header">
      <div class="header-left">
        <nut-avatar
          size="64"
          class="user-avatar"
          :src="userInfo.photo || defaultAvatar"
        >
          <img :src="userInfo.photo || defaultAvatar" alt="avatar" class="user-avatar-img" @error="handleAvatarError">
        </nut-avatar>
        <div class="user-info">
          <div class="user-name">{{ userInfo.nickName }}</div>
        </div>
      </div>
      <div>
        <img :src="rightIcon1" alt="right-icon" class="right-icon"></img>
      </div>
    </div>
    <div class="mine-content">
      <div class="balance-card">
        <div class="balance-card-content">
          <div class="balance-card-content-title">可用余额</div>
          <div class="balance-card-content-value">￥{{ formatCoin(userInfo.coin) }}</div>
        </div>
        <div>
          <img :src="rightIcon2" alt="balance-arrow" class="balance-arrow">
        </div>
      </div>
      <div class="mt-10">
        <div class="grid-container">
          <div class="grid-item" @click="showDownloadApp">
            <img :src="invite1" alt="invite-1" class="invite-icon grid-icon">
            <div class="grid-item-text">我要推广</div>
          </div>
          <div class="grid-item" @click="showDownloadApp">
            <img :src="invite2" alt="invite-2" class="invite-icon grid-icon">
            <div class="grid-item-text">我的邀请</div>
          </div>
          <div class="grid-item" @click="showDownloadApp">
            <img :src="wallet" alt="wallet" class="wallet-icon grid-icon">
            <div class="grid-item-text">推广钱包</div>
          </div>
        </div>
      </div>
      <div class="mt-10">
        <div class="order-card">
          <nut-cell-group title="" desc="" :border="false">
            <nut-cell title="我的优惠券" is-link center @click="router.push('/coupons')">
              <template #icon>
                <img :src="coupon2" alt="coupon-2" class="coupon-icon">
              </template>
            </nut-cell>
            <!-- @click="router.push('/discard')" -->
            <nut-cell title="我的优惠卡" is-link center @click="router.push('/discard')">
              <template #icon>
                <img :src="coupon1" alt="coupon-1" class="coupon-icon">
              </template>
            </nut-cell>
            <nut-cell title="商家申请" is-link center @click="showDownloadApp">
              <template #icon>
                <img :src="store" alt="store" class="store-icon">
              </template>
            </nut-cell>
            <nut-cell title="平台客服/纠纷处理" is-link center @click="showDownloadApp">
              <template #icon>
                <img :src="customer" alt="customer" class="customer-icon">
              </template>
            </nut-cell>
            <nut-cell title="退出登录" is-link center @click="logout">
              <template #icon>
                <img :src="setting" alt="setting" class="setting-icon">
              </template>
            </nut-cell>
          </nut-cell-group>
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
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import defaultAvatar from '@/assets/images/user/avatar.png'
import rightIcon1 from '@/assets/images/user/right-icon.png'
import rightIcon2 from '@/assets/images/user/right-icon-w.png'

import invite1 from '@/assets/images/user/invite-1.png'
import invite2 from '@/assets/images/user/invite-2.png'
import wallet from '@/assets/images/user/wallet.png'

import coupon1 from '@/assets/images/user/coupon-1.png'
import coupon2 from '@/assets/images/user/coupon-2.png'
import customer from '@/assets/images/user/customer.png'
import setting from '@/assets/images/user/setting.png'
import store from '@/assets/images/user/store.png'


import { getUserInfo } from '@/api/user'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from '@nutui/nutui'
import { formatCoin } from '@/utils/math'
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

const router = useRouter()
const userStore = useUserStore()
const userInfo = ref({})

const fetchUserInfo = async () => {
  const res = await getUserInfo({ userid: userStore.userInfo.userid })
  if (res?.code !== 0) {
    throw new Error(res?.msg || res?.message || '获取用户信息失败')
  }
  userInfo.value = res?.data
  console.log('userInfo:', userInfo.value)
  userStore.setUserInfo(res?.data)
}
fetchUserInfo()


// 弹窗提示下载app
const visibleDownloadApp = ref(false)
const customToast = (message) => {
  showToast.text(message, {duration: 2000})
}
function showDownloadApp() {
  // visibleDownloadApp.value = true
  customToast('下载app，体验完整版')
}

const logout = () => {
  userStore.logout()
  router.push('/login', { replace: true })
  showToast.success('退出登录成功')
}

// 下载app
const openUrl = (url) => {
  if (!url) {
    showToast.fail('下载地址为空')
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
          showToast.success('已复制 iOS 下载链接，请打开 Safari 粘贴访问')
        } else {
          showToast.fail('复制失败，请长按链接手动复制')
        }
      })
      return
    }

    // 微信浏览器中，APK 下载统一复制链接
    if (isApkUrl) {
      copyToClipboard(url).then((ok) => {
        if (ok) {
          showToast.success('已复制下载链接，请点击右上角"..."选择"在浏览器中打开"进行下载')
        } else {
          showToast.fail('复制失败，请长按链接手动复制')
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
        showToast.success('已复制下载链接，请在浏览器中粘贴访问')
      } else {
        showToast.fail('复制失败，请长按链接手动复制')
      }
    })
  } else {
    // 非 iOS 设备或非 App Store 链接，使用 window.open
    window.open(url, '_blank')
  }
}



</script>

<style scoped lang="scss">
@import './mine.scss';
</style>


