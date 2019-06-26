import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import './styles/index.less' // 全局样式
import 'nprogress/nprogress.css' // 导入进入条css
import axios from 'axios' // 配置axios

// 配置 axios 的基础路由
// 而就是说配置了这个东西，你就不用每次都写长长的 http://xxxx
// 只需要,axios({ url: '/autorizations' })
// 路径中的/,多退少补
axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/mp/v1_0/'

/**
 * Axios 请求拦截器
 * 所有使用 axios 发起的请求都要经过这里
 * config 是本次请求相关的配置对象
 * return config 就是允许通过的方式
 */
axios.interceptors.request.use(config => {
  const userInfo = JSON.parse(window.localStorage.getItem('userInfo'))
  // 如果登陆了，才给那些需要 token 的接口统一添加 token 令牌
  // 登录相关接口不需要添加 token 令牌，想要也没有
  if (userInfo) {
    config.headers.Authorization = `Bearer ${userInfo.token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * Axios 响应拦截器
 * 统一处理响应的数据格式
 */
axios.interceptors.response.use(response => {
  return response.data.data
}, error => {
  const status = error.response.status
  if (status === 401) {
    // 务必删除本地存储中的用户信息数据
    window.localStorage.removeItem('user_info')

    // 跳转到登录页面
    router.push({
      name: 'login'
    })
  }
  return Promise.reject(error)
})

// 几乎每个组件都要使用 axios 去发请求，频繁的 import 就变得非常麻烦
// 我们可以将一些频繁使用的成员放到 Vue.prototype中，然后就可以在组件中直接 this. xxx 使用了
// 因为所有组件都是Vue的实例
// 所以往 Vue.prototype 中添加的成员可以直接通过组件实例 this 进行访问
// 往Vue原型对象中添加成员，尽量使用 $名字 起名字，目的是为了防止和组件中的成员冲突
Vue.prototype.$http = axios

Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
