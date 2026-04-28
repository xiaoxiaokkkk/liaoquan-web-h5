import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './assets/css/common.scss'
import '@nutui/touch-emulator'
import router from './router/index'
import App from './App.vue'
import NutUI from '@nutui/nutui'
import '@nutui/nutui/dist/styles/themes/default.scss'
import { useUserStore } from './stores/user'
import { isWeChatBrowser } from './utils/common'
// import('vconsole').then(({ default: VConsole }) => new VConsole())

// 尝试隐藏微信 WebView 底部工具栏（后退/前进等）
// 注意：这是微信客户端 UI，部分微信版本/系统可能不允许彻底隐藏
function tryHideWeChatToolbar() {
  if (!isWeChatBrowser()) return

  const hideOnce = () => {
    try {
      // eslint-disable-next-line no-undef
      WeixinJSBridge.call('hideToolbar')
      // eslint-disable-next-line no-undef
      WeixinJSBridge.call('hideOptionMenu')
    } catch (e) {
      // ignore
    }
  }

  if (window.WeixinJSBridge && typeof window.WeixinJSBridge.call === 'function') {
    // 有些机型/版本需要多次调用才会生效（尤其是 SPA 路由切换后）
    hideOnce()
    setTimeout(hideOnce, 0)
    setTimeout(hideOnce, 100)
    setTimeout(hideOnce, 500)
    setTimeout(hideOnce, 1000)
  } else {
    document.addEventListener('WeixinJSBridgeReady', () => {
      hideOnce()
      setTimeout(hideOnce, 0)
      setTimeout(hideOnce, 100)
      setTimeout(hideOnce, 500)
      setTimeout(hideOnce, 1000)
    }, false)
  }

  // 底部工具栏/可视区域变化后再尝试隐藏（部分版本会重新露出）
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      hideOnce()
      setTimeout(hideOnce, 100)
    })
  }
}

function initApp() {
  if (typeof window.__syncVh === 'function') {
    window.__syncVh()
  }

  const app = createApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  
  // 初始化用户信息（从 localStorage 恢复）
  const userStore = useUserStore()
  userStore.initUserInfo()
  
  // 首次进入 & 每次路由切换后都尝试隐藏微信底部工具栏
  tryHideWeChatToolbar()
  router.afterEach(() => {
    if (typeof window.__syncVh === 'function') {
      window.__syncVh()
    }
    tryHideWeChatToolbar()
  })

  app.use(router).use(NutUI).mount('#app')
}

// 等待 DOM 准备好后初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}