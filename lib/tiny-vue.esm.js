/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function createDep(effects) {
    var dep = new Set(effects);
    return dep;
}

var isObject = function (val) {
    return val !== null && typeof val === 'object';
};
var extend = Object.assign;

var activeEffect = null;
var targetMap = new WeakMap();
var ReactiveEffect = (function () {
    function ReactiveEffect(fn) {
        this.fn = fn;
        this.active = true;
        this.deps = [];
    }
    ReactiveEffect.prototype.run = function () {
        activeEffect = this;
        this.fn();
    };
    ReactiveEffect.prototype.stop = function () {
        if (this.active) {
            cleanupEffect(this);
            this.active = false;
        }
    };
    return ReactiveEffect;
}());
function effect(fn, options) {
    if (options === void 0) { options = {}; }
    var _effect = new ReactiveEffect(fn);
    extend(_effect, options);
    _effect.run();
    var runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    runner.effect.stop();
}
function track(target, type, key) {
    if (!activeEffect)
        return;
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    var dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep()));
    }
    trackEffects(dep);
}
function trigger(target, type, key) {
    var deps = [];
    var depsMap = targetMap.get(target);
    var dep = depsMap.get(key);
    deps.push(dep);
    var effects = [];
    deps.forEach(function (dep) {
        effects.push.apply(effects, __spreadArray([], __read(dep), false));
    });
    triggerEffects(createDep(effects));
}
function triggerEffects(dep) {
    var e_1, _a;
    try {
        for (var dep_1 = __values(dep), dep_1_1 = dep_1.next(); !dep_1_1.done; dep_1_1 = dep_1.next()) {
            var effect_1 = dep_1_1.value;
            if (effect_1.scheduler) {
                effect_1.scheduler();
            }
            else {
                effect_1.run();
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (dep_1_1 && !dep_1_1.done && (_a = dep_1.return)) _a.call(dep_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
function trackEffects(dep) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function cleanupEffect(effect) {
    effect.deps.forEach(function (dep) {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}

var get = createGetter();
var set = createSetter();
function createGetter(isReadonly, shallow) {
    return function get(target, key, receiver) {
        var isExistInReactiveMap = function () {
            return (key === "__v_raw" &&
                receiver === reactiveMap.get(target));
        };
        if (key === "__v_isReactive") {
            return true;
        }
        else if (isExistInReactiveMap()) {
            return target;
        }
        var res = Reflect.get(target, key, receiver);
        if (isObject(res)) {
            return reactive(res);
        }
        track(target, "get", key);
        return res;
    };
}
function createSetter() {
    return function set(target, key, value, receiver) {
        var res = Reflect.set(target, key, value, receiver);
        trigger(target, "get", key);
        return res;
    };
}
var mutableHandlers = {
    get: get,
    set: set,
};

var reactiveMap = new WeakMap();
function reactive(target) {
    return createReactiveObject(target, reactiveMap);
}
function isReactive(value) {
    return !!value["__v_isReactive"];
}
function toRaw(value) {
    if (!value["__v_raw"]) {
        return value;
    }
    return value["__v_raw"];
}
function createReactiveObject(target, proxyMap) {
    var existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    var proxy = new Proxy(target, mutableHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}

export { effect, isReactive, reactive, reactiveMap, stop, toRaw };
//# sourceMappingURL=tiny-vue.esm.js.map
