<template>
  <!--
    el-select 组件
      value 属性，用来绑定同步的数据
      change 事件，当选中项发生改变触发，回调参数就是选项的value
 -->
 <el-select :value='value' clearable @change='handleChange'>
   <el-option
     v-for='item in channels'
     :key='item.id'
     :label='item.name'
     :value='item.id'
   ></el-option>
 </el-select>
</template>

<script>
export default {
  name: 'ArticleChannel',
  props: {
    value: {
      type: [String, Number],
      required: true
    }
  },
  data () {
    return {
      channels: []
    }
  },
  created () {
    // 记载频道列表
    this.loadChannels()
  },
  methods: {
    handleChange (val) {
      this.$emit('input', val)
    },
    loadChannels () {
      this.$http({
        method: 'GET',
        url: '/channels'
      }).then(data => {
        this.channels = data.channels
      }).catch(err => {
        console.log(err)
        this.$message.error('加载频道列表失败')
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
