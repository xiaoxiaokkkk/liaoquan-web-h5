const DEFAULT_BASE_PATH = '/webh5/'

export function normalizeBasePath(basePath = DEFAULT_BASE_PATH) {
  const raw = String(basePath || DEFAULT_BASE_PATH)
  if (raw === '/') return '/'
  return `/${raw.replace(/^\/+|\/+$/g, '')}/`
}

export function normalizeOrigin(origin) {
  return String(origin || '').replace(/\/+$/, '')
}

export function appendQuery(url, query = {}) {
  Object.entries(query || {}).forEach(([key, value]) => {
    if (key && value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })
  return url
}

export function buildMainEnterUrl(query, mainOrigin, basePath = DEFAULT_BASE_PATH) {
  const origin = normalizeOrigin(mainOrigin)
  if (!origin) {
    throw new Error('mainOrigin is required')
  }
  const url = new URL(`${normalizeBasePath(basePath)}jhhome`, origin)
  return appendQuery(url, query).toString()
}

export function buildMainContentDetailUrl(query, mainOrigin, basePath = DEFAULT_BASE_PATH) {
  const origin = normalizeOrigin(mainOrigin)
  if (!origin) {
    throw new Error('mainOrigin is required')
  }
  const url = new URL(`${normalizeBasePath(basePath)}contentDetail`, origin)
  return appendQuery(url, query).toString()
}

export function buildMainTargetUrl(query, mainOrigin, basePath = DEFAULT_BASE_PATH) {
  return query && query.contentId !== undefined && query.contentId !== null
    ? buildMainContentDetailUrl(query, mainOrigin, basePath)
    : buildMainEnterUrl(query, mainOrigin, basePath)
}

export function buildMainAuthCheckUrl({ mainOrigin, basePath = DEFAULT_BASE_PATH, redirectUrl, query = {} }) {
  const origin = normalizeOrigin(mainOrigin)
  if (!origin) {
    throw new Error('mainOrigin is required')
  }
  if (!redirectUrl) {
    throw new Error('redirectUrl is required')
  }
  const url = new URL(`${normalizeBasePath(basePath)}auth-check`, origin)
  url.searchParams.set('redirect', redirectUrl)
  ;['merchantId', 'userId', 'contentId'].forEach((key) => {
    const value = query?.[key]
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, Array.isArray(value) ? String(value[0] || '') : String(value))
    }
  })
  return url.toString()
}

export function buildAuthLoginUrl({ authOrigin, basePath = DEFAULT_BASE_PATH, redirectUrl }) {
  const origin = normalizeOrigin(authOrigin)
  if (!origin) {
    throw new Error('authOrigin is required')
  }
  if (!redirectUrl) {
    throw new Error('redirectUrl is required')
  }
  const url = new URL(`${normalizeBasePath(basePath)}login`, origin)
  url.searchParams.set('redirect', redirectUrl)
  return url.toString()
}

export function buildLoginCallbackUrl({ origin, basePath = DEFAULT_BASE_PATH, redirectUrl }) {
  const normalizedOrigin = normalizeOrigin(origin)
  if (!normalizedOrigin) {
    throw new Error('origin is required')
  }
  const url = new URL(`${normalizeBasePath(basePath)}login`, normalizedOrigin)
  if (redirectUrl) {
    url.searchParams.set('redirect', redirectUrl)
  }
  return url.toString()
}

export function buildTicketCallbackUrl({
  mainOrigin,
  basePath = DEFAULT_BASE_PATH,
  ticket,
  redirectPath
}) {
  const origin = normalizeOrigin(mainOrigin)
  if (!origin) {
    throw new Error('mainOrigin is required')
  }
  if (!ticket) {
    throw new Error('ticket is required')
  }
  const url = new URL(`${normalizeBasePath(basePath)}sso-callback`, origin)
  url.searchParams.set('ticket', ticket)
  if (redirectPath) {
    url.searchParams.set('redirect', redirectPath)
  }
  return url.toString()
}

export function sanitizeExternalRedirectPath(redirectUrl, basePath = DEFAULT_BASE_PATH) {
  const url = new URL(redirectUrl)
  const normalizedBase = normalizeBasePath(basePath).replace(/\/$/, '')
  const pathname = normalizedBase && normalizedBase !== '/' && url.pathname.startsWith(`${normalizedBase}/`)
    ? url.pathname.slice(normalizedBase.length) || '/'
    : url.pathname
  return `${pathname}${url.search}`
}

export function buildLoggedInExternalCallbackUrl({
  redirectUrl,
  ticket,
  mainOrigin,
  basePath = DEFAULT_BASE_PATH
}) {
  const targetUrl = new URL(redirectUrl)
  return buildTicketCallbackUrl({
    mainOrigin: mainOrigin || targetUrl.origin,
    basePath,
    ticket,
    redirectPath: sanitizeExternalRedirectPath(redirectUrl, basePath)
  })
}

export function normalizeInternalRedirectPath(rawRedirect, basePath = DEFAULT_BASE_PATH, fallback = '/jhhome') {
  const value = Array.isArray(rawRedirect)
    ? String(rawRedirect[0] || '')
    : String(rawRedirect || '')

  if (!value || value.startsWith('//') || /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) {
    return fallback
  }

  const [pathAndSearch, hash = ''] = value.split('#')
  const [pathname = '', search = ''] = pathAndSearch.split('?')
  const normalizedBase = normalizeBasePath(basePath).replace(/\/$/, '')
  const normalizedPath = normalizedBase && normalizedBase !== '/' && pathname.startsWith(`${normalizedBase}/`)
    ? pathname.slice(normalizedBase.length) || '/'
    : pathname

  if (!normalizedPath.startsWith('/') || normalizedPath === '/login') {
    return fallback
  }

  return `${normalizedPath}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`
}

export function normalizeInternalRedirectLocation(rawRedirect, basePath = DEFAULT_BASE_PATH, fallback = '/jhhome') {
  const normalized = normalizeInternalRedirectPath(rawRedirect, basePath, fallback)
  const [pathAndSearch, hash = ''] = normalized.split('#')
  const [path = fallback, search = ''] = pathAndSearch.split('?')
  const query = {}
  new URLSearchParams(search).forEach((value, key) => {
    query[key] = value
  })

  return {
    path,
    ...(Object.keys(query).length ? { query } : {}),
    ...(hash ? { hash: `#${hash}` } : {})
  }
}

export function getAllowedRedirectOrigins() {
  return String(import.meta.env.VITE_THREE_STEP_ALLOWED_REDIRECT_ORIGINS || '')
    .split(',')
    .map(item => normalizeOrigin(item.trim()))
    .filter(Boolean)
}

export function isAllowedExternalRedirect(redirectUrl, allowedOrigins = getAllowedRedirectOrigins()) {
  try {
    const url = new URL(redirectUrl)
    return allowedOrigins.map(normalizeOrigin).includes(url.origin)
  } catch (e) {
    return false
  }
}

export function getThreeStepAuthOrigin() {
  return normalizeOrigin(import.meta.env.VITE_THREE_STEP_AUTH_ORIGIN || '')
}

export function getThreeStepMainOrigin() {
  return normalizeOrigin(import.meta.env.VITE_THREE_STEP_MAIN_ORIGIN || '')
}
