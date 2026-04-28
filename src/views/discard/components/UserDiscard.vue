<template>
  <nut-pull-refresh
    v-model="refreshing"
    class="discard-scroll"
    :complete-duration="300"
    :disabled="loading"
    @refresh="handleRefresh"
  >
    <div class="list-wrap">
      <nut-skeleton
        v-if="loading && filteredList.length === 0"
        class="loading-wrap"
        width="250px"
        height="15px"
        rows="5"
        animated
      />

      <template v-else-if="filteredList.length === 0">
        <div class="empty-wrap">
          <nut-empty description="暂无已购优惠卡" />
        </div>
      </template>

      <template v-else>
        <div class="discard-list">
          <div
            v-for="(item, index) in filteredList"
            :key="getItemKey(item, index)"
            class="discard-card"
            :class="{ expired: item.isExpired }"
          >
            <div class="card-header">
              <span class="merchant-name">商家: {{ item.merchantName }}</span>
              <!-- <span class="card-type">类型: {{ item.typeName }}</span> -->
            </div>
            <div class="card-body">
              <div class="card-content">
                <div class="card-left" :class="item.colorClass">
                  <div class="price">
                    <!-- <span class="price-unit">¥</span> -->
                    <span class="price-value">{{ item.typeName }}</span>
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
                  <div class="status-pill" :class="item.statusClass">{{ item.statusText }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </nut-pull-refresh>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { showToast } from '@nutui/nutui'
import { getUserCardList, getUserExpiredCardList } from '@/api/discard'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  // active: 已生效（非过期）；expired: 已过期
  tabType: { type: String, default: 'active' }
})

const userStore = useUserStore()

const refreshing = ref(false)
const loading = ref(false)
const displayList = ref([])

const userId = computed(() => userStore?.userInfo?.userid)
// const userId = ref(741790244)
const getItemKey = (item, index) => item?.id ?? `user-discard-${index}`

const filteredList = computed(() => {
  // 过期 tab：接口本身就是 “expired list”，直接展示（避免 status 字段不为 3 时被过滤成 empty）
  if (props.tabType === 'expired') return displayList.value
  // 已生效 tab：兜底过滤掉已过期
  return displayList.value.filter((x) => !x?.isExpired)
})

function normalizeListResponse(res) {
  // 兼容多种返回：
  // 1) { code, data: { list: [...] } }
  // 2) { code, data: [...] }
  // 3) { list: [...] } / { rows: [...] } / { records: [...] }
  // 4) 直接返回数组 [...]
  const data = res?.data ?? res
  const rows = data?.list ?? data?.rows ?? data?.records ?? data?.data ?? data
  return Array.isArray(rows) ? rows : []
}

// function formatDateTime(v) {
//   if (!v) return ''
//   // 后端已按 yyyy-MM-dd HH:mm:ss 返回时，直接展示即可
//   if (typeof v === 'string') return v
//   try {
//     const d = new Date(v)
//     if (Number.isNaN(d.getTime())) return String(v)
//     const pad = (n) => String(n).padStart(2, '0')
//     return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
//   } catch {
//     return String(v)
//   }
// }

function mapStatus(status) {
  const s = Number(status ?? -1)
  if (s === 0) return { text: '未生效', cls: 'pending' }
  if (s === 1) return { text: '未使用', cls: 'unused' }
  if (s === 2) return { text: '已使用', cls: 'used' }
  if (s === 3) return { text: '已过期', cls: 'expired' }
  return { text: '未知', cls: 'unknown' }
}

async function loadData() {
  if (!userId.value) {
    displayList.value = []
    return
  }

  loading.value = true
  try {
    const res = props.tabType === 'expired' ? await getUserExpiredCardList({ userId: userId.value }) : await getUserCardList({ userId: userId.value })
    const { code, message } = res || {}
    // 兼容两种返回：{code,data} 或直接 data
    const ok = code == null || code === '0' || code === 0
    if (!ok) throw new Error(message || '获取已购优惠卡失败')
    const list = normalizeListResponse(res)
    displayList.value = list.map((r, idx) => {
        const cardType = Number(r?.cardType ?? 0) // 1-次卡 2-折扣卡 3-会员卡
        const salePrice = Number.isFinite(Number(r?.salePrice)) ? Number(r?.salePrice) : 0
        const discount = r?.discount
        const cardTimes = r?.cardTimes
        const remainingTimes = r?.remainingTimes
        // “已过期”tab：强制显示已过期，避免后端 status 字段未置为 3 导致状态不显示/过滤异常
        const statusInfo = props.tabType === 'expired' ? { text: '已过期', cls: 'expired' } : mapStatus(r?.status)

        const colorClass =
          cardType === 1 ? 'orange' :
          cardType === 2 ? 'blue' :
          cardType === 3 ? 'red' :
          'orange'

        // 会员卡不展示折扣；折扣只对折扣卡展示
        const countText =
          cardType === 1
            ? (remainingTimes != null && cardTimes != null
                ? `${cardTimes}次`
                : cardTimes != null
                  ? `次数: ${cardTimes}次`
                  : remainingTimes != null
                    ? `剩余: ${remainingTimes}次`
                    : '')
            : cardType === 2
              ? (discount != null ? `${discount}折` : '')
              : ''

        const details = []
        // 1-次卡 2-折扣卡 3-会员卡
        if (cardType === 1 && remainingTimes != null) details.push(`剩余次数: ${remainingTimes}次`)
        if (r?.remainingDays != null) details.push(`剩余天数: ${r.remainingDays}天`)
        // if (r?.effectiveTime) details.push(`生效时间: ${formatDateTime(r.effectiveTime)}`)
        // if (r?.expireTime) details.push(`过期时间: ${formatDateTime(r.expireTime)}`)
        if (r?.maxDeductAmount != null && r?.maxDeductAmount > 0) details.push(`最高抵扣金额: ${r.maxDeductAmount}元`)
        if (r?.remark) details.push(`备注: ${r.remark}`)

        return {
          id: r?.id ?? `${idx}`,
          title: r?.cardName ?? '优惠卡',
          merchantName: r?.merchantName ?? '商家',
          typeName: cardType === 1 ? '次卡' : cardType === 2 ? '折扣卡' : cardType === 3 ? '会员卡' : '优惠卡',
          price: salePrice > 0 ? salePrice : 0,
          countText,
          details,
          colorClass,
          statusText: statusInfo.text,
          statusClass: statusInfo.cls,
          isExpired: statusInfo.cls === 'expired'
        }
      })
  } catch (error) {
    console.error('加载用户优惠卡失败:', error)
    displayList.value = []
    showToast.fail(error?.message || '数据加载异常')
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  await loadData()
  refreshing.value = false
}

onMounted(() => {
  loadData()
})
</script>
<style scoped lang="scss">
.discard-scroll {
  flex: 1;
  overflow: hidden;
  overflow-y: auto;
  background: #EDEEF2;
  padding: 0px 15px;

  :deep(.nut-pull-refresh) {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :deep(.nut-pull-refresh__head) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }

  :deep(.nut-pull-refresh__body) {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    min-height: 0;
    padding: 0 15px 15px;
  }
}

.list-wrap {
  padding: 10px 0px;
}

.loading-wrap {
  padding: 10px 2px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-wrap {
  padding: 24px 0 10px;
}

.discard-list {
  display: flex;
  flex-direction: column;
  gap: 15px;

  .discard-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    &.expired {
      opacity: 0.72;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      font-size: 12px;
      color: #666;

      .merchant-name {
        font-weight: 400;
      }

      .card-type {
        font-weight: 400;
      }
    }

    .card-body {
      padding: 5px 10px 12px 10px;

      .card-content {
        // padding: 10px;
        // background-color: #F0F2F4;
        display: flex;
        gap: 15px;
        border-radius: 8px;
      }

      .card-left {
        width: 62px;
        height: 62px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        color: #fff;

        &.orange {
          background: #FF8500;
        }

        &.red {
          background: #FF4B31;
        }

        &.blue {
          background: #318EFF;
        }

        .price {
          line-height: 1.2;
          font-weight: 500;
          color: #FFFFFF;
          margin-bottom: 6px;
        }
        .price-unit {
          font-size: 10px;
          color: #FFFFFF;
        }
        .price-value {
          font-size: 16px;
          color: #FFFFFF;
        }

        .price-desc {
          font-weight: 400;
          font-size: 10px;
          color: #FFFFFF;
          text-align: center;
        }
      }

      .card-middle {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .card-title {
          font-size: 16px;
          font-weight: 500;
          color: #000;
          line-height: 1.4;
        }

        .card-details {
          display: flex;
          flex-direction: column;
          gap: 5px;

          .detail-item {
            font-size: 12px;
            color: #999;
            line-height: 1.5;
            word-break: break-all;
          }
        }
      }

      .card-right {
        flex-shrink: 0;
        display: flex;
        align-items: center;

        .status-pill {
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 12px;
          line-height: 1;
          background: rgba(0, 0, 0, 0.06);
          color: #666;
          white-space: nowrap;

          &.pending {
            background: rgba(250, 173, 20, 0.18);
            color: #d48806;
          }

          &.unused {
            background: rgba(22, 119, 255, 0.16);
            color: #0958d9;
          }

          &.used {
            background: rgba(82, 196, 26, 0.16);
            color: #389e0d;
          }

          &.expired {
            background: rgba(0, 0, 0, 0.10);
            color: #8c8c8c;
          }

          &.unknown {
            background: rgba(0, 0, 0, 0.06);
            color: #666;
          }
        }
      }
    }
  }
}
</style>

