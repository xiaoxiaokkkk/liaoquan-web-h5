import assert from 'node:assert/strict'
import { buildMainTargetUrl } from '../src/utils/threeStepRedirect.js'

const mainOrigin = 'http://ls.hainanjunfeng.com'
const basePath = '/webh5/'

assert.equal(
  buildMainTargetUrl({ merchantId: 10001 }, mainOrigin, basePath),
  'http://ls.hainanjunfeng.com/webh5/enter?merchantId=10001'
)

assert.equal(
  buildMainTargetUrl({ contentId: 90001, userId: 20001 }, mainOrigin, basePath),
  'http://ls.hainanjunfeng.com/webh5/contentDetail?contentId=90001&userId=20001'
)

console.log('threeStepRedirect tests passed')
