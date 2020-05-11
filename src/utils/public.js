
import { EosModel } from '@/utils/eos';
import moment from 'moment';
import store from '@/store';

// 登录
export function login(vThis, cb) {
  EosModel.scatterInit(vThis, () => {
    handleScatterOut(cb)
  });
}
// 先退出scatter
function handleScatterOut(cb) {
  EosModel.accountLoginOut(() => {
    EosModel.getIdentity('eos', (err => cb(err)));
  });
}
// 获取60秒均价
export function getPrice(cb) {
  const baseConfig = store.state.sys.baseConfig;
  const params = {
    code: baseConfig.oracle, // 'jinoracle113',
    json: true,
    limit: 2,
    scope: '0',
    table: 'avgprices',
  }
  EosModel.getTableRows(params, (res) => {
    const list = res.rows || [];
    const t = list.find(v => v.key === 60) || {};
    const price = toFixed(t.price0_avg_price / 10000, 4);
    cb(price);
  })
}

// 科学计数法转数值 - 处理 1e-7 这类精度问题
export function getFullNum(num) {
  // 处理非数字
  if (isNaN(num)) {
    return num;
  }
  // 处理不需要转换的数字
  const str = String(num);
  if (!/e/i.test(str)) {
    return num;
  }
  return Number(num).toFixed(18).replace(/\.?0+$/, '');
}

// 返回小数位后几位 截取
// number 数值
// p 位数
export function toFixed(number, pp) {
  if (!pp) pp = 4;
  let num = isNaN(number) || !number ? 0 : number;
  let p = isNaN(number) || !number ? 4 : pp;
  num = getFullNum(num);
  var n = (num + '').split('.'); // eslint-disable-line
  var x = n.length > 1 ? n[1] : ''; // eslint-disable-line
  if (x.length > p) { // eslint-disable-line
    x = x.substr(0, p); // eslint-disable-line
  } else { // eslint-disable-line
    x += Array(p - x.length + 1).join('0'); // eslint-disable-line
  } // eslint-disable-line
  return n[0] + (x == '' ? '' : '.' + x); // eslint-disable-line
}

// 获取路由参数
export function GetUrlPara() {
  const url = document.location.toString();
  const arrUrl = url.split('?');
  if (arrUrl.length === 1) {
    return {
      dapp: 'moreWallet',
    };
  }
  const para = arrUrl[1];
  const qureyArr = para.split('&');
  const params = {};
  for (let i = 0; i < qureyArr.length; i += 1) {
    const arr = qureyArr[i].split('=');
    params[arr[0]] = arr[1];
  }
  return params;
}
/**
 * 时间戳转成本地时间
 */
export function toLocalTime(time) {
  return moment(time).format('YYYY-MM-DD HH:mm:ss')
}

// 柯里化函数 - 多数据等待计算
function newArr(length) {
  var newArr = [...Object.keys(window).slice(0, length)].map(() => '')
  return newArr
}
export function crazyCurryingHelper(fn, args) {
  length = fn.length // fn所需的参数个数
  args = args || newArr(length) // 已有参数 | 创建一个fn需要参数长度的数组
  return function(...rest) {
    let _args = args.slice();
    rest.forEach((item, i) => {
    if (item !== '') {
        _args.splice(i, 1, item)
    }
  })
  const nullLength = _args.filter(item => !item).length; // 缺少参数数量
  return !nullLength // 递归的进行柯里化
         ? fn.apply(this, _args)
         : crazyCurryingHelper.call(this, fn, _args)
  }
}