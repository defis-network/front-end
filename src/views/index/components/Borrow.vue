<template>
  <div class="borrow">
    <!-- <div class="link">
      <span v-if="index !== 1" @click="index = 1">去生成></span>
      <span v-else class="toRepay" @click="index = 2">去偿还></span>
    </div> -->
    <!-- 生成 -->
    <el-form  v-if="index === 1" class="formDiv" ref="formBorrow" label-width="75px">
      <!-- 抵押数量 -->
      <el-form-item label="抵押数量">
        <el-input v-model="stakeNum"
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
      <el-form-item label="生成总额" style="margin-top: 5px">
        <el-input v-model="generateNum"
          @focus="handleIptFocus('mint')"
          @input="handleGetTransNum" @blur="handleInputBlur('mint')" type="number" clearable>
          <span slot="suffix">JIN</span>
        </el-input>
      </el-form-item>
      <el-button class="btn" type="primary" v-if="scatter.identity" plain @click="handleTransfer">生成JIN</el-button>
        <el-button class="btn" type="primary" v-else @click="handleLogin">请先登录</el-button>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { EosModel } from '@/utils/eos';
import { toFixed } from '@/utils/public';

export default {
  name: 'borrow',
  data() {
    return {
      stakeNum: '0.0000', // 抵押数量 - 4位小数
      rangeValue: 150, // 滑动条数值
      inputRang: '150.00', // 滑动条输入框数值
      generateNum: '0.0000', // 生成USN数量
      maxGenerateNum: '0.0000', // 最大可生成
      firstOpen: true, // 账户还未开仓
      showAddStake: false, // 开仓账户勾选增加抵押量 - 默认不勾选
      inputStakeFocus: false, // 新增抵押数量选中
      inputRangFocus: false, // 抵押比率输入框选中 - 默认未选中
      inputGenerateFocus: false, // 生成数量输入框选中 - 默认未选中
      afterActionData: {}, // 操作后数据
      first: true,
      timer: null,
      rangFocus: false,
      loading: false,
      userData: {},
      balance: '0.0000',
      userOpenStatusVo: { // 用户开仓状态
      },
      price: 2.7600, // 价格

      index: 1, // 1 - 生成 | 2 - 偿还
    }
  },
  computed:{
     ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
    })
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
  methods: {
    // 百分比显示
    formatTooltip(val) {
      return `${val}%`;
    },
    handleLogin() {
      this.$emit('listenLogin', true)
    },
    // 铸币
    handleTransfer() {
      const params = {
        code: 'eosio.token',
        toAccount: 'jinbankoneo1',
        memo: 'mint',
        quantity: `${this.stakeNum} EOS`
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
    },
    // 计算生成总额度 - 固定300%质押率
    handleGetNum() {
      const allPrice = this.price * this.stakeNum;
      const getNum = allPrice / 3;
      this.generateNum = toFixed(getNum, 4);
    },
    // 计算转账数量
    handleGetTransNum() {
      const allPrice = this.generateNum * 3;
      const stakeNum = allPrice / this.price;
      this.stakeNum = toFixed(stakeNum, 4);
    },
    handleInputBlur(type) {
      if (type === 'stake') {
        this.stakeNum = toFixed(this.stakeNum, 4);
        return
      }
      this.generateNum = toFixed(this.generateNum, 4);
    },
    handleIptFocus(type) {
      const n = type === 'stake' ? Number(this.stakeNum) : Number(this.generateNum);
      if (!n) {
        type === 'stake' ? this.stakeNum = '' : this.generateNum = '';
        return
      }
      type === 'stake' ? this.stakeNum = Number(this.stakeNum) : this.generateNum = Number(this.generateNum);
    }
  }
}
</script>

<style lang="scss" scoped>
.borrow{
  .link{
    text-align: right;
    color: #409EFF;
    font-size: 14px;

    .toRepay{
      color: #f56c6c;
    }
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
