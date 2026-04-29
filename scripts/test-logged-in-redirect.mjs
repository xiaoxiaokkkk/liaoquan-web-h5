import assert from 'node:assert/strict'

import {
  buildLoggedInExternalCallbackUrl,
  sanitizeExternalRedirectPath
} from '../src/utils/threeStepRedirect.js'

assert.equal(
  sanitizeExternalRedirectPath('http://t.hainanjunfeng.com/webh5/enter?merchantId=979301752'),
  '/enter?merchantId=979301752'
)

assert.equal(
  sanitizeExternalRedirectPath('http://t.hainanjunfeng.com/webh5/lqindex?merchantId=979301752'),
  '/lqindex?merchantId=979301752'
)

assert.equal(
  buildLoggedInExternalCallbackUrl({
    redirectUrl: 'http://t.hainanjunfeng.com/webh5/enter?merchantId=979301752',
    ticket: 'ticket-1',
    mainOrigin: 'http://t.hainanjunfeng.com',
    basePath: '/webh5/'
  }),
  'http://t.hainanjunfeng.com/webh5/auth-callback?ticket=ticket-1&redirect=%2Fenter%3FmerchantId%3D979301752'
)

console.log('logged-in redirect tests passed')