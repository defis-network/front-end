<template>
  <div class="tutorial">
    <div class="list">
      <div class="title">How to make a deposit?</div>
      <div class="content">
        <ul class="ul">
          <li>Choose a token</li>
          <li>Select amount to deposit</li>
          <li>Click Deposit</li>
          <li>Backup the note</li>
          <li>Click Send Deposit</li>
          <li>Confirm the transaction</li>
          <li>Wait until transaction is mined</li>
        </ul>
        <div class="end">Done!</div>
      </div>
    </div>
    <div class="list">
      <div class="title">How to make a withdraw with relayer?</div>
      <div class="content">
        <ul class="ul">
          <li>Enter your deposit's note</li>
          <li>Enter recipient address</li>
          <li>Click Withdraw</li>
          <li>Wait until proof is generated</li>
          <li>Click Withdraw</li>
          <li>Wait until transaction is mined</li>
        </ul>
        <div class="end">Done!</div>
      </div>
    </div>
    <div class="list">
      <div class="title">How to make a withdraw with metamask?</div>
      <div class="content">
        <ul class="ul">
          <li>Enter your deposit's note</li>
          <li>Click settings icon </li>
          <li>Choose Wallet option</li>
          <li>Enter recipient address</li>
          <li>Click Withdraw</li>
          <li>Wait until proof is generated</li>
          <li>Click Withdraw</li>
          <li>Sign transaction</li>
          <li>Wait until transaction is mined</li>
        </ul>
        <div class="end">Done!</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style lang="scss" scoped>
.tutorial {
  padding: 20px 18px;
  .list {
    text-align: left;
    margin-bottom: 20px;
    &:last-child{
      margin-bottom: 0px;
    }
    .title {
      color: #42b48f;
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 10px;
    }
    .content{
      .ul{
        list-style: disc outside;
        margin-left: 2em;
        color: #070707;
        font-size: 16px;
      }
      .end{
        margin-top: 10px;
        font-size: 14px;
      }
    }
  }
}
</style>
