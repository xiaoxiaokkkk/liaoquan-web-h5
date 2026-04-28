<template>
  <div class="couponslist-root">
    <nut-pull-refresh
      v-model="refreshing"
      class="coupons-scroll"
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
            <nut-empty description="暂无优惠券" />
          </div>
        </template>

        <template v-else>
          <div class="coupons-list">
            <div
              v-for="(item, index) in displayList"
              :key="getItemKey(item, index)"
              class="coupons-item"
            >
              <div class="coupons-item-content">
                <div class="item-amount">
                  <span class="amount-unit">￥</span>
                  <span class="amount-value">{{ formatYuan(item.couponAmount) }}</span>
                </div>
                <div class="item-info">
                  <div class="item-name">{{ item.couponName || '优惠券' }}</div>
                  <div class="item-merchant mt-10">商家:{{ item.merchantName || '-' }}</div>
                  <div class="item-expire-time mt-5">
                    {{ getTimeLabel(item) }}：{{ getTimeValue(item) }}
                  </div>
                  <div class="item-expire-time mt-5">
                    {{ getTypeText(item) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </nut-pull-refresh>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { showToast } from '@nutui/nutui'
import { getUnusedCouponList, getUsedCouponList, getExpiredCouponList } from '@/api/coupon'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  couponsType: {
    type: String,
    default: 'unused' // 'unused' | 'used' | 'expired'
  }
})

const userStore = useUserStore()

const refreshing = ref(false)
const loading = ref(false)

const displayList = ref([])

const getItemKey = (item, index) => item?.id ?? `${props.couponsType}-${index}`

function isOk(res) {
  const code = res?.code
  return code == null || code === '0' || code === 0
}

function formatYuan(v) {
  if (v === undefined || v === null || v === '') return '0'
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  const fixed = n.toFixed(2)
  return fixed.includes('.') ? fixed.replace(/0+$/, '').replace(/\.$/, '') : fixed
}

function getTypeText(item) {
  const t = Number(item?.couponType ?? 0) // 1-通用无门槛 2-满减
  if (t === 1) return '类型：通用无门槛'
  if (t === 2) {
    const threshold = formatYuan(item?.thresholdAmount)
    const amount = formatYuan(item?.couponAmount)
    // 不强依赖后端的文案，页面简单展示即可
    return `类型：满${threshold}减${amount}`
  }
  return '类型：-'
}

function getTimeLabel(item) {
  if (props.couponsType === 'used') return '使用时间'
  if (props.couponsType === 'expired') return '过期时间'
  return '有效期至'
}

function getTimeValue(item) {
  if (props.couponsType === 'used') return item?.useTime || '-'
  return item?.expireTime || '-'
}

async function loadData() {
  loading.value = true
  try {
    const apiFn =
      props.couponsType === 'used'
        ? getUsedCouponList
        : props.couponsType === 'expired'
          ? getExpiredCouponList
          : getUnusedCouponList

    const userId = userStore?.userInfo?.userid
    const params = userId ? { userId } : {}

    const res = await apiFn(params)
    if (!isOk(res)) throw new Error(res?.message || '获取优惠券列表失败')

    const list = Array.isArray(res?.data) ? res.data : []
    displayList.value = list
  } catch (e) {
    console.error('加载优惠券失败:', e)
    displayList.value = []
    showToast.text(e?.message || '数据加载异常')
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  await loadData()
  refreshing.value = false
}

watch(
  () => props.couponsType,
  () => {
    loadData()
  }
)

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
@import './couponslist.scss';
</style>

