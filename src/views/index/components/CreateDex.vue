<template>
  <div class="createDex">
    <el-form ref="formBorrow" label-width="75px">
      <!-- 抵押数量 -->
      <el-form-item label="基础币种" style="margin-bottom: 0">
        <el-input v-model="symnol0.contract" type="text" placeholder="合约地址" clearable></el-input>
        <el-input class="mt10" v-model="symnol0.coinName" type="text" placeholder="币种名称" clearable></el-input>
        <el-input class="mt10" v-model="symnol0.decimal" type="number" placeholder="币种精度" clearable></el-input>
      </el-form-item>

      <!-- 生成总额 -->
      <el-form-item label="计价币种" style="margin-top: 15px">
        <el-input v-model="symnol1.contract" type="text" placeholder="合约地址" clearable></el-input>
        <el-input class="mt10" v-model="symnol1.coinName" type="text" placeholder="币种名称" clearable></el-input>
        <el-input class="mt10" v-model="symnol1.decimal" type="number" placeholder="币种精度" clearable></el-input>
      </el-form-item>
      <el-button class="btn" type="primary" v-if="scatter.identity" @click="handleNewMarket" plain>创建交易所</el-button>
      <el-button class="btn" type="primary" v-else @click="handleLogin">请先登录</el-button>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { EosModel } from '@/utils/eos';

export default {
  name: 'createDex',
  data() {
    return {
      symnol0: {
        contract: '', // eosio.token
        coinName: '', // EOS
        decimal: '', // 4
      },
      symnol1: {
        contract: '', // eosio.token
        coinName: '', // EOS
        decimal: '', // 4
      }
    }
  },
  computed: {
    ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
    })
  },
  methods: {
    handleLogin() {
      this.$emit('listenLogin', true)
    },
    handleNewMarket() {
      const formName = this.scatter.identity.accounts[0].name;
      const permission = this.scatter.identity.accounts[0].authority;
      const params = {
        actions: [{
          account: this.baseConfig.toAccountSwap,
          name: 'newmarket',
          authorization: [{
            actor: formName, // 转账者
            permission,
          }],
          data: {
            creator: formName,
            contract0: this.symnol0.contract,
            contract1: this.symnol1.contract,
            sym0: `${this.symnol0.decimal},${this.symnol0.coinName}`,
            sym1: `${this.symnol1.decimal},${this.symnol1.coinName}`
          }
        }]
      }
      EosModel.toTransaction(params, (res) => {
        if(res.code) {
          this.$message({
            message: res.message,
            type: 'error'
          });
          return
        }
        this.$emit('listenGetMarketsList', true)
        this.$message({
          message: 'Create Success',
          type: 'success'
        });
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.createDex{
  margin-top: 5px;
  .mt10{
    margin-top: 10px;
  }
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
