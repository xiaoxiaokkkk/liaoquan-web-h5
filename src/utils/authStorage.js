const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

function getDefaultStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage
}

export function readStoredAuth(storage = getDefaultStorage()) {
  if (!storage) return { token: '', userInfo: null }

  const token = storage.getItem(TOKEN_KEY) || ''
  const rawUserInfo = storage.getItem(USER_INFO_KEY)
  if (!rawUserInfo) return { token, userInfo: null }

  try {
    const userInfo = JSON.parse(rawUserInfo)
    return { token, userInfo: userInfo && typeof userInfo === 'object' ? userInfo : null }
  } catch (_) {
    storage.removeItem(USER_INFO_KEY)
    return { token, userInfo: null }
  }
}

export function writeStoredToken(token, storage = getDefaultStorage()) {
  if (!storage) return
  if (token) {
    storage.setItem(TOKEN_KEY, String(token))
  } else {
    storage.removeItem(TOKEN_KEY)
  }
}

export function writeStoredUserInfo(userInfo, storage = getDefaultStorage()) {
  if (!storage) return
  if (userInfo) {
    storage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  } else {
    storage.removeItem(USER_INFO_KEY)
  }
}

export function clearStoredAuth(storage = getDefaultStorage()) {
  if (!storage) return
  storage.removeItem(TOKEN_KEY)
  storage.removeItem(USER_INFO_KEY)
}
