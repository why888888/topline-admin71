import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import './styles/index.less' // 全局样式
import 'nprogress/nprogress.css' // 导入进入条css
import axios from 'axios' // 配置axios
import JSONbig from 'json-bigint'

// 配置 axios 的基础路由
// 而就是说配置了这个东西，你就不用每次都写长长的 http://xxxx
// 只需要,axios({ url: '/autorizations' })
// 路径中的/,多退少补
// axios.defaults.baseURL = 'http://toutiao.course.itcast.cn/app/v1_0/'
axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/mp/v1_0/'
// axios.defaults.baseURL = 'http://toutiao.course.itcast.cn/mp/v1_0/'

// 使用 JSONbig 处理返回数据中超出 JavaScript 安全整数范围的数字
// JSONbig 自己会分析数据中的哪个数字超出范围了
// // 由于后端的数据 id 超出了 JavaScript 的安全整数范围，会导致整数无法精确表示
// 可以使用 json-biginit 来处理，它会帮你把找出范围的数字给处理好

// JSONbig.parse 类似于 JSON.parse,它的作用也是将JSON格式字符串转换为JavaScript对象
// 唯一的区别就是 JSONbig.parse 会检测被转换数据中的数字是否出了 JavaScript 安全整数范围，如果超出，他会做特殊处理
// 例如我们执行删除，后端返回一个204状态码，但是没有返回任何数据，也就是空字符串
// 那这里JSONbig.parse(空字符串)就报错
axios.defaults.transformResponse = [function (data) {
  // data 是未经处理的后端响应数据：JSON 格式字符串
  // Do whatever you want to transform the data
  try {
    // data数据可能不是标准的JSON格式字符串，否则会导致JSON.parse(data)转换失败报错
    return JSONbig.parse(data)
  } catch (err) {
    // 无法转换的数据将直接原样返回
    return data
  }
}]

/**
 * Axios 请求拦截器
 * 所有使用 axios 发起的请求都要经过这里
 * config 是本次请求相关的配置对象
 * return config 就是允许通过的方式
 */
axios.interceptors.request.use(config => {
  const userInfo = JSON.parse(window.localStorage.getItem('user_info'))
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
axios.interceptors.response.use(response => { // >=200&&<=400
  // 如果返回的数据格式是对象
  if (typeof response.data === 'object' && response.data.data) {
    return response.data.data
  } else {
    return response.data
  }
}, error => { // >400
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
