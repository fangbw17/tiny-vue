import { createDep } from "./dep";
import { extend } from "../../shared/index";

// 当前的 effect
let activeEffect = void 0;
// 存储 Map
const targetMap = new WeakMap();

// 依赖收集
export class ReactiveEffect {
    active = true
    deps = []
    constructor(public fn, public scheduler?) {}

    run() {
        // 执行副作用函数
        // 给全局的 activeEffect 赋值
        activeEffect = this as any;

        return this.fn();
    }

    stop() {
        if (this.active) {
            // 如果第一次执行 stop 后 active 就 false
            // 防止重复调用
            cleanupEffect(this)
            this.active = false
        }
    }
}

export function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn);
    extend(_effect, options)
    _effect.run();

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function stop(runner) {
    runner.effect.stop()
}

// 追踪依赖
export function track(target, type, key) {
    if (!activeEffect) return;
    /*
- WeakMap
    key: object
    value: map
        - map
        key: property
        value: set
        - set
            [effect1、effect2]
 */
    // 对象-属性-副作用
    // 根据对象查找相应的属性
    let depsMap = targetMap.get(target);
    // 未找到则初始化，并赋值
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    // 根据属性值查找对应的副作用函数
    let dep = depsMap.get(key);
    // 未找到则初始化，并赋值
    if (!dep) {
        depsMap.set(key, (dep = createDep()));
    }
    trackEffects(dep);
}

// 触发依赖
export function trigger(target, type, key) {
    let deps: Array<any> = [];

    const depsMap = targetMap.get(target);

    const dep = depsMap.get(key);

    deps.push(dep);

    const effects: Array<any> = [];
    deps.forEach((dep) => {
        // 解构 dep 得到的是 dep 内部存储的 effect
        effects.push(...dep);
    });
    triggerEffects(createDep(effects));
}

export function triggerEffects(dep) {
    for (const effect of dep) {
        // 调度器存在，则把响应事件交给用户处理
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            // 直接执行副作用函数
            effect.run();
        }
    }
}

export function trackEffects(dep) {
    // 用 dep 存放 effect
    dep.add(activeEffect);
    (activeEffect as any).deps.push(dep)
}

export function isTracking() {
    return activeEffect !== undefined
}


function cleanupEffect(effect) {
    // 找到所有依赖这个 effect 的响应式对象
    // 从这些响应式对象里面把 effect 给删除掉
    effect.deps.forEach(dep => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}