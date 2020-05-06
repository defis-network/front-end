<template>
  <div>
    <div class="link">
      <span v-if="index !== 1" @click="index = 1">去存入></span>
      <span v-else class="toRepay" @click="index = 2">去取回></span>
    </div>
    <div class="swap" v-if="index === 1">
      <el-form ref="formBorrow" label-width="75px">
        <!-- 抵押数量 -->
        <el-form-item label="存入资产">
          <el-input v-model="payNum1" type="number" clearable
                    @input="handleInBy('pay')">
            <!-- <span slot="suffix">EOS</span> -->
            <template slot="prepend">EOS</template>
          </el-input>
          <!-- 余额 -->
          <div class="balance">
            <span>余额：{{balanceEos}} EOS</span>
          </div>
          <el-input v-model="payNum2" type="number" clearable
                    @input="handleInBy('get')">
            <!-- <span slot="suffix">EOS</span> -->
            <template slot="prepend">JIN</template>
          </el-input>
          <!-- 余额 -->
          <div class="balance">
            <span>余额：{{balanceJin}} JIN</span>
          </div>
        </el-form-item>
        <!-- 生成总额 -->
        <el-form-item label="凭证数量" style="margin-top: 5px">
          <el-input v-model="getToken" type="number" disabled clearable>
            <!-- <span slot="suffix">JIN</span> -->
          </el-input>
        </el-form-item>
        <el-button class="btn" type="primary" v-if="scatter.identity" plain>存币</el-button>
        <el-button class="btn" type="primary" v-else @click="handleLogin">请先登录</el-button>
      </el-form>
    </div>

    <div class="swap" v-else>
      <el-form ref="formBorrow" label-width="75px">
        <!-- 生成总额 -->
        <el-form-item label="取回资产" style="margin-top: 5px">
          <el-input v-model="sellToken" type="number" clearable
                    @input="handleSellToken">
          </el-input>
          <!-- 余额 -->
          <div class="balance">
            <span>凭证数量：{{token}}</span>
          </div>
        </el-form-item>
        <!-- 抵押数量 -->
        <el-form-item label="存入资产">
          <el-input v-model="getNum1" type="number" disabled clearable>
            <template slot="prepend">EOS</template>
          </el-input>
          <div>1</div>
          <el-input v-model="getNum2" type="number" disabled clearable>
            <template slot="prepend">JIN</template>
          </el-input>
        </el-form-item>
        <el-button class="btn" type="danger" v-if="scatter.identity" plain>取币</el-button>
        <el-button class="btn" type="primary" v-else @click="handleLogin">请先登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { dealToken, sellToken } from '@/utils/logic';
import { EosModel } from '@/utils/eos';
// import { toFixed } from '@/utils/public';

export default {
  name: 'swap',
  data() {
    return {
      payNum1: '0.0000',
      payNum2: '0.0000',
      getToken: '0',
      sellToken: '0',
      getNum1: '0.0000',
      getNum2: '0.0000',
      poolEos: 5098.0863, // EOS池子总量
      poolJin: 35079829.4723, // JIN池子总量
      poolToken: 50979308, // 凭证数量
      index: 1, // 1 - 存入 | 2 - 取回
      token: '0'
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
  methods: {
    handleLogin() {
      this.$emit('listenLogin', true)
    },
    handleInBy(type = 'pay') {
      const inData = {
        poolEos: this.poolEos,
        poolJin: this.poolJin,
        poolToken: this.poolToken
      }
      if (type === 'pay') {
        inData.payNum1 = this.payNum1;
      } else {
        inData.payNum2 = this.payNum2;
      }
      const outData = dealToken(inData)
      this.payNum1 = outData.payNum1;
      this.payNum2 = outData.payNum2;
      this.getToken = outData.getToken;
    },
    handleSellToken() {
      const inData = {
        poolEos: this.poolEos,
        poolJin: this.poolJin,
        poolToken: this.poolToken,
        sellToken: this.sellToken
      }
      const outData = sellToken(inData);
      this.getNum1 = outData.getNum1;
      this.getNum2 = outData.getNum2;
    }
  }
}
</script>

<style lang="scss" scoped>
.link{
  text-align: right;
  color: #409EFF;
  font-size: 14px;

  .toRepay{
    color: #f56c6c;
  }
}
.swap{
  margin-top: 20px;
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
