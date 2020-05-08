<template>
  <div>
    <el-form ref="formBorrow" label-width="75px">
      <!-- 抵押数量 -->
      <el-form-item label="资金操作">
        <div class="selectDiv" @click="handleShowDrawer">
          <span></span>
          <span class="iconfont icon-huaban29 select"></span>
        </div>
        <br>
      </el-form-item>
    </el-form>

    <el-drawer
      class="drawerModel"
      :visible.sync="drawer"
      :with-header="false"
      direction="btt">
      <div class="drawer">
        <div class="title">
          <span>选择市场</span>
          <span class="close" @click="drawer = false">关闭</span>
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
  name: 'actions',
  data() {
    return {
      drawer: false,
    }
  },
  methods: {
    handleShowDrawer() {
      this.drawer = true;
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
