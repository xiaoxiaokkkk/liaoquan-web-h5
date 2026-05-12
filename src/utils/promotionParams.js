const STORAGE_KEY = 'promotion_params_v1'

function normalizeValue(value) {
  if (value == null) return undefined
  if (Array.isArray(value)) return value.length ? String(value[0]) : undefined
  const normalized = String(value)
  return normalized && normalized !== 'undefined' && normalized !== 'null' ? normalized : undefined
}

export function savePromotionParams(params = {}) {
  const superiorId = normalizeValue(params.superiorId ?? params.userId)
  const merchantId = normalizeValue(params.merchantId)
  if (!superiorId && !merchantId) return

  try {
    const prev = getSavedPromotionParams()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...prev,
      ...(superiorId ? { superiorId } : {}),
      ...(merchantId ? { merchantId } : {})
    }))
  } catch (_) {
    // ignore
  }
}

export function savePromotionParamsFromUrl() {
  try {
    const searchParams = new URLSearchParams(window.location.search)
    savePromotionParams({
      merchantId: searchParams.get('merchantId'),
      userId: searchParams.get('userId'),
      superiorId: searchParams.get('superiorId')
    })
  } catch (_) {
    // ignore
  }
}

export function getSavedPromotionParams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (_) {
    return {}
  }
}
