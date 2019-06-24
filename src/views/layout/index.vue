<template lang="html">
  <div>
    <AppAside/>
    <AppHeader/>
    <!-- 这里是内容Home、发布文章、评论管理...... -->
  </div>
</template>

<script>
import AppAside from './components/AppAside'
import AppHeader from './components/AppHeader'

export default {
  name: 'AppLayout',
  components: {
    AppAside,
    AppHeader
  },
  data () {
    return {}
  }
}
</script>

<style lang="less" scoped>
</style>
