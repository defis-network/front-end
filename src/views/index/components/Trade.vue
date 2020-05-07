<template>
  <div class="swapTrade">
    <!-- <div>Trade</div> -->
    <div class="trade">
      <el-form ref="formBorrow" label-width="75px">
        <!-- 抵押数量 -->
        <el-form-item label="支付数量" style="margin-bottom: 0">
          <el-input v-model="payNum" type="number" clearable
                    @input="handleInBy('pay')"
                    @focus="handleFocus('pay')"
                    @blur="handleBlur('pay')">
            <template v-if="!direction" slot="prepend">EOS</template>
            <template v-else slot="prepend">JIN</template>
          </el-input>
          <!-- 余额 -->
          <div class="balance">
            <span v-if="!direction">余额：{{balanceEos}} EOS</span>
            <span v-else>余额：{{balanceJin}} JIN</span>
          </div>
        </el-form-item>
        <!-- 互换 -->
        <div class="changeDiv">
          <span class="iconfont icon-huaban23 change" @click="handleExchange"></span>
        </div>
        <!-- 生成总额 -->
        <el-form-item label="得到数量" style="margin-top: 5px">
          <el-input v-model="getNum" type="number" clearable
                    @input="handleInBy('get')"
                    @focus="handleFocus('get')"
                    @blur="handleBlur('get')">
            <template v-if="!direction" slot="prepend">JIN</template>
            <template v-else slot="prepend">EOS</template>
          </el-input>
        </el-form-item>
        <el-button class="btn" type="primary" v-if="scatter.identity" plain @click="handleSwapTrade">交易</el-button>
        <el-button class="btn" type="primary" v-else @click="handleLogin">请先登录</el-button>
      </el-form>
    </div>

    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
      direction="btt">
      <div class="drawer">
        <div class="title">
          <span>自定义标题</span>
          <span class="close">关闭</span>
        </div>
        <div class="searchDiv">放搜索框</div>
        <div class="lists">
          <div class="list">放通证列表</div>
          <div class="list">EOS</div>
          <div class="list">NDX</div>
          <div class="list">JIN</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { dealTrade } from '@/utils/logic';
import { toFixed } from '@/utils/public';
import { EosModel } from '@/utils/eos';

export default {
  name: 'trade',
  data() {
    return {
      payNum: '0.0000',
      getNum: '0.0000',
      direction: false,
      drawer: false,
      thisMarket: {}, // 当前选中的做市池子
    }
  },
  props: {
    balanceEos: {
      type: String,
      default: '0.0000'
    },
    balanceJin: {
      type: String,
      default: '0.0000'
    },
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
          console.log(this.thisMarket)
          return;
        }
        this.thisMarket = newVal.filter(v => v.mid === this.thisMarket.mid)
      },
      immediate: true,
      deep: true
    },
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
  methods: {
    handleShowDrawer(type = 'sym0') {
      if (type === 'sym0') {
        this.drawer = true;
      }
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
      console.log(inData)
      const outData = dealTrade(inData);
      type === 'pay' ? this.getNum = toFixed(outData.getNum, 4) : this.payNum = toFixed(outData.payNum, 4);
      // this.getNum = outData.getNum;
      // this.payNum = outData.payNum;
    },
    handleExchange() {
      this.direction = !this.direction;
      this.payNum = '0.0000';
      this.getNum = '0.0000';
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
  /deep/ .el-drawer{
    height: 60% !important;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  .drawer{
    padding: 0 10px;
    .title{
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
    }
  }
}

.trade{
  margin-top: 20px;
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
