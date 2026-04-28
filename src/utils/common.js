export const iosUrl = 'https://apps.apple.com/cn/app/%E7%89%B9%E6%9C%89%E6%96%99/id6756619405'
export const androidUrl = 'https://d.hainanjunfeng.com/apk/tylan.apk'

// 检测是否为 iOS 设备
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

// 检测是否为微信浏览器
export function isWeChatBrowser() {
  return /micromessenger/i.test(navigator.userAgent)
}

// 尝试通过微信 JSBridge 打开链接
export function tryWeChatOpenUrl(url) {
  try {
    // 微信部分版本对 window.location / window.open 限制较多，优先走 JSBridge
    // eslint-disable-next-line no-undef
    if (window.WeixinJSBridge && typeof WeixinJSBridge.invoke === 'function') {
      // eslint-disable-next-line no-undef
      WeixinJSBridge.invoke('openUrl', { url })
      return true
    }
  } catch (_) {
    // ignore
    console.error('tryWeChatOpenUrl error', _)
  }
  return false
}

// 尝试通过 a 标签打开链接
export function tryAnchorOpen(url) {
  try {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return true
  } catch (_) {
    console.error('tryAnchorOpen error', _)
    return false
  }
}

// 复制文本到剪贴板
export async function copyToClipboard(text) {
  if (!text) return false
  // 优先使用异步 Clipboard API（需要安全上下文）
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (_) {
    // ignore，走降级方案
  }

  // 降级：execCommand('copy')，在 iOS 微信里通常需要用户手势触发（本函数从 click 里调用即可）
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch (_) {
    return false
  }
}

// 将 App Store 链接转换为 itms-apps:// 协议（iOS 设备直接打开 App Store）
export function convertToItmsApps(url) {
  if (!url) return url
  
  // 匹配 App Store 链接格式：https://apps.apple.com/cn/app/xxx/id123456789
  const match = url.match(/apps\.apple\.com\/[^\/]+\/app\/[^\/]+\/id(\d+)/)
  if (match && match[1]) {
    const appId = match[1]
    return `itms-apps://itunes.apple.com/app/id${appId}`
  }
  
  return url
}