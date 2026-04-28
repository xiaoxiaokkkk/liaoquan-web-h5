/**
 * 公共表单校验工具函数
 */

/**
 * 校验邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return {
      valid: false,
      message: '请输入邮箱'
    }
  }
  
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: '请输入正确的邮箱格式'
    }
  }
  
  return {
    valid: true,
    message: ''
  }
}

/**
 * 校验手机号
 * @param {string} phone - 手机号
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      message: '请输入手机号'
    }
  }
  
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    return {
      valid: false,
      message: '请输入正确的手机号'
    }
  }
  
  return {
    valid: true,
    message: ''
  }
}

/**
 * 校验验证码
 * @param {string} code - 验证码
 * @param {number} minLength - 最小长度，默认6
 * @param {number} maxLength - 最大长度，默认6
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateCode(code, minLength = 6, maxLength = 6) {
  if (!code || code.trim() === '') {
    return {
      valid: false,
      message: '请输入验证码'
    }
  }
  
  // 验证码通常只包含数字
  const codeRegex = /^\d+$/
  if (!codeRegex.test(code)) {
    return {
      valid: false,
      message: '验证码只能包含数字'
    }
  }
  
  if (code.length < minLength || code.length > maxLength) {
    return {
      valid: false,
      message: `验证码长度应为${minLength}位`
    }
  }
  
  return {
    valid: true,
    message: ''
  }
}

/**
 * 校验数字
 * @param {string|number} value - 要校验的值
 * @param {Object} options - 校验选项
 * @param {number} options.min - 最小值
 * @param {number} options.max - 最大值
 * @param {boolean} options.allowDecimal - 是否允许小数，默认false
 * @param {boolean} options.allowNegative - 是否允许负数，默认false
 * @param {string} options.fieldName - 字段名称，用于错误提示
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateNumber(value, options = {}) {
  const {
    min,
    max,
    allowDecimal = false,
    allowNegative = false,
    fieldName = '数字',
    maxField = ''
  } = options
  
  if (value === '' || value === null || value === undefined) {
    return {
      valid: false,
      message: `请输入${fieldName}`
    }
  }
  
  // 转换为字符串进行校验
  const valueStr = String(value).trim()
  
  if (valueStr === '') {
    return {
      valid: false,
      message: `请输入${fieldName}`
    }
  }
  
  // 构建正则表达式
  let numberRegex
  if (allowDecimal) {
    numberRegex = allowNegative ? /^-?\d+(\.\d+)?$/ : /^\d+(\.\d+)?$/
  } else {
    numberRegex = allowNegative ? /^-?\d+$/ : /^\d+$/
  }
  
  if (!numberRegex.test(valueStr)) {
    return {
      valid: false,
      message: allowDecimal 
        ? `请输入正确的${fieldName}${allowNegative ? '（可包含小数和负数）' : '（可包含小数）'}`
        : `请输入正确的${fieldName}${allowNegative ? '（可为负数）' : ''}`
    }
  }
  
  const numValue = parseFloat(valueStr)
  
  if (isNaN(numValue)) {
    return {
      valid: false,
      message: `请输入有效的${fieldName}`
    }
  }
  
  if (min !== undefined && numValue < min) {
    return {
      valid: false,
      message: `${fieldName}不能小于${min}`
    }
  }
  
  if (max !== undefined && numValue > max) {
    return {
      valid: false,
      message: `${fieldName}不能大于${maxField || max}`
    }
  }
  
  return {
    valid: true,
    message: ''
  }
}

/**
 * 校验密码
 * @param {string} password - 密码
 * @param {number} minLength - 最小长度，默认6
 * @param {number} maxLength - 最大长度，默认20
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePassword(password, minLength = 6, maxLength = 20) {
  if (!password || password.trim() === '') {
    return {
      valid: false,
      message: '请输入密码'
    }
  }
  
  if (password.length < minLength) {
    return {
      valid: false,
      message: `密码长度不能少于${minLength}位`
    }
  }
  
  if (password.length > maxLength) {
    return {
      valid: false,
      message: `密码长度不能超过${maxLength}位`
    }
  }
  
  return {
    valid: true,
    message: ''
  }
}

/**
 * 校验确认密码
 * @param {string} password - 原密码
 * @param {string} confirmPassword - 确认密码
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return {
      valid: false,
      message: '请输入确认密码'
    }
  }
  
  if (password !== confirmPassword) {
    return {
      valid: false,
      message: '两次输入的密码不一致'
    }
  }
  
  return {
    valid: true,
    message: ''
  }
}

export function validateLength(value, minLength = 10, maxLength = 200, fieldName = '内容') {
  if (!value || value.trim() === '') {
    return {
      valid: false,
      message: `请输入${fieldName}`
    }
  }
  
  if (value.length < minLength) {
    return {
      valid: false,
      message: `${fieldName}长度不能少于${minLength}位`
    }
  }
  
  if (value.length > maxLength) {
    return {
      valid: false,
      message: `${fieldName}长度不能超过${maxLength}位`
    }
  }
  
  return {
    valid: true,
    message: ''
  }
}


// 校验交易哈希
export function validateTxHash(txHash) {
  if (!txHash || txHash.trim() === '') {
    return {
      valid: false,
      message: '请输入交易哈希'
    }
  }
  
  // 交易哈希通常是十六进制字符串，支持可选的 0x 或 0X 前缀
  const txHashTrimmed = txHash.trim()
  // 支持 0x 或 0X 前缀，后面跟数字和英文字母（a-z, A-Z）
  const hexRegex = /^(0x|0X)?[0-9a-zA-Z]+$/
  
  if (!hexRegex.test(txHashTrimmed)) {
    return {
      valid: false,
      message: '交易哈希格式不正确，只能包含数字和英文字母，可包含 0x 前缀'
    }
  }
  
  // 移除 0x 前缀后检查实际长度
  const hashWithoutPrefix = txHashTrimmed.replace(/^0x/i, '')
  
  // 交易哈希长度至少为32个字符
  if (hashWithoutPrefix.length < 32) {
    return {
      valid: false,
      message: '交易哈希长度不正确，至少需要32个字符'
    }
  }
  
  return {
    valid: true,
    message: ''
  }
}

/**
 * 校验 API Key 格式（只能包含英文字母和数字）
 * @param {string} apiKey - API Key
 * @param {number} minLength - 最小长度，默认10
 * @param {number} maxLength - 最大长度，默认200
 * @param {string} fieldName - 字段名称，默认 'API Key'
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateApiKey(apiKey, minLength = 10, maxLength = 200, fieldName = 'API Key') {
  if (!apiKey || apiKey.trim() === '') {
    return {
      valid: false,
      message: `请输入${fieldName}`
    }
  }

  const trimmed = apiKey.trim()

  // 检查长度
  if (trimmed.length < minLength) {
    return {
      valid: false,
      message: `${fieldName}长度不能少于${minLength}位`
    }
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      message: `${fieldName}长度不能超过${maxLength}位`
    }
  }

  // 检查是否只包含英文字母和数字
  const alphanumericRegex = /^[a-zA-Z0-9]+$/
  if (!alphanumericRegex.test(trimmed)) {
    return {
      valid: false,
      message: `${fieldName}只能包含英文字母和数字，不能包含中文或其他特殊字符`
    }
  }

  return {
    valid: true,
    message: ''
  }
}

/**
 * 判断并解析 JSON 字符串
 * @param {any} rawData - 原始数据（可能是字符串、Blob、ArrayBuffer 等）
 * @returns {Object} { isJson: boolean, data: any } - isJson 表示是否为 JSON，data 为解析后的数据或原始数据
 */
export function parseJsonIfValid(rawData) {
  // 非字符串数据（如 Blob、ArrayBuffer），直接返回
  if (typeof rawData !== 'string') {
    return {
      isJson: false,
      data: rawData
    }
  }

  const trimmed = rawData.trim()
  
  // JSON 字符串通常以 { 或 [ 开头和结尾
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(rawData)
      return {
        isJson: true,
        data: parsed
      }
    } catch (parseError) {
      // 解析失败，不是有效的 JSON
      return {
        isJson: false,
        data: rawData
      }
    }
  }
  
  // 不是 JSON 格式，作为普通文本处理
  return {
    isJson: false,
    data: rawData
  }
}