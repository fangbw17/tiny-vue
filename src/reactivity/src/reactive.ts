// Vue3.x 的 reactivity 就是基于 Proxy 来实现的
// 通过监听 get 和 set
// 在 get 中收集副作用函数
// 在 set 中执行副作用函数
import { readBuilderProgram } from "typescript";
import { mutableHandlers } from "./baseHandlers";

export const reactiveMap = new WeakMap();

export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
    RAW = "__v_raw",
}

export function reactive(target) {
    return createReactiveObject(target, reactiveMap);
}

export function isReactive(value) {
    // value 是 proxy, 会触发 get 操作
    // value 是 普通对象的话 会返回 undefined，转成布尔值
    return !!value[ReactiveFlags.IS_REACTIVE];
}

export function toRaw(value) {
    // value 为 proxy 时，直接返回
    // value 为普通对象，返回普通对象
    // 只要不是 proxy，只要得到的 undefined，那么一定是普通对象
    if (!value[ReactiveFlags.RAW]) {
        return value;
    }
    return value[ReactiveFlags.RAW];
}

function createReactiveObject(target, proxyMap) {
    // 根据源数据获取对应的 proxy
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        // 返回已存在的 proxy
        return existingProxy;
    }
    // 根据源数据新建 proxy
    const proxy = new Proxy(target, mutableHandlers);
    // 源数据 - proxy 存入容器中
    proxyMap.set(target, proxy);
    // 返回 proxy
    return proxy;
}
