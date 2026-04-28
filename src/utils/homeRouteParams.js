const STORAGE_KEY = 'home_route_params_v1'
const EXCLUDE_STORAGE_KEYS = new Set(['userId', 'tab'])

function normalizeQueryValue(v) {
  if (v == null) return undefined
  if (Array.isArray(v)) return v.length ? String(v[0]) : undefined
  const s = String(v)
  return s === 'undefined' || s === 'null' || s === '' ? undefined : s
}

/**
 * 从 route-like 对象提取 query，并把 params 里的 merchantId/userId/tab 合并进来（兼容老写法）。
 * @param {{ query?: any, params?: any }} routeLike
 * @returns {Record<string, string>}
 */
export function extractHomeRouteParams(routeLike = {}) {
  const q = routeLike?.query || {}
  const p = routeLike?.params || {}

  const out = {}
  // 先复制 query（只保留 string 值）
  for (const k of Object.keys(q || {})) {
    const vv = normalizeQueryValue(q[k])
    if (vv !== undefined) out[k] = vv
  }

  // params 兜底补充
  const merchantId = normalizeQueryValue(p?.merchantId)
  const userId = normalizeQueryValue(p?.userId)
  const tab = normalizeQueryValue(p?.tab)
  if (merchantId !== undefined && out.merchantId === undefined) out.merchantId = merchantId
  if (userId !== undefined && out.userId === undefined) out.userId = userId
  if (tab !== undefined && out.tab === undefined) out.tab = tab

  return out
}

export function getSavedHomeRouteParams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const obj = JSON.parse(raw)
    if (!obj || typeof obj !== 'object') return null
    // 再 normalize 一次，避免存进来的值不是 string
    return extractHomeRouteParams({ query: obj })
  } catch (_) {
    return null
  }
}

/**
 * 保存（合并写入）Home 相关参数。传入 route-like（route/to）对象即可。
 */
export function saveHomeRouteParams(routeLike = {}) {
  try {
    const nextParams = extractHomeRouteParams(routeLike)
    if (!nextParams || Object.keys(nextParams).length === 0) return

    const prev = getSavedHomeRouteParams() || {}
    // next 覆盖 prev（以路由为准）
    const merged = { ...prev, ...nextParams }
    // 不存储 userId/tab：只保留 merchantId 等必要参数，避免切换 tabbar 时携带不必要的上下文
    for (const k of EXCLUDE_STORAGE_KEYS) {
      if (k in merged) delete merged[k]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch (_) {
    // ignore
  }
}

/**
 * 合并：优先使用路由参数；路由缺失的字段用 localStorage 补。
 */
export function mergeHomeRouteParams(routeLike = {}) {
  const saved = getSavedHomeRouteParams() || {}
  const fromRoute = extractHomeRouteParams(routeLike)
  return { ...saved, ...fromRoute }
}


