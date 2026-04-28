import { post, get } from "@/utils/request";

/**
 * 获取内容列表
 * @param {Object} params - 请求参数: { pageNum: 1, pageSize: 10, merchantId: 1 }
 * @returns {Promise}
 */
export const getPackageList = (params) => {
  return get("/user/content/list", params);
};

