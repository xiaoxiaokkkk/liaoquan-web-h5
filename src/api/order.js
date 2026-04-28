import { post, get } from "@/utils/request";

/**
 * 获取订单列表
 * @param {Object} params - 请求参数: { pageNum: 1, pageSize: 10, type: 'instant' | 'timed' | 'package' }
 * @returns {Promise}
 */
export const getOrderList = (params) => {
  return get("/api/pay-record/list", params);
};

export const payOrder = (params) => {
  return post("/app/api/pay/v2/wakeUpPay", params);
};


