<template>
  <nut-popup
    v-model:visible="innerVisible"
    position="right"
    pop-class="searchmch-popup"
    :style="{ width: '100%', height: '100%' }"
    :closeable="false"
    :round="false"
    teleport="#app"
  >
    <div class="searchmch-root">
      <div class="searchmch-top">
        <div class="back-btn" @click="close">
          <!-- <span class="back-icon">‹</span> -->
          <Left />
        </div>
        <div class="searchbar-wrap">
          <nut-searchbar
            v-model="keyword"
            placeholder="搜索商家"
            shape="round"
            clearable
            @search="onSearch"
          >
            <template #leftin>
              <img class="search-icon" :src="imgSearch" alt="search" />
            </template>
            <template #clear-icon>
              <img class="search-clear" :src="imgClose" alt="clear" @click.stop="clearKeyword" />
            </template>
          </nut-searchbar>
        </div>
      </div>

      <div class="searchmch-body">
        <nut-pull-refresh
          v-model="refreshing"
          class="searchmch-scroll"
          :complete-duration="300"
          :disabled="loading"
          @refresh="handleRefresh"
        >
          <div class="list-wrap">
            <!-- 空状态：既没有关注商家，也没有搜索结果时才显示 -->
            <template v-if="!hasAnyList && !loading">
              <div class="empty-wrap">
                <nut-empty description="暂无商家" />
              </div>
            </template>

            <template v-else>
              <!-- 关注商家列表（始终展示在顶部） -->
              <template v-if="followDisplayList.length">
                <div class="section-title" style="padding-bottom: 10px;">关注的商家</div>
                <div class="merchant-list">
                  <div
                    v-for="(item, index) in followDisplayList"
                    :key="`follow-${getItemKey(item, index)}`"
                    class="merchant-item"
                    @click="selectMerchant(item)"
                  >
                    <img class="avatar" :src="item.photoUrl || imgDefaultAvatar" alt="avatar" />
                    <div class="info">
                      <div class="name-row">
                        <div class="name">{{ item.name }}</div>
                        <div class="tag">已关注</div>
                      </div>
                      <div class="desc">
                        {{ item.desc }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 搜索结果列表（自动去重已关注商家） -->
              <template v-if="keyword.trim()">
                <nut-skeleton
                  v-if="loading && searchDisplayList.length === 0"
                  class="loading-wrap"
                  width="260px"
                  height="15px"
                  rows="6"
                  animated
                />

                <template v-else-if="searchDisplayList.length">
                  <div class="section-title" style="padding-bottom: 10px;">搜索结果</div>
                  <div class="merchant-list">
                    <div
                      v-for="(item, index) in searchDisplayList"
                      :key="`search-${getItemKey(item, index)}`"
                      class="merchant-item"
                      @click="selectMerchant(item)"
                    >
                      <img class="avatar" :src="item.photoUrl || imgDefaultAvatar" alt="avatar" />
                      <div class="info">
                        <div class="name-row">
                          <div class="name">{{ item.name }}</div>
                          <div v-if="item.isAttention === 1" class="tag">已关注</div>
                        </div>
                        <div class="desc">
                          {{ item.desc }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
            </template>
          </div>
        </nut-pull-refresh>
      </div>
    </div>

    <!-- 切换商家确认弹窗 -->
    <nut-dialog
      teleport="#app"
      title="切换商家"
      :content="confirmContent"
      v-model:visible="confirmVisible"
      ok-text="确定"
      cancel-text="取消"
      custom-class="custom-dialog"
      pop-class="custom-wechat"
      @ok="handleConfirmOk"
    />
  </nut-popup>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { showToast } from '@nutui/nutui'
import { useUserStore } from '@/stores/user'
import { getMerchantByName, getFollowMerchantList } from '@/api/user'
import { Left } from '@nutui/icons-vue'

import imgClose from '@/assets/images/home/close.png'
import imgSearch from '@/assets/images/home/search.png'
import imgDefaultAvatar from '@/assets/images/avatar@1x.png'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'select'])

const userStore = useUserStore()

const innerVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const keyword = ref('')
const refreshing = ref(false)
const loading = ref(false)
const rawList = ref([])
const hasPushedHistory = ref(false)

// 切换商家确认弹窗相关
const confirmVisible = ref(false)
const pendingMerchant = ref(null)
const confirmContent = computed(() => {
  const name = pendingMerchant.value?.name || '该商家'
  return `是否切换到“${name}”？`
})

function close() {
  // 支持“物理返回键/浏览器后退”关闭：打开时会 pushState，这里用 history.back() 回退
  if (hasPushedHistory.value) {
    history.back()
    return
  }
  innerVisible.value = false
}

function clearKeyword() {
  keyword.value = ''
  rawList.value = []
}

function getItemKey(item, index) {
  return item?.uid ?? item?.merchantId ?? `mch-${index}`
}

function buildDesc(item) {
  const sign = item?.sign ? String(item.sign) : ''
  const parts = []
  const age = Number.isFinite(Number(item?.age)) ? Number(item.age) : undefined
  const height = Number.isFinite(Number(item?.height)) ? Number(item.height) : undefined
  const emotionState = item?.emotionState ? String(item.emotionState) : ''

  if (age != null && age > 0) parts.push(`${age}岁`)
  if (height != null && height > 0) parts.push(`${height}cm`)
  if (emotionState) parts.push(emotionState)

  // 优先展示签名；没有签名才用基础信息
  if (sign) return sign
  if (parts.length) return parts.join(' · ')
  return ' '
}

// 关注商家展示列表
const followDisplayList = computed(() =>
  (Array.isArray(followMerchantList.value) ? followMerchantList.value : []).map((r) => ({
    ...r,
    desc: buildDesc(r)
  }))
)

// 搜索结果展示列表（去除已关注商家）
const searchDisplayList = computed(() => {
  const baseList = Array.isArray(rawList.value) ? rawList.value : []
  const followList = Array.isArray(followMerchantList.value) ? followMerchantList.value : []

  const followKeySet = new Set(
    followList.map((item, index) => getItemKey(item, index))
  )

  return baseList
    .filter((item, index) => {
      const key = getItemKey(item, index)
      return !followKeySet.has(key)
    })
    .map((r) => ({
      ...r,
      desc: buildDesc(r)
    }))
})

// 是否有任何列表数据（关注或搜索）
const hasAnyList = computed(
  () => followDisplayList.value.length > 0 || searchDisplayList.value.length > 0
)

function normalizeListResponse(res) {
  const data = res?.data || res
  const rows =
    data?.list || data?.rows || data?.records || data?.data || data || []
  return Array.isArray(rows) ? rows : []
}

async function doSearch() {
  const name = keyword.value.trim()
  if (!name) {
    rawList.value = []
    return
  }

  const userid = userStore.userInfo?.userid
  if (!userid) {
    showToast.text('请先登录后再搜索')
    rawList.value = []
    return
  }

  loading.value = true
  try {
    const res = await getMerchantByName({ userid, name })
    if (res?.code !== 0 && res?.code !== '0') {
      throw new Error(res?.msg || res?.message || '搜索失败')
    }
    rawList.value = normalizeListResponse(res)
  } catch (e) {
    console.error('搜索商家失败:', e)
    rawList.value = []
    showToast.text(e?.message || '搜索失败')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  doSearch()
}

const debounceTimer = ref(null)
watch(
  () => keyword.value,
  () => {
    if (debounceTimer.value) clearTimeout(debounceTimer.value)
    debounceTimer.value = setTimeout(() => {
      doSearch()
    }, 300)
  }
)

watch(
  () => props.visible,
  (v) => {
    if (v) {
      keyword.value = ''
      rawList.value = []

      // 打开时压入一条 history，让浏览器后退可关闭弹层
      if (!hasPushedHistory.value) {
        try {
          history.pushState({ __searchmch: true }, '')
          hasPushedHistory.value = true
        } catch (_) {
          // ignore
        }
      }
      window.addEventListener('popstate', handlePopState)
    } else {
      window.removeEventListener('popstate', handlePopState)
      hasPushedHistory.value = false
    }
  }
)

async function handleRefresh() {
  refreshing.value = true
  await doSearch()
  refreshing.value = false
}

function selectMerchant(item) {
  // 选中商家时：先弹出确认框，确认后再切换
  pendingMerchant.value = item
  confirmVisible.value = true
}

function handleConfirmOk() {
  if (!pendingMerchant.value) return
  // 1. 向父组件（Home）派发 select 事件，父组件会通过 router.replace 更新 merchantId
  // 2. 这里只关闭弹层本身，不再调用 history.back()，避免浏览器回退到旧的 /home 记录
  emit('select', pendingMerchant.value)
  hasPushedHistory.value = false
  innerVisible.value = false
  pendingMerchant.value = null
}

function handlePopState() {
  // 后退触发：关闭弹层
  if (innerVisible.value) {
    innerVisible.value = false
  }
}

const followMerchantList = ref([])
// 获取关注商家列表
const fetchFollowMerchantList = async () => {
  const res = await getFollowMerchantList({ userid: userStore.userInfo.userid })
  if (res?.code !== 0 && res?.code !== '0') {
    throw new Error(res?.msg || res?.message || '获取关注商家列表失败')
  }
  followMerchantList.value = normalizeListResponse(res)
}
fetchFollowMerchantList()

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState)
})
</script>

<style scoped lang="scss">
@import './searchmch.scss';
</style>
