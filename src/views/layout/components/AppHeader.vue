<template>
  <el-row class="app-header">
      <el-col :span="14">江苏传智播客教育科技股份有限公司</el-col>
      <el-col :span="4" :offset="6">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <img width="30" :src="$store.state.user.photo">
            {{ $store.state.user.name }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>账户设置</el-dropdown-item>
            <el-dropdown-item @click.native='handleLogout'>退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
</template>

<script>
export default {
  name: 'AppHeader',
  data () {
    return {
      userInfo: {}
    }
  },
  created () {
    this.userInfo = JSON.parse(window.localStorage.getItem('user_info'))
  },
  methods: {
    handleLogout () {
      this.$confirm('确认退出吗？', '退出提示', {
        confirmButtonText: '确定',
        cancelButtionText: '取消',
        type: 'warning'
      }).then(() => {
        // 清除本地存储
        window.localStorage.removeItem('user_info')

        this.$message({
          type: 'success',
          message: '退出成功'
        })

        this.$router.push({
          name: 'login'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消退出'
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.app-header {
  height: 60px;
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #409EFF;
  img {
    border-radius: 50%;
  }
}

.el-icon-arrow-down {
  font-size: 12px;
}
</style>
