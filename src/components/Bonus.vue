<template>
  <div class="bonus">
    <div class="title">分红</div>
    <div class="list">
      <div>
        <span>EOS 余额</span>
        <span class="">0.0000 EOS</span>
      </div>
      <div>
        <span>JIN 余额</span>
        <span class="">0.0000 JIN</span>
      </div>
      <div>
        <span>总估值</span>
        <span class="totalValue">0.0000 USD</span>
      </div>
      <div>
        <span>总股份数</span>
        <span class="totalValue">0.0000</span>
      </div>
      <div>
        <span>每股分红</span>
        <span class="balance">0.0000 USD</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'bonus',
  data() {
    return {
      balanceEos: '0.0000',
      balanceJin: '0.0000',
      totalValue: '0.0000',
      perBonus: '0.0000',
    }
  },
}
</script>

<style lang="scss" scoped>
.bonus{
  .title{
    color: #F56C6C;
    font-size: 18px;
    font-weight: 500;
  }
  .list{
    margin-top: 20px;
    font-size: 14px;
    &>div{
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;

      .balance{
        color: #67c23a;
      }
      .totalValue{
        color: #F56C6C
      }
    }
  }
}
</style>
