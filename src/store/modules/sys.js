// 系统性状态存储
const sys = {
  state: {
    baseConfig: {
    },
    // 区块链浏览器配置
    blockBrowser: {
      eos: {
        tx: 'https://bloks.io/transaction/',
        account: 'https://bloks.io/account/',
        token: 'https://bloks.io/tokens/',
      },
    },
    testConfig: { // 测试环境配置
      node: {
        area: "test",
        protocol: "https",
        host: "api.testnet.eos.io",
        port: "443",
        url: "https://api.testnet.eos.io/",
        chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
      },
      toAccountSwap: '',
      toAccountJin: '',
      baseCoin: 'EOS', // 母币
      baseCoinContract: 'eosio.token',
    },
    devConfig: { // 开发环境配置
      node: {
        area: "dev",
        protocol: "http",
        host: "183.250.89.179",
        port: "58888",
        url: "http://183.250.89.179:58888",
        chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
      },
      toAccountSwap: 'jinswap11111',
      toAccountJin: 'jinbankoneo1',
      baseCoin: 'SYS', // 母币
      baseCoinContract: 'eosio.token',
    },
    proConfig: { // 生产环境配置
      node: {
        area: 'production',
        protocol: 'https',
        host: 'api.eossweden.se',
        port: '443',
        url: 'https://api.eossweden.se',
        chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
      },
      toAccountSwap: '',
      toAccountJin: '',
      baseCoin: 'EOS', // 母币
      baseCoinContract: 'eosio.token',
    }
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
