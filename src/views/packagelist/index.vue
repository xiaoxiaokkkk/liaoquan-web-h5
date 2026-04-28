<template>
  <div class="packagelist-root">
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
      class="packagelist-scroll"
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
          <div class="package-list">
            <div
              v-for="(item, index) in displayList"
              :key="getItemKey(item, index)"
              class="package-card"
              @click="toContentDetail(item)"
            >
              <div class="left">
                <!-- <img class="package-img" :src="item.img" alt="" /> -->
                <img class="package-img" src="@/assets/images/home/pkg.png" alt="">
              </div>
              <div class="right">
                <div class="content-left">
                  <div class="title">
                    <span class="title-text">{{ item.title }}</span>
                  </div>
                  <div class="desc">
                    <span class="desc-text">{{ item.time }}</span>
                  </div>
                </div>
                <div class="content-right">
                  <div class="price">
                    <span class="price-text">
                      {{ item.price }}
                      <span class="price-unit">元</span>
                    </span>
                  </div>
                </div>
              </div>
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
import { getPackageList } from '@/api/package'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'PackageList'
})

const router = useRouter()

const props = defineProps({
  merchantId: { type: [Number, String], default: 1 },
  tabKey: { type: String, default: '' },
  filterValue: { type: String, default: 'all' }
})

import imgClose from '@/assets/images/home/close.png'
import imgSearch from '@/assets/images/home/search.png'

const pullRefreshRef = ref(null)
let scrollContainerEl = null
let scrollListenerAttached = false

const keyword = ref('')
const refreshing = ref(false)
const infiniteLoading = ref(false)
const hasMoreData = ref(true)
const loading = ref(false)

// 滚动位置缓存 key
const getScrollKey = () => `packagelist_scroll_${props.merchantId || 'default'}_${props.tabKey || 'package'}`

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
      container = el.closest('.packagelist-scroll')?.querySelector('.nut-pull-refresh__body')
      if (container) {
        scrollContainerEl = container
        return container
      }
    }
  }
  
  // 方法2：通过模板 ref 查找（如果 pullRefreshRef 指向的是 class="packagelist-scroll" 的元素）
  // 注意：这里 pullRefreshRef 实际指向的是 nut-pull-refresh 组件，不是 .packagelist-scroll
  
  // 方法3：通过类名查找当前组件内的滚动容器
  // 使用更精确的选择器，通过父级容器限制范围
  const rootEls = document.querySelectorAll('.packagelist-root')
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
      const container = rootEl.querySelector('.packagelist-scroll .nut-pull-refresh__body')
      if (container) {
        scrollContainerEl = container
        return container
      }
    }
  }
  
  // 方法4：全局查找可见的滚动容器
  const containers = document.querySelectorAll('.packagelist-scroll .nut-pull-refresh__body')
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
  
  // 方法5：备选方案 - 如果找不到 .nut-pull-refresh__body，尝试使用 .packagelist-scroll 本身
  // 检查样式，如果它有 overflow-y: auto 或 scroll，可以作为滚动容器
  const scrollEls = document.querySelectorAll('.packagelist-scroll')
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
        console.log('[PackageList] 使用备选方案：.packagelist-scroll 作为滚动容器')
        return scrollEl
      }
    }
  }
  
  // console.warn('[PackageList] getScrollContainer: 所有方法都未找到滚动容器', {
  //   pullRefreshRef: pullRefreshRef.value,
  //   rootElsCount: document.querySelectorAll('.packagelist-root').length,
  //   containersCount: document.querySelectorAll('.nut-pull-refresh__body').length,
  //   scrollElsCount: document.querySelectorAll('.packagelist-scroll').length
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
      console.log('[PackageList] 保存滚动位置:', key, scrollTop)
    } else {
      //console.warn('[PackageList] 无法找到滚动容器，无法保存滚动位置')
    }
  } catch (e) {
    console.error('[PackageList] 保存滚动位置失败:', e)
  }
}

// 恢复滚动位置（使用多次重试确保成功）
const restoreScrollPosition = () => {
  try {
    const key = getScrollKey()
    const savedScrollTop = sessionStorage.getItem(key)
    console.log('[PackageList] 尝试恢复滚动位置:', key, savedScrollTop)
    
    if (!savedScrollTop || Number(savedScrollTop) <= 0) {
      console.log('[PackageList] 没有保存的滚动位置，跳过恢复')
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
        
        console.log(`[PackageList] 恢复滚动位置 (尝试 ${retryCount + 1}/${maxRetries}):`, {
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
          console.log('[PackageList] 滚动位置恢复成功')
        }
      } else {
        // 如果找不到容器，继续重试
        if (retryCount < maxRetries) {
          retryCount++
          setTimeout(tryRestore, 100)
        } else {
          //console.warn('[PackageList] 无法找到滚动容器，恢复失败')
        }
      }
    }
    
    // 使用 nextTick 和 setTimeout 确保 DOM 已渲染
    nextTick(() => {
      setTimeout(tryRestore, 50)
    })
  } catch (e) {
    console.error('[PackageList] 恢复滚动位置失败:', e)
  }
}

const pageObj = reactive({
  pageNum: 1,
  pageSize: 10
})

const displayList = ref([])

const isActive = computed(() => props.tabKey === 'package')
const getItemKey = (item, index) => item?.id ?? `package-${index}`

function matchByKeyword(item) {
  const kw = keyword.value.trim()
  if (!kw) return true
  const t = item?.title ? String(item.title) : ''
  return t.includes(kw)
}

async function fetchPage(page = 1) {
  const params = {
    pageNum: page,
    pageSize: pageObj.pageSize,
    merchantId: props.merchantId,
    isPackage: 1
  }
  return await getPackageList(params)
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
  if (reset) {
    pageObj.pageNum = 1
    hasMoreData.value = true
    loading.value = true
  }

  if (!hasMoreData.value && !reset) return
  if (!isActive.value) return

  try {
    const res = await fetchPage(pageObj.pageNum)
    const { list, hasMore } = normalizeListResponse(res, pageObj.pageNum)

    const mapped = list
      .map((r, idx) => {
        const price = Number(r?.price ?? r?.amount ?? r?.money ?? 0)
        return {
          id: r?.id ?? `${pageObj.pageNum}-${idx}`,
          title: r?.title ?? r?.cardName ?? r?.name ?? '套餐',
          time: r?.time ?? r?.createTime ?? r?.createdAt ?? '',
          price: price > 0 ? price : 0,
          img: r?.img ?? r?.cover ?? r?.pic ?? ''
        }
      })
      .filter(matchByKeyword)

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
    console.error('加载套餐列表失败:', e)
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
  () => [props.merchantId, props.tabKey],
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
            console.log('[PackageList] 滚动监听器已绑定', {
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
          // console.warn('[PackageList] 无法找到滚动容器，绑定失败', {
          //   retryCount,
          //   pullRefreshRef: pullRefreshRef.value,
          //   rootExists: !!document.querySelector('.packagelist-root'),
          //   scrollExists: !!document.querySelector('.packagelist-scroll')
          // })
        }
      })
    })
  }
  
  tryBind()
}

const toContentDetail = (item) => {
  router.push('/contentDetail?contentId=' + item.id)
}

onMounted(() => {
  console.log('[PackageList] onMounted, isActive:', isActive.value, 'merchantId:', props.merchantId)
  if (isActive.value) loadData(true)
  bindScrollListener()
})

// keep-alive 激活时恢复滚动位置
onActivated(() => {
  console.log('[PackageList] onActivated, isActive:', isActive.value, 'merchantId:', props.merchantId)
  // 重置状态，重新绑定
  scrollContainerEl = null
  scrollListenerAttached = false
  bindScrollListener()
})
</script>
<style lang="scss" scoped>
@import './packagelist.scss';
</style>