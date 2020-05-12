<template>
  <div class="borrow">
    <!-- 生成 -->
    <el-form  v-if="index === 1" class="formDiv" ref="formBorrow" label-width="75px">
      <!-- 抵押数量 -->
      <el-form-item :label="$t('bank.stakeNum')">
        <el-input v-model="stakeNum"
          @focus="handleIptFocus('stake')"
          @input="handleGetNum" @blur="handleInputBlur('stake')" type="number" clearable>
          <span slot="suffix">{{ baseConfig.baseCoin }}</span>
        </el-input>
        <!-- 余额 -->
        <div class="balance">
          <span>{{ $t('public.balance') }}：{{balanceEos}} {{ baseConfig.baseCoin }}</span>
        </div>
      </el-form-item>
      <!-- 生成总额 -->
      <el-form-item :label="$t('bank.borrowNum')" style="margin-top: 5px">
        <el-input v-model="generateNum"
          @focus="handleIptFocus('mint')"
          @input="handleGetTransNum" @blur="handleInputBlur('mint')" type="number" clearable>
          <span slot="suffix">JIN</span>
        </el-input>
      </el-form-item>
      <el-button class="btn" type="primary" v-if="scatter.identity" plain @click="handleTransfer">生成JIN</el-button>
      <el-button class="btn" type="primary" v-else @click="handleLogin">请先登录</el-button>
    </el-form>

    <!-- 列表 -->
    <div class="tableList">
      <div class="title">
        <span>生成记录</span>
        <span class="right">余额: {{ balanceJin }} JIN</span>
      </div>
      <div class="lists">
        <div class="noDate" v-if="!tableData.length">暂无数据</div>
        <div class="list" v-for="(item, index) in tableData" :key="index">
          <div class="left">
            <div>{{ item.ctime }}</div>
            <div>
              <el-button type="danger" plain @click="handleRedeem(item)">赎回</el-button>
              <el-button type="primary" v-if="!item.staked" plain @click="handleStake(item)">挖矿</el-button>
              <el-button type="info" disabled v-else plain>挖矿中</el-button>
            </div>
          </div>
          <div class="right">
            <div>
              <div>抵押数量</div>
              <div class="num">{{ item.pledge }}</div>
            </div>
            <div>
              <div class="txtRight">生成数量</div>
              <div class="num">{{ item.issue }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 赎回详情 -->
    
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { EosModel } from '@/utils/eos';
import { toFixed, toLocalTime, getPrice } from '@/utils/public';

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
      priceTimer: null, // 价格定时器
      index: 1, // 1 - 生成 | 2 - 偿还
      balanceEos: '0.0000',
      balanceJin: '0.0000',
      tableData: [], // 生成记录
    }
  },
  computed:{
     ...mapState({
      // 箭头函数可使代码更简练
      scatter: state => state.app.scatter,
      baseConfig: state => state.sys.baseConfig, // 基础配置 - 默认为{}
    })
  },
  props: {
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
  mounted() {
    this.handleGetPrice();
    clearInterval(this.priceTimer);
    this.priceTimer = setInterval(() => {
      this.handleGetPrice();
    }, 10000)
  },
  beforeDestroy() {
    clearInterval(this.timer);
    clearInterval(this.priceTimer);
  },
  methods: {
    // 重启余额定时器
    handleBalanTimer() {
      clearInterval(this.timer);
      this.handleRowsMint();
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
        code: this.baseConfig.baseCoinContract,
        coin: this.baseConfig.baseCoin,
        decimal: 4
      };
      if (next) {
        params.code = this.baseConfig.toAccountJin;
        params.coin = 'JIN';
      }
      await EosModel.getCurrencyBalance(params, res => {
        let balance = '0.0000';
        if (!res || res.length === 0) {
          balance = '0.0000'
        } else {
          balance = res.split(' ')[0];
        }
        if (next) {
          this.balanceJin = balance;
          return;
        }
        this.balanceEos = balance;
      })
    },
    // 获取60秒均价
    handleGetPrice() {
      getPrice((price) => {
        this.price = price;
      })
    },
    // 生成列表
    handleRowsMint() {
      const params = {
        code: this.baseConfig.toAccountJin,
        scope: this.baseConfig.toAccountJin,
        table: 'debts',
        limit: 10,
        lower_bound: this.scatter.identity.accounts[0].name,
        upper_bound: this.scatter.identity.accounts[0].name,
        key_type: 'i64',
        index_position: 2,
        table_key: 'byname',
        json: true
      }
      EosModel.getTableRows(params, (res) => {
        const list = res.rows.filter(v => v.owner === this.scatter.identity.accounts[0].name)
        list.forEach((v) => {
          v.ctime = toLocalTime(`${v.create_time}.000+0000`);
          v.staked = !!Number(v.rex_received.split(' ')[0]);
          v.ableRedeemDate = toLocalTime(`${v.rex_maturity}.000+0000`);
          const redeemTime = new Date(v.ableRedeemDate).getTime(); // 解锁时间
          const nowTime = new Date().getTime(); // 当前时间
          v.ableRedeem = redeemTime <= nowTime;
        });
        this.tableData = list;
      })
    },
    handleReg(item) {
      if (!item.ableRedeem) {
        this.$message({
          type: 'info',
          message: `挖矿中，将于 ${item.ableRedeemDate} 后可赎回`,
        })
        return;
      }
      const issue = item.issue.split(' ')[0]
      if (Number(issue) > Number(this.balanceJin)) {
        this.$message({
          message: 'balance lower',
          type: 'error'
        })
        return false;
      }
      return true
    },
    // 赎回
    handleRedeem(item) {
      if (!this.handleReg(item)) {
        return
      }
      const params = {
        code: this.baseConfig.toAccountJin,
        toAccount: this.baseConfig.toAccountJin,
        memo: `redeem: ${item.id}`,
        quantity: item.issue
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
          message: 'Redeem Success',
          type: 'success'
        });
      })
    },
    // 挖矿
    handleStake(item) {
      const params = {
        id: item.id,
      }
      EosModel.stake(params, (res) => {
        if(res.code) {
          this.$message({
            message: res.message,
            type: 'error'
          });
          return
        }
        this.handleBalanTimer();
        this.$message({
          message: 'Stake Success',
          type: 'success'
        });
      });
    },
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
        code: this.baseConfig.baseCoinContract,
        toAccount: this.baseConfig.toAccountJin,
        memo: 'mint',
        quantity: `${this.stakeNum} ${this.baseConfig.baseCoin}`
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
.tableList{
  margin-top: 30px;
  // box-shadow: 0 0px 5px 5px #fafafa;
  border-top: 3px solid #fafafa;
  padding: 10px 0;

  .title{
    border-bottom: 1px solid #fafafa;
    font-size: 16px;
    padding: 0 0 10px 0px;
    text-align: left;
    .right{
      float: right;
      font-size: 14px;
    }
  }
  .trxId{
    white-space: nowrap;
    text-overflow:ellipsis;
  }
}
.lists{
  .noDate{
    color: #999;
    font-size: 14px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center
  }
  .list{
    background: #fafafa;
    margin-bottom: 5px;
    border-radius: 5px;
    padding: 10px 8px;
    font-size: 14px;

    &:last-child{
      margin-bottom: 0px;
    }
    .left,.right{
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
    }
    .right{
      height: 60px;
      text-align: left;
      .num{
        margin-top: 5px;
      }
      .txtRight{
        text-align: right;
      }
    }
  }
}
</style>
