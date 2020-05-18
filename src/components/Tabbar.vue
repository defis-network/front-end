<template>
  <div class="tabbar">
    <div @click="handleTo(0)">
      <div>
        <img v-if="checked !== 0" src="@/assets/img/bank.png" alt="">
        <img v-else src="@/assets/img/bank1.png" alt="">
      </div>
      <div :class="{'green': checked === 0}">金库</div>
    </div>
    <div  @click="handleTo(1)">
      <div>
        <img v-if="checked !== 1" src="@/assets/img/dex.png" alt="">
        <img v-else src="@/assets/img/dex1.png" alt="">
      </div>
      <div :class="{'green': checked === 1}">兑换</div>
    </div>
    <div  @click="handleTo(2)">
      <div>
        <img v-if="checked !== 2" src="@/assets/img/swap.png" alt="">
        <img v-else src="@/assets/img/swap1.png" alt="">
      </div>
      <div :class="{'green': checked === 2}">做市</div>
    </div>
    <div  @click="handleTo(3)">
      <div>
        <img v-if="checked !== 3" src="@/assets/img/hyk.png" alt="">
        <img v-else src="@/assets/img/hyk1.png" alt="">
      </div>
      <div :class="{'green': checked === 3}">认购</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      checked: 0,
      routName: [
        'bank',
        'dex',
        'pools',
        'hyk'
      ]
    }
  },
  methods: {
    handleTo(index) {
      if (index === this.checked) {
        return;
      }
      this.checked = index;
      this.$router.push({
        name: this.routName[index],
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.tabbar{
  display: flex;
  align-content: center;
  justify-content: space-between;
  box-shadow: 0 0 5px 3px #f0f0f0;
  font-size: 12px;
  &>div{
    flex: 1;
    img{
      display: block;
      width: 30px;
      margin: auto;
    }
    .green{
      color: #42B48F;
    }
  }
}
</style>
