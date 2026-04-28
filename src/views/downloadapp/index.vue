<template>
  <div class="download-app-page padding-left-right-15">
    <div class="download-app-page-content">
      <!-- <div class="page-top">
        <div class="top-logo">
          <img src="@/assets/images/logo.png" alt="logo">
        </div>
        <div class="top-title">
          特有料
        </div> 
      </div> -->

      <!-- 根据系统类型显示对应下载二维码 -->
      <div class="page-top download-qrcode" v-if="qrSrc">
        <div class="download-qrcode-title">
          特有料
        </div> 
        <img :src="qrSrc" class="download-qrcode-img" alt="下载二维码">
        <div class="download-qrcode-tip">{{ qrTipText }}</div>
      </div>
      <div class="page-content">
        <nut-button
          class="download-app-btn"
          color="#F9505B"
          block
          :loading="isLoading"
          :disabled="isLoading"
          @click="handleDownloadApp"
        >
          下载APP
        </nut-button>
      </div>
    </div>

    <div v-if="showWeChatGuide" class="wechat-guide-mask" @click="closeWeChatGuide">
      <div class="wechat-guide-content" @click.stop>
        <div class="wechat-guide-title">请使用外部应用打开</div>
        <div class="wechat-guide-text">{{ wechatGuideText }}</div>
        <div class="wechat-guide-actions">
          <nut-button type="primary" size="small" @click="copyDownloadLink">复制下载链接</nut-button>
          <nut-button size="small" @click="closeWeChatGuide">我知道了</nut-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { showToast } from '@nutui/nutui'
import { computed, onMounted, ref } from 'vue'
import iosQr from '@/assets/images/ios.png'
import androidQr from '@/assets/images/android.png'
  
const isLoading = ref(false)
const showWeChatGuide = ref(false)

const wechatGuideText = computed(() => {
  const systemType = getSystemType()
  if (systemType === 'ios') {
    return '点击右上角 ···，优先选择“用其他应用打开”；若可见“在 Safari/默认浏览器打开”也可使用，打开后将自动跳转。'
  }
  if (systemType === 'android') {
    return '点击右上角 ···，选择“用其他应用打开”并在外部浏览器继续下载；若没有浏览器选项，请先复制链接后在浏览器粘贴打开。'
  }
  return '点击右上角 ···，选择“用其他应用打开”，打开后将自动跳转下载。'
})

const qrSrc = computed(() => {
  const systemType = getSystemType()
  if (systemType === 'ios') return iosQr
  if (systemType === 'android') return androidQr
  return ''
})

const qrTipText = computed(() => {
  const systemType = getSystemType()
  if (systemType === 'ios') return '长按图片或者使用 iPhone 扫码立即下载'
  if (systemType === 'android') return `长按图片保存二维码后，使用浏览器扫码下载`
  return '请使用手机扫码下载'
})

function getSystemType() {
  const ua = navigator.userAgent.toLowerCase()
  // iPadOS 13+ 可能伪装成 Mac，结合触摸点位做兜底识别
  const isIOS = /iphone|ipad|ipod/.test(ua)
    || (ua.includes('macintosh') && navigator.maxTouchPoints > 1)
  const isAndroid = /android/.test(ua)

  if (isIOS) return 'ios'
  if (isAndroid) return 'android'
  return 'other'
}

function isWeChatBrowser() {
  return /micromessenger/.test(navigator.userAgent.toLowerCase())
}

function buildAndroidIntentUrl(downloadUrl) {
  try {
    const parsedUrl = new URL(downloadUrl)
    const scheme = parsedUrl.protocol.replace(':', '') || 'https'
    const hostAndPath = `${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
    const fallbackUrl = encodeURIComponent(downloadUrl)

    return `intent://${hostAndPath}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${fallbackUrl};end`
  } catch (error) {
    return ''
  }
}

function getDownloadUrls() {
  // const defaultUrl = import.meta.env.VITE_APP_DOWNLOAD_URL || ''
  // const iosUrl = import.meta.env.VITE_APP_IOS_DOWNLOAD_URL || defaultUrl
  // const androidUrl = import.meta.env.VITE_APP_ANDROID_DOWNLOAD_URL || defaultUrl

  const defaultUrl = 'https://d.hainanjunfeng.com/apk/tylan.apk'
  const iosUrl = 'https://itunes.apple.com/us/app/id6756619405'
  const androidUrl = 'https://d.hainanjunfeng.com/apk/tylan.apk'

  return { defaultUrl, iosUrl, androidUrl }
}

function getTargetDownloadUrl() {
  const { defaultUrl, iosUrl, androidUrl } = getDownloadUrls()
  const systemType = getSystemType()

  if (systemType === 'ios') return iosUrl || defaultUrl
  if (systemType === 'android') return androidUrl || defaultUrl
  return defaultUrl
}

async function copyDownloadLink() {
  const targetUrl = getTargetDownloadUrl()
  if (!targetUrl) {
    showToast.text('暂无可复制的下载链接')
    return
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(targetUrl)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = targetUrl
      textarea.setAttribute('readonly', 'true')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    showToast.text('下载链接已复制')
  } catch (error) {
    showToast.text('复制失败，请手动复制链接')
  }
}

function markAutoDownloadFlag() {
  const currentUrl = new URL(window.location.href)
  if (currentUrl.searchParams.get('autoDownload') === '1') return

  currentUrl.searchParams.set('autoDownload', '1')
  window.history.replaceState(null, '', currentUrl.toString())
}

function closeWeChatGuide() {
  showWeChatGuide.value = false
}

function handleDownloadApp(options = {}) {
  if (isLoading.value) return

  const systemType = getSystemType()
  const inWeChat = isWeChatBrowser()
  const { bypassWeChatGuide = false } = options

  const { defaultUrl, iosUrl, androidUrl } = getDownloadUrls()


  if (!iosUrl && !androidUrl && !defaultUrl) {
    showToast.text('暂未配置下载地址')
    return
  }

  // 无论是否在微信内，点击时先复制一份当前系统对应的下载链接
  copyDownloadLink()

  if (inWeChat && !bypassWeChatGuide) {
    markAutoDownloadFlag()
    showWeChatGuide.value = true
    return
  }
  
  isLoading.value = true
  if (systemType === 'ios') {
    console.log('iosUrl:', iosUrl)
    if (!iosUrl) {
      showToast.text('暂未配置 iOS 下载地址')
      isLoading.value = false
      return
    }
    // iOS: 直接跳转应用商店地址
    window.location.href = iosUrl
  } else if (systemType === 'android') {
    if (!androidUrl) {
      showToast.text('暂未配置安卓下载地址')
      isLoading.value = false
      return
    }
    // Android 微信内优先使用 intent 协议唤起外部浏览器，失败则走 fallback_url
    if (isWeChatBrowser()) {
      const intentUrl = buildAndroidIntentUrl(androidUrl)
      window.location.href = intentUrl || androidUrl
    } else {
      window.location.href = androidUrl
    }
  } else {
    if (!defaultUrl) {
      showToast.text('暂未配置下载地址')
      isLoading.value = false
      return
    }
    window.location.href = defaultUrl
  }
  // 跳转后页面会卸载，这里不再复位 loading
}

onMounted(() => {
  const currentUrl = new URL(window.location.href)
  const needAutoDownload = currentUrl.searchParams.get('autoDownload') === '1'

  // 从微信“在浏览器打开”后，自动续跳到系统对应下载地址
  if (needAutoDownload && !isWeChatBrowser()) {
    handleDownloadApp({ bypassWeChatGuide: true })
  }
})

</script>
<style lang="scss" scoped>
@import "./downloadapp.scss";

.wechat-guide-mask {
  position: fixed;
  z-index: 9999;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.wechat-guide-content {
  width: 100%;
  max-width: 320px;
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
}

.wechat-guide-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2329;
}

.wechat-guide-text {
  margin: 12px 0 16px;
  font-size: 14px;
  line-height: 22px;
  color: #646a73;
}

.wechat-guide-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.download-qrcode {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.download-qrcode-img {
  width: 180px;
  height: 180px;
}

.download-qrcode-tip {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}
</style>