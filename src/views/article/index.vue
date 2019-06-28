<template>
  <div>
    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <div slot="header" class="clearfix">
        <span>筛选条件</span>
        <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
      </div>
      <el-form ref="form" :model="filterParams" label-width="80px">
        <el-form-item label="状态">
          <el-radio-group v-model="filterParams.status">
            <el-radio label=''>全部</el-radio>
            <el-radio
              v-for='(item,index) in statTypes'
              :key='item.label'
              :label='index + ""'
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="频道">
          <!-- <el-select v-model="filterParams.channel_id" clearable placeholder="请选择活动区域">
            <el-option label='全部' value=''></el-option>
            <el-option
              v-for='item in channels'
              :key='item.id'
              :label='item.name'
              :value='item.id'
            ></el-option>
          </el-select> -->
          <article-channel v-model='filterParams.channel_id'></article-channel>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            type="daterange"
            value-format='yyyy-MM-dd'
            v-model='begin_end_pubdate'
            @change='handleDateChange'
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="onSubmit"
            :loading='articleLoading'
          >查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- /筛选区域 -->

    <!-- 列表 -->
    <el-card class="list-card">
      <div slot="header" class="clearfix">
        <span>共找到<strong>{{ totalCount }}</strong>条符合条件的内容</span>
      </div>

      <!-- table 表格 -->
      <!--
        data 用来指定表格的数据
        表格不需要我们自己手动遍历
        只需要把数据给 el-table 的 data 属性就可以了
        然后配置 el-table-column 需要展示的数据字段即可
       -->
      <el-table
        class="list-table"
        :data="articles"
        style="width: 100%"
        v-loading="articleLoading">
        <el-table-column
          prop="cover.images[0]"
          label="封面"
          width="60">
          <!-- 表格列默认只能输出文本，如果需要自定义里面的内容，则需要 -->
          <!--
            slot-scope 是插槽作用域，现在先听个名词，你要知道的是值 scope 是起的一个名字
            scope 中有个成员叫 row
            也就是说 scope.row 就是当前的遍历项对象
            自定义列模板，el-table-column 的 prop 就没有意义了
          -->
          <template slot-scope="scope">
            <img width="30" :src="scope.row.cover.images[0]">
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="标题"
          width="180">
        </el-table-column>
        <el-table-column
          prop="pubdate"
          label="发布日期"
          width="180">
        </el-table-column>
        <el-table-column
          label="状态">
          <template slot-scope='scope'>
            <el-tag :type='statTypes[scope.row.status].type'>{{ statTypes[scope.row.status].label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button type="success" plain>修改</el-button>
            <el-button type="danger" plain @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- /table 表格 -->

      <!-- 数据分页 -->
      <!--
        一：分多少页
          每页多大，默认是10条每页，我们的接口如果没有指定每页条数，则默认也是按照每页10条返回数据
          有多少条数据
          total 总记录数
          current-page 当前页码，也就是高亮的那个页码
        二：页面改变加载对应的页码数据
       -->
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalCount"
        :disabled='articleLoading'
        :current-page='page'
        @current-change="handleCurrentChage"
      >
      </el-pagination>
      <!-- /数据分页 -->
    </el-card>
    <!-- /列表 -->
  </div>
</template>

<script>
import ArticleChannel from '@/components/article-channel'

export default {
  name: 'ArticleList',
  components: {
    ArticleChannel
  },
  data () {
    return {
      articles: [], // 列表数据
      totalCount: 0, // 总数据条数
      articleLoading: false, // 控制文档加载中 loading 效果
      page: 1, // 当前页面
      statTypes: [
        {
          type: 'info',
          label: '草稿'
        },
        {
          type: '',
          label: '待审核'
        },
        {
          type: 'success',
          label: '审核通过'
        },
        {
          type: 'warning',
          label: '审核失败'
        },
        {
          type: 'danger',
          label: '已删除'
        }
      ],
      filterParams: { // 文章查询条件参数
        status: '', // 文章状态
        channel_id: '', // 频道id
        begin_pubdate: '', // 开始时间
        end_pubdate: '' // 结束时间
      },
      begin_end_pubdate: [] // 存储日期选择器同步的[开始时间，结束时间]，这个字段没啥用，只是日期选择器必须 v-mode 绑定一个数据才会触发 change 事件
    }
  },
  created () {
    // 加载文章列表
    this.loadArticles()
  },
  methods: {
    loadArticles (page = 1) {
      this.articleLoading = true

      // 过滤出有效的查询条件数据字段
      const filterData = {}
      for (let key in this.filterParams) {
        if (this.filterParams[key]) {
          filterData[key] = this.filterParams[key]
        }
      }

      this.$http({
        methods: 'GET',
        url: '/articles',
        params: {
          page,
          per_page: 10, // 请求数据每页大小，默认10
          ...filterData // 将对象混入当前对象，说白了就是对象拷贝
        }
      }).then(data => {
        this.articles = data.results // 列表数据
        this.totalCount = data.total_count // 总记录数
        this.articleLoading = false
      })
    },
    onSubmit () {
      this.page = 1 // 让分页组件回到1
      this.loadArticles()
    },
    handleCurrentChage (page) {
      this.page = page
      // 当页码发生改变的时候，请求该页码对应的数据
      this.loadArticles(page)
    },
    handleDelete (article) {
      this.$confirm('确认删除吗？', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 发送删除请求
        this.$http({
          method: 'DELETE',
          url: `/articles/${article.id}`
        }).then(data => {
          // 提示删除成功
          this.$message({
            type: 'success',
            message: '删除成功!'
          })

          // 重新加载数据列表
          this.loadArticles(this.page)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除!'
        })
      })
    },
    /**
     * 日期选择组件改变事件
     */
    handleDateChange (value) {
      this.filterParams.begin_pubdate = value[0]
      this.filterParams.end_pubdate = value[1]
    }
  }
}
</script>

<style lang="less" scoped>
.filter-card {
  margin-bottom: 20px;
}

.list-table {
  margin-bottom: 30px;
}
</style>
