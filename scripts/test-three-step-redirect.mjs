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
  buildMainEnterUrl(query, 'https://ls.hainanjunfeng.com', '/webh5/'),
  'https://ls.hainanjunfeng.com/webh5/enter?merchantId=288948594&from=enter-page&empty='
)

assert.equal(
  buildAuthLoginUrl({
    authOrigin: 'https://ls.kaletao.cn',
    basePath: '/webh5/',
    redirectUrl: 'https://ls.hainanjunfeng.com/webh5/enter?merchantId=288948594'
  }),
  'https://ls.kaletao.cn/webh5/login?redirect=https%3A%2F%2Fls.hainanjunfeng.com%2Fwebh5%2Fenter%3FmerchantId%3D288948594'
)

assert.equal(
  buildTicketCallbackUrl({
    mainOrigin: 'https://ls.hainanjunfeng.com',
    basePath: '/webh5/',
    ticket: 'abc123',
    redirectPath: '/enter?merchantId=288948594'
  }),
  'https://ls.hainanjunfeng.com/webh5/auth-callback?ticket=abc123&redirect=%2Fenter%3FmerchantId%3D288948594'
)

assert.equal(
  isAllowedExternalRedirect(
    'https://ls.hainanjunfeng.com/webh5/enter?merchantId=1',
    ['https://ls.hainanjunfeng.com']
  ),
  true
)

assert.equal(
  isAllowedExternalRedirect(
    'https://evil.example/webh5/enter?merchantId=1',
    ['https://ls.hainanjunfeng.com']
  ),
  false
)

console.log('threeStepRedirect tests passed')
