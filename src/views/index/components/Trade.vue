<template>
  <div>
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
        <el-button class="btn" type="primary" v-if="scatter.identity" plain>交易</el-button>
        <el-button class="btn" type="primary" v-else @click="handleLogin">请先登录</el-button>
      </el-form>
    </div>
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
      poolEos: 5046.4643,
      poolJin: 34851733.0507,
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
    }
  },
  computed:{
    ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
    })
  },
  mounted() {
  },
  methods: {
    handleLogin() {
      this.$emit('listenLogin', true)
    },
    handleInBy(type = 'pay') {
      const inData = {
        poolEos: this.poolEos,
        poolJin: this.poolJin,
        direction: this.direction,
      }
      if (type === 'pay') {
        inData.payNum = this.payNum;
      } else {
        inData.getNum = this.getNum;
      }
      const outData = dealTrade(inData);
      this.getNum = outData.getNum;
      this.payNum = outData.payNum;
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
    }
  }
}
</script>

<style lang="scss" scoped>
.trade{
  margin-top: 20px;
  /deep/ .el-input-group__prepend{
    width: 28px;;
  }
  .changeDiv{
    margin-bottom: 30px;
    .change{
      font-size: 30px;
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
