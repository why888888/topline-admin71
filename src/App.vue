<template>
  <div id="app">
    <!-- 在模板中不需要写 this.$store -->
    <!-- <h1>{{ $store.state.count }}</h1> -->
    <!-- <button @click='$store.commit("increment")'>点击提交mutation改变count</button> -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {}
  }
}
</script>

<style lang="less" scoped>
  #app{
    height:100%;
  }
</style>
