<template>
  <div class="warmTip" v-if="!close">
    <div class="tipDiv" @click="handleClose">
      <span class="iconfont icon-hongse1 warmIcon"></span>
      <span>项目尚处于beta阶段。使用需自行承担风险。</span>
    </div>
    <span class="iconfont closeIcon"></span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      close: false,
    }
  },
  mounted() {
    this.handleRegClose();
  },
  methods: {
    handleRegClose() {
      const close = sessionStorage.getItem('WARMTIP') ? JSON.parse(sessionStorage.getItem('WARMTIP')) : false;
      this.close = close;
    },
    handleClose() {
      sessionStorage.setItem('WARMTIP', true);
      this.close = true;
    }
  },
}
</script>

<style lang="scss" scoped>
.warmTip{
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #f56c6c;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  padding: 10px 5px 10px 15px;
  margin: 20px 10px 20px;
  border-radius: 20px;
  .tipDiv{
    display: flex;
    align-items: center;
  }
  .warmIcon{
    color: #f56c6c;
    margin-right: 5px;
  }
  .closeIcon{
    font-size: 10px;
    margin-right: 15px;

    &::after{
      content: "✕";
    }
  }
}
</style>
