<template>
  <el-dialog
    class="dialog"
    :class="{'unstakeAct': active === 3}"
    width="305px"
    :visible.sync="showBonus">
    <div class="bonus" v-if="showBonus">
      <div class="title" v-if="active !== 3">
        <span :class="{'green': active === 1}" @click="handleClickActive(1)">{{ $t('hyk.stock') }}</span>
        <span :class="{'green': active === 2}" v-if="scatter.identity"
          @click="handleClickActive(2)">{{ $t('bonus.myDividends') }}</span>
      </div>
      <div class="subTool" v-else>
        <span @click="handleClickActive(2)" class="iconfont icon-huaban29 back"></span>
        <span>{{ $t('bonus.redeemDetail') }}</span>
      </div>
      <bonus-total v-if="active === 1" />
      <!-- 我的红利 -->
      <div class="list" v-else-if="active === 2">
        <div class="next">
          <div class="item mt12">
            <span>{{ $t('bonus.myDividends') }}</span>
            <span class="green" @click="handleAccGetRefund">{{ $t('bonus.claim') }}</span>
          </div>
          <div class="bonusNum">
            <span>100.0000 EOS</span>
          </div>
        </div>
        <div class="item">
          <span>{{ $t('bonus.ableStake') }}</span>
          <span>1.2345 DFS</span>
        </div>
        <div class="item inputItem mt15">
          <input type="number" :placeholder="`${$t('bonus.inStake')}`">
          <span class="btn" @click="handleAccToStake">{{ $t('bonus.stake') }}</span>
        </div>
        <div class="item">
          <span>{{ $t('bonus.staked') }}</span>
          <span>1.2345 DFS</span>
        </div>
        <div class="item mt15">
          <span></span>
          <span class="small">{{ $t('bonus.ofPercent', {percent: '0.10'}) }}</span>
        </div>
        <div class="item">
          <span>{{ $t('bonus.redeemable') }}</span>
          <span>1.2345 DFS</span>
        </div>
        <div class="item inputItem mt15">
          <input type="number" :placeholder="`${$t('bonus.inRedeem')}`">
          <span class="btn" @click="handleAccToRefund">{{ $t('bank.redeem') }}</span>
        </div>
        <div class="item">
          <span>{{ $t('bonus.redeeming') }}</span>
          <span @click="handleClickActive(3)">
            <span>1.2345 DFS</span>
            <span class="iconfont icon-huaban29 right"></span>
          </span>
        </div>
      </div>

      <div v-else class="unstakeLists">
        <div class="unstakeList">
          <div>
            <span>{{ $t('bonus.redeemNum') }}</span>
            <span>10.8782 DFS</span>
          </div>
          <div>
            <span>{{ $t('bonus.redeemTime') }}</span>
            <span>{{ $t('bonus.lastTime', {day: 11, hour: 23}) }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { EosModel } from '@/utils/eos';
import { crazyCurryingHelper, toFixed, getPrice, toBrowser } from "@/utils/public";
import BonusTotal from './bonusChild/BonusTotal';

export default {
  name: 'bonus',
  components: {
    BonusTotal
  },
  data() {
    return {
      showBonus: false,
      active: 1, // 1 - 股权权益 | 2 - 我的红利
      balanceEos: '0.0000',
      balanceJin: '0.0000',
      totalValue: '0.0000', // JIN = USD  |  EOS = USD * price
      sellHykAccBalan: '0.0000', // 限量卖HYK账户
      swapHykAccBalan: '0.0000', // swap合约内 HYK余额
      jinFundsBalan: '0.0000', // 资金账户
      totalHykBonus: '0.0000', // 参与分红的HYK数量
      supply: '0.0000', // 流通量
      perBonus: '0.0000',
      price: '0.0001',
      timer: null,
      
      // 柯里化函数变量
      valueCurrying: null, // 计算总估值的柯里化函数
      hykCurrying: null, // 计算参与分红数量的柯里化函数
      perCurrying: null, // 计算每份分红的柯里化函数
    }
  },
  computed:{
     ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
    }),
  },
  watch: {
    showBonus(newVal) {
      if(!newVal) {
        return;
      }
      this.handleClickActive(1)
      this.handleStartGetBalan();
      this.handleStartTotalHyk()
    }
  },
  mounted() {
    this.handleStartGetBalan();
    this.handleStartTotalHyk()

    // test
    this.handleGetBalance()
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  },
  methods: {
    handleClickActive(type) {
      this.active = type;
    },
    handleToBrowser() {
      toBrowser(this.baseConfig.bonusAccount, 'eos', 'account');
    },
    handleInitCurrying() {
      this.valueCurrying = crazyCurryingHelper(this.handleTotalValue);
      this.hykCurrying = crazyCurryingHelper(this.handleBonusCount);
      this.perCurrying = crazyCurryingHelper(this.handlePerBonus);
    },
    handleStartTotalHyk() {
      this.handleGetHykStats();
      // this.handleGetBalance('HYK');
      // this.handleGetBalance('HYK Swap')
      // this.handleGetBalance('HYK Funds');
    },
    handleStartGetBalan() {
      clearTimeout(this.timer);
      this.handleInitCurrying();
      // this.handleGetBalance();
      // this.handleGetBalance('next')
      this.handleGetPrice();
      // this.timer = setTimeout(() => {
      //   this.handleGetBalance();
      //   this.handleGetBalance('next')
      //   this.handleGetPrice();
      // }, 10000);
    },
    // 获取账户余额
    async handleGetBalance_old(type) {
      let params = {
        code: this.baseConfig.baseCoinContract,
        coin: 'EOS',
        decimal: 4,
        account: this.baseConfig.bonusAccount,
      }
      if (type === 'next') {
        params = {
          code: this.baseConfig.toAccountJin,
          coin: 'JIN',
          decimal: 4,
          account: this.baseConfig.bonusAccount,
        }
      }
      if (type === 'HYK') {
        params = { // 限量交易的HYK余额
          code: this.baseConfig.hykContranct,
          coin: 'HYK',
          decimal: 4,
          account: this.baseConfig.toAccountByHyk,
        }
      }
      if (type === 'HYK Swap') {
        params = { // swap 合约中 HYK余额
          code: this.baseConfig.hykContranct,
          coin: 'HYK',
          decimal: 4,
          account: this.baseConfig.toAccountSwap,
        }
      }
      if (type === 'HYK Funds') {
        params = { // swap 合约中 HYK余额
          code: this.baseConfig.hykContranct,
          coin: 'HYK',
          decimal: 4,
          account: this.baseConfig.teamFunds,
        }
      }
      await EosModel.getCurrencyBalance(params, res => {
        let balance = '0.0000'
        if (!res || res.length === 0) {
          balance = '0.0000';
        } else {
          balance = res.split(' ')[0];
        }
        if (type === 'HYK') {
          this.sellHykAccBalan = balance;
          this.hykCurrying = this.hykCurrying('', balance);
          return;
        }
        if (type === 'HYK Swap') {
          this.swapHykAccBalan = balance;
          this.hykCurrying = this.hykCurrying('', '', balance);
          return;
        }
        if (type === 'HYK Funds') {
          this.jinFundsBalan = balance;
          this.hykCurrying = this.hykCurrying('', '', '', balance);
          return
        }
        if (type === 'next') {
          this.balanceJin = balance;
          this.valueCurrying = this.valueCurrying('', balance);
          return;
        }
        this.balanceEos = balance;
        this.valueCurrying = this.valueCurrying(balance);
      })
    },
    // 获取总发行量
    async handleGetHykStats() {
      const https = this.baseConfig.node.url;
      const params = {
        code: this.baseConfig.hykContranct,
        symbol: 'HYK'
      }
      const result = await axios.post(`${https}/v1/chain/get_currency_stats`, JSON.stringify(params))
      if (result.status !== 200) {
        return;
      }
      const res = result.data['HYK'];
      this.supply = res.supply.split(' ')[0];
      this.hykCurrying = this.hykCurrying(this.supply);
    },
    // 获取jiage
    handleGetPrice() {
      getPrice((price) => {
        this.price = price;
        this.valueCurrying = this.valueCurrying('', '', this.price);    
      })
    },
    // 计算参与股份
    handleBonusCount(supply, sellHykAccBalan, swapHykAccBalan, jinFundsBalan) {
      const totalHykBonus = supply - sellHykAccBalan - swapHykAccBalan - jinFundsBalan;
      this.totalHykBonus = toFixed(totalHykBonus, 4);
      this.perCurrying = this.perCurrying('', this.totalHykBonus);
    },
    // 计算分红总估值
    handleTotalValue(balanEos, balanJin, price) {
      let total = balanEos * price + balanJin * 1;
      this.totalValue = toFixed(total, 4);
      this.perCurrying = this.perCurrying(this.totalValue);
    },
    // 计算每股分红
    handlePerBonus(totalValue, totalHykBonus) {
      let perBonus = totalValue / (totalHykBonus / 10000);
      this.perBonus = toFixed(perBonus, 4);
    },
    // 获取账户抵押详情
    handleGetAccStakes() {
      const params = {
        code: 'defistakedfs',
        scope: 'defistakedfs',
        table: 'stakes',
        lower_bound: this.scatter.identity.accounts[0].name,
        upper_bound: this.scatter.identity.accounts[0].name,
        json: true
      }
      EosModel.getTableRows(params, (res) => {
        console.log(res)
      })
    },
    // 获取账户赎回详情
    handleGetAccRefunds() {
      const params = {
        code: 'defistakedfs',
        scope: this.scatter.identity.accounts[0].name,
        table: 'refunds',
        json: true
      }
      EosModel.getTableRows(params, (res) => {
        console.log(res)
      })
    },
    // 账户转账参与抵押
    handleAccToStake() {
      const formName = this.$store.state.app.scatter.identity.accounts[0].name;
      const permission = this.$store.state.app.scatter.identity.accounts[0].authority;
      const params = {
        actions: [
          {
            account: 'minedfstoken',
            name: 'transfer',
            authorization: [{
              actor: formName, // 转账者
              permission,
            }],
            data: {
              from: formName,
              to: 'defistakedfs',
              quantity: `100.0000 DFS`,
              memo: `stake`
            }
          }
        ]
      }
      EosModel.toTransaction(params, (res) => {
        console.log(res)
      })
    },
    // 账户赎回抵押
    handleAccToRefund() {
      const formName = this.$store.state.app.scatter.identity.accounts[0].name;
      const permission = this.$store.state.app.scatter.identity.accounts[0].authority;
      const params = {
        actions: [
          {
            account: 'defistakedfs',
            name: 'unstake',
            authorization: [{
              actor: formName, // 转账者
              permission,
            }],
            data: {
              user: formName,
              quantity: `100.0000 DFS`,
            }
          }
        ]
      }
      EosModel.toTransaction(params, (res) => {
        console.log(res)
      })
    },
    // 用户领取已解抵押的DFS - 根据id领取
    handleAccGetRefund() {
      const formName = this.$store.state.app.scatter.identity.accounts[0].name;
      const permission = this.$store.state.app.scatter.identity.accounts[0].authority;
      const params = {
        actions: [
          {
            account: 'defistakedfs',
            name: 'refund',
            authorization: [{
              actor: formName, // 转账者
              permission,
            }],
            data: {
              user: formName,
              id: 0,
            }
          }
        ]
      }
      EosModel.toTransaction(params, (res) => {
        console.log(res)
      })
    },
    // 获取账户余额
    async handleGetBalance(next) {
      const params = {
        code: 'minedfstoken',
        coin: 'DFS',
        decimal: 4
      };
      // if (next) {
      //   params.code = this.thisMarket.contract1;
      //   params.coin = this.thisMarket.symbol1;
      //   params.decimal = this.thisMarket.decimal1;
      // }
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
  }
}
</script>

<style lang="scss" scoped>
.dialog{
  /deep/ .el-dialog{
    border-radius: 8px;
    .el-dialog__header{
      padding: 0;
    }
    .el-dialog__body{
      padding-bottom: 30px;
    }
    .el-dialog__headerbtn{
      z-index: 10;
    }
  }

  &.unstakeAct{
    /deep/ .el-dialog{
      .el-dialog__body{
        padding-top: 10px;
      }
      .el-dialog__headerbtn{
        display: none;
      }
    }
  }
}
.bonus{
  .green{
    color: #42B48F !important;
  }
  .title{
    color: #070707;
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    &>span{
      flex: 1;
      text-align: center;
    }
  }
  .list{
    font-size: 14px;
    color: #070707;
    .next{
      background: #f9f9f9;
      padding: 20px 15px;
      margin: 20px 0 18px;
    }
    .item{
      display: flex;
      align-items: center;
      justify-content: space-between;
      &.mt12{
        margin-bottom: 12px;
      }
      &.mt15{
        margin-bottom: 15px;
      }
      span{
        &:last-child{
          font-weight: 500;
        }
        &.small{
          font-size: 12px;
          // margin-top: 3px;
          font-weight: normal !important;
        }
      }
      .right{
        font-size: 12px;
        margin-left: 10px;
      }
    }
    .bonusNum{
      font-weight: 500;
      font-size: 16px;
      text-align: left;
    }
    .inputItem{
      background: #f9f9f9;
      height: 37px;
      margin-top: 5px;
      input{
        background: transparent;
        height: 100%;
        width: calc(100% - 70px);
        border: 0px;
        outline: none;
        font-size: 14px;
        padding-left: 10px;
      }
      .btn{
        font-size: 12px;
        font-weight: 500;
        height: 31px;
        width: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #42B48F;
        color: #f9f9f9;
        border-radius: 2px;
        margin-right: 10px;
      }
    }
  }
  .subTool{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    position: relative;
    color: #070707;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    // box-shadow: 0 2px 4px 0 rgba(0,0,0,0.08);
    .back{
      font-size: 16px;
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translate(0%, -50%) rotate(180deg);
    }
  }
  .unstakeLists{
    height: 349px;
    overflow: auto;
    .unstakeList{
      background: #f9f9f9;
      color: #070707;
      font-size: 14px;
      padding: 20px 15px;
      margin-bottom: 10px;
      &:last-child{
        margin-bottom: 0px;
      }
      &>div{
        display: flex;
        align-items: center;
        justify-content: space-between;

        &:first-child{
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
