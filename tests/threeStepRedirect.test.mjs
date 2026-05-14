import assert from 'node:assert/strict'
import {
  buildLoggedInExternalCallbackUrl,
  buildMainTargetUrl,
  normalizeInternalRedirectLocation,
  normalizeInternalRedirectPath,
  sanitizeExternalRedirectPath
} from '../src/utils/threeStepRedirect.js'

const mainOrigin = 'http://ls.hainanjunfeng.com'
const basePath = '/webh5/'

assert.equal(
  buildMainTargetUrl({ merchantId: 10001, userId: 20001 }, mainOrigin, basePath),
  'http://ls.hainanjunfeng.com/webh5/jhhome?merchantId=10001&userId=20001'
)

assert.equal(
  buildMainTargetUrl({ contentId: 90001, userId: 20001 }, mainOrigin, basePath),
  'http://ls.hainanjunfeng.com/webh5/contentDetail?contentId=90001&userId=20001'
)

assert.equal(
  sanitizeExternalRedirectPath('http://ls.hainanjunfeng.com/webh5/jhhome?merchantId=10001&userId=20001', basePath),
  '/jhhome?merchantId=10001&userId=20001'
)

const callbackUrl = new URL(buildLoggedInExternalCallbackUrl({
  redirectUrl: 'http://ls.hainanjunfeng.com/webh5/jhhome?merchantId=10001&userId=20001',
  ticket: 'ticket123',
  mainOrigin,
  basePath,
  nonce: 'nonce123'
}))
assert.equal(callbackUrl.origin, mainOrigin)
assert.equal(callbackUrl.pathname, '/webh5/sso-callback/nonce123')
assert.equal(callbackUrl.searchParams.get('ticket'), 'ticket123')
assert.equal(callbackUrl.searchParams.get('redirect'), '/jhhome?merchantId=10001&userId=20001')

assert.equal(normalizeInternalRedirectPath('/webh5/jhhome?merchantId=10001', basePath), '/jhhome?merchantId=10001')
assert.equal(normalizeInternalRedirectPath('/jhhome?merchantId=10001', basePath), '/jhhome?merchantId=10001')
assert.equal(normalizeInternalRedirectPath('/login?redirect=/mine', basePath), '/jhhome')
assert.equal(normalizeInternalRedirectPath('//evil.example/path', basePath), '/jhhome')
assert.equal(normalizeInternalRedirectPath('http://evil.example/path', basePath), '/jhhome')
assert.deepEqual(normalizeInternalRedirectLocation('/webh5/jhhome?merchantId=10001&userId=20001#top', basePath), {
  path: '/jhhome',
  query: { merchantId: '10001', userId: '20001' },
  hash: '#top'
})

console.log('threeStepRedirect tests passed')
