<template>
  <div class="swapTrade">
    <div class="topDiv">
      <div class="title">
        <span v-if="index === 1">{{ $t('dex.trade') }}</span>
        <span v-else>{{ $t('dex.createdDex') }}</span>
      </div>
      <div class="link">
        <span v-if="index !== 1" @click="index = 1">{{ $t('dex.toTrade') }}></span>
        <span v-else class="toRepay" @click="index = 2">{{ $t('dex.toCreatedDex') }}></span>
      </div>
    </div>
    <div class="trade" v-if="index === 1">
      <market-lists-com :thisMarket="thisMarket" :marketLists="marketLists"
        @listenMarketChange="handleSelectThis" />
      <el-form ref="formBorrow" label-width="75px">
        <!-- 抵押数量 -->
        <el-form-item :label="$t('dex.payNum')" style="margin-bottom: 0">
          <el-input v-model="payNum" type="number" clearable
                    @input="handleInBy('pay')"
                    @focus="handleFocus('pay')"
                    @blur="handleBlur('pay')">
            <template v-if="!direction" slot="prepend">{{ thisMarket.symbol0 }}</template>
            <template v-else slot="prepend">{{ thisMarket.symbol1 }}</template>
          </el-input>
          <!-- 余额 -->
          <div class="balance">
            <span v-if="!direction">{{ $t('public.balance') }}：{{balanceSym0}} {{ thisMarket.symbol0 }}</span>
            <span v-else>{{ $t('public.balance') }}：{{balanceSym1}} {{ thisMarket.symbol1 }}</span>
          </div>
        </el-form-item>
        <!-- 互换 -->
        <div class="changeDiv">
          <span class="iconfont icon-huaban23 change" @click="handleExchange"></span>
        </div>
        <!-- 生成总额 -->
        <el-form-item :label="$t('dex.getNum')" style="margin-top: 5px">
          <el-input v-model="getNum" type="number" clearable
                    @input="handleInBy('get')"
                    @focus="handleFocus('get')"
                    @blur="handleBlur('get')">
            <template v-if="!direction" slot="prepend">{{ thisMarket.symbol1 }}</template>
            <template v-else slot="prepend">{{ thisMarket.symbol0 }}</template>
          </el-input>
          <div class="tradeRate">
            <span>{{ $t('dex.rate') }}</span>
            <span v-if="!direction">1 {{ thisMarket.symbol0 }} = {{ tradeInfo.aboutPrice | numberTofixed }} {{ thisMarket.symbol1 }}</span>
            <span v-else>1 {{ thisMarket.symbol1 }} = {{ tradeInfo.aboutPrice | numberTofixed }} {{ thisMarket.symbol0 }}</span>
          </div>
        </el-form-item>
        <div class="infoDetail" v-if="Number(tradeInfo.aboutPrice) && false">
          <div class="title">交易详情</div>
          <div class="detail">
            <div class="doing">您正在出售 XXX , 滑点是{{ tradeInfo.slipPoint }}</div>
            <div class="setting">
              <div>滑点保护  ? </div>
              <div>
                <span>1%</span>
                <span>5%</span>
                <span>10%</span>
              </div>
              <div>
                <el-input v-model="slipPoint" type="number">
                  <span slot="suffix" clearable>%</span>
                </el-input>
              </div>
            </div>
          </div>
        </div>
        <el-button class="btn" type="primary" v-if="scatter.identity" plain @click="handleSwapTrade">{{ $t('dex.trade') }}</el-button>
        <el-button class="btn" type="primary" v-else @click="handleLogin">{{ $t('public.loginPls') }}</el-button>
      </el-form>
    </div>

    <div v-else>
      <create-dex @listenLogin="handleLogin"
        @listenGetMarketsList="handleRowsMarket"
        :scatter="scatter" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { dealTrade } from '@/utils/logic';
import { toFixed } from '@/utils/public';
import { EosModel } from '@/utils/eos';
import MarketListsCom from './MarketListsCom';
import CreateDex from './CreateDex';

export default {
  name: 'trade',
  components: {
    MarketListsCom,
    CreateDex
  },
  data() {
    return {
      index: 1,
      payNum: '0.0000',
      getNum: '0.0000',
      direction: false,
      drawer: false,
      thisMarket: {}, // 当前选中的做市池子
      balanceSym0: '0.0000',
      balanceSym1: '0.0000',
      timer: null,
      tradeInfo: {}, // 交易详情
      slipPoint: '',
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
          this.handleBalanTimer();
        }
      },
      deep: true,
      immediate: true,
    },
    thisMarket() {
      this.handleBalanTimer();
    }
  },
  computed:{
    ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
    })
  },
  mounted() {
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    handleToFixed(n, l) {
      if (Number(n)) {
        return toFixed(Number(n), l || 4)
      }
      return ''
    },
    handleRowsMarket() {
      this.$emit('listenGetMarketsList', true)
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
    handleShowDrawer() {
      this.drawer = true;
    },
    // 选择当前市场
    handleSelectThis(item) {
      this.thisMarket = item;
      this.drawer = false;
    },
    handleLogin() {
      this.$emit('listenLogin', true)
    },
    handleInBy(type = 'pay') {
      const inData = {
        direction: this.direction,
        poolSym0: this.thisMarket.reserve0.split(' ')[0],
        poolSym1: this.thisMarket.reserve1.split(' ')[0],
        poolToken: this.thisMarket.liquidity_token,
      }
      if (type === 'pay') {
        inData.payNum = this.payNum;
      } else {
        inData.getNum = this.getNum;
      }
      const outData = dealTrade(inData);
      this.tradeInfo = outData;
      type === 'pay' ? this.getNum = toFixed(outData.getNum, 4) : this.payNum = toFixed(outData.payNum, 4);
      // this.getNum = outData.getNum;
      // this.payNum = outData.payNum;
    },
    handleExchange() {
      this.direction = !this.direction;
      this.payNum = '0.0000';
      this.getNum = '0.0000';
      this.tradeInfo = {};
    },
    handleFocus(type = 'pay') {
      const num = type === 'pay' ? Number(this.payNum) : Number(this.getNum);
      if (!num) {
        type === 'pay' ? this.payNum = '' : this.getNum = '';
        return
      }
      type === 'pay' ? this.payNum = Number(this.payNum) : this.getNum = Number(this.getNum);
    },
    handleBlur(type = 'pay') {
      type === 'pay' ? this.payNum = toFixed(Number(this.payNum), 4)
                     : this.getNum = toFixed(Number(this.getNum), 4);
    },
    // swap交易
    handleSwapTrade() {
      const tradeCoin = this.direction ? this.thisMarket.symbol1 : this.thisMarket.symbol0;
      const params = {
        code: this.direction ? this.thisMarket.contract1 : this.thisMarket.contract0,
        toAccount: this.baseConfig.toAccountSwap,
        memo: `swap:${this.thisMarket.mid}`,
        quantity: `${this.payNum} ${tradeCoin}`
      }
      EosModel.transfer(params, (res) => {
        if(res.code) {
          this.$message({
            message: res.message,
            type: 'error'
          });
          return
        }
        this.handleBalanTimer();
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
    color: #409EFF;
  }
}
.trade{
  margin-top: 5px;
  /deep/ .el-input-group__prepend{
    width: 28px;;
  }
  .changeDiv{
    margin-bottom: 30px;
    .change{
      font-size: 20px;
      color: #409EFF;
    }
  }
  .tradeRate{
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #999;
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
.infoDetail{
  font-size: 14px;
  .title{
    color: #F56C6C;
  }
}

</style>
