// Vue3.x 的 reactivity 就是基于 Proxy 来实现的
// 通过监听 get 和 set
// 在 get 中收集副作用函数
// 在 set 中执行副作用函数
import { mutableHandlers } from "./baseHandlers";
export function reactive(target) {
    return createReactiveObject;
}

function createReactiveObject(target) {
    return new Proxy(target, mutableHandlers);
}
