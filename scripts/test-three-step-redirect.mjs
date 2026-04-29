import assert from 'node:assert/strict'

import {
  buildAuthLoginUrl,
  buildMainEnterUrl,
  buildTicketCallbackUrl,
  isAllowedExternalRedirect
} from '../src/utils/threeStepRedirect.js'

const query = {
  merchantId: '288948594',
  from: 'enter-page',
  empty: '',
  skip: undefined
}

assert.equal(
  buildMainEnterUrl(query, 'https://t.hainanjunfeng.com', '/webh5/'),
  'https://t.hainanjunfeng.com/webh5/enter?merchantId=288948594&from=enter-page&empty='
)

assert.equal(
  buildAuthLoginUrl({
    authOrigin: 'https://ls.tyliao.cn',
    basePath: '/webh5/',
    redirectUrl: 'https://t.hainanjunfeng.com/webh5/enter?merchantId=288948594'
  }),
  'https://ls.tyliao.cn/webh5/login?redirect=https%3A%2F%2Ft.hainanjunfeng.com%2Fwebh5%2Fenter%3FmerchantId%3D288948594'
)

assert.equal(
  buildTicketCallbackUrl({
    mainOrigin: 'https://t.hainanjunfeng.com',
    basePath: '/webh5/',
    ticket: 'abc123',
    redirectPath: '/enter?merchantId=288948594'
  }),
  'https://t.hainanjunfeng.com/webh5/auth-callback?ticket=abc123&redirect=%2Fenter%3FmerchantId%3D288948594'
)

assert.equal(
  isAllowedExternalRedirect(
    'https://t.hainanjunfeng.com/webh5/enter?merchantId=1',
    ['https://t.hainanjunfeng.com']
  ),
  true
)

assert.equal(
  isAllowedExternalRedirect(
    'https://evil.example/webh5/enter?merchantId=1',
    ['https://t.hainanjunfeng.com']
  ),
  false
)

console.log('threeStepRedirect tests passed')
