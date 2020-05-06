/* eslint-disable */
import { toFixed } from '@/utils/public';
// import { Decimal } from 'decimal.js';

const config = {
  rate: 0.003, // 手续费 - 0.2%
}

// 算法逻辑
// 1. 滑点 & 成交数量算
/**
 *
 * @param {*} inData
 * {
 *  direction: 0 - buyJIN | 1 - sellJIN
 *  payNum: 输入支付数量
 *  getNum: 输入获得数量
 *  poolEos: EOS池子数量
 *  poolJin: JIN池子数量
 * }
 */
export function dealTrade(inData) {
  // EOS价格
  let eosPrice = inData.poolJin / inData.poolEos;
      eosPrice = toFixed(eosPrice, 8);
  // JIN价格
  let jinPrice = inData.poolEos / inData.poolJin;
      jinPrice = toFixed(jinPrice, 8);
  const outData = {
    eosPrice, // 当前EOS价格
    jinPrice, // 当前JIN价格
  }
  // 没有输入支付数量 & 得到数量时 - 返回默认配置
  if (!Number(inData.payNum) && !Number(inData.getNum)) {
    return outData;
  }
  // 计算当前pool不变量
  
  // 计算1: 根据输入支付数量 计算 得到数量 成交价格 滑点
  // 计算2: 根据输入得到数量 计算 支付数量 成交价格 滑点
  const { payNum, getNum, aboutPrice } = dealPayToGet(inData); // 获得支付数量 & 得到数量
  const slipPoint = (aboutPrice - jinPrice) / jinPrice; // 溢价率 =（当前价格-预估成交价）/ 当前价格
  return Object.assign(outData, {
    payNum, getNum, aboutPrice, slipPoint
  });
}

function dealPayToGet(inData) {
  const Invariant = inData.poolJin * inData.poolEos;
  const payMainPool = inData.direction ? inData.poolJin : inData.poolEos; // 支付池子 - 池子里币种数量增加
  const getMainPool = inData.direction ? inData.poolEos : inData.poolJin; // 得到池子 - 池子里币种数量减少
  let payNum, getNum, aboutPrice;
  // 输入支付金额
  if (Number(inData.payNum)) {
    payNum = inData.payNum;
    let byNum = payNum - payNum * config.rate; // 实际用于交易的数量 - 去除手续费后的支付金额
    let payPool = payMainPool + byNum; // 交易成功后，池子应到达金额
    let getPool = Invariant / payPool; // 交易成功后，对应池子应减少到的数量
    getNum = getMainPool - getPool; // 最终获取到的数量
  } else { // 输入得到数量
    getNum = inData.getNum;
    let getPool = getMainPool - getNum; // 交易成功后，对应池子应减少到的数量
    let payPool = Invariant / getPool; // 交易成功后，池子应到达金额
    let byNum = payPool - payMainPool; // 实际用于交易的数量 - 去除手续费后的支付金额
    payNum = byNum / (1 - config.rate);
  }
  aboutPrice = inData.direction ? getNum / payNum : payNum / getNum; // 计算出预估成交价 - EOS/JIN

  return {
    payNum,
    getNum,
    aboutPrice
  }
}


// 做市算法处理
/**
 * 做市token 计算
 * @param {*} inData
 * payNum1: 输入存币数量 - EOS
 * payNum2: 输入存币数量 - JIN
 * poolEos: EOS池子数量
 * poolJin: JIN池子数量
 * poolToken: 凭证数量
 */
export function dealToken(inData) {
  // EOS价格
  let eosPrice = inData.poolJin / inData.poolEos;
      eosPrice = toFixed(eosPrice, 8);
  let payNum1 = Number(inData.payNum1);
  let payNum2 = Number(inData.payNum2);
  if (Number(payNum1)) {
    payNum2 = payNum1 * eosPrice;
  } else {
    payNum1 = payNum2 / eosPrice;
  }
  const poolToken = inData.poolToken;
  const poolEos = inData.poolEos;
  // 计算做市占比
  const rate = Number(payNum1) / (Number(payNum1) + Number(poolEos));
  const getToken = (Number(poolToken) * Number(rate)) / (1 - Number(rate));
  return {
    payNum1,
    payNum2,
    rate,
    getToken
  }
}
/**
 * 卖出Token赎回资产
 * @param {*} inData 
 * poolEos: EOS池子数量
 * poolJin: JIN池子数量
 * poolToken: 池子总凭证
 * sellToken: 卖出token数量
 */
export function sellToken(inData) {
  const poolToken = inData.poolToken;
  const sellToken = Number(inData.sellToken);
  const poolEos = inData.poolEos;
  const poolJin = inData.poolJin;
  // 计算卖出比率
  const rate = sellToken / poolToken;
  let getNum1 = poolEos * rate;
  let getNum2 = poolJin * rate;
  return {
    getNum1,
    getNum2
  }
}