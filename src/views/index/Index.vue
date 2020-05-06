<template>
  <div class="main">
    <div class="index">
      <el-tabs v-model="activeName">
        <el-tab-pane label="生成JIN" name="first">
          <borrow v-if="activeName === 'first'"
            @listenLogin="handleLogin" :balanceEos="balanceEos" :balanceJin="balanceJin"/>
        </el-tab-pane>
        <el-tab-pane label="交易兑换" name="second">
          <trade
            @listenLogin="handleLogin" :balanceEos="balanceEos" :balanceJin="balanceJin"/>
        </el-tab-pane>
        <el-tab-pane label="SWAP做市" name="third">
          <swap v-if="activeName === 'third'"
            @listenLogin="handleLogin" :balanceEos="balanceEos" :balanceJin="balanceJin"/>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 列表 -->
    <div class="tableList">
      <div class="title">生成记录</div>
      <el-table
        :data="tableData"
        stripe
        style="width: 100%">
        <el-table-column
          prop="date"
          label="日期"
          width="160">
        </el-table-column>
        <!-- <el-table-column
          prop="name"
          label="账户"
          width="170">
        </el-table-column> -->
        <el-table-column
          prop="stakedNum"
          label="抵押数量(EOS)"
          width="140">
        </el-table-column>
        <el-table-column
          prop="num"
          label="生成数量(JIN)"
          width="140">
        </el-table-column>
        <!-- <el-table-column
          width="140"
          label="TrxID">
          <template slot-scope="props">
            <a target="_blank" href="#" class="trxId">{{ props.row.address }}</a>
          </template>
        </el-table-column> -->
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
import Borrow from './components/Borrow';
import Trade from './components/Trade';
import Swap from './components/Swap';

export default {
  name: 'index',
  components: {
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
      tableData: [{
        date: '2016-05-02 00:00:00',
        name: 'mmmmmmmmmmm1',
        stakedNum: '300.0000',
        num: '100.0000',
        address: 'sadfytfqwytdf126t3712gubd',
      }, {
        date: '2016-05-02 00:00:00',
        name: 'mmmmmmmmmmm2',
        stakedNum: '300.0000',
        num: '100.0000',
        address: 'sadfytfqwytdf126t3712gubd'
      }, {
        date: '2016-05-02 00:00:00',
        name: 'mmmmmmmmmmm3',
        stakedNum: '300.0000',
        num: '100.0000',
        address: 'sadfytfqwytdf126t3712gubd'
      }, {
        date: '2016-05-02 00:00:00',
        name: 'mmmmmmmmmmm4',
        stakedNum: '300.0000',
        num: '100.0000',
        address: 'sadfytfqwytdf126t3712gubd'
      }],
    }
  },
  computed:{
     ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
    })
  },
  watch: {
    scatter: {
      handler: function listen(newVal) {
        if (newVal.identity) {
          clearInterval(this.timer);
          this.handleRows();
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
    this.handleRows();
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
        params.code = 'jinbankoneo1';
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
    // 赎回
    handleRedeem(item) {
      const params = {
        code: 'jinbankoneo1',
        toAccount: 'jinbankoneo1',
        memo: `redeem: ${item.id}`,
        quantity: `${item.num} JIN`
      }
      EosModel.transfer(params, (res) => {
        if(res) {
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
        if(res) {
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
    handleRows() {
      EosModel.getTableRows((res) => {
        console.log(res)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.main{
  width: 800px;
  margin: auto;
  .tableList{
    margin-top: 30px;
    box-shadow: 0 0 5px 5px #fafafa;
    padding: 25px;

    .title{
      font-size: 20px;
      padding: 0 0 10px 0px;
      text-align: left;
    }
    .trxId{
      white-space: nowrap;
      text-overflow:ellipsis;
    }
  }
}
.index{
  margin-top: 30px;
  border: 1px solid #fafafa;
  border-radius: 5px;
  box-shadow: 0 0 5px 5px #fafafa;
  padding: 25px;

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
