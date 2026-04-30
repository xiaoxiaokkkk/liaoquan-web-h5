<template>
  <div class="contentdetail-page">
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
    <Navbar title="返回" left="left" backgroundColor="#fff" color="#111" :autoBack="false" :titleBack="true" @left="handleNavbarBack" />

    <div class="contentdetail-body">
      <template v-if="loading">
        <div class="loading-wrap">
          <nut-skeleton width="100%" height="28px" animated :row="2" />
          <div style="height: 12px" />
          <nut-skeleton width="100%" height="200px" animated :row="6" />
        </div>
      </template>

      <template v-else-if="errorMsg">
        <div class="error-wrap">
          <nut-empty :description="errorMsg" />
          <nut-button class="retry-btn" type="primary" @click="fetchDetail">
            重试
          </nut-button>
        </div>
      </template>

      <template v-else>
        <div class="detail-title">
          <img v-if="detail.leftTag" class="left-tag" :src="detail.leftTag" alt="tag" />
          <img v-if="detail.isPackage" class="package-tag" :src="imgTimesPkg" alt="package" />
          <span :class="{'title-text': detail.leftTag || detail.isPackage}">{{ detail.title || '内容详情' }}</span>
        </div>
        <div v-if="detail.time" class="detail-time">{{ formatTimeWithoutYear(detail.time) }}</div>
        <div class="item-tag">
          <nut-tag color="#0089AC" v-if="detail.refundFlag === 1"> 不中退还 </nut-tag>
          <nut-tag color="#F74B2B" v-if="detail.shareFlag === 1" @click="showShareTips"> 分享解锁 </nut-tag>
          <nut-tag color="#4AACFF" v-if="detail.packageId || (detail.packageIds && detail.packageIds.length > 0)">已加套餐</nut-tag>
        </div>
        <div v-if="detail.notice" class="notice-card">
          <img class="notice-icon" :src="warningTip" alt="warning" />
          <div class="notice-text">{{ detail.notice }}</div>
        </div>
        <!-- <div v-if="detail.packageId || (detail.packageIds && detail.packageIds.length > 0)">
          <nut-tag plain color="#4AACFF" style="height: 27px;">该料已加入套餐，购买套餐更划算>></nut-tag>
        </div>
        <div v-if="detail.hasAvailableCard === 1" class="available-card-box">
          <div class="available-card-box-title">
            <div>商家已发布优惠卡</div>
            <div>>></div>
          </div>
        </div> -->

        <div class="paid-section">
          <!-- 免费内容区域（标题始终展示） -->
          <div class="free-content-box">
            <div class="free-content-box-title">
              <img class="lock-icon" :src="unLock" alt="lock" />
              <span class="lock-text">以下为免费内容</span>
            </div>
            <div v-if="detail.freeContent" class="content-html" v-html="detail.freeContent" />
            <div v-else class="content-box">
              <div class="content-text">暂无内容</div>
            </div>
          </div>

          <nut-divider :style="{ color: 'rgba(0,0,0,0.2)' }"></nut-divider>

          <!-- 付费内容区域（标题始终展示） -->
          <div class="paid-head">
            <div class="paid-content-box-title">
              <img class="lock-icon" :src="lockSmall" alt="lock" />
              <span class="lock-text">以下为付费内容</span>
            </div>
          </div>

          <template v-if="detail.isPaid">
            <div v-if="detail.paidContent" class="content-box">
              <!-- 更新追加内容 -->
              <div v-if="detail.appendPaidGroups && detail.appendPaidGroups.length > 0">
                <div
                  v-for="appendGroup in detail.appendPaidGroups"
                  :key="appendGroup.createTime || `append-${appendGroup.items?.[0]?.id || 0}`"
                >
                  <div class="append-content">
                    <div class="refresh-time">
                      <span>{{ formatTimeWithoutYear(appendGroup.createTime) }} 更新</span>
                    </div>
                    <div class="append-content-text">
                      <div v-for="item in appendGroup.items" :key="item.id || `${appendGroup.createTime}-${item.sort}`">
                        <div v-if="item.textContent" class="append-text">
                          <div v-html="item.textContent" />
                        </div>
                        <div v-if="Array.isArray(item.imageUrls) && item.imageUrls.length > 0" class="append-images">
                          <img
                            v-for="(imgUrl, imgIdx) in item.imageUrls"
                            :key="imgIdx"
                            :src="imgUrl"
                            style="max-width: 100%; height: auto; margin: 10px 0; display: block;"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <nut-divider></nut-divider>
                </div>
              </div>
              <div class="content-html" v-html="detail.paidContent" />
            </div>
            <div v-else class="content-box">
              <div class="content-text">暂无内容</div>
            </div>
          </template>

          <!-- 未支付时，付费区域锁定 -->
          <div v-else class="content-box locked">
            <div class="content-text lock-content-box">
              <img class="lock-content-icon" src="@/assets/images/content/lock-content.png" alt="lock-content" />
              <span class="lock-content-text">内容付费后展示</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div v-if="!loading && !errorMsg && !detail.isPaid && detail.price > 0" class="paybar">
      <div class="paybar-left">
        <div class="pay-label">支付金额：</div>
        <div class="pay-amount">
          <span class="amount-num">{{ detail.price }}</span>
          <span class="amount-unit">元</span>
        </div>
        <div v-if="detail.originalPriceText" class="pay-original-price">
          原价 {{ detail.originalPriceText }}<span class="pay-original-price-unit">元</span>
        </div>
      </div>
      <nut-button class="pay-btn" color="#ff4d4f" @click="showPayPopup = true">
        立即支付
      </nut-button>
    </div>
    <nut-popup v-model:visible="showPayPopup" position="bottom" pop-class="custom-popup" closeable round :style="{ padding: '20px 0px' }">
      <div class="title">支付金额</div>
      <div class="amount">{{ detail.price }}<span class="amount-unit">元</span></div>
      <div v-if="detail.originalPriceText" class="popup-original-price">
        原价 {{ detail.originalPriceText }}<span class="popup-original-price-unit">元</span>
      </div>
      <nut-cell-group>
        <nut-cell center class="alipay-cell" is-link v-if="availableCardCount > 0" @click="visibleDownloadApp = true">
          <template #icon>
            <img :src="cardIcon" alt="card" class="alipay-icon" />
          </template>
          <template #title>{{ cardObj.cardName }}({{ cardObj.cardType === 1 ? '次卡' : cardObj.cardType === 2 ? '折扣卡' : '会员卡' }})</template>
          <template #desc>
            <span class="card-count">{{ cardObj.cardType === 1 ? `${cardObj.remainingTimes}次` : cardObj.cardType === 2 ? `${cardObj.discount}折` : `会员免费` }}</span>
          </template>
        </nut-cell>
        <nut-cell center class="alipay-cell" is-link v-if="availableCouponCount > 0" @click="visibleDownloadApp = true">
          <template #icon>
            <img :src="couponIcon" alt="coupon" class="alipay-icon" />
          </template>
          <template #title>请选择优惠券</template>
          <template #desc>
            <span class="coupon-count">{{ availableCouponCount }}张 </span><span class="coupon-count-text">可使用</span>
          </template>
        </nut-cell>
        <!-- <nut-cell center class="alipay-cell">
          <template #icon>
            <img :src="wechatIcon" alt="alipay" class="alipay-icon" />
          </template>
          <template #title>微信</template>
          <template #link>
            <nut-checkbox v-model="checkedWechatPay" readonly icon-size="20" />
          </template>
        </nut-cell> -->
        <nut-cell center class="alipay-cell">
          <template #icon>
            <img :src="alipay" alt="alipay" class="alipay-icon" />
          </template>
          <template #title>支付宝</template>
          <template #link>
            <nut-checkbox v-model="checkedAlipay" readonly icon-size="20" />
          </template>
        </nut-cell>
      </nut-cell-group>
      <div class="pay-btn-wrap">
        <div class="pay-btn-wrap-inner">
          <nut-button color="#ff4d4f" block @click="onPay">
            立即支付
          </nut-button>
        </div>
      </div>
    </nut-popup>
    <nut-dialog
      v-model:visible="showPayStatusDialog"
      title="支付确认"
      content="您是否已支付?"
      confirmText="已支付"
      cancelText="未支付"
      closeOnClickOverlay
      custom-class="custom-dialog"
      pop-class="custom-wechat"
      @ok="checkPaymentStatus()"
      >
    </nut-dialog>
    <nut-dialog
      v-model:visible="showPaySuccessDialog"
      title="支付成功"
      content="恭喜您，支付成功！内容已解锁，可以查看完整内容了。"
      confirmText="我知道了"
      noCancelBtn
      closeOnClickOverlay
      custom-class="custom-dialog"
      pop-class="custom-wechat"
      @ok="showPaySuccessDialog = false"
    />
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
import { computed, onActivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from '@nutui/nutui'
import Navbar from '@/components/Navbar.vue'
import { useUserStore } from '@/stores/user'
import { shareCallback, addAttention } from '@/api/user'
import { getContentDetail, saveLastMerchant } from '@/api/content'
import { getAvailableCouponList } from '@/api/coupon'
import { payOrder } from '@/api/order'
import { multiply } from '@/utils/math'
import { runWakeUpPayChannels } from '@/utils/wechatPay'
import { runUserBlackCheck } from '@/utils/blackCheck'
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
import wechatIcon from '@/assets/images/wechat.png'
import alipay from '@/assets/images/alipay.png'

import unLock from '@/assets/images/content/un-lock.png'
import lockSmall from '@/assets/images/content/lock-small.png'
import lockContent from '@/assets/images/content/lock-content.png'
import warningTip from '@/assets/images/content/warning-tip.png'
import couponIcon from '@/assets/images/content/coupon.png'
import cardIcon from '@/assets/images/content/discard.png'
import imgTimesPkg from '@/assets/images/home/times-pkg.png'
import imgBlack from '@/assets/images/home/black.png'
import imgRed from '@/assets/images/home/red.png'
import imgRun from '@/assets/images/home/run.png'


const route = useRoute()
const router = useRouter()

const contentId = ref(route.query?.contentId ?? route.params?.contentId)
// 推广人ID
const shareUserId = ref(route.query?.userId ?? route.params?.userId)


const userStore = useUserStore()
const loading = ref(false)
const errorMsg = ref('')
const showPayPopup = ref(false)
const showPayStatusDialog = ref(false)
const showPaySuccessDialog = ref(false)
const checkedWechatPay = ref(true)
const visibleDownloadApp = ref(false)
const checkedAlipay = ref(true)

const detail = ref({
  id: 0,
  title: '',
  time: '',
  createTime: '',
  notice: '',
  price: 0,
  leftTag: '',
  isPackage: false,
  isPaid: true,
  content: '',
  isHtml: false,
  freeItemList: [],
  itemList: [],
  freeContent: '',
  paidContent: '',
  hasPaidContent: false
})

const merchantTitle = computed(() => {
  return (
    (route.query?.merchantName && String(route.query.merchantName)) ||
    detail.value.merchantName ||
    '内容详情'
  )
})

function safeNumber(v, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

// 格式化时间，去掉年份
function formatTimeWithoutYear(timeStr) {
  if (!timeStr) return ''
  // 处理格式：2024-01-15 10:30:00 -> 01-15 10:30:00
  // 或：2024-01-15 -> 01-15
  return timeStr.replace(/^\d{4}-/, '').replace(/^\d{4}\//, '')
}

// 比较时间，判断 item 是否晚于 detail 的创建时间
function isItemAfterDetail(itemTime, detailTime) {
  if (!itemTime || !detailTime) return false
  // 将时间字符串转换为 Date 对象进行比较
  const itemDate = new Date(itemTime)
  const detailDate = new Date(detailTime)
  return itemDate > detailDate
}

/**
 * 将内容项列表转换为HTML内容
 * @param {Array} itemList - 内容项列表
 * @returns {string} HTML内容
 */
function buildContentFromItems(itemList) {
  if (!Array.isArray(itemList) || itemList.length === 0) {
    return ''
  }

  // 按 sort 排序
  const sortedItems = [...itemList].sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0))

  const htmlParts = []
  for (const item of sortedItems) {
    // 文本内容
    if (item?.textContent) {
      htmlParts.push(`<p>${item.textContent}</p>`)
    }
    // 图片内容
    if (Array.isArray(item?.imageUrls) && item.imageUrls.length > 0) {
      for (const imgUrl of item.imageUrls) {
        if (imgUrl && imgUrl.trim()) {
          htmlParts.push(`<img src="${imgUrl}" alt="" style="max-width: 100%; height: auto; margin: 10px 0;" />`)
        }
      }
    }
  }

  return htmlParts.join('')
}

function payBuildContentFromItems(itemList) {
  if (!Array.isArray(itemList) || itemList.length === 0) {
    return ''
  }

  const { defaultItems } = splitPaidItems(itemList)
  const htmlParts = []

  for (const item of defaultItems) {
    // 文本内容
    if (item?.textContent) {
      htmlParts.push(`<p>${item.textContent}</p>`)
    }
    // 图片内容
    if (Array.isArray(item?.imageUrls) && item.imageUrls.length > 0) {
      for (const imgUrl of item.imageUrls) {
        if (imgUrl && imgUrl.trim()) {
          htmlParts.push(`<img src="${imgUrl}" alt="" style="max-width: 100%; height: auto; margin: 10px 0;" />`)
        }
      }
    }
  }

  return htmlParts.join('')
}

function buildAppendPaidGroups(itemList) {
  if (!Array.isArray(itemList) || itemList.length === 0) {
    return []
  }

  const { appendGroups } = splitPaidItems(itemList)
  return appendGroups.map(([createTime, items]) => ({
    createTime,
    items
  }))
}

function splitPaidItems(itemList) {
  const groups = new Map()
  for (const item of itemList) {
    const key = item?.createTime ?? ''
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(item)
  }

  const parseTime = (time) => {
    const ts = new Date(time).getTime()
    return Number.isFinite(ts) ? ts : Number.POSITIVE_INFINITY
  }
  const sortItemsInGroup = (items) => [...items].sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0))

  const groupEntries = [...groups.entries()]
  if (groupEntries.length === 0) {
    return { defaultItems: [], appendGroups: [] }
  }

  // createTime 最小的一组是默认付费内容
  let defaultIndex = 0
  let minTime = parseTime(groupEntries[0][0])
  for (let i = 1; i < groupEntries.length; i++) {
    const currentTime = parseTime(groupEntries[i][0])
    if (currentTime < minTime) {
      minTime = currentTime
      defaultIndex = i
    }
  }

  const defaultItems = sortItemsInGroup(groupEntries[defaultIndex][1])
  const appendGroups = groupEntries
    .filter((_, idx) => idx !== defaultIndex)
    .sort((a, b) => parseTime(b[0]) - parseTime(a[0]))
    .map(([createTime, items]) => [createTime, sortItemsInGroup(items)])

  return { defaultItems, appendGroups }
}

function normalizeDetail(raw) {

  // 如果raw.discount为空，则为10
  const discount = raw?.discount ?? 10
  // 价格文本：只有价格大于0时才显示
  const discountRate = discount / 10;
  // 价格
  const originPrice = safeNumber(raw?.price ?? 0, 0)
  const price = multiply(originPrice, discountRate)
  const originalPriceText = discount < 10 && originPrice > 0 ? `${originPrice}` : ''

  const isPublic = raw?.isPublic ?? 0
  const predictResult = raw?.predictResult ?? null
  
  // 支付状态：payStatus 0未支付 1已支付
  const payStatus = safeNumber(raw?.payStatus, 0)
  // const isPaid = payStatus === 1 || (raw.itemList && raw.itemList.length > 0) || raw.itemList !== null
  const isPaid = payStatus === 1
  
  // 是否免费
  const isFree = price <= 0 || isPublic === 1 || predictResult === 1 || predictResult === 2

  // 时间
  const time = raw?.createTime ?? ''
  
  // 标题
  const title = raw?.title ?? ''

  // 提示信息
  const notice = '注意：此订单任何情况下都不退款，请知悉。所有图片、文字仅供参考，不保证连续性，不做任何承诺。自愿付费，谨慎下单购买即接受协议，具有法律依据。'

  // 获取免费内容列表
  const freeItemList = raw?.freeitemList ?? []
  const freeContent = buildContentFromItems(freeItemList)

  // 获取付费内容列表
  const paidItemList = raw?.itemList ?? []
  const paidContent = payBuildContentFromItems(paidItemList)
  const appendPaidGroups = buildAppendPaidGroups(paidItemList)
  const hasPaidContent = paidContent.length > 0

  // 构建最终内容
  let content = ''
  let isHtml = false

  if (isPaid || isFree) {
    // 已支付或免费：显示全部内容（免费内容 + 付费内容）
    content = freeContent + paidContent
    isHtml = content.length > 0
  } else {
    content = freeContent;
    isHtml = content.length > 0;
    // 未支付：只显示免费内容
    // content = freeContent
    // isHtml = content.length > 0
  }

  // 如果没有内容，设置默认值
  if (!content) {
    content = ''
    isHtml = false
  }

  return {
    id: raw?.id ?? 0,
    merchantId: raw?.merchantId ?? 0,
    merchantName: raw?.merchantName ?? raw?.storeName ?? '',
    title,
    time,
    createTime: raw?.createTime ?? time, // 用于比较追加内容的时间
    notice,
    price,
    originalPriceText,
    leftTag: mapPredictResult(predictResult),
    isPackage: raw?.isPackage ?? false,
    refundFlag: raw?.refundFlag ?? 0,
    shareFlag: raw?.shareFlag ?? 0,
    packageId: raw?.packageId ?? 0,
    packageIds: raw?.packageIds ?? [],
    isPaid: isFree || isPaid,
    hasAvailableCard: raw?.hasAvailableCard ?? 0,
    content,
    isHtml,
    freeItemList: freeItemList,
    itemList: raw?.itemList ?? [],
    freeContent,
    paidContent,
    appendPaidGroups,
    hasPaidContent
  }
}


// 1-黑，2-红，3-走水
function mapPredictResult(predictResult) {
  if (predictResult === 1) return imgBlack
  if (predictResult === 2) return imgRed
  if (predictResult === 3) return imgRun
  return null
}

async function fetchDetail(retryCount = 0) {
  if (!contentId.value) {
    // 兼容部分机型/场景：路由参数注入稍慢，短延迟重试一次
    if (retryCount < 1) {
      await new Promise((resolve) => setTimeout(resolve, 120))
      return fetchDetail(retryCount + 1)
    }
    errorMsg.value = '缺少 contentId 参数'
    return
  }

  loading.value = true
  errorMsg.value = ''
  try {
    const params = {
      userId: userStore.userInfo.userid
    }
    console.log('params', params)
    const { data, code, message } = await getContentDetail(contentId.value, params)
    if (code !== '0') {
      throw new Error(message || '加载失败')
    }
    const d = normalizeDetail(data)
    // 未付费：内容一般会返回部分预览；如果后端返回空，这里也兜底给占位
    detail.value = d
    fetchAddAttention(d.merchantId)
    fetchAvailableCouponList(d)
    fetchSaveLastMerchant(d.merchantId)
  } catch (e) {
    console.error(e)
    errorMsg.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

// 获取可用优惠券列表
// 优惠卡类型cardType === 1 ? '次卡' : cardType === 3 ? '会员卡' : '折扣卡',
// 优惠卡列表
const cardObj = ref({})
const availableCardList = ref([])
// 优惠卡数量
const availableCardCount = ref(0)

// 优惠券列表
const availableCouponList = ref([])
// 优惠券数量
const availableCouponCount = ref(0)
const fetchAvailableCouponList = async (item) => {
  try {
    const params = {
      merchantId: item.merchantId,
      userId: userStore.userInfo.userid,
      contentId: item.id
    }
    const { data, code, message } = await getAvailableCouponList(params)
    if (code === '0' || code === 0) {
      availableCardList.value = data.availableCardList
      availableCardCount.value = data.availableCardCount
      cardObj.value = data.availableCardCount > 0 ? data.availableCardList[0] : {}

      availableCouponList.value = data.availableCouponList
      availableCouponCount.value = data.availableCouponCount
    } else {
      throw new Error(message || '获取可用优惠券列表失败')
    }
  } catch (error) {
    console.error(error)
  }
}
// 获取可用优惠卡列表结束

// 2.添加关注
const fetchAddAttention = async (merchantId) => {
  try {
    const params = {
      userid: userStore.userInfo.userid,
      friendid: merchantId
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
  }
}

// 3.分享回调
const fetchShareCallback = async (merchantId) => {
  if (!shareUserId.value) {
    console.log('推广人ID为空，不需要分享回调')
    return
  }
  const params = {
    merchantId: merchantId,
    shareUserId: shareUserId.value,
    userId: userStore.userInfo.userid,
    contentId: contentId.value
  }
  try {
    console.log('params', params)
    const { code, message } = await shareCallback(params)
    if (code !== '0' && code !== 0) {
      throw new Error(message || '分享失败')
    }
  } catch (error) {
    console.error(error)
  }
}

// 4.保存最后一次访问的商户
const fetchSaveLastMerchant = async (merchantId) => {
  try {
    const merchantIdLong = Number(merchantId)
    const { code, message } = await saveLastMerchant(merchantIdLong)
    if (code !== '0' && code !== 0) {
      throw new Error(message || '保存最后一次访问的商户失败')
    }
  } catch (error) {
    console.error(error)
  }
}


// 支付状态检测相关
const PAY_CHECK_KEY = 'paying_content_id'
let visibilityHandler = null
let pageShowHandler = null

function setPendingPayContentId(id) {
  if (!id) return
  localStorage.setItem(PAY_CHECK_KEY, String(id))
}

function getPendingPayContentId() {
  return localStorage.getItem(PAY_CHECK_KEY)
}

function clearPendingPayContentId() {
  localStorage.removeItem(PAY_CHECK_KEY)
}

// 检查支付状态
const checkPaymentStatus = async () => {
  console.log('detail', detail.value)
  const pendingId = getPendingPayContentId()
  const checkId = pendingId ? Number(pendingId) : detail.value.id
  if (!checkId) return

  // 只允许对当前文章做自动支付补偿检查，避免串到其他文章
  const currentId = Number(contentId.value)
  if (pendingId && currentId && Number(pendingId) !== currentId) {
    return
  }

  try {
    // 重新获取详情
    const params = {
      userId: userStore.userInfo.userid
    }
    showToast.loading('加载中...',{duration: 0 })
    const { data, code, message } = await getContentDetail(checkId, params)
    if (code !== '0' && code !== 0) {
      showToast.hide()
      showToast.fail(message || '加载失败')
      return
    }

    const newDetail = normalizeDetail(data)
    const isPaidNow = newDetail.isPaid
    // 更新详情
    detail.value = newDetail

    // 支付成功后再清除标记并提示
    if (isPaidNow) {
      clearPendingPayContentId()
      showPaySuccessDialog.value = true
      showPayStatusDialog.value = false
    }
  } catch (error) {
    console.error('检查支付状态失败:', error)
  } finally {
    showToast.hide()
  }
}

const tryResumePendingPayCheck = () => {
  const pendingId = getPendingPayContentId()
  if (!pendingId) return
  if (document.visibilityState === 'hidden') return

  // 仅当前文章 id 命中才检查
  const currentId = Number(contentId.value)
  if (currentId && Number(pendingId) !== currentId) return
  checkPaymentStatus()
}

const onPay = async () => {
  if (!checkedAlipay.value) {
    showToast.fail('请选择支付方式')
    return
  }

  showPayPopup.value = false
  const params = {
    userId: userStore.userInfo.userid,
    category: "支付文章",
    payType: "HFALIZN",
    chargeAmount: detail.value.price,
    coinAmount: multiply(detail.value.price, 100, 0),
    packName: "tylan",
    contentId: detail.value.id
  }
  // console.log('params', params)
  try {
    showToast.loading('支付中...', {duration: 0})
    const { data, code, message } = await payOrder(params)
    // 修复逻辑错误：应该使用 && 而不是 ||
    if (code !== '0' && code !== 0) {
      throw new Error(message || '支付失败')
    }
    
    // 获取支付URL
    const payUrl = data || ''
    if (!payUrl) {
      throw new Error('未获取到支付链接')
    }
    showPayStatusDialog.value = true
    
    console.log('支付链接:', payUrl)
    
    // 保存支付标记，用于返回时检测支付状态
    setPendingPayContentId(detail.value.id)
    
    showToast.hide()
    
    // H5拉起支付宝支付
    // 如果是支付宝二维码链接，直接跳转
    if (payUrl.startsWith('https://qr.alipay.com/') || payUrl.startsWith('http://qr.alipay.com/')) {
      // 移动端直接跳转到支付链接
      window.location.href = payUrl
    } else if (payUrl.startsWith('alipays://')) {
      // 支付宝scheme协议，直接跳转
      window.location.href = payUrl
    } else {
      // 其他情况，尝试直接跳转
      window.location.href = payUrl
    }
  } catch (error) {
    console.error(error)
    showToast.hide()
    showToast.fail(error?.message || '支付失败')
    // 支付失败时清除标记
    clearPendingPayContentId()
  }
}

// const onPay = async () => {
//   showPayPopup.value = false
//   const params = {
//     userId: userStore.userInfo.userid,
//     category: "支付文章",
//     payType: "HFWXJSN",
//     chargeAmount: detail.value.price,
//     coinAmount: detail.value.price * 100,
//     packName: "tylan",
//     contentId: detail.value.id
//   }
//   console.log('params', params)
//   try {
//     showToast.loading('支付中...', {duration: 0})
//     const { data, code, message } = await payOrder(params)
//     // 修复逻辑错误：应该使用 && 而不是 ||
//     if (code !== '0' && code !== 0) {
//       throw new Error(message || '支付下单失败')
//     }

//     if (data == null || data === '') {
//       throw new Error('未获取到支付信息')
//     }

//     showPayStatusDialog.value = true
//     setPendingPayContentId(detail.value.id)

//     showToast.hide()

//     try {
//       await runWakeUpPayChannels(data)
//       await checkPaymentStatus()
//     } catch (e) {
//       showPayStatusDialog.value = false
//       clearPendingPayContentId()
//       throw e
//     }
//   } catch (error) {
//     console.error(error)
//     showToast.hide()
//     showToast.fail(error?.message || '支付失败，请重试')
//     // 支付失败时清除标记
//     clearPendingPayContentId()
//   }
// }


onMounted(() => {
  runUserBlackCheck()
  fetchDetail()
  tryResumePendingPayCheck()

  visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      tryResumePendingPayCheck()
    }
  }
  document.addEventListener('visibilitychange', visibilityHandler)

  pageShowHandler = () => {
    tryResumePendingPayCheck()
  }
  window.addEventListener('pageshow', pageShowHandler)
})

onActivated(() => {
  runUserBlackCheck()
})

watch(
  () => [route.query?.contentId, route.params?.contentId, route.query?.userId, route.params?.userId],
  () => {
    const nextContentId = route.query?.contentId ?? route.params?.contentId
    const nextShareUserId = route.query?.userId ?? route.params?.userId

    // 路由参数变化时同步更新，避免继续用旧 id 请求
    contentId.value = nextContentId
    shareUserId.value = nextShareUserId

    // 切换文章时重置 UI 状态，避免上一次支付弹窗残留
    showPayPopup.value = false
    showPayStatusDialog.value = false
    showPaySuccessDialog.value = false

    // 如果 pendingId 不是当前文章，则清理，避免串单
    const pendingId = getPendingPayContentId()
    if (pendingId && nextContentId && Number(pendingId) !== Number(nextContentId)) {
      clearPendingPayContentId()
    }

    fetchDetail()
    tryResumePendingPayCheck()
  }
)

// 处理 Navbar 返回按钮点击事件
const handleNavbarBack = () => {
  // if (route.query?.fromHome === '1') {
  //   router.back()
  //   return
  // }

  if (detail.value.merchantId) {
    if (shareUserId.value) {
      const path = '/lqindex?merchantId=' + detail.value.merchantId + '&userId=' + shareUserId.value
      router.push(path)
      return
    } else {
      const path = '/lqindex?merchantId=' + detail.value.merchantId
      router.push(path)
      return
    }
  } else {
    router.back()
  }
}

// 显示分享提示
const showShareTips = () => {
  showToast.text('下载app后，可分享解锁该料', {duration: 2000})
}

// 下载 app（避免 openUrl/iosUrl/androidUrl 未定义导致点击报错）
const openUrl = (url) => {
  if (!url) {
    showToast.fail('下载地址为空', { duration: 2000 })
    return
  }

  const isApkUrl = typeof url === 'string' && url.includes('.apk')

  if (isWeChatBrowser()) {
    if (isIOS() && url.includes('apps.apple.com')) {
      copyToClipboard(url).then((ok) => {
        if (ok) {
          showToast.success('已复制 iOS 下载链接，请打开 Safari 粘贴访问', { duration: 2000 })
        } else {
          showToast.fail('复制失败，请长按链接手动复制', { duration: 2000 })
        }
      })
      return
    }

    if (isApkUrl) {
      copyToClipboard(url).then((ok) => {
        if (ok) {
          showToast.success('已复制下载链接，请点击右上角"..."选择"在浏览器中打开"进行下载', { duration: 2000 })
        } else {
          showToast.fail('复制失败，请长按链接手动复制', { duration: 2000 })
        }
      })
      return
    }

    const opened = tryWeChatOpenUrl(url) || tryAnchorOpen(url)
    if (!opened) {
      window.location.href = url
    }
    return
  }

  if (isIOS() && url.includes('apps.apple.com')) {
    window.location.href = convertToItmsApps(url)
    return
  }

  if (isApkUrl) {
    copyToClipboard(url).then((ok) => {
      if (ok) {
        showToast.success('已复制下载链接，请在浏览器中粘贴访问', { duration: 2000 })
      } else {
        showToast.fail('复制失败，请长按链接手动复制', { duration: 2000 })
      }
    })
    return
  }

  window.open(url, '_blank')
}

onUnmounted(() => {
  // 清理事件监听器
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
  }
  if (pageShowHandler) {
    window.removeEventListener('pageshow', pageShowHandler)
  }
})
</script>

<style scoped lang="scss">
@import './contentdetail.scss';
</style>


