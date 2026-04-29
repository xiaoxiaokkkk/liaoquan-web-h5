import { post, get } from "@/utils/request";

/**
 * 微信H5授权登录（后端接口：/api/user/wechat/login/v2）
 * @param {Object} data
 * @param {string} data.code - 微信网页授权回调 code
 * @param {number} data.isH5 - H5标识：1
 * @param {string} [data.channel] - 渠道标识（如 h5）
 * @param {string} [data.imei] - 设备标识（前端可自生成并持久化）
 * @returns {Promise}
 */
export const wechatLogin = (data) => {
  // 后端参数没有 @RequestBody，需要发送表单格式（application/x-www-form-urlencoded）
  // 而不是 JSON 格式（application/json）
  const formData = new URLSearchParams()
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key])
    }
  })
  
  return post("/api/user/wechat/login/v2", formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
};

export const createCrossDomainTicket = () => {
  return post("/api/user/auth/ticket/create", {})
};

export const exchangeCrossDomainTicket = (data) => {
  const formData = new URLSearchParams()
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key])
    }
  })

  return post("/api/user/auth/ticket/exchange", formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
};

// 获取用户信息
export const getUserInfo = (data) => {
  const formData = new URLSearchParams()
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key])
    }
  })
  
  return post("/api/user/info/v2", formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
};

/**
 * 用户绑定推广关系
 * @param {*} data 
 * @returns 
 */
export const bindPromotion = (data) => {
  const formData = new URLSearchParams()
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key])
    }
  })
  return post("/merchant/content/user/promotion/bind", formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}


/**
 * 分享人数统计回调
 * @param {*} data 
 * @returns 
 */
export const shareCallback = (data) => {
  const formData = new URLSearchParams()
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key])
    }
  })
  return post("/merchant/content/share/callback", formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 添加关注
 * @param {*} data 
 * @returns 
 */
export const addAttention = (data) => {
  const formData = new URLSearchParams()
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key])
    }
  })
  return post("/api/attention/add", formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export const getMerchantByName = (params) => {
  return get("/api/user/getMerchantByName", params);
};

export const getFollowMerchantList = (data) => {
  const formData = new URLSearchParams()
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key])
    }
  })
  return post("/api/attention/list", formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
};
