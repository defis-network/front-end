<template>
  <div class="list">
    <div class="next">
      <div class="item mt12">
        <span>{{ $t('bonus.nextDividends') }}</span>
        <span>167:00:00</span>
      </div>
      <div class="item">
        <span>{{ $t('bonus.totalDividends') }}</span>
        <span>100.0000 EOS</span>
      </div>
    </div>
    <div class="item mt12">
      <span>{{ $t('bonus.dfsSupply') }}</span>
      <span>123132.2345 DFS</span>
    </div>
    <div class="item">
      <span>{{ $t('bonus.dfsStaked') }}</span>
      <span>123132.2345 DFS</span>
    </div>
    <div class="item mt12">
      <span></span>
      <span class="small">{{ $t('bonus.ofPercent', {percent: '80.00'}) }}</span>
    </div>
    <div class="item">
      <span>{{ $t('hyk.perBonus') }}</span>
      <span class="green">1.2345 USD</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BonusTotal',
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
.list{
  font-size: 14px;
  color: #070707;
  .next{
    background: #f9f9f9;
    padding: 20px 15px;
    margin: 20px 0 18px;
  }
  .item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    &.mt12{
      margin-bottom: 12px;
    }
    &.mt15{
      margin-bottom: 15px;
    }
    span{
      &:last-child{
        font-weight: 500;
      }
      &.small{
        font-size: 12px;
        // margin-top: 3px;
        font-weight: normal !important;
      }
    }
    .right{
      font-size: 12px;
      margin-left: 10px;
    }
  }
  .bonusNum{
    font-weight: 500;
    font-size: 16px;
    text-align: left;
  }
  .inputItem{
    background: #f9f9f9;
    height: 37px;
    margin-top: 5px;
    input{
      background: transparent;
      height: 100%;
      width: calc(100% - 70px);
      border: 0px;
      outline: none;
      font-size: 14px;
      padding-left: 10px;
    }
    .btn{
      font-size: 12px;
      font-weight: 500;
      height: 31px;
      width: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #42B48F;
      color: #f9f9f9;
      border-radius: 2px;
      margin-right: 10px;
    }
  }
}
</style>