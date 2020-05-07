<template>
  <div class="main">
    <warm-tip />
    <div class="index">
      <el-tabs v-model="activeName">
        <el-tab-pane label="生成JIN" name="first">
          <borrow v-if="activeName === 'first'"
            @listenLogin="handleLogin" :balanceEos="balanceEos" :balanceJin="balanceJin"/>
        </el-tab-pane>
        <el-tab-pane label="交易兑换" name="second">
          <trade v-if="activeName === 'second'"
            @listenLogin="handleLogin" :balanceEos="balanceEos" :balanceJin="balanceJin"
            :marketLists="marketLists"/>
        </el-tab-pane>
        <el-tab-pane label="SWAP做市" name="third">
          <swap v-if="activeName === 'third'"
            @listenLogin="handleLogin" :balanceEos="balanceEos" :balanceJin="balanceJin"
            :marketLists="marketLists"/>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 列表 -->
    <div class="tableList" v-if="activeName === 'first'">
      <div class="title">
        <span>生成记录</span>
        <span class="right">余额: {{ balanceJin }} JIN</span>
      </div>
      <el-table
        :data="tableData"
        stripe
        style="width: 100%">
        <el-table-column
          prop="ctime"
          label="日期"
          width="160">
        </el-table-column>
        <el-table-column
          prop="pledge"
          label="抵押数量(EOS)"
          width="140">
        </el-table-column>
        <el-table-column
          prop="issue"
          label="生成数量(JIN)"
          width="140">
        </el-table-column>
        <el-table-column
        fixed="right"
          label="操作">
          <template slot-scope="props">
            <el-button type="danger" plain @click="handleRedeem(props.row)">赎回</el-button>
            <el-button type="primary" plain @click="handleStake(props.row)">挖矿</el-button>
          </template>
        </el-table-column>
      </el-table>
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
    scatter: {
      handler: function listen(newVal) {
        if (newVal.identity) {
          clearInterval(this.timer);
          this.handleRowsMint();
          this.handleGetBalance();
          this.handleGetBalance('next');
          this.timer = setInterval(() => {
            this.handleGetBalance();
            this.handleGetBalance('next');
          }, 20000)
        }
      },
      deep: true,
      immediate: true,
    }
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
    // 现实偿还弹窗
    handleShowRepay(data) {
      console.log(data)
    },
    // 获取账户余额
    async handleGetBalance(next) {
      const params = {
        code: 'eosio.token',
        coin: 'EOS',
        decimal: 4
      };
      if (next) {
        params.code = this.baseConfig.toAccountJin;
        params.coin = 'JIN';
      }
      await EosModel.getCurrencyBalance(params, res => {
        if (!res || res.length === 0) {
          this.balanceJin = 0;
          this.lackBanlance = true;
          return 0
        }
        this.lackBanlance = false;
        const balance = res.split(' ')[0];
        if (next) {
          this.balanceJin = balance;
          return;
        }
        this.balanceEos = balance;
      })
    },
    handleReg(item) {
      const issue = item.issue.split(' ')[0]
      if (Number(issue) > Number(this.balanceJin)) {
        this.$message({
          message: 'balance lower',
          type: 'error'
        })
        return false;
      }
      return true
    },
    // 赎回
    handleRedeem(item) {
      if (!this.handleReg(item)) {
        return
      }
      const params = {
        code: this.baseConfig.toAccountJin,
        toAccount: this.baseConfig.toAccountJin,
        memo: `redeem: ${item.id}`,
        quantity: item.issue
      }
      EosModel.transfer(params, (res) => {
        if(res.code) {
          this.$message({
            message: res.message,
            type: 'error'
          });
          return
        }
        this.$message({
          message: 'Redeem Success',
          type: 'success'
        });
      })
    },
    // 挖矿
    handleStake(item) {
      const params = {
        id: item.id,
      }
      EosModel.stake(params, (res) => {
        if(res.code) {
          this.$message({
            message: res.message,
            type: 'error'
          });
          return
        }
        this.$message({
          message: 'Stake Success',
          type: 'success'
        });
      });
    },
    // 生成列表
    handleRowsMint() {
      const params = {
        code: this.baseConfig.toAccountJin,
        scope: this.baseConfig.toAccountJin,
        table: 'debts',
        lower_bound: 1,
        upper_bound: 100,
        json: true
      }
      EosModel.getTableRows(params, (res) => {
        const list = res.rows.filter(v => v.owner === this.scatter.identity.accounts[0].name)
        list.forEach((v) => {
          v.ctime = toLocalTime(`${v.create_time}.000+0000`)
        });
        this.tableData = list;
      })
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
  .tableList{
    margin-top: 30px;
    box-shadow: 0 0 5px 5px #fafafa;
    padding: 25px;

    .title{
      font-size: 20px;
      padding: 0 0 10px 0px;
      text-align: left;
      .right{
        float: right;
        font-size: 16px;
      }
    }
    .trxId{
      white-space: nowrap;
      text-overflow:ellipsis;
    }
  }
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
