import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, reactiveMap } from "./reactive";
import { isObject } from "../../shared/index";
const get = createGetter();
const set = createSetter();

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        // console.log(
        //     "Proxy get 函数触发了. target:",
        //     JSON.stringify(target),
        //     "key: ",
        //     key
        // );
        // 已存在的 proxy
        const isExistInReactiveMap = () => {
            return (
                key === ReactiveFlags.RAW &&
                receiver === reactiveMap.get(target)
            );
        };

        if (key === ReactiveFlags.IS_REACTIVE) {
            // 判断 reactive 类型
            return true;
        } else if (isExistInReactiveMap()){
            return target
        }
        // 反射
        const res = Reflect.get(target, key, receiver);
        if (isObject(res)) {
            return reactive(res);
        }
        // 注入追踪依赖
        track(target, "get", key);
        // 返回值
        return res;
    };
}

function createSetter() {
    return function set(target, key, value, receiver) {
        // console.log(
        //     "Proxy set 函数触发了. target:",
        //     JSON.stringify(target),
        //     " key: ",
        //     key,
        //     " value: ",
        //     value
        // );
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
