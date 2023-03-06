import { track, trigger } from "./effect";
import {
    ReactiveFlags,
    reactive,
    reactiveMap,
    readonly,
    readonlyMap,
    shallowReadonlyMap,
} from "./reactive";
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

        // reactive 原始值
        const isExistInReactiveMap = () => {
            return (
                key === ReactiveFlags.RAW &&
                receiver === reactiveMap.get(target)
            );
        };

        // readonly 原始值
        const isExistInReadonlyMap = () => {
            return (
                key === ReactiveFlags.RAW &&
                receiver === readonlyMap.get(target)
            );
        };

        // shallowReadonly 原始值
        const isExistInshallowReadonlyMap = () => {
            return (
                key === ReactiveFlags.RAW &&
                receiver === shallowReadonlyMap.get(target)
            );
        };

        // 是否是 reactive
        if (key === ReactiveFlags.IS_REACTIVE) {
            // 判断 reactive 类型
            return !isReadonly;
        } else if (key === ReactiveFlags.IS_READONLY) {
            // 是否是 readonly
            return isReadonly;
        } else if (
            isExistInReactiveMap() ||
            isExistInReadonlyMap() ||
            isExistInshallowReadonlyMap()
        ) {
            // 获取原始值
            return target;
        }
        // 反射
        const res = Reflect.get(target, key, receiver);

        // shallowReadonly
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            // 注入追踪依赖
            track(target, "get", key);
        }
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
        trigger(target, "set", key);
        // 返回值
        return res;
    };
}

export const mutableHandlers = {
    get,
    set,
};

export const readonlyHandlers = {
    get: createGetter(true),
    set(target, key) {
        console.warn(
            `Set operation on key "${String(key)}" failed target is readonly.`
        );
        return true;
    },
};

export const shallowReadonlyHandlers = {
    get: createGetter(true, true),
    set(target, key) {
        console.warn(
            `Set operation on key "${String(
                key
            )}" failed: target is shallowReadonly.`,
            target
        );
        return true;
    },
};
