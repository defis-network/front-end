<template>
  <div>
    <!-- 方式1: 现价认购 -->
    <div class="type">
      <div class="title">限量认购</div>
      <el-form class="formDiv" ref="formBorrow" label-width="75px">
        <!-- 抵押数量 -->
        <el-form-item label="购买金额">
          <el-input v-model="payNum"
            @focus="handleIptFocus('stake')"
            @input="handleGetNum" @blur="handleInputBlur('stake')" type="number" clearable>
            <span slot="suffix">EOS</span>
          </el-input>
          <!-- 余额 -->
          <div class="balance">
            <span>余额：{{balanceEos}} EOS</span>
          </div>
        </el-form-item>
        <!-- 生成总额 -->
        <el-form-item label="购买数量" style="margin-top: 5px">
          <el-input v-model="getNum"
            @focus="handleIptFocus('mint')"
            @input="handleGetTransNum" @blur="handleInputBlur('mint')" type="number" clearable>
            <span slot="suffix">HYK</span>
          </el-input>
        </el-form-item>
        <el-button class="btn" type="primary" v-if="scatter.identity" plain @click="handleTransfer">认购HYK</el-button>
        <el-button class="btn" type="primary" v-else @click="handleLogin">请先登录</el-button>
      </el-form>
    </div>
    <!-- 方式2: swap认购 -->
    <div class="type">
      <div class="title">SWAP认购</div>
      <el-form class="formDiv" ref="formBorrow" label-width="75px">
        <el-form-item label="购买金额" style="margin-bottom: 0;">
          <el-input v-model="payNum2"
            @focus="handleIptFocus2('stake')"
            @input="handleGetTransNum2('pay')" @blur="handleInputBlur2('stake')" type="number" clearable>
            <span slot="suffix">EOS</span>
          </el-input>
          <!-- 余额 -->
          <div class="balance">
            <span>余额：{{balanceEos}} EOS</span>
          </div>
        </el-form-item>
        <div class="changeDiv">
          <span class="iconfont icon-huaban22 change"></span>
        </div>
        <!-- 生成总额 -->
        <el-form-item label="购买数量" style="margin-top: 5px">
          <el-input v-model="getNum2"
            @focus="handleIptFocus2('mint')"
            @input="handleGetTransNum2('get')" @blur="handleInputBlur2('mint')" type="number" clearable>
            <span slot="suffix">HYK</span>
          </el-input>
        </el-form-item>
        <el-button class="btn" type="primary" v-if="scatter.identity" plain @click="handleTransferSwap">认购HYK</el-button>
        <el-button class="btn" type="primary" v-else @click="handleLogin">请先登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { EosModel } from '@/utils/eos';
import { toFixed, toLocalTime } from '@/utils/public';
import { dealTrade } from '@/utils/logic';

export default {
  name: 'buyHyk',
  data() {
    return {
      payNum: '0.0000',
      getNum: '0.0000',
      payNum2: '0.0000',
      getNum2: '0.0000',
      balanceEos: '0.0000',
      price: 10,
      timer: null,
      thisMarket: {
        contract0: "eosio.token",
        contract1: "jinbankoneo1",
        decimal0: "4",
        decimal1: "4",
        last_update: "2020-05-08T09:25:33",
        liquidity_token: 16355591,
        mid: 1,
        price0_cumulative_last: "6611699108",
        price0_last: "3.39009999999999989",
        price1_cumulative_last: "6611699108",
        price1_last: "0.29490000000000000",
        reserve0: "100.0000 EOS",
        reserve1: "1000.0000 HYK",
        sym0: "4,EOS",
        sym1: "4,JIN",
        symbol0: "EOS",
        symbol1: "JIN",
      }
    }
  },
  computed:{
     ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
    })
  },
  created() {
      const params = {
        code: this.baseConfig.toAccountSwap,
        scope: this.baseConfig.toAccountSwap,
        table: 'markets',
        json: true
      }
      EosModel.getTableRows(params, (res) => {
        const list = res.rows || [];
        list.forEach((v) => {
          if(v.sym1 = "4,HYK") {
            this.thisMarket = v;
          }
        });
        this.marketLists = list;
      })
  },
  watch: {
    scatter: {
      handler: function listen(newVal) {
        if (newVal.identity) {
          this.handleBalanTimer();
        }
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    // 重启余额定时器
    handleBalanTimer() {
      clearInterval(this.timer);
      this.handleGetBalance();
      this.timer = setInterval(() => {
        this.handleGetBalance();
      }, 20000)
    },
    // 获取账户余额
    async handleGetBalance() {
      const params = {
        code: this.baseConfig.baseCoinContract,
        coin: 'EOS',
        decimal: 4
      };
      await EosModel.getCurrencyBalance(params, res => {
        if (!res || res.length === 0) {
          return 0
        }
        const balance = res.split(' ')[0];
        this.balanceEos = balance;
      })
    },
    // 计算生成总额度 - 当前价格
    handleGetNum() {
      const allPrice = this.price * this.payNum;
      this.getNum = toFixed(allPrice, 4);
    },
    // 计算生成总额度 - swap
    handleGetNum2() {
      const allPrice = this.price * this.payNum2;
      this.getNum2 = toFixed(allPrice, 4);
    },
    // 计算转账数量
    handleGetTransNum() {
      const payNum = this.getNum / this.price;
      this.payNum = toFixed(payNum, 4);
    },
    // 计算转账数量 - swap
    handleGetTransNum2(type) {
      const inData = {
        poolSym0: this.thisMarket.reserve0.split(' ')[0],
        poolSym1: this.thisMarket.reserve1.split(' ')[0],
        poolToken: this.thisMarket.liquidity_token,
      }
      if (type === 'pay') {
        inData.payNum = this.payNum2;
      } else {
        inData.getNum = this.getNum2;
      }
      const outData = dealTrade(inData);
      type === 'pay' ? this.getNum2 = toFixed(outData.getNum, 4) : this.payNum2 = toFixed(outData.payNum, 4);
    },
    // 铸币
    handleTransfer() {
      const params = {
        code: this.baseConfig.baseCoinContract,
        toAccount: this.baseConfig.toAccountByHyk,
        memo: 'HYK swap',
        quantity: `${this.payNum} EOS`
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
    },
    // 单向SWAP买币
    handleTransferSwap() {
      const params = {
        code: this.baseConfig.baseCoinContract,
        toAccount: this.baseConfig.toAccountByHyk,
        memo: `HYK swap`,
        quantity: `${this.payNum2} EOS`
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
    },
    handleInputBlur(type) {
      if (type === 'stake') {
        this.payNum = toFixed(this.payNum, 4);
        return
      }
      this.getNum = toFixed(this.getNum, 4);
    },
    handleIptFocus(type) {
      const n = type === 'stake' ? Number(this.payNum) : Number(this.getNum);
      if (!n) {
        type === 'stake' ? this.payNum = '' : this.getNum = '';
        return
      }
      type === 'stake' ? this.payNum = Number(this.payNum) : this.getNum = Number(this.getNum);
    },
    handleInputBlur2(type) {
      if (type === 'stake') {
        this.payNum2 = toFixed(this.payNum2, 4);
        return
      }
      this.getNum2 = toFixed(this.getNum2, 4);
    },
    handleIptFocus2(type) {
      const n = type === 'stake' ? Number(this.payNum2) : Number(this.getNum2);
      if (!n) {
        type === 'stake' ? this.payNum2 = '' : this.getNum2 = '';
        return
      }
      type === 'stake' ? this.payNum2 = Number(this.payNum2) : this.getNum2 = Number(this.getNum2);
    },
  },
}
</script>

<style lang="scss" scoped>
.type{
  border-bottom: 2px solid #fafafa;
  margin-bottom: 20px;
  padding-bottom: 30px;

  &:last-child{
    border-bottom: 0px solid #fafafa;
    margin-bottom: 0px;
    padding-bottom: 20px;
  }
  .title{
    text-align: left;
    height: 40px;
    line-height: 40px;
    margin-top: 10px;
    &::before{
      content: '';
      position: relative;
      margin-right: 5px;
      border-left: 2px solid #409EFF;
    }
  }
}
.changeDiv{
  margin-bottom: 30px;
  .change{
    font-size: 20px;
    color: #409EFF;
  }
}
.formDiv{
  margin-top: 20px;
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
