<template>
  <div class="login-wrap">
    <div class="login-form-wrap">
      <div class="login-head">
        <img src="./logo_index.png" alt="黑马头条">
      </div>
      <div class="login-form">
        <el-form ref='ruleForm' :model='form' :rules='rules'>
          <el-form-item prop='mobile'>
            <el-input v-model= 'form.mobile' placeholder = '手机号'></el-input>
          </el-form-item>
          <el-form-item prop='code'>
            <el-col :span='13'>
              <el-input v-model= 'form.code' placeholder = '验证码'></el-input>
            </el-col>
            <el-col :span='10' :offset='1'>
              <!-- :disabled 如果定时器为true禁用 -->
              <el-button
              @click='handleSendCode'
              :disabled='!!codeTimer'
              >
                <!-- 倒计时 -->
                {{ codeTimer ? `剩余${codeSecons}秒` : '获取验证码' }}
              </el-button>
            </el-col>
          </el-form-item>
          <el-form-item prop='agree'>
              <!-- `checked` 为 true 或 false -->
              <el-checkbox v-model="form.agree"></el-checkbox>
              <span>我已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私条款</a></span>
          </el-form-item>
          <el-form-item>
            <el-button
              class="btn-login"
              type='primary'
              @click='handleLogin'
              :loading='loginLoading'
            >登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import '@/vendor/gt' // gt.js 会向全局 window 暴露一个函数 initGeetest
const initCodeSeconds = 60
export default {
  name: 'AppLogin',
  data () {
    return {
      form: {
        mobile: '15340047821',
        code: '',
        agree: '' // 是否同意用户协议
      },
      loginLoading: false,
      rules: {
        mobile: [
          { required: true, message: '请输入后记号', trigger: 'blur' },
          { len: 11, message: '长度必须11个', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '长度必须为6个字符', trigger: 'blur' }
        ],
        agree: [
          { required: true, message: '请同意用户协议', trigger: 'change' },
          { pattern: /true/, message: '请同意用户协议', trigger: 'change' }
        ]
      },
      captchaObj: null, // 通过 initGeetest 得到的极验验证码对象
      codeSecons: initCodeSeconds, // 倒计时的时间
      codeTimer: null // 倒计时定时器
    }
  },
  methods: {
    handleLogin () {
      this.$refs['ruleForm'].validate(valid => {
        if (!valid) {
          return
        }
        this.submitLogin()
      })
    },
    submitLogin () {
      this.loginLoading = true
      axios({
        method: 'POST',
        url: 'http://ttapi.research.itcast.cn/mp/v1_0/authorizations',
        data: this.form
      }).then(res => {
        this.$message({
          message: '登录成功',
          type: 'success'
        })

        this.loginLoading = false

        this.$router.push({
          name: 'home'
        })
      }).catch(err => {
        if (err.response.status === 400) {
          this.$message.error('登录失败，手机号或验证码错误')
        }
        this.loginLoading = false
      })
    },
    handleSendCode () {
      this.$refs['ruleForm'].validateField('mobile', errorMessage => {
        console.log(errorMessage)
        if (errorMessage.trim().length > 0) {
          return
        }
        this.showGeetest()
      })
    },
    showGeetest () {
      const { mobile } = this.form

      if (this.captchaObj) {
        return this.captchaObj.verify()
      }

      axios({
        method: 'GET',
        url: `http://ttapi.research.itcast.cn/mp/v1_0/captchas/${mobile}`
      }).then(res => {
        const data = res.data.data
        window.initGeetest({
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: data.new_captcha,
          product: 'bind'
        }, (captchaObj) => {
          this.captchaObj = captchaObj
          captchaObj.onReady(() => {
            captchaObj.verify()
          }).onSuccess(() => {
            const {
              geetest_challenge: challenge,
              geetest_seccode: seccode,
              geetest_validate: validate } =
            captchaObj.getValidate()

            axios({
              method: 'GET',
              url: `http://ttapi.research.itcast.cn/mp/v1_0/sms/codes/${mobile}`,
              params: {
                challenge,
                seccode,
                validate
              }
            }).then(res => {
              console.log(res.data)
              // 发送短信之后，开始倒计时
              this.codeCountDown()
            })
          })
        })
      })
    },
    // 倒计时
    codeCountDown () {
      this.codeTimer = window.setInterval(() => {
        this.codeSecons--
        if (this.codeSecons <= 0) {
          this.codeSecons = initCodeSeconds // 让倒计时时间回到初始状态
          window.clearInterval(this.codeTimer) // 清除定时器
          this.codeTimer = null // 清除倒计时定时器的标识
        }
      }, 1000)
    }
  }
}
</script>

<style lang="less" scoped>
.login-wrap{
  height:100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ccc;
  .login-head{
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    img {
      width: 270px;
    }
  }
  .login-form-wrap{
    background-color: #fff;
    padding:50px;
    border-radius: 10px;
    .btn-login{
      width: 100%;
    }
  }
}
</style>
