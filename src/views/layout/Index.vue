<template>
  <div class="layout">
    <div class="project"> JIN-Network</div>
    <div class="account" v-if="scatter.identity">
      <span class="name">账户：{{ scatter.identity.accounts[0].name }}</span>
      <span class="loginOut" @click="handleLoginOut">退出</span>
    </div>
    <transition name="fade" mode="out-in">
      <router-view @listenLogin="handleLogin"/>
    </transition>
  </div>
</template>

<script>
import { login, GetUrlPara } from '@/utils/public';
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
    this.handleInit();
    EosModel.scatterInit(this, () => {
      console.log('init success')
    })
    // this.handleLogin()
  },
  methods: {
    // 配置环境
    handleInit() {
      const urlData = GetUrlPara();
      if (urlData.env) {
        sessionStorage.setItem('ENV', urlData.env)
      }
    },
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
  width: 800px;
  margin: auto;
}
.project{
  font-size: 35px;
}
.account{
  text-align: right;
  .loginOut{
    color: #F56C6C;
    margin-left: 8px;
    cursor: pointer;
  }
}
</style>