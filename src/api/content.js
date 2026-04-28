import { post, get } from "@/utils/request";

/**
 * 获取内容列表
 * @param {Object} params - 请求参数: { pageNum: 1, pageSize: 10, merchantId: 1 }
 * @returns {Promise}
 */
export const getContentList = (params) => {
  return get("/user/content/list/match", params);
};

export const getContentDetail = (contentId, params) => {
  return get(`/user/content/detail/${contentId}`, params);
};

// post 请求，参数 merchantId
export const saveLastMerchant = (merchantId) => {
  return post('/user/content/last/merchant/save?merchantId=' + merchantId, {});
};

// get 请求，参数 merchantId
// export const getLastMerchant = () => {
//   return get('/user/content/last/merchant/get', {});
// };
