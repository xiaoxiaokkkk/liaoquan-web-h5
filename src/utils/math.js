/**
 * 实现两个decimal数值相加，防止精度丢失
 * @param {number|string} a - 第一个数值
 * @param {number|string} b - 第二个数值
 * @returns {string} 相加结果，保留合适的小数位数
 */
export const add = (a, b) => {
  // 将输入转换为字符串处理
  const num1 = a.toString();
  const num2 = b.toString();
  
  // 获取小数位数
  const decimalPlaces1 = num1.split('.')[1] ? num1.split('.')[1].length : 0;
  const decimalPlaces2 = num2.split('.')[1] ? num2.split('.')[1].length : 0;
  
  // 获取最大小数位数
  const maxDecimalPlaces = Math.max(decimalPlaces1, decimalPlaces2);
  
  // 转换为整数运算避免精度问题
  const factor = Math.pow(10, maxDecimalPlaces);
  const result = (Math.round(parseFloat(num1) * factor) + Math.round(parseFloat(num2) * factor)) / factor;
  
  // 保留适当的小数位数
  return result.toFixed(maxDecimalPlaces);
};

/**
 * 实现两个decimal数值相乘，防止精度丢失
 * @param {number|string} a - 第一个数值
 * @param {number|string} b - 第二个数值
 * @param {number} decimalPlaces - 保留小数位数，默认2位
 * @returns {number} 相乘结果：会先按 decimalPlaces 做四舍五入，再自动去掉末尾无意义的 0（如 1.50 -> 1.5，2.00 -> 2）
 */
export const multiply = (a, b, decimalPlaces = 2) => {
  const n1 = Number(a)
  const n2 = Number(b)
  if (!Number.isFinite(n1) || !Number.isFinite(n2)) return 0

  // 将输入转换为字符串处理
  const num1 = a.toString();
  const num2 = b.toString();
  
  // 获取小数位数
  const decimalPlaces1 = num1.split('.')[1] ? num1.split('.')[1].length : 0;
  const decimalPlaces2 = num2.split('.')[1] ? num2.split('.')[1].length : 0;
  
  // 计算需要保留的总小数位数（两个数的小数位数之和）
  const totalDecimalPlaces = decimalPlaces1 + decimalPlaces2;
  
  // 转换为整数运算避免精度问题
  const factor1 = Math.pow(10, decimalPlaces1);
  const factor2 = Math.pow(10, decimalPlaces2);
  const int1 = Math.round(parseFloat(num1) * factor1);
  const int2 = Math.round(parseFloat(num2) * factor2);
  
  // 整数相乘，然后除以总的放大倍数
  const result = (int1 * int2) / (factor1 * factor2);
  
  // 先按指定小数位四舍五入，再去掉尾随 0（以及可能残留的小数点）
  const fixed = result.toFixed(decimalPlaces)
  const trimmed = fixed.includes('.') ? fixed.replace(/0+$/, '').replace(/\.$/, '') : fixed
  const normalized = trimmed === '-0' ? '0' : trimmed
  return Number(normalized)
};

export const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '0'
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * 格式化为带符号的定点小数（默认保留 2 位），正数/0 会带 "+"。
 * @param {number|string} value
 * @param {number} fractionDigits
 * @param {{ zeroSign?: boolean, suffix?: string }} options
 * @returns {string}
 */
export const formatSignedFixed = (value, fractionDigits = 2, options = {}) => {
  const { zeroSign = true, suffix = '' } = options || {}
  const num = Number(value)
  const safeNum = Number.isFinite(num) ? num : 0
  const sign = safeNum > 0 || (zeroSign && safeNum === 0) ? '+' : ''
  return `${sign}${safeNum.toFixed(fractionDigits)}${suffix}`
}

/**
 * 格式化为带符号的百分比字符串（默认保留 2 位），并自动追加 "%"。
 * @param {number|string} value
 * @param {number} fractionDigits
 * @param {{ zeroSign?: boolean }} options
 * @returns {string}
 */
export const formatSignedPercent = (value, fractionDigits = 2, options = {}) => {
  return formatSignedFixed(value, fractionDigits, { ...(options || {}), suffix: '%' })
}

/**
 * 将coin（分）转换为元（除以100），并处理浮点数精度问题
 * @param {number|string} coin - coin值（单位：分）
 * @param {number} decimalPlaces - 保留小数位数，默认2位
 * @returns {string} 格式化后的金额字符串
 */
export const formatCoin = (coin, decimalPlaces = 2) => {
  if (coin === undefined || coin === null || coin === '') return '0'
  
  const num = Number(coin)
  if (!Number.isFinite(num)) return '0'
  
  // 使用 Math.round 避免浮点数精度问题
  // 先将分转换为元，再四舍五入到指定小数位
  const yuan = Math.round(num) / 100
  return yuan.toFixed(decimalPlaces)
}