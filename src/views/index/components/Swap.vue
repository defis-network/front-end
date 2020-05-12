<template>
  <div>
    <div class="topDiv">
      <div class="title">
        <span v-if="index === 1">{{ $t('pools.depositFunds') }}</span>
        <span v-else>{{ $t('pools.withdrawalFunds') }}</span>
      </div>
      <div class="link">
        <span v-if="index !== 1" @click="index = 1">{{ $t('pools.toDeposit') }}></span>
        <span v-else class="toRepay" @click="index = 2">{{ $t('pools.toWithdrawal') }}></span>
      </div>
    </div>
    <div class="swap" v-if="index === 1">
      <market-lists-com :thisMarket="thisMarket" :marketLists="marketLists"
        @listenMarketChange="handleSelectThis" />
      <el-form ref="formBorrow" label-width="75px">
        <!-- 抵押数量 -->
        <el-form-item :label="$t('pools.depositFunds')">
          <el-input v-model="payNum1" type="number" clearable
                    @focus="handleIptFocus('pay')"
                    @blur="handleIptBlur('pay')"
                    @input="handleInBy('pay')">
            <!-- <span slot="suffix">EOS</span> -->
            <template slot="prepend">{{ thisMarket.symbol0 }}</template>
          </el-input>
          <!-- 余额 -->
          <div class="balance">
            <span>{{ $t('public.balance') }}：{{balanceSym0}} {{ thisMarket.symbol0 }}</span>
          </div>
          <el-input v-model="payNum2" type="number" clearable
                    @focus="handleIptFocus('get')"
                    @blur="handleIptBlur('get')"
                    @input="handleInBy('get')">
            <!-- <span slot="suffix">EOS</span> -->
            <template slot="prepend">{{ thisMarket.symbol1 }}</template>
          </el-input>
          <!-- 余额 -->
          <div class="balance">
            <span>{{ $t('public.balance') }}：{{balanceSym1}} {{ thisMarket.symbol1 }}</span>
          </div>
        </el-form-item>
        <!-- 生成总额 -->
        <el-form-item :label="$t('pools.tokenNum')" style="margin-top: 5px">
          <el-input v-model="getToken" type="number" disabled clearable>
          </el-input>
        </el-form-item>
        <el-button class="btn" type="primary" v-if="scatter.identity" plain @click="handleAddToken">{{ $t('pools.depositFunds') }}</el-button>
        <el-button class="btn" type="primary" v-else @click="handleLogin">{{ $t('public.loginPls') }}</el-button>
      </el-form>
    </div>

    <div class="swap" v-else>
      <market-lists-com :thisMarket="thisMarket" :marketLists="marketLists"
        @listenMarketChange="handleSelectThis" />
      <el-form ref="formBorrow" label-width="75px">
        <!-- 生成总额 -->
        <el-form-item :label="$t('pools.destroyToken')">
          <el-input v-model="sellToken" type="number" clearable
                    @input="handleSellToken">
          </el-input>
          <!-- 余额 -->
          <div class="balance">
            <span>{{ $t('pools.tokenNum') }}：{{token}}</span>
          </div>
        </el-form-item>
        <!-- 抵押数量 -->
        <el-form-item :label="$t('pools.withdrawalFunds')">
          <div>
            <el-input v-model="getNum1" type="number" disabled clearable>
              <template slot="prepend">{{ thisMarket.symbol0 }}</template>
            </el-input>
          </div>
          <div style="margin-top: 10px;">
            <el-input v-model="getNum2" type="number" disabled clearable>
              <template slot="prepend">{{ thisMarket.symbol1 }}</template>
            </el-input>
          </div>
        </el-form-item>
        <el-button class="btn" type="danger" v-if="scatter.identity" @click="handleToSell" plain>{{ $t('pools.withdrawalFunds') }}</el-button>
        <el-button class="btn" type="primary" v-else @click="handleLogin">{{ $t('public.loginPls') }}</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { dealToken, sellToken } from '@/utils/logic';
import { EosModel } from '@/utils/eos';
import { toFixed } from '@/utils/public';
import MarketListsCom from './MarketListsCom';

export default {
  name: 'swap',
  components: {
    MarketListsCom
  },
  data() {
    return {
      payNum1: '0.0000',
      payNum2: '0.0000',
      getToken: '0',
      sellToken: '0',
      getNum1: '0.0000',
      getNum2: '0.0000',
      index: 1, // 1 - 存入 | 2 - 取回
      token: '0',

      thisMarket: {}, // 当前选中的做市池子
      balanceSym0: '0.0000',
      balanceSym1: '0.0000',
      timer: null,
    }
  },
  props: {
    marketLists: {
      type: Array,
      default: function lists() {
        return []
      }
    }
  },
  watch: {
    marketLists: {
      handler: function marketList(newVal) {
        if (!this.thisMarket.mid) {
          this.thisMarket = newVal[0];
          return;
        }
        this.thisMarket = newVal.filter(v => v.mid === this.thisMarket.mid)
      },
      immediate: true,
      deep: true
    },
    scatter: {
      handler: function listen(newVal) {
        if (newVal.identity) {
          this.handleGetAccToken();
          this.handleBalanTimer();
        }
      },
      deep: true,
      immediate: true,
    },
    thisMarket() {
      this.handleBalanTimer();
      this.handleGetAccToken();
    }
  },
  computed:{
     ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
    })
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    handleLogin() {
      this.$emit('listenLogin', true)
    },
    // 重启余额定时器
    handleBalanTimer() {
      clearInterval(this.timer);
      this.handleGetBalance();
      this.handleGetBalance('next');
      this.timer = setInterval(() => {
        this.handleGetBalance();
        this.handleGetBalance('next');
      }, 20000)
    },
    // 获取账户余额
    async handleGetBalance(next) {
      const params = {
        code: this.thisMarket.contract0,
        coin: this.thisMarket.symbol0,
        decimal: this.thisMarket.decimal0
      };
      if (next) {
        params.code = this.thisMarket.contract1;
        params.coin = this.thisMarket.symbol1;
        params.decimal = this.thisMarket.decimal1;
      }
      await EosModel.getCurrencyBalance(params, res => {
        let balance = '0.0000';
        (!res || res.length === 0) ? balance = '0.0000' : balance = res.split(' ')[0];
        if (next) {
          this.balanceSym1 = balance;
          return;
        }
        this.balanceSym0 = balance;
      })
    },
    // 选择当前市场
    handleSelectThis(item) {
      this.thisMarket = item;
    },
    handleIptFocus(type = 'pay') {
      const n = type === 'pay' ? Number(this.payNum1) : Number(this.payNum2);
      if (!n) {
        type === 'pay' ? this.payNum1 = '' : this.payNum2 = '';
        return
      }
      type === 'pay' ? this.payNum1 = Number(this.payNum1) : this.payNum2 = Number(this.payNum2);
    },
    handleIptBlur(type = 'pay') {
      type === 'pay' ? this.payNum1 = toFixed(this.payNum1, this.thisMarket.decimal0)
                     : this.payNum2 = toFixed(this.payNum2, this.thisMarket.decimal1);
    },
    // 获取账户当前交易对凭证数量
    handleGetAccToken() {
      const params = {
        code: this.baseConfig.toAccountSwap,
        scope: this.thisMarket.mid,
        table: 'liquidity',
        lower_bound: this.scatter.identity.accounts[0].name,
        upper_bound: this.scatter.identity.accounts[0].name,
        json: true
      }
      EosModel.getTableRows(params, (res) => {
        const list = res.rows || [];
        !list[0] ? this.token = 0 : this.token = list[0].token;
      })
    },
    // 计算存币获取凭证
    handleInBy(type = 'pay') {
      const inData = {
        poolSym0: this.thisMarket.reserve0.split(' ')[0],
        poolSym1: this.thisMarket.reserve1.split(' ')[0],
        poolToken: this.thisMarket.liquidity_token
      }
      if (type === 'pay') {
        inData.payNum1 = this.payNum1;
      } else {
        inData.payNum2 = this.payNum2;
      }
      const outData = dealToken(inData)
      type === 'pay' ? this.payNum2 = toFixed(outData.payNum2, this.thisMarket.decimal1) :
                       this.payNum1 = toFixed(outData.payNum1, this.thisMarket.decimal0);
      this.getToken = outData.getToken;
    },
    // 存币做市
    handleAddToken() {
      const obj = this.thisMarket;
      const formName = this.$store.state.app.scatter.identity.accounts[0].name;
      const permission = this.$store.state.app.scatter.identity.accounts[0].authority;
      const params = {
        actions: [
          {
            account: this.baseConfig.toAccountSwap,
            name: 'deposit',
            authorization: [{
              actor: formName, // 转账者
              permission,
            }],
            data: {
              user: formName,
              mid: obj.mid
            }
          },
          {
            account: obj.contract0,
            name: 'transfer',
            authorization: [{
              actor: formName, // 转账者
              permission,
            }],
            data: {
              from: formName,
              to: this.baseConfig.toAccountSwap,
              quantity: `${this.payNum1} ${obj.symbol0}`,
              memo: `deposit`
            }
          },
          {
            account: obj.contract1,
            name: 'transfer',
            authorization: [{
              actor: formName, // 转账者
              permission,
            }],
            data: {
              from: formName,
              to: this.baseConfig.toAccountSwap,
              quantity: `${this.payNum2} ${obj.symbol1}`,
              memo: `deposit`
            }
          }
        ]
      }
      EosModel.toTransaction(params, (res) => {
        if(res.code) {
          this.$message({
            message: res.message,
            type: 'error'
          });
          return
        }
        this.handleGetAccToken();
        this.$message({
          message: 'Transfer Success',
          type: 'success'
        });
      })
    },
    // 计算卖出凭证
    handleSellToken() {
      const inData = {
        poolSym0: this.thisMarket.reserve0.split(' ')[0],
        poolSym1: this.thisMarket.reserve1.split(' ')[0],
        poolToken: this.thisMarket.liquidity_token,
        sellToken: this.sellToken
      }
      const outData = sellToken(inData);
      this.getNum1 = toFixed(outData.getNum1, this.thisMarket.decimal0);
      this.getNum2 = toFixed(outData.getNum2, this.thisMarket.decimal1);
    },
    handleToSell() {
      const obj = this.thisMarket;
      const formName = this.$store.state.app.scatter.identity.accounts[0].name;
      const permission = this.$store.state.app.scatter.identity.accounts[0].authority;
      const params = {
        actions: [
          {
            account: this.baseConfig.toAccountSwap,
            name: 'withdraw',
            authorization: [{
              actor: formName, // 转账者
              permission,
            }],
            data: {
              user: formName,
              mid: obj.mid,
              amount: this.sellToken
            }
          },
        ]
      }
      EosModel.toTransaction(params, (res) => {
        if(res.code) {
          this.$message({
            message: res.message,
            type: 'error'
          });
          return
        }
        this.handleGetAccToken();
        this.$message({
          message: 'Transfer Success',
          type: 'success'
        });
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.topDiv{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
  .title{
    height: 40px;
    line-height: 40px;
    text-align: left;
    &::before{
      content: '';
      position: relative;
      margin-right: 6px;
      border-left: 2px solid #409EFF;
    }
  }
}
.link{
  text-align: right;
  color: #409EFF;
  font-size: 14px;
  // margin-top: 15px;

  .toRepay{
    color: #f56c6c;
  }
}
.swap{
  margin-top: 5px;
  /deep/ .el-input-group__prepend{
    width: 28px;;
  }
  .balance{
    text-align: right;
    &>span{
      cursor: pointer;
    }
  }

  .btn{
    width: 100%;
  }
}

</style>
