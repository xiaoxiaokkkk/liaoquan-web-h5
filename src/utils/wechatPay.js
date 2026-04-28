import { isWeChatBrowser } from '@/utils/common'

function tryParseJson(str) {
  if (typeof str !== 'string' || !str.trim()) return null
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

/**
 * 从 wakeUpPay 接口的 data 中解析微信 JSAPI 调起参数。
 * 支持：纯对象字段、或直接为 JSON 字符串。
 */
export function normalizeWechatJsapiParams(raw) {
  if (raw == null) return null

  let obj = raw
  if (typeof raw === 'string') {
    obj = tryParseJson(raw)
    if (!obj) return null
  }

  if (typeof obj !== 'object') return null

  const appId = obj.appId ?? obj.appid
  const timeStamp =
    obj.timeStamp != null
      ? String(obj.timeStamp)
      : obj.timestamp != null
        ? String(obj.timestamp)
        : ''
  const nonceStr = obj.nonceStr ?? obj.noncestr
  const pkg = obj.package
  const signType = obj.signType ?? obj.signtype ?? 'RSA'
  const paySign = obj.paySign ?? obj.paysign

  if (!appId || !timeStamp || !nonceStr || !pkg || !paySign) return null

  return {
    appId,
    timeStamp,
    nonceStr,
    package: pkg,
    signType,
    paySign
  }
}

function waitForWeixinJSBridge() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }
    // eslint-disable-next-line no-undef
    const bridge = window.WeixinJSBridge
    if (bridge && typeof bridge.invoke === 'function') {
      resolve(bridge)
      return
    }
    const onReady = () => {
      document.removeEventListener('WeixinJSBridgeReady', onReady)
      resolve(window.WeixinJSBridge)
    }
    document.addEventListener('WeixinJSBridgeReady', onReady)
  })
}

/**
 * 部分微信版本在支付成功后会自动触发一次后退。
 * 这里预先压入一层同地址历史，避免直接回到微信会话页。
 */
function injectWeChatPayHistoryGuard() {
  if (typeof window === 'undefined' || !window.history || typeof window.history.pushState !== 'function') {
    return
  }
  try {
    window.history.pushState({ __wxPayGuard: Date.now() }, '', window.location.href)
  } catch (e) {
    console.warn('injectWeChatPayHistoryGuard failed:', e)
  }
}

/**
 * 微信内 H5 调起 JSAPI 支付（getBrandWCPayRequest）
 */
export function invokeWechatJsapiPay(params) {
  return waitForWeixinJSBridge().then((bridge) => {
    if (!bridge || typeof bridge.invoke !== 'function') {
      return Promise.reject(new Error('当前环境无法调起微信支付'))
    }
    injectWeChatPayHistoryGuard()
    return new Promise((resolve, reject) => {
      bridge.invoke('getBrandWCPayRequest', params, (res) => {
        console.log('支付完成回调', res)
        const msg = String(res?.err_msg || res?.errMsg || '').toLowerCase()
        if (msg === 'get_brand_wcpay_request:ok') {
          console.log('支付成功', res)
          resolve(res)
        } else if (msg === 'get_brand_wcpay_request:cancel') {
          reject(new Error('已取消支付'))
        } else {
          reject(new Error(msg || '支付失败'))
        }
      })
    })
  })
}

/**
 * 根据接口 data 执行微信 JSAPI 支付（需在微信内）。
 */
export async function runWakeUpPayChannels(data) {
  const wxParams = normalizeWechatJsapiParams(data)
  if (!wxParams) {
    throw new Error('微信支付参数异常：缺少 appId/timeStamp/nonceStr/package/signType/paySign')
  }
  if (!isWeChatBrowser()) {
    throw new Error('微信支付请在微信内打开')
  }
  await invokeWechatJsapiPay(wxParams)
}
