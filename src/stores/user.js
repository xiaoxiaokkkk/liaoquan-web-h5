import { defineStore } from 'pinia'

/**
 * 用户状态管理 Store
 * 用于管理用户 token、用户信息等
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '', // 从 localStorage 读取 token
    userInfo: null, // 用户信息
  }),
  // state: () => {
  //   // 从 localStorage 读取 token
  //   let token = localStorage.getItem('token') || ''
    
  //   // 开发环境：如果没有 token，自动设置测试 token（方便测试，生产环境请删除或注释）
  //   if (!token && import.meta.env.DEV) {
  //     // 方式1：使用环境变量配置测试 token（推荐）
  //     const testToken = import.meta.env.VITE_TEST_TOKEN
  //     if (testToken) {
  //       token = testToken
  //       localStorage.setItem('token', token)
  //       console.log('[DEV] 已自动设置测试 token（来自 VITE_TEST_TOKEN）')
  //     }
  //     // 方式2：直接写死测试 token（不推荐，但方便快速测试）
  //     // 取消下面的注释并填入你的测试 token：
  //     // else {
  //     //   token = '你的测试token字符串'
  //     //   localStorage.setItem('token', token)
  //     //   console.log('[DEV] 已自动设置测试 token（写死）')
  //     // }
  //   }
    
  //   return {
  //     token, // 从 localStorage 读取 token
  //     userInfo: null, // 用户信息
  //   }
  // },

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
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },

    /**
     * 设置用户信息
     * @param {Object} userInfo - 用户信息对象
     */
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      // 如果需要持久化用户信息，可以存储到 localStorage
      if (userInfo) {
        if (!userInfo.avatar) {
          userInfo.avatar = '@/assets/images/avatar@1x.png'
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      } else {
        localStorage.removeItem('userInfo')
      }
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
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },

    /**
     * 初始化用户信息（从 localStorage 恢复）
     */
    initUserInfo() {
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        try {
          this.userInfo = JSON.parse(storedUserInfo)
        } catch (error) {
          console.error('Failed to parse userInfo from localStorage:', error)
          localStorage.removeItem('userInfo')
        }
      }
    },
  },
})

