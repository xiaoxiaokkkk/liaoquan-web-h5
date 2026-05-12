/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/layouts/index'),
    redirect: '/lqindex',
    // 关键：缓存 Layout，避免从 /home 跳到 /contentDetail 时 Layout 被卸载，
    // 从而导致其内部 keep-alive 缓存（Home/ContentList）丢失、滚动回到顶部
    meta: { keepAlive: true },
    children: [
      // {
      //   path: '/home',
      //   name: 'Home',
      //   component: () => import('@/views/index/index'),
      //   meta: { title: '首页', keepAlive: true, scrollTop: 0 }
      // },
      {
        path: '/lqindex',
        name: 'LqIndex',
        component: () => import('@/views/index/index'),
        meta: { title: '首页', keepAlive: true, scrollTop: 0 }
      },
      {
        path: '/msg',
        name: 'Msg',
        component: () => import('@/views/msg/index'),
        meta: { title: '消息', keepAlive: true, scrollTop: 0 }
      },
      {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/order/index'),
        meta: { title: '订单', keepAlive: true, scrollTop: 0 }
      },
      {
        path: '/mine',
        name: 'Mine',
        component: () => import('@/views/mine/index'),
        meta: { title: '我的', keepAlive: true, scrollTop: 0 }
      }
    ]
  },
  {
    path: '/contentDetail',
    name: 'ContentDetail',
    component: () => import('@/views/contentdetail/index.vue'),
    hidden: true,
    meta: { title: '内容详情', keepAlive: false, scrollTop: 0 }
  },
  {
    path: '/downloadapp',
    name: 'DownloadApp',
    component: () => import('@/views/downloadapp/index'),
    hidden: true,
    meta: { title: '下载APP', keepAlive: true, scrollTop: 0 }
  },
  {
    path: '/enter',
    name: 'Enter',
    redirect: (to) => ({ path: '/lqindex', query: to.query, hash: to.hash }),
    meta: { title: '进入页', requiresAuth: false, keepAlive: true, scrollTop: 0 }
  },
  // {
  //   path: '/enter',
  //   name: 'Enter',
  //   component: () => import('@/views/enter/index'),
  //   hidden: true,
  //   meta: { title: '进入页', requiresAuth: false, keepAlive: true, scrollTop: 0 }
  // },
  {
    path: '/bridge',
    name: 'Bridge',
    component: () => import('@/views/bridge/index'),
    hidden: true,
    meta: { title: '跳转中', requiresAuth: false, keepAlive: false, scrollTop: 0 }
  },
  {
    path: '/auth-callback',
    name: 'AuthCallback',
    component: () => import('@/views/auth-callback/index'),
    hidden: true,
    meta: { title: '登录中', requiresAuth: false, keepAlive: false, scrollTop: 0 }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index'),
    hidden: true,
    meta: { title: '登录', requiresAuth: false, keepAlive: true, scrollTop: 0 }
  },
  {
    path: '/error',
    name: 'Error',
    component: () => import('@/views/error/index'),
    hidden: true,
    meta: { title: '页面不存在', requiresAuth: false }
  },
  {
    path: '/privacyPolicy',
    name: 'PrivacyPolicy',
    component: () => import('@/views/privacy-policy/index.vue'),
    hidden: true,
    meta: { title: '隐私政策', requiresAuth: false, keepAlive: false, scrollTop: 0 }
  },
  {
    path: '/agreement',
    name: 'Agreement',
    component: () => import('@/views/agreement/index.vue'),
    hidden: true,
    meta: { title: '服务协议', requiresAuth: false, keepAlive: false, scrollTop: 0 }
  },
  {
    path: '/coupons',
    name: 'Coupons',
    component: () => import('@/views/coupons/index'),
    meta: { title: '我的优惠券', keepAlive: true, scrollTop: 0 }
  },
  {
    path: '/discard',
    name: 'Discard',
    component: () => import('@/views/discard/index'),
    meta: { title: '我的优惠卡', keepAlive: true, scrollTop: 0 }
  },
  // {
  //   path: '/register',
  //   name: 'Register',
  //   component: () => import('@/views/register/index'),
  //   hidden: true,
  //   meta: { title: '注册', requiresAuth: false, keepAlive: true, scrollTop: 0 }
  // },
  // {
  //   path: '/success',
  //   name: 'Success',
  //   component: () => import('@/views/success/index'),
  //   hidden: true,
  //   meta: { title: '注册成功', requiresAuth: false, keepAlive: true, scrollTop: 0 }
  // },
  // {
  //   path: '/privacy',
  //   name: 'Privacy',
  //   component: () => import('@/views/privacy/index'),
  //   hidden: true,
  //   meta: { title: '隐私政策', requiresAuth: false, keepAlive: true, scrollTop: 0 }
  // },
  // {
  //   path: '/agreement',
  //   name: 'Agreement',
  //   component: () => import('@/views/agreement/index'),
  //   hidden: true,
  //   meta: { title: '用户协议', requiresAuth: false, keepAlive: true, scrollTop: 0 }
  // },
  // {
  //   path: '/error',
  //   name: 'Error',
  //   component: () => import('@/views/error/index'),
  //   hidden: true,
  //   meta: { title: '响应异常', requiresAuth: false }
  // },
  // 历史/外链使用的短链前缀：无对应页面时会落到 NotFound → /error，统一回到首页
  {
    path: '/lqi_:legacyPath(.*)',
    name: 'LegacyLqiRoute',
    redirect: (to) => ({ path: '/lqindex', query: to.query, hash: to.hash })
  },
  {
    path: '/lq3_:legacyPath(.*)',
    name: 'LegacyLq3Route',
    redirect: (to) => ({ path: '/lqindex', query: to.query, hash: to.hash })
  },
  // 404路由：匹配所有未定义的路由，必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/error',
    hidden: true,
    meta: { title: '页面不存在', requiresAuth: false }
  }
]
