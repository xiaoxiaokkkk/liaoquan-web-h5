// import Vue from 'vue'
import {
  createRouter,
  // createWebHashHistory,
  createWebHistory
} from 'vue-router'


import { constantRouterMap } from './router.config.js'
import { useUserStore } from '@/stores/user'
import { getSavedHomeRouteParams, saveHomeRouteParams } from '@/utils/homeRouteParams'

// const originalPush = Router.prototype.push
// Router.prototype.push = function push(location, onResolve, onReject) {
//   if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
//   return originalPush.call(this, location).catch(err => err)
// }

// 获取基础路径，与 Vite 的 base 保持一致
// 统一规范化：确保 basePath 形如 '/' 或 '/webh5/'（前后都有 /）
const rawBasePath = import.meta.env.VITE_BASE_PATH || '/'
const basePath =
  rawBasePath === '/'
    ? '/'
    : `/${String(rawBasePath).replace(/^\/+|\/+$/g, '')}/`

const router = createRouter( {
  // history : createWebHistory(),
  // 传入 base 参数，确保路由与静态资源路径一致
  history : createWebHistory(basePath),
  routes : constantRouterMap,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的滚动位置（浏览器前进/后退），使用保存的位置
    if (savedPosition) {
      return savedPosition
    }
    // 如果目标路由设置了 keepAlive，不重置滚动位置（让组件自己管理）
    if (to.meta.keepAlive && from.meta.keepAlive) {
      return false // 不滚动
    }
    // 其他情况重置到顶部
    return { left: 0, top: 0 }
  }
} )

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.getToken
  
  // 定义不需要登录的页面白名单
  const whiteList = ['/login', '/error', '/downloadapp', '/mine', '/enter']

  // 已登录：即使进入 login，也不允许停留在登录页，直接跳回目标页（或首页）
  if (to.path === '/login' && token) {
    const rawRedirect =
      typeof to.query.redirect === 'string'
        ? to.query.redirect
        : Array.isArray(to.query.redirect)
          ? String(to.query.redirect[0] || '')
          : ''

    const redirectPath =
      rawRedirect && rawRedirect.startsWith('/') && rawRedirect !== '/login'
        ? rawRedirect
        : '/lqindex'

    next({ path: redirectPath, replace: true })
    return
  }
  
  // 检查当前路由是否需要认证（默认需要认证，除非 meta.requiresAuth 为 false）
  const requiresAuth = to.meta.requiresAuth !== false
  
  // 如果路由在白名单中，直接放行
  if (whiteList.includes(to.path)) {
    next()
    return
  }
  
  // 如果需要认证但没有token，重定向到登录页
  if (requiresAuth && !token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath } // 保存原始路径，登录后可以跳转回来
    })
    return
  }

  // 首页参数持久化/兜底：tabbar 切换可能导致 /home 或 /lqindex 不带 query（merchantId 等）
  if (to.name === 'LqIndex') {
    const hasQuery = to.query && Object.keys(to.query).length > 0
    if (hasQuery) {
      // 进入 home 有参数：保存下来
      saveHomeRouteParams(to)
    } else {
      // 进入 home 无参数：尝试从 localStorage 恢复
      const saved = getSavedHomeRouteParams()
      if (saved && Object.keys(saved).length > 0) {
        next({ ...to, query: saved, replace: true })
        return
      }
    }
  }
  
  // 已登录或不需要认证，放行
  next()
})

// export function resetRouter() {
//   const WHITE_NAME_LIST = ['Login']
//   router.getRoutes().forEach( route => {
//     const { name } = route
//     if ( name && !WHITE_NAME_LIST.includes( name ) ) {
//       router.hasRoute( name ) && router.removeRoute( name )
//     }
//   } )
// }

export default router
