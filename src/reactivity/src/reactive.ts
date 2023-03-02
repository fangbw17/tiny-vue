// Vue3.x 的 reactivity 就是基于 Proxy 来实现的
// 通过监听 get 和 set
// 在 get 中收集副作用函数
// 在 set 中执行副作用函数
import { mutableHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}

export function reactive(target) {
    return createReactiveObject(target);
}

export function isReactive(value) {
    // value 是 proxy, 会触发 get 操作
    // value 是 普通对象的话 会返回 undefined，转成布尔值
    return !!value[ReactiveFlags.IS_REACTIVE]
}

function createReactiveObject(target) {
    return new Proxy(target, mutableHandlers);
}


