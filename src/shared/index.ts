export * from "./shapeFlags";

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
