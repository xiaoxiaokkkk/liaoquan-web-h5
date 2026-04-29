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
  const url = new URL(`${normalizeBasePath(basePath)}enter`, origin)
  return appendQuery(url, query).toString()
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
  const url = new URL(`${normalizeBasePath(basePath)}auth-callback`, origin)
  url.searchParams.set('ticket', ticket)
  if (redirectPath) {
    url.searchParams.set('redirect', redirectPath)
  }
  return url.toString()
}

export function sanitizeExternalRedirectPath(redirectUrl) {
  const url = new URL(redirectUrl)
  const pathname = url.pathname.replace(/^\/webh5/, '') || '/'
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
    redirectPath: sanitizeExternalRedirectPath(redirectUrl)
  })
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
