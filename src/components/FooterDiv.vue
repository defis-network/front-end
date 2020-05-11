<template>
  <div class="footer">
    <div class="left">
      <a href="#">About</a>
      <a href="#">Doc</a>
      <a href="#">Github</a>
    </div>
    <div class="right">
      <span class="red" @click="showBonus = true">HYK分红</span>
    </div>

    <el-dialog
      width="320px"
      :visible.sync="showBonus">
      <bonus />
    </el-dialog>
  </div>
</template>

<script>
import Bonus from './Bonus';

export default {
  name: 'footerDiv',
  components: {
    Bonus
  },
  data() {
    return{
      showBonus: true,
    }
  }
}
</script>

<style lang="scss" scoped>
.footer{
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  bottom: 30px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  // margin-bottom: 30px;
  .left{
    a{
      margin-right: 10px;
    }
  }
  .right{
    .red{
      cursor: pointer;
      color: #F56C6C;
    }
  }

  /deep/ .el-dialog__header{
    padding: 0;
  }
}
</style>
