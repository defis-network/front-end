<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { GetUrlPara } from '@/utils/public';

export default {
  name: 'App',
  components: {
  },
  computed: {
    ...mapState({
      // 箭头函数可使代码更简练
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
      testConfig: state => state.sys.testConfig, // 测试网环境
      devConfig: state => state.sys.devConfig, // 开发环境
      proConfig: state => state.sys.proConfig, // 生产环境
    }),
  },
  created() {
    this.handleEnvReLoad()
    this.handleEnvSet();
  },
  methods: {
    handleEnvReLoad() {
      const urlData = GetUrlPara();
      const protocol = location.protocol;
      if (urlData.env === '1dev' && protocol === 'https:') {
        location.href = `http://${location.host}`
        // location.href = `http://www.baidu.com`
      }
    },
    handleEnvSet() {
      const urlData = GetUrlPara();
      let config = this.baseConfig;
      if (!urlData.env || urlData.env === 'production') { // 没有配置环境 - 默认生产环境
        sessionStorage.setItem('ENV', 'production')
        config = this.proConfig;
      } else if (urlData.env === 'test') {
        sessionStorage.setItem('ENV', 'test')
        config = this.testConfig;
      } else {
        sessionStorage.setItem('ENV', 'dev')
        config = this.devConfig;
      }
      this.$store.dispatch('setBaseConfig', config)
      console.log(this.baseConfig)
    }
  },
}
</script>

<style>
*{
  padding: 0;
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}
</style>
