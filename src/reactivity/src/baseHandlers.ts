import { track, trigger } from "./effect";
const get = createGetter();
const set = createSetter();

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        // 反射
        const res = Reflect.get(target, key, receiver);
        // 注入追踪依赖
        track(target, "get", key);
        // 返回值
        return res;
    };
}

function createSetter() {
    return function set(target, key, value, receiver) {
        // 反射
        const res = Reflect.set(target, key, value, receiver);
        // 注入执行依赖
        trigger(target, "get", key);
        // 返回值
        return res;
    };
}

export const mutableHandlers = {
    get,
    set,
};
