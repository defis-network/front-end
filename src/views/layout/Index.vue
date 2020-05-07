<template>
  <div class="layout">
    <div class="project">
      <span class="logo">JIN-Network</span>
      <span class="login" v-if="!scatter.identity">
        <el-button class="btn" type="primary" plain round @click="handleLogin">connect to Wallet</el-button>
      </span>
      <div class="account" v-else>
        <span class="name">账户：{{ scatter.identity.accounts[0].name }}</span>
        <span class="loginOut" @click="handleLoginOut">退出</span>
      </div>
    </div>
    <transition name="fade" mode="out-in">
      <router-view @listenLogin="handleLogin"/>
    </transition>
  </div>
</template>

<script>
import { login } from '@/utils/public';
import { mapState } from 'vuex'
import { EosModel } from '@/utils/eos';

export default {
  data() {
    return {
    }
  },
  computed:{
    ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
    })
  },
  mounted() {
    EosModel.scatterInit(this, () => {
      console.log('init success')
    })
    // this.handleLogin()
  },
  methods: {
    // 登录
    handleLogin() {
      login(this, (err) => {
        if (err) {
          // this.$router.push('/');
          console.log(err)
        }
      })
    },
    handleLoginOut() {
      EosModel.accountLoginOut(() => {
        location.reload()
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.layout{
  width: 100%;
  margin: auto;
}
.project{
  padding: 0px 10px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .logo{
    padding-left: 5px;
  }
  .login{
  }
}
.account{
  text-align: right;
  font-size: 14px;
  .loginOut{
    color: #F56C6C;
    margin-left: 8px;
    cursor: pointer;
  }
}
</style>