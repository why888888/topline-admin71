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
              :disabled='!!codeTimer || codeLoading'
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
      codeTimer: null, // 倒计时定时器
      sendMobile: '', // 保存初始化验证码之后发送短信的手机号
      codeLoading: false
    }
  },
  methods: {
    handleLogin () {
      // 对整个表单进行校验的方法，参数为一个回调函数。
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
      // 对部分表单字段进行校验的方法
      this.$refs['ruleForm'].validateField('mobile', errorMessage => {
        if (errorMessage.trim().length > 0) {
          return
        }

        // 手机号码验证通过

        // 验证是否有验证码插件对象
        if (this.captchaObj) {
          // 手机号码有效，初始化验证码插件
          // this.showGeetest
          // 如果用户输入的手机号和之前初始化的验证码手机号不一致，就急于当前手机号码重新初始化
          // 否则，直接verify显示
          if (this.form.mobile !== this.sendMobile) {
            // 手机号码发送改变，重新初始化验证码插件

            // 重新初始化之前，将原来的验证码插件DOM删除
            document.body.removeChild(document.querySelector('.geetest_panel'))

            // 重新初始化
            this.showGeetest()
          } else {
            // 一致，直接verify
            this.captchaObj.verify()
          }
        } else {
          // 这里是第一次的初始化验证插件
          this.showGeetest()
        }
      })
    },
    showGeetest () {
      // 初始化验证码期间，禁用按钮的点击状态
      this.codeLoading = true

      axios({
        method: 'GET',
        url: `http://ttapi.research.itcast.cn/mp/v1_0/captchas/${this.form.mobile}`
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
            // 只有ready了才能显示验证码
            this.sendMobile = this.form.mobile
            captchaObj.verify()
            //验证码初始化好了，让'获取验证码'按钮可点击
            this.codeLoading = false
          }).onSuccess(() => {
            const {
              geetest_challenge: challenge,
              geetest_seccode: seccode,
              geetest_validate: validate } =
            captchaObj.getValidate()

            axios({
              method: 'GET',
              url: `http://ttapi.research.itcast.cn/mp/v1_0/sms/codes/${this.form.mobile}`,
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
  background: url('./login_bg.jpg') no-repeat;
  background-size: cover;
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
