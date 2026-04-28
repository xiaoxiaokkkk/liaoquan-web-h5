<template>
  <div class="insurance-record-page">
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
    <Navbar 
      v-if="showNavbar"
      title="历史保单" 
      left="left" 
      right="" 
      :image="paperIcon"
      backgroundColor="" 
    />
    <div class="insurance-record-content">
      <nut-pull-refresh
        v-model="refreshing"
        class="policy-scroll"
        :complete-duration="300"
        :disabled="loading"
        @refresh="handleRefresh"
      >
        <div class="policy-list-container">
          <nut-skeleton
            v-if="loading && displayList.length === 0"
            class="policy-skeleton"
            width="250px"
            height="15px"
            rows="3"
            animated
          />
          <template v-else-if="displayList.length === 0">
            <div class="policy-empty">
              <nut-empty description="暂无保单" />
            </div>
          </template>
          <template v-else>
            <div 
              v-for="(policy, index) in displayList" 
              :key="getPolicyKey(policy, index)"
              class="policy-item"
            >
              <div class="policy-item-content">
                <div class="policy-header">
                  <div class="policy-name-section">
                    <div class="policy-name">
                      {{ policy.name || policy.purchaseTime }}
                    </div>
                    <div class="policy-status" :class="getStatusClass(policy.status)">
                      <span class="status-dot" :class="getStatusDotClass(policy.status)"></span>
                      <span class="status-text">{{ getStatusText(policy.status) }}</span>
                    </div>
                  </div>
                  <div class="policy-strategy">
                    绑定策略: {{ policy.strategyInstanceName || '' }}
                  </div>
                </div>
                <div class="policy-info">
                  <div class="info-item">
                    <div class="info-label">投保额(UT)</div>
                    <div class="info-value">{{ policy.coverageAmount }}</div>
                  </div>
                  <div v-if="policy.status !== '3'" class="info-item info-center">
                    <div class="info-label">预计可赔付金额(CTIC)</div>
                    <div class="info-value">{{ policy.cticAmount || 0 }}</div>
                  </div>
                  <div v-if="policy.status === '3'" class="info-item info-right">
                    <div class="info-label">赔付金额(CTIC)</div>
                    <div class="info-value payout">{{ formatAmount(policy.payoutCticAmount) }}</div>
                  </div>
                  <div v-if="policy.status === '3'" class="info-item info-right">
                    <div class="info-label">剩余释放(天)</div>
                    <div class="info-value payout">{{ policy.remainingDays || 0 }}</div>
                  </div>
                  <div v-if="policy.hasNoProfitPayout === 1 || policy.status === 3 || policy.status === 4" class="info-item info-right">
                    <div class="icon-toggle" @click="toggleExpanded(policy)">
                      <RectDown v-if="isExpanded(policy)" />
                      <RectRight v-else />
                    </div>
                  </div>
                </div>
                <template v-if="isExpanded(policy)">
                  <nut-divider dashed :style="{ color: '#fff' }" />
                  <div class="policy-item-footer">
                    <nut-button class="policy-button" v-if="policy.hasNoProfitPayout === 1" size="mini" @click="handlePayout(policy)">亏损赔付</nut-button>
                    <nut-button class="policy-button" v-if="policy.status === 3 || policy.status === 4" size="mini" @click="handlePolicyDetail(policy)">爆仓赔付</nut-button>
                  </div>
                </template>
              </div>
            </div>

            <nut-infinite-loading
              v-if="!loading || displayList.length > 0"
              class="policy-infinite-loading"
              v-model="infiniteLoading"
              :has-more="hasMoreData"
              :threshold="100"
              @load-more="handleLoadMore"
            >
              <template #finished>
                <div class="policy-finished">没有更多保单了</div>
              </template>
            </nut-infinite-loading>
          </template>
        </div>
      </nut-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import paperIcon from '@/assets/images/Paper@2x.png'
import { policyPageList } from '@/api/insurance'
import { showToast } from '@nutui/nutui'
import { RectRight, RectDown } from '@nutui/icons-vue'

const props = defineProps({
  // 筛选状态：'0' 保险已取消, '1' 保险生效中, '2' 保险已退回, '3' 保险赔付中, '4' 赔付已完成, 'ALL' 全部
  status: {
    type: String,
    default: 'ALL'
  },
  // 是否显示 Navbar
  showNavbar: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()

const pageObj = reactive({
  page: 1,
  pageSize: 10
})

// 显示的保单列表
const displayList = ref([])
// 下拉刷新状态
const refreshing = ref(false)
// 无限滚动加载状态
const infiniteLoading = ref(false)
// 是否还有更多数据
const hasMoreData = ref(true)
// 加载状态
const loading = ref(false)
// 展开状态 Map (key: policy id, value: boolean)
const expandedMap = ref({})

// 获取保单的唯一 key
const getPolicyKey = (policy, index) => {
  return policy.id || policy.name || `policy-${index}`
}

// 切换展开状态
const toggleExpanded = (policy) => {
  const key = getPolicyKey(policy)
  expandedMap.value[key] = !expandedMap.value[key]
}

// 判断是否展开
const isExpanded = (policy) => {
  const key = getPolicyKey(policy)
  return expandedMap.value[key] || false
}

// 格式化金额
const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '0.00'
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    '0': '保险已取消',
    '1': '保险生效中',
    '2': '保险已退回',
    '3': '保险赔付中',
    '4': '赔付已完成'
  }
  return statusMap[status] || '未知'
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    '0': 'status-cancelled',
    '1': 'status-active',
    '2': 'status-returned',
    '3': 'status-payout',
    '4': 'status-payout-completed'
  }
  return classMap[status] || ''
}

// 获取状态点样式类
const getStatusDotClass = (status) => {
  const classMap = {
    '0': 'dot-cancelled',
    '1': 'dot-active',
    '2': 'dot-returned',
    '3': 'dot-payout',
    '4': 'dot-payout-completed'
  }
  return classMap[status] || ''
}

// 处理保单详情
const handlePolicyDetail = (policy) => {
  console.log('保单详情:', policy)
  if (policy.status === 3 || policy.status === 4) {
    router.push('/insuranceRelease?policyId=' + policy.id)
  }
}

// 处理亏损赔付
const handlePayout = (policy) => {
  console.log('亏损赔付:', policy)
  router.push('/insurancePayout?policyId=' + policy.id)
}

// 调用 API 获取数据
const fetchPolicyData = async (page = 1) => {
  try {
    const params = {
      page,
      size: pageObj.pageSize
    }
    
    // 如果 status 不是 'ALL'，则传递 status 参数
    if (props.status && props.status !== 'ALL') {
      params.status = props.status
    }
    
    const { code, data } = await policyPageList(params)

    if (code === 200) {
      const { records, totalPage, totalRow } = data;
      return {
        list: records,
        hasMore: totalPage > page,
        total: totalRow
      }
    } else {
      return {}
    }
  } catch (error) {
    console.error('API 调用失败:', error)
    throw error
  }
}

// 加载数据
const loadData = async (reset = false) => {
  if (reset) {
    pageObj.page = 1
    hasMoreData.value = true
    loading.value = true
  }
  
  if (!hasMoreData.value && !reset) {
    return
  }
  
  try {
    const result = await fetchPolicyData(pageObj.page)
    
    if (result && result.list) {
      if (reset) {
        // 刷新时替换数据
        displayList.value = result.list || []
      } else {
        // 加载更多时追加数据（避免重复）
        const newIds = result.list.map(item => item.id || item.name)
        const existingIds = displayList.value.map(item => item.id || item.name)
        const uniqueNewItems = result.list.filter(item => {
          const id = item.id || item.name
          return !existingIds.includes(id)
        })
        displayList.value = [...displayList.value, ...uniqueNewItems]
      }
      
      hasMoreData.value = result.hasMore !== false
      
      if (result.hasMore && !reset) {
        pageObj.page += 1
      } else if (reset && result.hasMore) {
        pageObj.page = 2
      }
    } else if (Array.isArray(result)) {
      // 兼容直接返回数组的情况
      if (reset) {
        displayList.value = result
      } else {
        displayList.value = [...displayList.value, ...result]
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    showToast.fail('加载数据失败')
  } finally {
    if (reset) {
      loading.value = false
    }
  }
}

// 下拉刷新处理
const handleRefresh = async () => {
  refreshing.value = true
  await loadData(true)
  refreshing.value = false
  infiniteLoading.value = false
}

// 滚动加载更多处理
const handleLoadMore = async () => {
  if (!hasMoreData.value) {
    infiniteLoading.value = false
    return
  }
  
  infiniteLoading.value = true
  await loadData(false)
  infiniteLoading.value = false
}

// 监听 status 变化
watch(() => props.status, () => {
  loadData(true)
})

// 初始化时加载数据
onMounted(() => {
  loadData(true)
})
</script>

<style lang="scss" scoped>
@import "./insuranceRecord.scss";
</style>

