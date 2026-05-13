import { defineStore } from 'pinia'
import {
  clearStoredAuth,
  readStoredAuth,
  writeStoredToken,
  writeStoredUserInfo
} from '@/utils/authStorage'

/**
 * 用户状态管理 Store
 * 用于管理用户 token、用户信息等
 */
export const useUserStore = defineStore('user', {
  state: () => {
    const { token, userInfo } = readStoredAuth()
    return {
      token,
      userInfo,
    }
  },

  getters: {
    /**
     * 是否已登录
     */
    isLoggedIn: (state) => !!state.token,

    /**
     * 获取 token
     */
    getToken: (state) => state.token,
  },

  actions: {
    /**
     * 设置 token
     * @param {string} token - 用户 token
     */
    setToken(token) {
      this.token = token || ''
      writeStoredToken(this.token)
    },

    /**
     * 设置用户信息
     * @param {Object} userInfo - 用户信息对象
     */
    setUserInfo(userInfo) {
      const normalizedUserInfo = userInfo ? { ...userInfo } : null
      if (normalizedUserInfo && !normalizedUserInfo.avatar) {
        normalizedUserInfo.avatar = '@/assets/images/avatar@1x.png'
      }
      this.userInfo = normalizedUserInfo
      writeStoredUserInfo(normalizedUserInfo)
    },

    /**
     * 登录
     * @param {string} token - 用户 token
     * @param {Object} userInfo - 用户信息
     */
    login(token, userInfo = null) {
      this.setToken(token)
      if (userInfo) {
        this.setUserInfo(userInfo)
      }
    },

    /**
     * 退出登录
     */
    logout() {
      this.token = ''
      this.userInfo = null
      clearStoredAuth()
    },

    /**
     * 初始化登录态（从 localStorage 恢复）
     */
    initFromStorage() {
      const { token, userInfo } = readStoredAuth()
      this.token = token
      this.userInfo = userInfo
    },

    /**
     * 兼容旧调用：初始化用户信息和 token
     */
    initUserInfo() {
      this.initFromStorage()
    },
  },
})

