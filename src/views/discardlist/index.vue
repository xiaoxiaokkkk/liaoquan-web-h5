<template>
  <div id="discardlist-root" class="discardlist-root">
    <nut-pull-refresh
      v-model="refreshing"
      class="discardlist-scroll"
      :complete-duration="300"
      :disabled="loading"
      @refresh="handleRefresh"
    >
      <div class="list-wrap">
        <nut-skeleton
          v-if="loading && displayList.length === 0"
          class="loading-wrap"
          width="250px"
          height="15px"
          rows="5"
          animated
        />
        <template v-else-if="displayList.length === 0">
          <div class="empty-wrap">
            <nut-empty description="暂无内容" />
          </div>
        </template>

        <template v-else>
          <div class="discard-list">
            <div
              v-for="(item, index) in displayList"
              :key="getItemKey(item, index)"
              class="discard-card"
            >
              <div class="card-header">
                <span class="merchant-name">商家: {{ item.merchantName }}</span>
                <span class="card-type">类型: {{ item.typeName }}</span>
              </div>
              <div class="card-body">
                <div class="card-content">
                  <div class="card-left" :class="item.colorClass">
                    <div class="price">
                      <span class="price-unit">¥</span>
                      <span class="price-value">{{ item.price }}</span>
                    </div>
                    <div v-if="item.countText" class="price-desc">{{ item.countText }}</div>
                  </div>
                  <div class="card-middle">
                    <div class="card-title">{{ item.title }}</div>
                    <div class="card-details">
                      <div v-for="(d, i) in item.details" :key="`d-${index}-${i}`" class="detail-item">
                        {{ d }}
                      </div>
                    </div>
                  </div>
                  <div class="card-right">
                    <nut-button class="buy-btn" color="#F9505B" type="primary" @click="onPay(item)">购买</nut-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </nut-pull-refresh>
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
    <!--优惠卡购买提示-->
    <nut-dialog
      v-model:visible="showDiscardBuyDialog"
      title="提示"
      content="因为此套餐卡为优惠力度大，，一经购买不可退款，请确认是否购买?"
      confirmText="确认"
      cancelText="再想想"
      closeOnClickOverlay
      custom-class="custom-dialog"
      pop-class="custom-wechat"
      @ok="handleBuyDiscard()"
    />
    <nut-dialog
      v-model:visible="showPaySuccessDialog"
      title="支付成功"
      content="恭喜您，支付成功。"
      confirmText="我知道了"
      noCancelBtn
      closeOnClickOverlay
      custom-class="custom-dialog"
      pop-class="custom-wechat"
      @ok="showPaySuccessDialog = false"
    />
    <nut-popup teleport="#app" :teleport-disable="true" v-model:visible="showPayPopup" position="bottom" pop-class="custom-popup" closeable round :style="{ padding: '20px 0px' }">
      <div class="title">支付金额</div>
      <div class="amount">{{ cardItem.price }}<span class="amount-unit">元</span></div>
      <nut-cell center class="alipay-cell">
        <template #icon>
          <img :src="wechatIcon" alt="alipay" class="alipay-icon" />
        </template>
        <template #title>微信</template>
        <template #link>
          <nut-checkbox v-model="checkedWechatPay" readonly icon-size="20" />
        </template>
      </nut-cell>
      <div class="pay-btn-wrap">
        <div class="pay-btn-wrap-inner">
          <nut-button color="#ff4d4f" block @click="handleBuy">
            立即支付
          </nut-button>
        </div>
      </div>
    </nut-popup>
  </div>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { showToast } from '@nutui/nutui'
import { getDiscardList } from '@/api/discard'
import { payOrder } from '@/api/order'
import { useUserStore } from '@/stores/user'
import { multiply } from '@/utils/math'
import { runWakeUpPayChannels } from '@/utils/wechatPay'
import wechatIcon from '@/assets/images/wechat.png'

defineOptions({
  name: 'DiscardList'
})

const userStore = useUserStore()

const showPayPopup = ref(false)
const showPayStatusDialog = ref(false)
const showPaySuccessDialog = ref(false)
const showDiscardBuyDialog = ref(false)
const checkedWechatPay = ref(true)
const cardItem = ref({})
const PAY_CHECK_KEY = 'paying_card_id'

const props = defineProps({
  merchantId: { type: [Number, String], default: 1 },
  tabKey: { type: String, default: '' }
})

const refreshing = ref(false)
const loading = ref(false)

const displayList = ref([])
const isActive = computed(() => props.tabKey === 'discard')
const getItemKey = (item, index) => item?.id ?? `discard-${index}`

function normalizeListResponse(res) {
  const data = res?.data || res
  const rows = data?.list || data?.rows || data?.records || data?.data || data || []

  const list = Array.isArray(rows) ? rows : []
  return { list }
}

async function loadData() {
  if (!isActive.value) return
  loading.value = true

  try {
    // 不分页：接口直接返回全部
    const res = await getDiscardList({ merchantId: props.merchantId })
    const { list } = normalizeListResponse(res)

    const mapped = list.map((r, idx) => {
      const price = Number.isFinite(Number(r?.salePrice)) ? Number(r?.salePrice) : 0
      // 接口字段可能是 "1"/"2"/"3"，统一转成数字处理
      const cardType = Number(r?.cardType ?? 0)

      // 左侧配色：沿用现有 scss 的 orange/red/blue（尽量做个兜底映射）
      // 优惠卡类型 1-次卡 2-折扣卡 3-会员卡
      const colorClass =
        cardType === 1 ? 'orange' :
        cardType === 2 ? 'blue' :
        cardType === 3 ? 'red' :
        'orange'

      const count = r?.cardTimes ?? undefined
      const discount = r?.discount ?? undefined

      const details = []
      if (r?.maxDeductAmount != null) details.push(`最高抵扣金额: ${r.maxDeductAmount}元`)
      if (r?.validDays != null) details.push(`有效天数: ${r.validDays}天`)
      // if (r?.expireTime) details.push(`有效期至: ${r.expireTime}`)
      if (r?.remark) details.push(`备注: ${r.remark}`)

      return {
        id: r?.id ?? `discard-${idx}`,
        title: r?.cardName ?? '',
        merchantName: r?.merchantName ?? '商家',
        cardName: r?.cardName ?? '优惠卡',
        typeName: cardType === 1 ? '次卡' : cardType === 3 ? '会员卡' : '折扣卡',
        price: price > 0 ? price : 0,
        // 会员卡不展示折扣；折扣只对折扣卡展示
        countText:
          cardType === 1 && count != null
            ? `次数: ${count}次`
            : cardType === 2 && discount != null
              ? `折扣: ${discount}折`
              : '',
        details: details,
        colorClass: colorClass
      }
    })

    displayList.value = mapped
  } catch (e) {
    console.error('加载优惠卡列表失败:', e)
    displayList.value = []
    showToast.text('数据加载异常')
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  await loadData()
  refreshing.value = false
}

const onPay = async (item) => {
  // console.log('item', item)
  cardItem.value = item
  showDiscardBuyDialog.value = true
  // console.log('cardItem', cardItem.value)
  // showPayPopup.value = true
  // console.log('showPayPopup', showPayPopup.value)
}


const handleBuyDiscard = () => {
  showDiscardBuyDialog.value = false
  showPayPopup.value = true
}

const checkPaymentStatus = async () => {
  // 优惠卡支付状态无法在前端直接确认时：按用户确认后刷新列表做兜底
  showPayStatusDialog.value = false
  sessionStorage.removeItem(PAY_CHECK_KEY)
  console.log('cardItem', cardItem.value)
  // await loadData()
  // 添加查询的方法
  showPaySuccessDialog.value = true
}

const handleBuy = async () => {
  const item = cardItem.value || {}
  const userId = userStore?.userInfo?.userid
  const price = Number(item?.price)
  const cardId = item?.id
  if (!userId) {
    showToast.fail('请先登录')
    return
  }
  if (!cardId) {
    showToast.fail('卡片信息异常')
    return
  }
  if (!Number.isFinite(price) || price <= 0) {
    showToast.fail('支付金额异常')
    return
  }

  // showToast.text('购买功能待实现')
  // console.log('buy item:', item)
  showPayPopup.value = false
  const params = {
    userId: userStore.userInfo.userid,
    category: "优惠卡",
    payType: "HFWXJSN",
    chargeAmount: price,
    // 分：必须是整数
    coinAmount: multiply(price, 100, 0),
    packName: "tylan",
    cardId
  }
  console.log('params', params)
  try {
    showToast.loading('支付中...', {duration: 0})
    const { data, code, message } = await payOrder(params)
    // 修复逻辑错误：应该使用 && 而不是 ||
    if (code !== '0' && code !== 0) {
      throw new Error(message || '支付失败')
    }

    if (data == null || data === '') {
      throw new Error('未获取到支付信息')
    }

    showPayStatusDialog.value = true
    sessionStorage.setItem(PAY_CHECK_KEY, String(item.id ?? ''))

    showToast.hide()

    try {
      await runWakeUpPayChannels(data)
    } catch (e) {
      showPayStatusDialog.value = false
      sessionStorage.removeItem(PAY_CHECK_KEY)
      throw e
    }
  } catch (error) {
    console.error(error)
    showToast.hide()
    showToast.fail(error?.message || '支付失败')
    // 支付失败时清除标记
    sessionStorage.removeItem(PAY_CHECK_KEY)
  }
}

watch(
  () => [props.merchantId, props.tabKey],
  () => {
    if (isActive.value) loadData()
  }
)

onMounted(() => {
  if (isActive.value) loadData()
})
</script>
<style lang="scss" scoped>
@import './discardlist.scss';
</style>