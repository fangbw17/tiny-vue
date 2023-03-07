import { trackEffects, triggerEffects, isTracking } from "./effect";
import { createDep } from "./dep";
import { isObject, hasChanged } from "../../shared";
import { reactive } from "./reactive";

export class RefImpl {
    private _rawValue: any;
    private _value: any;
    public dep;
    public __v_isRef = true

    constructor(value) {
        // 原始值
        this._rawValue = value;
        // 如果 value 是一个对象，则需要用 reactive 来包裹
        this._value = convert(value);
        this.dep = createDep();
    }

    get value() {
        // 收集依赖
        trackRefValue(this);
        return this._value;
    }

    set value(newValue) {
        // 当新值不等于老值的话，那么才触发依赖
        if (hasChanged(newValue, this._rawValue)) {
            // 更新值
            this._value = convert(newValue);
            this._rawValue = newValue;
            // 触发依赖
            triggerRefValue(this);
        }
    }
}

// Ref 对外暴露的简便方法
export function ref(value) {
    return createRef(value);
}

// 创建 Ref
function createRef(value) {
    const ref = new RefImpl(value);
    return ref;
}

function convert(value) {
    // 如果是对象则通过 reactive 创建
    return isObject(value) ? reactive(value) : value;
}

export function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}

export function triggerRefValue(ref) {
    triggerEffects(ref.dep);
}


// 解构 ref
const shallowUnwrapHandlers = {
    get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver)
        return unRef(res)
    },
    set(target, key, value, receiver) {
        const oldValue = target[key]
        if (isRef(oldValue) && !isRef(value)) {
            return (target[key].value = value)
        } else {
            return Reflect.set(target, key, value, receiver)
        }
    }
}

export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, shallowUnwrapHandlers)
}

// 把 ref 里面的值拿到
export function unRef(ref) {
    return isRef(ref) ? ref.value : ref
}

export function isRef(value) {
    return !!value.__v_isRef
}
