<template>
  <div class="main">
    <warm-tip />
    <div class="index">
      <el-tabs v-model="activeName">
        <el-tab-pane label="金库" name="first">
          <borrow v-if="activeName === 'first'"
            @listenLogin="handleLogin" :balanceEos="balanceEos" :balanceJin="balanceJin"/>
        </el-tab-pane>
        <el-tab-pane label="交易所" name="second">
          <trade v-if="activeName === 'second'"
            @listenLogin="handleLogin" :balanceEos="balanceEos" :balanceJin="balanceJin"
            :marketLists="marketLists"/>
        </el-tab-pane>
        <el-tab-pane label="资金池" name="third">
          <swap v-if="activeName === 'third'"
            @listenLogin="handleLogin" :balanceEos="balanceEos" :balanceJin="balanceJin"
            :marketLists="marketLists"/>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { EosModel } from '@/utils/eos';
import { mapState } from 'vuex'
import { toLocalTime } from '@/utils/public';
import WarmTip from '@/components/WarmTip';
import Borrow from './components/Borrow';
import Trade from './components/Trade';
import Swap from './components/Swap';

export default {
  name: 'index',
  components: {
    WarmTip,
    Borrow,
    Trade,
    Swap
  },
  data() {
    return {
      activeName: 'first',
      tab: 0, // 0 - 生成 & 偿还 Jin | 1 - 交易兑换 | 2 - swap做市
      timer: null,
      balanceJin: '0.0000',
      balanceEos: '0.0000',
      tableData: [], // 生成记录
      marketLists: [], // 所有池子
    }
  },
  computed:{
    ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
    })
  },
  watch: {
  },
  mounted() {
    this.handleRowsMarket();
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    // 登录
    handleLogin() {
      this.$emit('listenLogin', true)
    },
    // 获取做市池子
    handleRowsMarket() {
      const params = {
        code: this.baseConfig.toAccountSwap,
        scope: this.baseConfig.toAccountSwap,
        table: 'markets',
        json: true
      }
      EosModel.getTableRows(params, (res) => {
        const list = res.rows || [];
        list.forEach((v) => {
          const sym0 = v.sym0.split(',');
          v.symbol0 = sym0[1]; // 币种
          v.decimal0 = sym0[0]; // 精度
          const sym1 = v.sym1.split(',');
          v.symbol1 = sym1[1]; // 币种
          v.decimal1 = sym1[0]; // 精度
        });
        this.marketLists = list;
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.main{
  width: 100%;
  max-width: 800px;
  margin: auto;
}
.index{
  margin-top: 20px;
  // border: 1px solid #fafafa;
  border-radius: 5px;
  // box-shadow: 0 0 5px 5px #fafafa;
  padding: 0px 10px;

  .tab{
    display: flex;
    justify-content: space-between;
    align-items: center;
    .tab-item{
      height: 65px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
