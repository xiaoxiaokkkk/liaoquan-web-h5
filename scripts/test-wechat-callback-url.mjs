import assert from 'node:assert/strict'

import { buildLoginCallbackUrl } from '../src/utils/threeStepRedirect.js'

assert.equal(
  buildLoginCallbackUrl({
    origin: 'http://ls.tyliao.cn',
    basePath: '/webh5/',
    redirectUrl: 'http://ls.hainanjunfeng.com/webh5/enter?merchantId=979301752'
  }),
  'http://ls.tyliao.cn/webh5/login?redirect=http%3A%2F%2Fls.hainanjunfeng.com%2Fwebh5%2Fenter%3FmerchantId%3D979301752'
)

assert.equal(
  buildLoginCallbackUrl({
    origin: 'http://ls.tyliao.cn',
    basePath: '/webh5/'
  }),
  'http://ls.tyliao.cn/webh5/login'
)

console.log('wechat callback url tests passed')