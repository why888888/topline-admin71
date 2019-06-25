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
