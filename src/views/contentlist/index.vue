<template>
  <div class="contentlist-root">
    <!-- <nut-noticebar :scrollable="false" background="#ff4d5b" color="#fff">
      <template #left-icon>
        <img src="@/assets/images/logo.png" alt="logo" style="width: 20px; height: 20px">
      </template>
      <span>下载APP，应用商店搜索：特有料</span>
    </nut-noticebar> -->
    <div class="search-row">
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
    </div>

    <nut-pull-refresh
      ref="pullRefreshRef"
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
            <nut-empty description="暂无内容" />
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
              :data-content-id="String(item.id)"
              class="content-item"
              @click="toContentDetail(item, $event)"
            >
              <img v-if="item.corner" class="corner" :src="item.corner" alt="corner" />
              <span v-if="item.priceText" class="corner-meta-price">{{ item.priceText }}<span class="corner-meta-price-unit">元</span></span>
              <div v-if="item.discount < 10" class="extra-tag">
                <nut-tag color="#FFD4CC" round text-color="#F74B2B">{{ item.discount }}折</nut-tag>
                <!--计算出原价-->
                <span v-if="item.originalPriceText" class="corner-meta-original-price">{{ item.originalPriceText }}<span class="corner-meta-original-price-unit">元</span></span>
              </div>

              <div class="item-title">
                <span class="item-title-text">
                  <!-- 图片内联容器，v-if 控制显示 -->
                  <span v-if="item.leftTag || item.isPackage" class="inline-images">
                    <img v-if="item.leftTag" class="left-tag" :src="item.leftTag" alt="tag" />
                    <img v-if="item.isPackage" class="package-tag" :src="imgTimesPkg" alt="package" />
                  </span>
                  <!-- 文本内容，保持内联以便多行换行 -->
                  <span class="title-content">{{ item.title }}</span>
                </span>
                <!-- <div class="item-title-right">

                </div> -->
              </div>

              <div class="item-tag">
                <nut-tag color="#0089AC" v-if="item.refundFlag === 1"> 不中退还 </nut-tag>
                <nut-tag color="#F74B2B" v-if="item.shareFlag === 1"> 分享解锁 </nut-tag>
                <nut-tag color="#4AACFF" v-if="item.packageId || (item.packageIds && item.packageIds.length > 0)">已加套餐</nut-tag>
              </div>
              <div>
                <nut-tag
                  color="#FF0000"
                  plain
                  v-if="item.resultType === 3"
                  @click.stop="showFullResult(item.result)"
                >
                  {{ item.result }}
                  <!-- {{ truncateResult() }} -->
                </nut-tag>
              </div>
              <div class="item-meta">
                <span class="meta-time">{{ item.time }}</span>
                <span class="meta-views">
                  <img class="view-icon" :src="imgView" alt="view" />
                  {{ item.views }}人查看
                </span>
                <nut-tag color="#FF0000" plain v-if="item.resultType === 2"> {{ item.result }} </nut-tag>
                <div v-if="item.resultType === 1" class="custom-result-tag">
                  <span class="result-number">{{ extractNumber(item.result) }}</span>
                  <span class="result-text">连红</span>
                </div>
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
import { computed, onActivated, onMounted, reactive, ref, watch, nextTick } from 'vue'
import { showToast } from '@nutui/nutui'
import { getContentList } from '@/api/content'
import { multiply } from '@/utils/math'

defineOptions({
  name: 'ContentList'
})

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

const props = defineProps({
  merchantId: { type: [Number, String], default: 1 },
  tabKey: { type: String, default: '' },
  filterValue: { type: String, default: 'all' }
})

const emit = defineEmits(['item-click'])

const pullRefreshRef = ref(null)
let scrollContainerEl = null
let scrollListenerAttached = false

const keyword = ref('')
const refreshing = ref(false)
const infiniteLoading = ref(false)
const hasMoreData = ref(true)
const loading = ref(false)

// 滚动位置缓存 key
const getScrollKey = () => `contentlist_scroll_${props.merchantId || 'default'}_${props.tabKey || 'material'}`

// 获取滚动容器元素（使用 ref 或查找）
const getScrollContainer = () => {
  // 先尝试使用缓存的引用
  if (scrollContainerEl && document.contains(scrollContainerEl)) {
    return scrollContainerEl
  }
  
  // 重置缓存
  scrollContainerEl = null
  
  // 方法1：通过 pullRefreshRef 获取（Vue 3 方式）
  if (pullRefreshRef.value) {
    let el = null
    
    // Vue 3 组件实例：尝试多种方式获取 DOM 元素
    if (pullRefreshRef.value instanceof HTMLElement) {
      // 直接是 DOM 元素
      el = pullRefreshRef.value
    } else if (pullRefreshRef.value.$el) {
      // Vue 2 兼容或某些库的实现
      el = pullRefreshRef.value.$el
    } else if (pullRefreshRef.value.ctx) {
      // Vue 3 Composition API 组件实例
      el = pullRefreshRef.value.ctx.$el || pullRefreshRef.value.ctx.el
    } else if (pullRefreshRef.value.$) {
      // Vue 3 内部实例
      const vnode = pullRefreshRef.value.$.vnode
      if (vnode && vnode.el) {
        el = vnode.el
      }
    }
    
    // 如果找到了组件根元素，查找滚动容器
    if (el) {
      // 先尝试在当前元素内查找
      let container = el.querySelector('.nut-pull-refresh__body')
      if (container) {
        scrollContainerEl = container
        return container
      }
      
      // 如果组件根元素就是 pull-refresh，查找其子元素
      if (el.classList && el.classList.contains('nut-pull-refresh')) {
        container = el.querySelector('.nut-pull-refresh__body')
        if (container) {
          scrollContainerEl = container
          return container
        }
      }
      
      // 尝试查找父级或子级中的滚动容器
      container = el.closest('.contentlist-scroll')?.querySelector('.nut-pull-refresh__body')
      if (container) {
        scrollContainerEl = container
        return container
      }
    }
  }
  
  // 方法2：通过模板 ref 查找（如果 pullRefreshRef 指向的是 class="contentlist-scroll" 的元素）
  // 注意：这里 pullRefreshRef 实际指向的是 nut-pull-refresh 组件，不是 .contentlist-scroll
  
  // 方法3：通过类名查找当前组件内的滚动容器
  // 使用更精确的选择器，通过父级容器限制范围
  const rootEls = document.querySelectorAll('.contentlist-root')
  for (const rootEl of rootEls) {
    // 检查这个 root 是否包含 pullRefreshRef 的 DOM（如果 pullRefreshRef 有值）
    let isCurrentComponent = true
    if (pullRefreshRef.value) {
      let refEl = null
      if (pullRefreshRef.value instanceof HTMLElement) {
        refEl = pullRefreshRef.value
      } else if (pullRefreshRef.value.$el) {
        refEl = pullRefreshRef.value.$el
      } else if (pullRefreshRef.value.ctx?.$el) {
        refEl = pullRefreshRef.value.ctx.$el
      }
      
      if (refEl && !rootEl.contains(refEl)) {
        isCurrentComponent = false
      }
    }
    
    if (isCurrentComponent) {
      const container = rootEl.querySelector('.contentlist-scroll .nut-pull-refresh__body')
      if (container) {
        scrollContainerEl = container
        return container
      }
    }
  }
  
  // 方法4：全局查找可见的滚动容器
  const containers = document.querySelectorAll('.contentlist-scroll .nut-pull-refresh__body')
  for (const container of containers) {
    const rect = container.getBoundingClientRect()
    const style = window.getComputedStyle(container)
    // 检查是否可见且可滚动
    if (
      rect.width > 0 && 
      rect.height > 0 && 
      style.display !== 'none' && 
      style.visibility !== 'hidden' &&
      style.overflowY !== 'hidden'
    ) {
      scrollContainerEl = container
      return container
    }
  }
  
  // 方法5：备选方案 - 如果找不到 .nut-pull-refresh__body，尝试使用 .contentlist-scroll 本身
  // 检查样式，如果它有 overflow-y: auto 或 scroll，可以作为滚动容器
  const scrollEls = document.querySelectorAll('.contentlist-scroll')
  for (const scrollEl of scrollEls) {
    const style = window.getComputedStyle(scrollEl)
    const rect = scrollEl.getBoundingClientRect()
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      rect.width > 0 && 
      rect.height > 0 && 
      style.display !== 'none' && 
      style.visibility !== 'hidden'
    ) {
      // 检查这个元素是否包含 pullRefreshRef
      let isCurrentComponent = true
      if (pullRefreshRef.value) {
        let refEl = null
        if (pullRefreshRef.value instanceof HTMLElement) {
          refEl = pullRefreshRef.value
        } else if (pullRefreshRef.value.$el) {
          refEl = pullRefreshRef.value.$el
        } else if (pullRefreshRef.value.ctx?.$el) {
          refEl = pullRefreshRef.value.ctx.$el
        }
        
        if (refEl && !scrollEl.contains(refEl) && !scrollEl.isSameNode(refEl)) {
          isCurrentComponent = false
        }
      }
      
      if (isCurrentComponent) {
        scrollContainerEl = scrollEl
        console.log('[ContentList] 使用备选方案：.contentlist-scroll 作为滚动容器')
        return scrollEl
      }
    }
  }
  
  // console.warn('[ContentList] getScrollContainer: 所有方法都未找到滚动容器', {
  //   pullRefreshRef: pullRefreshRef.value,
  //   rootElsCount: document.querySelectorAll('.contentlist-root').length,
  //   containersCount: document.querySelectorAll('.nut-pull-refresh__body').length,
  //   scrollElsCount: document.querySelectorAll('.contentlist-scroll').length
  // })
  
  return null
}

// 保存滚动位置
const saveScrollPosition = () => {
  try {
    const scrollContainer = getScrollContainer()
    if (scrollContainer) {
      const scrollTop = scrollContainer.scrollTop || 0
      const key = getScrollKey()
      sessionStorage.setItem(key, String(scrollTop))
      console.log('[ContentList] 保存滚动位置:', key, scrollTop)
    } else {
      // console.warn('[ContentList] 无法找到滚动容器，无法保存滚动位置')
    }
  } catch (e) {
    console.error('[ContentList] 保存滚动位置失败:', e)
  }
}

// 恢复滚动位置（使用多次重试确保成功）
const restoreScrollPosition = () => {
  try {
    const key = getScrollKey()
    const savedScrollTop = sessionStorage.getItem(key)
    console.log('[ContentList] 尝试恢复滚动位置:', key, savedScrollTop)
    
    if (!savedScrollTop || Number(savedScrollTop) <= 0) {
      console.log('[ContentList] 没有保存的滚动位置，跳过恢复')
      return
    }
    
    const targetScrollTop = Number(savedScrollTop)
    let retryCount = 0
    const maxRetries = 10
    
    const tryRestore = () => {
      const scrollContainer = getScrollContainer()
      if (scrollContainer) {
        scrollContainer.scrollTop = targetScrollTop
        const currentScrollTop = scrollContainer.scrollTop
        
        console.log(`[ContentList] 恢复滚动位置 (尝试 ${retryCount + 1}/${maxRetries}):`, {
          target: targetScrollTop,
          current: currentScrollTop,
          diff: Math.abs(currentScrollTop - targetScrollTop)
        })
        
        // 如果滚动位置差异较大，继续重试
        if (Math.abs(currentScrollTop - targetScrollTop) > 5 && retryCount < maxRetries) {
          retryCount++
          requestAnimationFrame(() => {
            setTimeout(tryRestore, 50)
          })
        } else if (Math.abs(currentScrollTop - targetScrollTop) <= 5) {
          console.log('[ContentList] 滚动位置恢复成功')
        }
      } else {
        // 如果找不到容器，继续重试
        if (retryCount < maxRetries) {
          retryCount++
          setTimeout(tryRestore, 100)
        } else {
          //console.warn('[ContentList] 无法找到滚动容器，恢复失败')
        }
      }
    }
    
    // 使用 nextTick 和 setTimeout 确保 DOM 已渲染
    nextTick(() => {
      setTimeout(tryRestore, 50)
    })
  } catch (e) {
    console.error('[ContentList] 恢复滚动位置失败:', e)
  }
}

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
const getAnchorKey = () => `contentlist_anchor_${props.merchantId || 'default'}_${props.tabKey || 'material'}`

// 格式化时间，去掉年份
function formatTimeWithoutYear(timeStr) {
  if (!timeStr) return ''
  // 处理格式：2024-01-15 10:30:00 -> 01-15 10:30:00
  // 或：2024-01-15 -> 01-15
  return timeStr.replace(/^\d{4}-/, '').replace(/^\d{4}\//, '')
}

// 从结果字符串中提取数字（如 "5连红" -> "5"）
function extractNumber(resultStr) {
  if (!resultStr) return ''
  const match = String(resultStr).match(/^(\d+)/)
  return match ? match[1] : ''
}

// 截断 resultType=3 的文案，超出长度显示省略号
function truncateResult(text, maxLen = 6) {
  if (!text) return ''
  const str = String(text)
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str
}

// 点击时展示完整文案
function showFullResult(text) {
  if (!text) return
  showToast.text(String(text))
}

function findScrollableParent(el) {
  let current = el?.parentElement
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current)
    const canScroll = /(auto|scroll)/.test(style.overflowY)
    if (canScroll && current.scrollHeight > current.clientHeight) {
      return current
    }
    current = current.parentElement
  }
  return document.scrollingElement || document.documentElement
}

function saveClickedAnchor(item, event) {
  const el = event?.currentTarget
  if (!el || !item?.id) return

  sessionStorage.setItem(
    getAnchorKey(),
    JSON.stringify({
      id: String(item.id),
      top: el.getBoundingClientRect().top
    })
  )
}

function restoreClickedAnchor() {
  const raw = sessionStorage.getItem(getAnchorKey())
  if (!raw) return

  let anchor
  try {
    anchor = JSON.parse(raw)
  } catch (_) {
    return
  }

  if (!anchor?.id || typeof anchor.top !== 'number') return

  let retryCount = 0
  const maxRetries = 12

  const tryRestore = () => {
    const items = document.querySelectorAll('.content-item[data-content-id]')
    const el = Array.from(items).find((node) => node.dataset.contentId === anchor.id)

    if (!el) {
      if (retryCount < maxRetries) {
        retryCount += 1
        setTimeout(tryRestore, 50)
      }
      return
    }

    const scrollParent = findScrollableParent(el)
    const currentTop = el.getBoundingClientRect().top
    scrollParent.scrollTop += currentTop - anchor.top
  }

  nextTick(() => {
    requestAnimationFrame(tryRestore)
  })
}

async function fetchPage(page = 1) {
  const params = {
    pageNum: page,
    pageSize: pageObj.pageSize,
    merchantId: props.merchantId,
    context: keyword.value || undefined,
    isPackage: 0,
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
      } else if (isPublic === 1 || predictResult === 1 || predictResult === 2) {
        kind = 'public' // 公开（免费可见）
      } else {
        kind = 'pay' // 付费（仅付费可见）
      }
      // 折扣， 0-50，0免费，1=1折， 2 = 2折， 3 = 3折， 10=无折扣，50=原价5倍
      const discount = r?.discount ?? 0
      // 价格文本：只有价格大于0时才显示
      const discountRate = discount / 10;
      const priceText = price >= 0 ? `${multiply(price, discountRate)}` : null
      const originalPriceText = discount < 10 && price > 0 ? `${price}` : null
      
      return {
        id: r?.id ?? `${pageObj.pageNum}-${idx}`,
        isPackage: r?.isPackage ?? 0,
        title: r?.title ?? '内容标题',
        time: formatTimeWithoutYear(r?.createTime ?? ''),
        views: r?.views ?? r?.viewCount ?? 0,
        corner: mapCorner(kind),
        result: r?.result ?? 0,
        resultType: r?.resultType ?? 0,
        shareFlag: r?.shareFlag ?? 0,
        refundFlag: r?.refundFlag ?? 0,
        packageId: r?.packageId ?? 0,
        packageIds: r?.packageIds ?? [],
        leftTag: mapPredictResult(predictResult),
        priceText: priceText,
        originalPriceText,
        discount,
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
    // 失败兜底 mock（也要支持“分页+搜索”体验）
    hasMoreData.value = false
    showToast.text('数据加载异常')
  } finally {
    if (reset) loading.value = false
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
  loadData(true)
}

function clearKeyword() {
  keyword.value = ''
  loadData(true)
}

watch(
  () => [props.merchantId, props.tabKey, props.filterValue],
  () => {
    if (isActive.value) loadData(true)
  }
)

// 监听滚动事件，保存滚动位置（使用节流优化性能）
let scrollTimer = null
const handleScroll = () => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  scrollTimer = setTimeout(() => {
    saveScrollPosition()
  }, 100)
}

// 绑定滚动事件
const bindScrollListener = () => {
  // 先清除之前的监听器
  if (scrollContainerEl && scrollListenerAttached) {
    scrollContainerEl.removeEventListener('scroll', handleScroll)
    scrollListenerAttached = false
  }
  
  // 重置容器引用，重新查找
  scrollContainerEl = null
  
  const tryBind = (retryCount = 0) => {
    // 使用 nextTick 确保 DOM 更新完成
    nextTick(() => {
      // 再等待一个微任务，确保 NutUI 组件完全渲染
      Promise.resolve().then(() => {
        const scrollContainer = getScrollContainer()
        if (scrollContainer) {
          if (!scrollListenerAttached) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
            scrollListenerAttached = true
            console.log('[ContentList] 滚动监听器已绑定', {
              container: scrollContainer,
              scrollHeight: scrollContainer.scrollHeight,
              clientHeight: scrollContainer.clientHeight
            })
          }
          // 恢复滚动位置
          restoreScrollPosition()
        } else if (retryCount < 10) {
          // 延迟重试，最多重试10次（增加重试次数，因为组件可能需要更长时间渲染）
          setTimeout(() => {
            tryBind(retryCount + 1)
          }, 100)
        } else {
          // console.warn('[ContentList] 无法找到滚动容器，绑定失败', {
          //   retryCount,
          //   pullRefreshRef: pullRefreshRef.value,
          //   rootExists: !!document.querySelector('.contentlist-root'),
          //   scrollExists: !!document.querySelector('.contentlist-scroll')
          // })
        }
      })
    })
  }
  
  tryBind()
}

onMounted(() => {
  console.log('[ContentList] onMounted, isActive:', isActive.value, 'merchantId:', props.merchantId)
  if (isActive.value) loadData(true)
  bindScrollListener()
})

// keep-alive 激活时恢复滚动位置
onActivated(() => {
  console.log('[ContentList] onActivated, isActive:', isActive.value, 'merchantId:', props.merchantId)
  // 重置状态，重新绑定
  scrollContainerEl = null
  scrollListenerAttached = false
  bindScrollListener()
  restoreClickedAnchor()
})

const toContentDetail = (item, event) => {
  saveClickedAnchor(item, event)
  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const contentId = encodeURIComponent(String(item.id))
  window.location.assign(`${normalizedBaseUrl}contentDetail?contentId=${contentId}&fromHome=1`)
}


</script>

<style scoped lang="scss">
@import './contentlist.scss';
</style>


