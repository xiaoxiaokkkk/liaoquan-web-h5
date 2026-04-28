import { post, get } from "@/utils/request";

/**
 * 获取商户优惠卡列表
 * 不分页：接口直接返回全部数据
 * @param {Object} params - 请求参数: { merchantId: 1 }
 * @returns {Promise}
 */
export const getDiscardList = (params) => {
  return get("/api/merchant/card/list", params);
};


 /**
  * 获取用户优惠卡列表
  * @param {Object} params - 请求参数: { merchantId: 1 }
  * @returns {Promise}
  */
export const getUserCardList = (params) => {
  return get("/api/user/card/list", params);
};

/**
 * 获取用户已过期的优惠卡列表
 * @param {Object} params - 请求参数: { merchantId: 1 }
 * @returns {Promise}
 */
export const getUserExpiredCardList = (params) => {
  return get("/api/user/card/expired/list", params);
};
