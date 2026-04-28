import { post, get } from "@/utils/request";

/**
 * 获取可用的优惠券列表
 * @param {Object} params - 请求参数: { pageNum: 1, pageSize: 10, merchantId: 1 }
 * code	String	状态码，"0"表示成功
 *   message	String	响应消息
 *   service	String	服务名称
 *   data	UserBenefitAvailableVO	可用优惠卡/优惠券结果
 * @returns {Promise}
 */
export const getAvailableCouponList = (params) => {
  return get("/api/user/coupon/available", params);
};

/**
 * 获取用户优惠券列表
 * @param {Object} params - 请求参数: { userId: 1 }
 * @returns {Promise}
 */
export const getUnusedCouponList = (params) => {
  return get("/api/user/coupon/list", params);
};

/**
 * 获取已使用的优惠券列表
 * @param {Object} params - 请求参数: { userId: 1 }
 * @returns {Promise}
 */
export const getUsedCouponList = (params) => {
  return get("/api/user/coupon/used/list", params);
};

/**
 * 获取已过期的优惠券列表
 * @param {Object} params - 请求参数: { userId: 1 }
 * @returns {Promise}
 */
export const getExpiredCouponList = (params) => {
  return get("/api/user/coupon/expired/list", params);
};