<template>
  <div class="swapTrade">
    <div class="navTitle">
      <span class="title">{{ $t('tab.dex') }}</span>
      <span @click="handleToCreateMarket">{{ $t('dex.addMarket') }}></span>
    </div>
    <div class="trade" v-if="index === 1">
      <market-lists-com ref="marketListsCom" :thisMarket="thisMarket" :marketLists="marketLists"
        @listenMarketChange="handleSelectThis" />
      <el-form ref="formBorrow" class="formDiv">
        <!-- 抵押数量 -->
        <el-form-item style="margin-bottom: 0">
          <div class="label">{{ $t('dex.pay') }}</div>
          <el-input v-model="payNum" type="number"
                    @input="handleInBy('pay')"
                    @focus="handleFocus('pay')"
                    @blur="handleBlur('pay')">
            <span v-if="!direction" slot="suffix" @click="handleShowMarList" class="coinSpan">
              <span>{{ thisMarket.symbol0 }}</span>
              <span class="iconfont icon-huaban29 select"></span>
            </span>
            <span v-else slot="suffix" @click="handleShowMarList" class="coinSpan">{{ thisMarket.symbol1 }}
              <span class="iconfont icon-huaban29 select"></span>
            </span>
          </el-input>
        </el-form-item>
        <el-divider>
          <span class="aniDiv" @click="handleExchange">
            <!-- <span class="iconfont icon-huaban29 topIcon" :class="{'changing': ani}"></span>
            <span class="iconfont icon-huaban29 bottomIcon" :class="{'changing': ani}"></span> -->
            <img class="topIcon" :class="{'changing': ani}" src="@/assets/img/top.png" alt="">
            <img class="bottomIcon" :class="{'changing': ani}" src="@/assets/img/bottom.png" alt="">
          </span>
          <!-- <img class="change" @click="handleExchange" :class="{'changing': ani}" src="@/assets/img/change.png" alt=""> -->
        </el-divider>
        <!-- 生成总额 -->
        <el-form-item>
          <div class="label">{{ $t('dex.obtain') }}</div>
          <el-input v-model="getNum" type="number"
                    @input="handleInBy('get')"
                    @focus="handleFocus('get')"
                    @blur="handleBlur('get')">
            <span v-if="!direction" slot="suffix" @click="handleShowMarList" class="coinSpan">{{ thisMarket.symbol1 }}
              <span class="iconfont icon-huaban29 select"></span>
            </span>
            <span v-else slot="suffix" @click="handleShowMarList" class="coinSpan">{{ thisMarket.symbol0 }}
              <span class="iconfont icon-huaban29 select"></span>
            </span>
          </el-input>
        </el-form-item>
      </el-form>

      <div class="infoDetail">
        <div class="tradeRate">
          <span>{{ $t('dex.rate') }}</span>
          <span v-if="direction">1 {{ thisMarket.symbol0 }} = {{ tradeInfo.aboutPrice | numberTofixed }} {{ thisMarket.symbol1 }}</span>
          <span v-else>1 {{ thisMarket.symbol1 }} = {{ tradeInfo.aboutPrice | numberTofixed }} {{ thisMarket.symbol0 }}</span>
        </div>
        <div class="slipPointDiv" v-if="showDetail">
          <div class="tradeRateTitle">
            <span>{{ $t('dex.slipPoint') }}</span>
            <span class="iconfont icon-huaban tip" @click="handleShowSlipTip"></span>
          </div>
          <div class="slipPoint">
            <span :class="{'checked': !isUserSet && slipPointUser === '1'}" @click="handleChangeSlip('1')">1%</span>
            <span :class="{'checked': !isUserSet && slipPointUser === '5'}" @click="handleChangeSlip('5')">5%</span>
            <span :class="{'checked': !isUserSet && slipPointUser === '10'}" @click="handleChangeSlip('10')">10%</span>
          </div>
          <div class="slipIpt">
            <el-input class="sIpt" v-model="isUserSetSlip" type="number"
              :placeholder="$t('public.useDefined')"
              :class="{'checked': isUserSet}"
              @focus="isUserSet = true"
              @blur="handleSlipIptBlur"
              @input="handleUserSetSlip">
              <span slot="suffix" class="slipIptPer">%</span>
            </el-input>
          </div>
        </div>
        <div class="more" @click="showDetail = !showDetail">
          <span class="iconfont icon-huaban29 moreIcon"
                :class="{'closeMore': showDetail}"></span>
        </div>
      </div>

      <!-- 余额 -->
      <div class="balance">
        <span>{{ $t('public.fee') }}：0.3%</span>
        <span v-if="!direction">{{ $t('public.balance') }}：{{balanceSym0}} {{ thisMarket.symbol0 }}</span>
        <span v-else>{{ $t('public.balance') }}：{{balanceSym1}} {{ thisMarket.symbol1 }}</span>
      </div>

      <el-button class="btn" type="primary" v-if="scatter.identity" plain @click="handleSwapTrade">{{ $t('dex.swapNow') }}</el-button>
      <el-button class="btn" type="primary" v-else @click="handleLogin">{{ $t('public.loginPls') }}</el-button>
    </div>

    <div v-else>
      <create-dex @listenLogin="handleLogin"
        @listenGetMarketsList="handleRowsMarket"
        :scatter="scatter" />
    </div>

    <slip-tip ref="slipTip"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { dealTrade } from '@/utils/logic';
import { toFixed } from '@/utils/public';
import { EosModel } from '@/utils/eos';
import MarketListsCom from '@/views/index/components/MarketListsCom';
import SlipTip from '@/views/dex/components/SlipTip';

export default {
  name: 'trade',
  components: {
    MarketListsCom,
    SlipTip
  },
  data() {
    return {
      index: 1,
      payNum: '0.0000',
      getNum: '0.0000',
      direction: false,
      drawer: false,
      thisMarket: {
        contract0: "eosio.token",
        contract1: "jinbankoneos",
        decimal0: "4",
        decimal1: "4",
        last_update: "2020-05-14T06:49:27",
        liquidity_token: 2509980,
        mid: 1,
        price0_cumulative_last: "10524156827",
        price0_last: "2.52539999999999987",
        price1_cumulative_last: 1513579653,
        price1_last: "0.39589999999999997",
        reserve0: "157.9329 EOS",
        reserve1: "398.7956 JIN",
        sym0: "4,EOS",
        sym1: "4,JIN",
        symbol0: "EOS",
        symbol1: "JIN",
      }, // 当前选中的做市池子
      balanceSym0: '0.0000',
      balanceSym1: '0.0000',
      timer: null,
      tradeInfo: {}, // 交易详情
      slipPointUser: '5', // 默认 5%
      isUserSetSlip: '', // 用户自定义滑点保护
      showDetail: false,
      isUserSet: false,
      ani: false,
      aniTimer: null,
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
        if (!newVal.length) {
          return
        }
        if (!this.thisMarket.mid) {
          this.thisMarket = newVal[0];
          return;
        }
        this.thisMarket = newVal.find(v => v.mid === this.thisMarket.mid)
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
      this.handleInBy(this.tradeInfo.type)
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
    handleShowSlipTip() {
      this.$refs.slipTip.showTip = true;
    },
    handleToCreateMarket() {
      this.$router.push({
        name: 'createMarket',
      })
    },
    handleShowMarList() {
      this.$refs.marketListsCom.handleShowDrawer();
    },
    // 滑点保护设置
    minOutCoin(index) {
      const dir = this.direction;
      const type = this.tradeInfo.type === 'pay';
      if (index === 0) {
        const coin0 = (!dir && type) || (dir && !type) ? this.thisMarket.symbol0 : this.thisMarket.symbol1;
        return coin0
      }
      const coin1 = (!dir && !type) || (dir && type) ? this.thisMarket.symbol0 : this.thisMarket.symbol1;
      return coin1
    },
    handleSlipIptBlur() {
      if (!Number(this.isUserSetSlip)) {
        this.isUserSet = false;
        this.slipPointUser = '5';
      }
    },
    handleUserSetSlip(rate) {
      if (Number(rate) < 0) {
        this.slipPointUser = Math.abs(rate);
        this.isUserSetSlip = Math.abs(rate);
        return
      }
      this.isUserSet = true;
      this.isUserSetSlip = rate;
      this.slipPointUser = rate;
      this.handleInBy(this.tradeInfo.type)
    },
    handleChangeSlip(rate) {
      if (Number(rate) < 0) {
        return
      }
      this.isUserSet = false;
      this.slipPointUser = rate;
      this.handleInBy(this.tradeInfo.type)
    },
    handleToFixed(n, l) {
      if (!isNaN(n)) {
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
        type,
        slipPointUser: this.slipPointUser / 100, // 滑点保护
      }
      if (type === 'pay') {
        inData.payNum = this.payNum;
      } else {
        inData.getNum = this.getNum;
      }
      const outData = dealTrade(inData);
      this.tradeInfo = outData;
      type === 'pay' ? this.getNum = toFixed(outData.minOut, 4) : this.payNum = toFixed(outData.minOut, 4);
    },
    handleExchange() {
      this.direction = !this.direction;
      this.payNum = '0.0000';
      this.getNum = '0.0000';
      this.tradeInfo = {};
      this.ani = true;
      clearTimeout(this.aniTimer)
      this.aniTimer = setTimeout(() => {
        this.ani = false;
      }, 300);
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
.swapTrade{
  padding: 20px 18px;
  .navTitle{
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    color: #C1C1C1;
    margin-bottom: 20px;
    .title{
      font-size: 28px;
      color: #070707;
      font-weight: 500;
    }
    .github{
      font-size: 14px;
      color: #C1C1C1;
      text-decoration: none;
    }
  }
  .formDiv{
    background: #F5F5F5;
    border-radius: 8px;
    padding: 5px 20px;
    margin-bottom: 12px;
    .label{
      font-size: 14px;
      text-align: left;
      font-weight: 500;
    }
    .coinSpan{
      display: flex;
      .select{
        margin-left: 5px;
        font-size: 12px;
        display: flex;
        transform: rotate(90deg);
      }
    }
    /deep/ .el-form-item{
      margin-bottom: 5px;
      &:last-child{
        margin-bottom: 0px;
      }
    }

    /deep/ .el-input{
      background-color: transparent;
      .el-input__inner{
        color: #070707;
        font-weight: 500;
        background-color: transparent;
        font-size: 24px;
        padding-left: 0px;
        outline: none;
        border: 1px solid transparent;
        &:focus{
          border-color: transparent;
        }
      }
      .el-input__suffix{
        color: #070707;
        font-weight: 500;
        font-size: 20px;
      }
    }
    /deep/ .el-divider--horizontal{
      margin: 10px 0;
      .el-divider__text{
        background: #F5F5F5;
      }
    }
    .aniDiv{
      width: 22px;
      height: 19px;;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      transition: .3s all;
      transform: scale(1);
      margin: 0 20px;
    }
    .topIcon{
      display: block;
      width: 100%;
      transition: .3s all;
      transform: translate(0);
      &.changing{
        transform: translate(0, -3px);
      }
    }
    .bottomIcon{
      display: block;
      width: 100%;
      transition: .3s all;
      transform: translate(0);
      &.changing{
        transform: translate(0, 3px);
      }
    }
    .change{
      width: 20px;
      transition: .3s all;
      transform: scale(1);
      &.changing{
        transform: scale(1.2)
      }
    }
  }
  .infoDetail{
    background: #f5f5f5;
    border-radius: 8px;
    padding: 15px 20px 8px;
    .tradeRate{
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      &>span:last-child{
        font-weight: 500;
      }
    }
    .more{
      height: 20px;
      position: relative;
      .moreIcon{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) rotate(90deg);
        &.closeMore{
          transform: translate(-50%, -50%) rotate(-90deg);
        }
      }
    }
    .slipPointDiv{
      margin-top: 10px;
      .tradeRateTitle{
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-bottom: 10px;
        .tip{
          font-size: 16px;
          margin-left: 5px;
        }
      }
      .slipPoint{
        display: flex;
        align-items: center;
        justify-content: space-between;
        &>span{
          font-size: 14px;
          border: 1px solid #DADADA;
          border-radius: 13px;
          width: 80px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;

          &.checked{
            background: #FFF;
            border: 1px solid #42B48F;
            border-radius: 13px;
            color: #42B48F;
          }
        }
      }
      .slipIpt{
        margin-top: 10px;
        display: flex;
        align-items: center;
        .checked{
          /deep/ .el-input__inner{
            background: #FFF !important;
            border: 1px solid #42B48F;
            border-radius: 13px;
            color: #42B48F;
          }
        }
        /deep/ .el-input{
          width: 148px;
          .el-input__inner{
            height: 28px;;
            border-radius: 30px;
            font-size: 12px;
            line-height: 28px;
            background: transparent;
            &:focus{
              color: #42B48F;
              border: 1px solid #42B48F;
              background: #FFF;
            }
          }
          .el-input__suffix{
            padding-right: 8px;
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }
  .balance{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    margin: 10px 0 20px;
  }
  .btn{
    width: 100%;
    background: #42B48F;
    color: #fff;
    border-color: transparent;
  }
}
</style>
