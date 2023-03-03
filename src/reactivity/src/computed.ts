import { createDep } from "./dep";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";

export class ComputedRefImpl {
    // 依赖收集容器
    public dep: any
    // 副作用函数
    public effect: ReactiveEffect

    // 缓存标识
    private _dirty: boolean
    private _value

    constructor(getter) {
        this._dirty = true
        this._value = null
        this.dep = createDep()
        this.effect = new ReactiveEffect(getter, () => {
            if (this._dirty) return

            this._dirty = false
            triggerRefValue(this)
        })
    }

    get value() {
        // 收集依赖
        trackRefValue(this)
        // 锁上，只可以调用一次
        // 当数据改变的时候才会解锁
        // 这里就是缓存实现的核心
        // 解锁是在 scheduler 里面做的
        if (this._dirty) {
            this._dirty = false
            // 执行 run
            this._value = this.effect.run()
        }
        return this._value
    }
}

export function computed(getter) {
    return new ComputedRefImpl(getter)
}