export * from "../src/shapeFlags";
export * from '../src/toDisplayString'

// 是否为对象
export const isObject = (val) => {
    return val !== null && typeof val === 'object'
}

export const isString = val => typeof val === 'string'

// 对象复制
export const extend = Object.assign
export function hasChanged(value, oldValue) {
    return !Object.is(value, oldValue)
}

export function hasOwn(val, key) {
    return Object.prototype.hasOwnProperty.call(val, key)
}

// 以 on + 一个大写字母开头
export const isOn = (key) => /^on[A-Z]/.test(key) 

const camelizeRE = /-(\w)/g;

/**
 * @description: 连接符命名转驼峰命名
 * @param {string} str
 * @return {*}
 */
export const camelize = (str: string): string => {
    return str.replace(camelizeRE, (_, $1) => ($1 ? $1.toUpperCase() : ""));
};

/**
 * @private
 * @description: 首字母大写
 * @param {string} str
 */
export const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

/**
 * @private
 * @description: 添加 on 前缀
 * @param {string} str
 * @return {*}
 */
export const toHandlerKey = (str: string) =>
    str ? `on${capitalize(str)}` : ``;

// 用来匹配 kebab-case 的情况
// 比如 onTest-event 可以匹配到 T
// 然后取到 T 在前面加一个 - 就可以
// \BT 就可以匹配到 T 前面是字母的位置
const hyphenateRE = /\B([A-Z])/g;
/**
 * @private
 */
export const hyphenate = (str: string) =>
  str.replace(hyphenateRE, "-$1").toLowerCase();