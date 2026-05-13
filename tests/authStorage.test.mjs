import assert from 'node:assert/strict'
import {
  clearStoredAuth,
  readStoredAuth,
  writeStoredToken,
  writeStoredUserInfo
} from '../src/utils/authStorage.js'

function createStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, value) {
      data.set(key, String(value))
    },
    removeItem(key) {
      data.delete(key)
    }
  }
}

const storage = createStorage()
assert.deepEqual(readStoredAuth(storage), { token: '', userInfo: null })

writeStoredToken('token-abc', storage)
writeStoredUserInfo({ userid: 128, nickname: 'tester' }, storage)
assert.deepEqual(readStoredAuth(storage), {
  token: 'token-abc',
  userInfo: { userid: 128, nickname: 'tester' }
})

writeStoredToken('', storage)
assert.equal(readStoredAuth(storage).token, '')

const brokenStorage = createStorage({ token: 'token-xyz', userInfo: '{bad json' })
assert.deepEqual(readStoredAuth(brokenStorage), { token: 'token-xyz', userInfo: null })

clearStoredAuth(brokenStorage)
assert.deepEqual(readStoredAuth(brokenStorage), { token: '', userInfo: null })

console.log('authStorage tests passed')
