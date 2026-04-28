<template>
  <div class="contentlist-root">
    <!-- <nut-noticebar :scrollable="false" background="#ff4d5b" color="#fff">
      <template #left-icon>
        <img src="@/assets/images/logo.png" alt="logo" style="width: 20px; height: 20px">
      </template>
      <span>下载APP，应用商店搜索：特有料</span>
    </nut-noticebar> -->
    <!-- <div class="search-row">
      <nut-searchbar
        v-model="keyword"
        placeholder="搜索内容关键词"
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
    </div> -->

    <nut-pull-refresh
      ref="scrollContainerRef"
      v-model="refreshing"
      class="contentlist-scroll"
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
            <nut-empty description="下载app,查看查看购买订单" />
          </div>
        </template>
        <!-- <template v-if="loading && displayList.length === 0">
          <div class="loading-wrap">
            <div
              v-for="i in 5"
              :key="`skeleton-${i}`"
              class="skeleton-item"
            >
              <nut-skeleton width="100%" height="90px" animated :row="3" />
            </div>
          </div>
        </template>

        <template v-else-if="displayList.length === 0">
          <div class="empty-wrap">
            <nut-empty description="暂无内容" />
          </div>
        </template> -->

        <template v-else>
          <div class="content-list">
            <!-- @click="emit('item-click', item)" -->
            <div
              v-for="(item, index) in displayList"
              :key="getItemKey(item, index)"
              class="content-item"
              @click="toContentDetail(item)"
            >
              <img v-if="item.corner" class="corner" :src="item.corner" alt="corner" />
              <span v-if="item.priceText" class="corner-meta-price">{{ item.priceText }}</span>

              <div class="item-title">
                <img v-if="item.leftTag" class="left-tag" :src="item.leftTag" alt="tag" />
                <img v-if="item.isPackage" class="package-tag" :src="imgTimesPkg" alt="package" />
                <span>{{ item.title }}</span>
              </div>

              <div class="item-tag">
                <nut-tag color="#0089AC" v-if="item.refundFlag === 1"> 不中退还 </nut-tag>
                <nut-tag color="#F74B2B" v-if="item.shareFlag === 1"> 分享解锁 </nut-tag>
                <nut-tag color="#4AACFF" v-if="item.packageId || (item.packageIds && item.packageIds.length > 0)">已加套餐</nut-tag>
              </div>

              <div class="item-meta">
                <span class="meta-time">{{ item.time }}</span>
                <span class="meta-views">
                  <img class="view-icon" :src="imgView" alt="view" />
                  {{ item.views }}人查看
                </span>
                <nut-tag color="#FF0000" v-if="item.result" plain> {{ item.result }} </nut-tag>
                <!-- <span v-if="item.priceText" class="meta-price">{{ item.priceText }}</span> -->
              </div>

              <div v-if="item.extraTag" class="extra-tag">{{ item.extraTag }}</div>
            </div>
          </div>

          <nut-infinite-loading
            v-if="!loading || displayList.length > 0"
            class="content-infinite-loading"
            v-model="infiniteLoading"
            :has-more="hasMoreData"
            :threshold="100"
            @load-more="handleLoadMore"
          >
            <template #finished>
              <div class="content-finished">没有更多了</div>
            </template>
          </nut-infinite-loading>
        </template>
      </div>
    </nut-pull-refresh>
  </div>
</template>

<script setup>
import { computed, onMounted, onActivated, onDeactivated, onUpdated, reactive, ref, watch, nextTick } from 'vue'
import { showToast } from '@nutui/nutui'
import { useRouter, useRoute } from 'vue-router'
import { getContentList } from '@/api/content'
import { multiply } from '@/utils/math'

import imgClose from '@/assets/images/home/close.png'
import imgSearch from '@/assets/images/home/search.png'
import imgView from '@/assets/images/home/view.png'
import imgFree from '@/assets/images/home/free.png'
import imgPublic from '@/assets/images/home/public.png'
import imgSell from '@/assets/images/home/sell.png'
import imgBeforeSell from '@/assets/images/home/before-sell.png'
import imgBlack from '@/assets/images/home/black.png'
import imgRed from '@/assets/images/home/red.png'
import imgRun from '@/assets/images/home/run.png'
import imgTimesPkg from '@/assets/images/home/times-pkg.png'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  merchantId: { type: [Number, String], default: 1 },
  orderType: { type: String, default: '' },
})

const emit = defineEmits(['item-click'])

// 滚动容器引用
const scrollContainerRef = ref(null)
let scrollTimer = null
let scrollElement = null

// 获取存储滚动位置的 key
const getScrollPositionKey = () => {
  return `contentlist_scroll_${props.merchantId}_${props.tabKey || 'material'}`
}

// 获取滚动元素
const getScrollElement = () => {
  // 方式1: 直接查找 .contentlist-scroll（根据 CSS，它本身有 overflow-y: auto）
  let element = document.querySelector('.contentlist-root .contentlist-scroll')
  if (element) {
    const style = window.getComputedStyle(element)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      console.log('✅ 通过方式1找到滚动元素: .contentlist-scroll')
      return element
    }
  }
  
  // 方式2: 查找 .nut-pull-refresh__body（NutUI 组件内部的滚动容器）
  element = document.querySelector('.contentlist-root .nut-pull-refresh__body')
  if (element) {
    const style = window.getComputedStyle(element)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      console.log('✅ 通过方式2找到滚动元素: .nut-pull-refresh__body')
      return element
    }
  }
  
  // 方式3: 通过 scrollContainerRef 查找
  if (scrollContainerRef.value) {
    const componentEl = scrollContainerRef.value.$el || scrollContainerRef.value.el || scrollContainerRef.value
    if (componentEl) {
      // 尝试查找 .nut-pull-refresh__body
      if (componentEl.querySelector) {
        element = componentEl.querySelector('.nut-pull-refresh__body')
        if (element) {
          console.log('✅ 通过方式3找到滚动元素（组件内部）')
          return element
        }
      }
      
      // 如果组件本身就是滚动容器
      const style = window.getComputedStyle(componentEl)
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        console.log('✅ 通过方式3找到滚动元素（组件本身）')
        return componentEl
      }
    }
  }
  
  // 方式4: 查找所有可能的滚动容器
  const root = document.querySelector('.contentlist-root')
  if (root) {
    const allScrollable = root.querySelectorAll('[style*="overflow"], .contentlist-scroll, .nut-pull-refresh__body')
    for (let i = 0; i < allScrollable.length; i++) {
      const el = allScrollable[i]
      const style = window.getComputedStyle(el)
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        console.log('✅ 通过方式4找到滚动元素:', el.className || el.tagName)
        return el
      }
    }
  }
  
  console.warn('❌ 未找到滚动元素')
  return null
}

// 保存滚动位置（防抖）
const saveScrollPosition = () => {
  try {
    const element = getScrollElement()
    if (element) {
      const scrollTop = element.scrollTop || 0
      const key = getScrollPositionKey()
      localStorage.setItem(key, String(scrollTop))
      console.log('保存滚动位置:', scrollTop, 'key:', key)
    }
  } catch (error) {
    console.error('保存滚动位置失败:', error)
  }
}

// 恢复滚动位置
const restoreScrollPosition = () => {
  try {
    const savedScrollTop = localStorage.getItem(getScrollPositionKey())
    if (!savedScrollTop) {
      console.log('没有保存的滚动位置')
      return
    }
    
    const scrollTop = Number(savedScrollTop)
    console.log('准备恢复滚动位置:', scrollTop, 'key:', getScrollPositionKey())
    
    // 多次尝试恢复，确保 DOM 已渲染
    const tryRestore = (attempts = 0) => {
      // 尝试次数控制得更少，避免长时间等待
      if (attempts > 6) {
        console.warn('恢复滚动位置失败：超过最大尝试次数', attempts)
        return
      }
      
      const element = getScrollElement()
      if (element) {
        const currentScrollHeight = element.scrollHeight
        const currentScrollTop = element.scrollTop
        const clientHeight = element.clientHeight
        
        console.log(`尝试恢复 (${attempts}):`, {
          scrollHeight: currentScrollHeight,
          clientHeight: clientHeight,
          scrollTop: currentScrollTop,
          targetScrollTop: scrollTop,
          elementExists: !!element,
          elementTag: element.tagName,
          elementClass: element.className
        })
        
        // 如果内容高度足够，直接设置滚动位置
        if (currentScrollHeight >= scrollTop) {
          element.scrollTop = scrollTop
          // 验证是否设置成功
          setTimeout(() => {
            const actualScrollTop = element.scrollTop
            if (Math.abs(actualScrollTop - scrollTop) < 10) {
              console.log('✅ 成功恢复滚动位置:', actualScrollTop)
            } else {
              console.warn('⚠️ 滚动位置设置后不匹配，当前:', actualScrollTop, '期望:', scrollTop)
              // 再试一次
              element.scrollTop = scrollTop
            }
          }, 50)
          return true
        } else {
          // 内容高度不够，等待内容加载
          console.log('内容高度不足，等待加载...', currentScrollHeight, '<', scrollTop)
        }
      } else {
        console.log('滚动元素不存在，重试...', attempts)
      }
      
      // 延迟重试，整体等待时间缩短，加快恢复速度
      const delay = Math.min(40 + attempts * 30, 200)
      setTimeout(() => {
        tryRestore(attempts + 1)
      }, delay)
      return false
    }
    
    // 等待 DOM 更新，缩短初始延迟，加快首次恢复时间
    nextTick(() => {
      setTimeout(() => {
        tryRestore(0)
      }, 60)
    })
  } catch (error) {
    console.error('恢复滚动位置失败:', error)
  }
}

// 初始化滚动监听
const initScrollListener = () => {
  nextTick(() => {
    setTimeout(() => {
      const element = getScrollElement()
      if (element) {
        scrollElement = element
        // 移除旧的监听器（如果存在）
        element.removeEventListener('scroll', handleScroll)
        // 添加新的监听器
        element.addEventListener('scroll', handleScroll, { passive: true })
        console.log('滚动监听器已初始化')
      }
    }, 200)
  })
}

// 滚动处理函数
const handleScroll = () => {
  // 防抖保存滚动位置
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  scrollTimer = setTimeout(() => {
    saveScrollPosition()
  }, 200)
}

const keyword = ref('')
const refreshing = ref(false)
const infiniteLoading = ref(false)
const hasMoreData = ref(true)
const loading = ref(false)

const pageObj = reactive({
  pageNum: 1,
  pageSize: 10
})

function mapCorner(kind) {
  if (kind === 'free') return imgFree
  if (kind === 'public') return imgPublic
  if (kind === 'presell') return imgBeforeSell
  // if (kind === 'pay') return imgSell
  return null
}

// 1-黑，2-红，3-走水
function mapPredictResult(predictResult) {
  if (predictResult === 1) return imgBlack
  if (predictResult === 2) return imgRed
  if (predictResult === 3) return imgRun
  return null
}

const displayList = ref([])

// 只在「TA料」这个 tab 激活时才触发请求，避免切换到其他 tab 时仍然刷新文章列表
const isActive = computed(() => props.tabKey === 'material')

const effectiveType = computed(() =>
  props.filterValue && props.filterValue !== 'all' ? props.filterValue : undefined
)

function matchByKeyword(item) {
  const kw = keyword.value.trim()
  return !kw || (item?.title && String(item.title).includes(kw))
}

const getItemKey = (item, index) => item?.id ?? `content-${index}`

// 格式化时间，去掉年份
function formatTimeWithoutYear(timeStr) {
  if (!timeStr) return ''
  // 处理格式：2024-01-15 10:30:00 -> 01-15 10:30:00
  // 或：2024-01-15 -> 01-15
  return timeStr.replace(/^\d{4}-/, '').replace(/^\d{4}\//, '')
}

async function fetchPage(page = 1) {
  const params = {
    pageNum: page,
    pageSize: pageObj.pageSize,
    merchantId: props.merchantId,
    context: keyword.value || undefined,
    isPackage: props.orderType === 'pkg' ? 1 : 0
    // type: effectiveType.value,
    // tabKey: props.tabKey || undefined
  }
  return await getContentList(params)
}

function normalizeListResponse(res, page) {
  const data = res?.data || res
  const rows = data?.list || data?.rows || data?.records || data?.data || data || []

  const list = Array.isArray(rows) ? rows : []

  // 判断是否还有更多：优先 totalPage/pages/hasMore，其次用返回条数兜底
  const totalPage =
    data?.totalPage ?? data?.pages ?? data?.totalPages ?? data?.pageCount ?? undefined
  const hasMore =
    typeof data?.hasMore === 'boolean'
      ? data.hasMore
      : typeof totalPage === 'number'
        ? page < totalPage
        : list.length >= pageObj.pageSize

  return { list, hasMore }
}

async function loadData(reset = false) {
  if (!isActive.value) return

  if (reset) {
    pageObj.pageNum = 1
    hasMoreData.value = true
    loading.value = true
  }

  if (!hasMoreData.value && !reset) return

  try {
    const res = await fetchPage(pageObj.pageNum)
    const { list, hasMore } = normalizeListResponse(res, pageObj.pageNum)

    const mapped = list.map((r, idx) => {
      let price = Number(r?.price ?? 0)
      const isPublic = r?.isPublic ?? 0
      const tag = r?.tag ?? 0
      const predictResult = r?.predictResult ?? null
      
      // 根据 tag、price、isPublic 决定角标类型
      // 优先级：预售 > 免费 > 公开付费 > 付费
      let kind = 'pay' // 默认付费
      if (tag === 1) {
        kind = 'presell' // 预售
      } else if (price === 0) {
        kind = 'free' // 免费
      } else if (isPublic === 1) {
        kind = 'public' // 公开（免费可见）
      } else {
        kind = 'pay' // 付费（仅付费可见）
      }
      // 折扣， 0-50，0免费，1=1折， 2 = 2折， 3 = 3折， 10=无折扣，50=原价5倍
      const discount = r?.discount ?? 0
      // 价格文本：只有价格大于0时才显示
      const discountRate = discount / 10;
      const priceText = price >= 0 ? `${multiply(price, discountRate)}元` : null
      
      return {
        id: r?.id ?? `${pageObj.pageNum}-${idx}`,
        isPackage: r?.isPackage ?? 0,
        title: r?.title ?? '内容标题',
        time: formatTimeWithoutYear(r?.createTime ?? ''),
        views: r?.views ?? r?.viewCount ?? 0,
        corner: mapCorner(kind),
        shareFlag: r?.shareFlag ?? 0,
        result: r?.result ?? null,
        refundFlag: r?.refundFlag ?? 0,
        packageId: r?.packageId ?? 0,
        packageIds: r?.packageIds ?? [],
        leftTag: mapPredictResult(predictResult),
        priceText: priceText,
        extraTag: r?.extraTag || null,
        kind
      }
    }).filter(matchByKeyword)

    if (reset) {
      displayList.value = mapped
    } else {
      const existingIds = new Set(displayList.value.map((x) => x.id))
      const uniqueNew = mapped.filter((x) => !existingIds.has(x.id))
      displayList.value = [...displayList.value, ...uniqueNew]
    }

    hasMoreData.value = hasMore
    if (hasMore && !reset) {
      pageObj.pageNum += 1
    } else if (reset && hasMore) {
      pageObj.pageNum = 2
    }
  } catch (e) {
    console.error('加载内容列表失败:', e)
    // 失败兜底 mock（也要支持"分页+搜索"体验）
    hasMoreData.value = false
    showToast.text('数据加载异常')
  } finally {
    if (reset) {
      loading.value = false
      // 数据加载完成后，如果不是搜索操作，恢复滚动位置
      // 搜索时会清除缓存，所以不需要恢复
      const savedScrollTop = localStorage.getItem(getScrollPositionKey())
      if (savedScrollTop) {
        nextTick(() => {
          setTimeout(() => {
            restoreScrollPosition()
          }, 60)
        })
      }
    }
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  await loadData(true)
  refreshing.value = false
  infiniteLoading.value = false
}

const handleLoadMore = async () => {
  if (!hasMoreData.value) {
    infiniteLoading.value = false
    return
  }
  infiniteLoading.value = true
  await loadData(false)
  infiniteLoading.value = false
}

function onSearch() {
  // 搜索时清除滚动位置缓存
  localStorage.removeItem(getScrollPositionKey())
  loadData(true)
}

function clearKeyword() {
  keyword.value = ''
  // 清除搜索时清除滚动位置缓存
  localStorage.removeItem(getScrollPositionKey())
  loadData(true)
}

watch(
  () => [props.merchantId, props.tabKey, props.filterValue],
  () => {
    if (isActive.value) loadData(true)
  }
)

// 标记是否已经恢复过滚动位置（避免重复恢复）
const hasRestoredScroll = ref(false)

onMounted(() => {
  if (isActive.value) {
    loadData(true)
    // 初始化滚动监听
    initScrollListener()
  }
})

// 组件更新后尝试恢复滚动位置
onUpdated(() => {
  if (isActive.value && displayList.value.length > 0 && !hasRestoredScroll.value) {
    const savedScrollTop = localStorage.getItem(getScrollPositionKey())
    if (savedScrollTop) {
      nextTick(() => {
        setTimeout(() => {
          restoreScrollPosition()
          hasRestoredScroll.value = true
        }, 60)
      })
    }
  }
})

// 组件激活时恢复滚动位置并初始化滚动监听
onActivated(() => {
  hasRestoredScroll.value = false
  initScrollListener()
  // 如果数据已加载，恢复滚动位置
  if (displayList.value.length > 0) {
    nextTick(() => {
      setTimeout(() => {
        restoreScrollPosition()
        hasRestoredScroll.value = true
      }, 80)
    })
  }
})

// 组件失活时保存滚动位置
onDeactivated(() => {
  saveScrollPosition()
  hasRestoredScroll.value = false
})

// 监听路由变化，从详情页返回时恢复滚动位置
watch(
  () => route.path,
  (newPath, oldPath) => {
    // 从详情页返回到首页时，恢复滚动位置
    if (oldPath === '/contentDetail' && newPath === '/home' && isActive.value) {
      hasRestoredScroll.value = false
      nextTick(() => {
        setTimeout(() => {
          if (displayList.value.length > 0) {
            restoreScrollPosition()
            hasRestoredScroll.value = true
          }
        }, 80)
      })
    }
  }
)

const toContentDetail = (item) => {
  // 跳转前保存滚动位置
  saveScrollPosition()
  router.push('/contentDetail?contentId=' + item.id)
}


</script>

<style scoped lang="scss">
@import './orderlist.scss';
</style>


