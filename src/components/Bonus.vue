<template>
  <div class="bonus">
    <div class="title">HYK DAO</div>
    <div class="list">
      <div>
        <span>DAO 账户</span>
        <span class="account" @click="handleToBrowser">{{ baseConfig.bonusAccount }}</span>
      </div>
      <div>
        <span>EOS 余额</span>
        <span class="">{{ balanceEos }} EOS</span>
      </div>
      <div>
        <span>JIN 余额</span>
        <span class="">{{ balanceJin }} JIN</span>
      </div>
      <div>
        <span>总估值</span>
        <span class="totalValue">{{ totalValue }} USD</span>
      </div>
      <div>
        <span>总股份数</span>
        <span class="totalValue">{{ totalHykBonus }} HYK</span>
      </div>
      <div>
        <span>每股分红</span>
        <span class="balance">{{ perBonus }} USD</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { EosModel } from '@/utils/eos';
import { crazyCurryingHelper, toFixed, getPrice, toBrowser } from "@/utils/public";

export default {
  name: 'bonus',
  data() {
    return {
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
  mounted() {
    this.handleStartGetBalan();
    this.handleStartTotalHyk()
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  },
  methods: {
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
      this.handleGetBalance('HYK');
      this.handleGetBalance('HYK Swap')
      this.handleGetBalance('HYK Funds');
    },
    handleStartGetBalan() {
      clearTimeout(this.timer);
      this.handleInitCurrying();
      this.handleGetBalance();
      this.handleGetBalance('next')
      this.handleGetPrice();
      // this.timer = setTimeout(() => {
      //   this.handleGetBalance();
      //   this.handleGetBalance('next')
      //   this.handleGetPrice();
      // }, 10000);
    },
    // 获取账户余额
    async handleGetBalance(type) {
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
      let perBonus = totalValue / totalHykBonus;
      this.perBonus = toFixed(perBonus, 4);
    }
  }
}
</script>

<style lang="scss" scoped>
.bonus{
  .title{
    color: #F56C6C;
    font-size: 18px;
    font-weight: 500;
  }
  .list{
    margin-top: 20px;
    font-size: 14px;
    &>div{
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;

      .account{
        color: #409EFF !important;
      }

      .balance{
        color: #67c23a;
      }
      .totalValue{
        color: #F56C6C
      }
    }
  }
}
</style>
