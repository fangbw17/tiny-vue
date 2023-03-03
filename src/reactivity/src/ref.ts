import { trackEffects, triggerEffects } from "./effect";
import { createDep } from "./dep";
import { isObject, hasChanged } from "../../shared";
import { reactive } from "./reactive";

export class RefImpl {
    private _rawValue: any;
    private _value: any;
    public dep;

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

function trackRefValue(ref) {
    trackEffects(ref.dep);
}

function triggerRefValue(ref) {
    triggerEffects(ref.dep);
}
