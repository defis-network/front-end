<template>
  <div class="selectMarket">
    <!-- 选择市场 -->
    <el-form ref="formBorrow" v-if="show">
      <el-form-item style="margin-bottom: 0">
        <div class="selectDiv" @click="handleShowDrawer">
          <span>{{ thisMarket.symbol0 }} / {{ thisMarket.symbol1 }}</span>
          <span class="iconfont icon-huaban29 select"></span>
        </div>
      </el-form-item>
    </el-form>

    <el-drawer
      class="drawerModel"
      :visible.sync="drawer"
      :with-header="false"
      direction="btt">
      <div class="drawer">
        <div class="title">
          <span>{{ $t('dex.chooseMarket') }}</span>
          <span class="close" @click="drawer = false">{{ $t('public.close') }}</span>
        </div>
        <!-- <div class="searchDiv">放搜索框</div> -->
        <div class="lists">
          <div class="list" v-for="(item, index) in marketLists" :key="index">
            <div @click="handleSelectThis(item)">
              <div>{{ item.symbol0 }} / {{ item.symbol1 }}</div>
              <div class="contract">{{ item.contract0 }} / {{ item.contract1 }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'marketListsCom',
  data() {
    return {
      drawer: false,
    }
  },
  props: {
    thisMarket: {
      type: Object,
      default: function market() {
        return {}
      }
    },
    marketLists: {
      type: Array,
      default: function lists() {
        return []
      }
    },
    show: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    handleShowDrawer() {
      this.drawer = true;
    },
    // 选择当前市场
    handleSelectThis(item) {
      this.$emit('listenMarketChange', item)
      this.drawer = false;
    },
  },
}
</script>

<style lang="scss" scoped>
.selectMarket{
  .selectDiv{
    // border: 1px solid #DCDFE6;
    border-radius: 5px;
    position: relative;
    color: #333;
    font-size: 20px;
    font-weight: bold;
    .select{
      position: absolute;
      transform: rotate(90deg);
      font-size: 14px;
      color: #999;
      margin-left: 10px;
    }
  }
}
.drawerModel{
  /deep/ .el-drawer{
    height: 40% !important;
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
    .list{
      height: 60px;
      display: flex;
      align-items: center;
      text-align: left;
      // justify-content: center;
      border-bottom: 1px solid #ebeef5;
      &>div{
        width: 100%;
      }
      .contract{
        color: #999;
        font-size: 14px;
      }
    }
  }
}
</style>
