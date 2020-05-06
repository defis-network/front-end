// 系统性状态存储
const sys = {
  state: {
    baseConfig: { // 服务器状态设置 - 1:开通 | 0: 暂停
      issue: 1, // 生成USN
      repay: 1, // 偿还USN
      auction: 1, // 爆单抢拍
      deposit: 1, // 增加抵押量
      withdraw: 1, // 减少抵押量
      maintain: 1, // 整服
      warnRateColor: 135, // 未爆仓比率颜色
      marginRateColor: 125, // 爆仓比率颜色
      marginRate: 1.25, // 爆仓比率
      initialDiscount: 0.98, // 爆仓拍卖初始折扣
      lastDiscount: 0.9, // 爆仓拍卖最低折扣
      declining: 0.1, // 爆仓拍卖每轮递减折扣
      auctionTime: 0, // 爆仓后开卖时间
      durationTime: 60, // 爆仓拍卖持续时间
      intervalTime: 1, // 爆仓拍卖轮次间隔时间
      forfeit: 0.15, // 爆仓罚金
      gratis: 10, // 免CPU次数
      interestFree: 1, // 开仓偿还免息时间
      interestfRate: 0.01, // 年化利率
    },
    // 区块链浏览器配置
    blockBrowser: {
      eos: {
        // tx: 'https://eospark.com/tx/',
        // account: 'https://eospark.com/account/',
        tx: 'https://bloks.io/transaction/',
        account: 'https://bloks.io/account/',
        token: 'https://bloks.io/tokens/',
      },
    },
    toAccount: localStorage.getItem('toAccount') ? localStorage.getItem('toAccount') : 'danchorsmart', // 接收账户
  },
  mutations: {
    SET_BASECONFIG: (state, baseConfig) => {
      state.baseConfig = baseConfig;
    },
    // 接收账户
    SET_TOACCOUNT: (state, toAccount) => {
      state.toAccount = toAccount;
      localStorage.setItem('toAccount', toAccount);
    },
  },
  actions: {
    setBaseConfig({ commit }, baseConfig) {
      commit('SET_BASECONFIG', baseConfig);
    },
    // 接收账户
    setToAccount({ commit }, toAccount) {
      commit('SET_TOACCOUNT', toAccount);
    },
  }
};

export default sys;
