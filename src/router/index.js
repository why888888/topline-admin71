import Vue from 'vue'
import Router from 'vue-router'
import nprogress from 'nprogress'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/login')
    },
    {
      // name: 'layout', // 由于它有默认子路由，所以它的名字没有意义
      path: '/',
      component: () => import('@/views/layout'),
      // 嵌套路由：https://router.vuejs.org/zh/guide/essentials/nested-routes.html
      // 所有 children 路由都显示到父路由的 router-view 中
      children: [
        {
          name: 'home',
          path: '', // 它就是 layout 的默认子路由
          component: () => import('@/views/home')
        },
        { // 发布文章
          name: 'publish',
          path: '/publish',
          component: () => import('@/views/publish')
        },
        { // 编辑文章
          name: 'publish-edit',
          path: '/publish/:id',
          component: () => import('@/views/publish')
        },
        {
          name: 'article-list',
          path: '/article',
          component: () => import('@/views/article')
        },
        {
          name: 'article-comment',
          path: '/comment',
          component: () => import('@/views/comment')
        },
        {
          // 账户设置
          name: 'account-setting',
          path: '/account',
          component: () => import('@/views/account')
        },
        {
          name: 'image',
          path: '/image',
          component: () => import('@/views/image')
        },
        {
          name: 'fans-overview',
          path: '/fans/overview',
          component: () => import('@/views/fans')
        }
      ]
    }
  ]
})

/**
 * 所有路由导航都要经过这里 (导航守卫)
 * 全局前置守卫
 * to 去哪儿
 * from 来自哪里
 * next 允许通过的方法
 */

router.beforeEach((to, from, next) => {
  nprogress.start()
  const userInfo = window.localStorage.getItem('user_info')

  // 如果是非 /login 页面，判断其登录状态
  if (to.path !== '/login') {
    // 如果没有登录，让其跳转到登录页
    if (!userInfo) {
      next({ name: 'login' })
    } else {
      // 如果登录了，则允许通过
      next()
    }
  } else {
    // 如果登录了，就不允许访问登录页了
    if (userInfo) {
      next(false)
    } else {
      // 没有登录，才允许访问登录页
      next()
    }
  }
})

// 路由导航完成的时候进入这里
// 全局后置钩子
router.afterEach((to, from) => {
  nprogress.done()
})

export default router
