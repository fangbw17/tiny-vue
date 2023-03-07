'use strict';

const c2eMap = {
    你好: "hello",
    "调用 patch": "call patch function",
};
const e2cMap = {
    hello: "你好",
};
class languageTranslator {
    constructor() {
        this.currentLanguage = 'cn';
    }
    get currentMap() {
        return this.currentLanguage === "cn" ? e2cMap : c2eMap;
    }
    transition(text) {
        const result = this.currentMap[text];
        return result ? result : text;
    }
}

class Debug {
    constructor(languageTranslator) {
        this.languageTranslator = languageTranslator;
    }
    mainPath(text) {
        return window.console.log.bind(window.console, `%c[ mainPath ] ${this.languageTranslator.transition(text)}`, "color:red");
    }
}

const debug = new Debug(new languageTranslator());
window['debug'] = debug;

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

const toDisplayString = (val) => {
    return String(val);
};

const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const extend = Object.assign;
function hasChanged(value, oldValue) {
    return !Object.is(value, oldValue);
}
function hasOwn(val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
}
const isOn = (key) => /^on[A-Z]/.test(key);
const camelizeRE = /-(\w)/g;
const camelize = (str) => {
    return str.replace(camelizeRE, (_, $1) => ($1 ? $1.toUpperCase() : ""));
};
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const toHandlerKey = (str) => str ? `on${capitalize(str)}` : ``;

const createVNode = function (type, props, children) {
    const vnode = {
        el: null,
        component: null,
        key: props === null || props === void 0 ? void 0 : props.key,
        type,
        props: props || {},
        children,
        shapeFlag: getShapeFlag(type),
    };
    if (Array.isArray(children)) {
        vnode.shapeFlag |= 16;
    }
    else if (typeof children === "string") {
        vnode.shapeFlag |= 8;
    }
    normalizeChildren(vnode, children);
    return vnode;
};
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1
        : 4;
}
function normalizeChildren(vnode, children) {
    if (typeof children === "object") {
        if (vnode.shapeFlag & 1) ;
        else {
            vnode.shapeFlag |= 32;
        }
    }
}
function normalizeVNode(child) {
    return createVNode(Text, null, String(child));
}
const Text = Symbol("Text");
const Fragment = Symbol("Fragment");
function createTextVNode(text = "") {
    return createVNode(Text, {}, text);
}

const h = function (type, props, children) {
    return createVNode(type, props, children);
};

function createAppAPI(render) {
    return function createApp(rootComponent) {
        const app = {
            _component: rootComponent,
            mount(rootContainer) {
                console.log("基于根组件创建 vnode");
                const vnode = createVNode(rootComponent);
                console.log("调用 render，基于 vnode 进行开箱");
                render(vnode, rootContainer);
            },
        };
        return app;
    };
}

function initProps(instance, rawProps) {
    console.log('initProps');
    instance.props = rawProps;
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 32) {
        normalizeObjectSlots(children, (instance.slots = {}));
    }
}
const normalizeSlotValue = (value) => {
    return Array.isArray(value) ? value : [value];
};
const normalizeObjectSlots = (rawSlots, slots) => {
    for (const key in rawSlots) {
        const value = rawSlots[key];
        if (typeof value === "function") {
            slots[key] = (props) => normalizeSlotValue(value(props));
        }
    }
};

function emit(instance, event, ...rawArgs) {
    const props = instance.props;
    const handlerName = toHandlerKey(camelize(event));
    console.log(`方法名为: ${handlerName} 的事件被触发了。 参数为:${rawArgs}`);
    const handler = props[handlerName];
    handler && handler(...rawArgs);
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $emit: (i) => i.emit,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        console.log("触发 proxy 的 hook. key: ", key);
        if (key[0] !== "$") {
            if (hasOwn(setupState, key)) {
                return setupState[key];
            }
            else if (hasOwn(props, key)) {
                return props[key];
            }
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
    set({ _: instance }, key, value) {
        const { setupState } = instance;
        if (Object.keys(setupState).length > 0 && hasOwn(setupState, key)) {
            setupState[key] = value;
        }
        return true;
    },
};

function createDep(effects) {
    const dep = new Set(effects);
    return dep;
}

let activeEffect = void 0;
let shouldTrack = false;
const targetMap = new WeakMap();
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
        console.log(`创建 ReactiveEffect 对象`);
    }
    run() {
        console.log("run");
        if (!this.active) {
            return this.fn();
        }
        shouldTrack = true;
        activeEffect = this;
        console.log("执行 副作用函数 fn");
        const result = this.fn();
        shouldTrack = false;
        activeEffect = undefined;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    runner.effect.stop();
}
function track(target, type, key) {
    console.log(`触发 track -> target: ${target} type: ${type} key:${key}`);
    if (!activeEffect)
        return;
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep()));
    }
    trackEffects(dep);
}
function trigger(target, type, key) {
    let deps = [];
    const depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    const dep = depsMap.get(key);
    deps.push(dep);
    const effects = [];
    deps.forEach((dep) => {
        effects.push(...dep);
    });
    triggerEffects(createDep(effects));
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function trackEffects(dep) {
    if (!activeEffect)
        return;
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
    }
}
function isTracking() {
    return activeEffect !== undefined && shouldTrack;
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        const isExistInReactiveMap = () => {
            return (key === "__v_raw" &&
                receiver === reactiveMap.get(target));
        };
        const isExistInReadonlyMap = () => {
            return (key === "__v_raw" &&
                receiver === readonlyMap.get(target));
        };
        const isExistInshallowReadonlyMap = () => {
            return (key === "__v_raw" &&
                receiver === shallowReadonlyMap.get(target));
        };
        if (key === "__v_isReactive") {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly") {
            return isReadonly;
        }
        else if (isExistInReactiveMap() ||
            isExistInReadonlyMap() ||
            isExistInshallowReadonlyMap()) {
            return target;
        }
        const res = Reflect.get(target, key, receiver);
        if (!isReadonly) {
            track(target, "get", key);
        }
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value, receiver) {
        const res = Reflect.set(target, key, value, receiver);
        trigger(target, "set", key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`Set operation on key "${String(key)}" failed target is readonly.`);
        return true;
    },
};
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set(target, key) {
        console.warn(`Set operation on key "${String(key)}" failed: target is shallowReadonly.`, target);
        return true;
    },
};

const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
const shallowReadonlyMap = new WeakMap();
var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
    ReactiveFlags["RAW"] = "__v_raw";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(target) {
    return createReactiveObject(target, reactiveMap, mutableHandlers);
}
function readonly(target) {
    return createReactiveObject(target, readonlyMap, readonlyHandlers);
}
function shallowReadonly(target) {
    return createReactiveObject(target, shallowReadonlyMap, shallowReadonlyHandlers);
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function isReadonly(value) {
    return !!value["__v_isReadonly"];
}
function isReactive(value) {
    return !!value["__v_isReactive"];
}
function createReactiveObject(target, proxyMap, baseHandlers) {
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = createDep();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(newValue, this._rawValue)) {
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerRefValue(this);
        }
    }
}
function ref(value) {
    return createRef(value);
}
function createRef(value) {
    const ref = new RefImpl(value);
    return ref;
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function triggerRefValue(ref) {
    triggerEffects(ref.dep);
}
const shallowUnwrapHandlers = {
    get(target, key, receiver) {
        const res = Reflect.get(target, key, receiver);
        return unRef(res);
    },
    set(target, key, value, receiver) {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            return (target[key].value = value);
        }
        else {
            return Reflect.set(target, key, value, receiver);
        }
    }
};
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function isRef(value) {
    return !!value.__v_isRef;
}

class ComputedRefImpl {
    constructor(getter) {
        this._dirty = true;
        this._value = null;
        this.dep = createDep();
        this.effect = new ReactiveEffect(getter, () => {
            if (this._dirty)
                return;
            this._dirty = false;
            triggerRefValue(this);
        });
    }
    get value() {
        trackRefValue(this);
        if (this._dirty) {
            this._dirty = false;
            this._value = this.effect.run();
        }
        return this._value;
    }
}
function computed(getter) {
    return new ComputedRefImpl(getter);
}

const createComponentInstance = function (vnode, parent) {
    const instance = {
        type: vnode.type,
        vnode,
        next: null,
        props: {},
        proxy: null,
        isMounted: false,
        attrs: {},
        slots: {},
        ctx: {},
        setupState: {},
        parent,
        provides: parent ? parent.provides : {},
        emit: () => { },
    };
    instance.ctx = {
        _: instance,
    };
    instance.emit = emit.bind(null, instance);
    return instance;
};
function setupComponent(instance) {
    const { props, children } = instance.vnode;
    initProps(instance, props);
    initSlots(instance, children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    console.log("创建 proxy");
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
    const { setup } = instance.type;
    if (setup) {
        const context = createSetupContext(instance);
        setCurrentInstance(instance);
        const setupResult = setup && setup(shallowReadonly(instance.props), context);
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
    else {
        finishComponentSetup(instance);
    }
}
function createSetupContext(instance) {
    console.log("初始化 setup context");
    return {
        attrs: instance.attrs,
        slots: instance.slots,
        emit: instance.emit,
        expose: () => { },
    };
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "function") {
        instance.render = setupResult;
    }
    else if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (!instance.render) {
        if (compile && !component.render) {
            if (component.template) {
                const template = component.template;
                component.render = compile(template);
            }
        }
        instance.render = component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compile;
function registerRuntimeCompiler(_compile) {
    compile = _compile;
}

function provide(key, value) {
    var _a;
    const instance = getCurrentInstance();
    if (instance) {
        let { provides } = instance;
        const parentProvides = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (parentProvides === provides) {
            provides = instance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    var _a;
    const instance = getCurrentInstance();
    if (instance) {
        let provides = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (key in provides) {
            return provides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function renderSlot(slots, name, props = {}) {
    const slot = slots[name];
    console.log("渲染插槽 slot -> ${name}");
    if (slot) {
        const slotContent = slot(props);
        return createVNode(Fragment, {}, slotContent);
    }
}

const queue = new Set();
const p = Promise.resolve();
let isFlushPending = false;
const queueJob = function (effect) {
    if (!queue.has(effect)) {
        queue.add(effect);
        queueFlush();
    }
    console.log(`what's the effect: ${effect}`);
};
const nextTick = function (fn) {
    return fn ? p.then(fn).finally(() => {
        isFlushPending = false;
    }) : p;
};
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    console.log("副作用函数 微任务列表执行");
    queue.forEach((effect) => effect && effect());
    queue.clear();
}

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    if (prevProps === nextVNode) {
        return false;
    }
    if (!prevProps) {
        return !!nextProps;
    }
    if (!nextProps) {
        return true;
    }
    return hasPropsChanged(prevProps, nextProps);
}
function hasPropsChanged(prevProps, nextProps) {
    const prevAllKeys = Object.keys(prevProps);
    const nextAllKeys = Object.keys(nextProps);
    if (prevAllKeys.length !== nextAllKeys.length) {
        return true;
    }
    for (let i = 0; i < nextAllKeys.length; i++) {
        const key = nextAllKeys[i];
        if (nextProps[key] !== prevProps[key] || !(key in prevAllKeys)) {
            return true;
        }
    }
    return false;
}

function createRenderer(options) {
    const { createElement: hostCreateElement, setElementText: hostSetElementText, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setText: hostSetText, createText: hostCreateText, } = options;
    const render = (vnode, container) => {
        const debug = window["debug"];
        debug && debug.mainPath("调用 patch")();
        patch(null, vnode, container);
    };
    function patch(n1, n2, container = null, anchor = null, parentComponent = null) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Text:
                processText(n1, n2, container);
                break;
            case "comment":
                break;
            case "static":
                break;
            case Fragment:
                processFragment(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1) {
                    console.log("处理 element");
                    processElement(n1, n2, container, anchor, parentComponent);
                }
                else if (shapeFlag & 4) {
                    console.log("处理 component");
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }
    function processFragment(n1, n2, container) {
        if (!n1) {
            console.log("初始化 Fragment 类型节点");
            mountChildren(n2.children, container);
        }
    }
    function processText(n1, n2, container) {
        console.log("处理 Text 节点");
        if (n1 === null) {
            console.log("初始化 Text 类型的节点");
            hostInsert((n2.el = hostCreateText(n2.children)), container);
        }
        else {
            const el = (n2.el = n1.el);
            if (n2.children !== n1.children) {
                console.log("更新 Text 类型的节点");
                hostSetText(el, n2.children);
            }
        }
    }
    function processElement(n1, n2, container, anchor, parentComponent) {
        if (!n1) {
            mountElement(n2, container, anchor);
        }
        else {
            updateElement(n1, n2, container, anchor, parentComponent);
        }
    }
    function updateElement(n1, n2, container, anchor, parentComponent) {
        const oldProps = (n1 && n1.props) || {};
        const newProps = n2.props || {};
        console.log("更新 element");
        console.log("旧节点：", n1);
        console.log("新节点：", n2);
        const el = (n2.el = n1.el);
        patchProps(el, oldProps, newProps);
        patchChildren(n1, n2, el, anchor, parentComponent);
    }
    function patchProps(el, oldProps = {}, newProps = {}) {
        for (const key in newProps) {
            const oldValue = oldProps[key];
            const newValue = newProps[key];
            if (oldValue !== newValue) {
                hostPatchProp(el, key, oldValue, newValue);
            }
        }
        for (const key in oldProps) {
            const oldValue = oldProps[key];
            if (!(key in newProps)) {
                hostPatchProp(el, key, oldValue, null);
            }
        }
    }
    function patchChildren(n1, n2, container, anchor, parentComponent) {
        if (n2.shapeFlag & 8) {
            if (n1.children !== n2.children) {
                console.log("类型为 text_children, 当前需要更新");
                hostSetElementText(container, n2.children);
            }
        }
        else {
            if (n1.shapeFlag & 16) {
                if (n2.shapeFlag & 16) {
                    patchKeyedChildren(n1.children, n2.children, container, anchor, parentComponent);
                }
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentAnchor, parentComponent) {
        let i = 0;
        const l2 = c2.length;
        var e1 = c1.length - 1, e2 = l2 - 1;
        var isSameVNodeType = function (n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        };
        while (i <= e1 && i <= e2) {
            const prevChild = c1[i];
            const nextChild = c2[i];
            if (!isSameVNodeType(prevChild, nextChild)) {
                console.log("头部遍历 - 新旧节点不同");
                break;
            }
            patch(prevChild, nextChild, container, parentAnchor, parentComponent);
            i++;
        }
        while (i <= e1 && i <= e2) {
            const prevChild = c1[e1];
            const nextChild = c2[e2];
            if (!isSameVNodeType(prevChild, nextChild)) {
                console.log("尾部遍历 - 新旧节点不同");
                break;
            }
            patch(prevChild, nextChild, container, parentAnchor, parentComponent);
            e1--;
            e2--;
        }
        if (i > e1 && i <= e2) {
            const nextPos = e2 + 1;
            const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
            while (i >= e2) {
                console.log("新增一个节点：", c2[i].key);
                patch(null, c2[i++], container, anchor, parentComponent);
            }
        }
        else if (i > e2 && i <= e1) {
            while (i <= e1) {
                console.log("移除一个节点: ", c1[i].key);
                hostRemove(c1[i++].el);
            }
        }
        else {
            let s1 = i, s2 = i;
            const keyToNewIndexMap = new Map();
            let moved = false;
            let maxNewIndexSoFar = 0;
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            const newIndexArray = new Array(toBePatched);
            for (let index = 0; index < toBePatched; index++) {
                newIndexArray[index] = 0;
            }
            for (i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIdx;
                if (prevChild.key !== null) {
                    newIdx = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIdx = j;
                            break;
                        }
                    }
                }
                if (newIdx === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    console.log("新老节点都存在");
                    newIndexArray[newIdx - s2] = i + 1;
                    if (newIdx >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIdx;
                    }
                    else {
                        moved = true;
                    }
                    patch(prevChild, c2[newIdx], container, null, parentComponent);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexArray)
                : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = s2 + i;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
                if (newIndexArray[i] === 0) {
                    patch(null, nextChild, container, anchor, parentComponent);
                }
                else if (moved) {
                    if (j < 0 || increasingNewIndexSequence[j] !== i) {
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, anchor) {
        const { shapeFlag, props } = vnode;
        const el = (vnode.el = hostCreateElement(vnode.type));
        if (shapeFlag & 8) {
            console.log(`处理文本:${vnode.children}`);
            hostSetElementText(el, vnode.children);
        }
        else if (shapeFlag & 16) {
            mountChildren(vnode.children, el);
        }
        if (props) {
            for (const key in props) {
                const nextVal = props[key];
                hostPatchProp(el, key, null, nextVal);
            }
        }
        console.log("vnodeHook -> onVnodeBeforeMount");
        console.log("DirectiveHook -> beforeMount");
        console.log("transition -> beforeEnter");
        hostInsert(el, container, anchor);
        console.log("vnodeHook -> onVnodeMount");
        console.log("DirectiveHook -> mount");
        console.log("transition -> enter");
    }
    function mountChildren(children, container) {
        children.forEach((c) => {
            console.log("mountChildren:", c);
            patch(null, c, container);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        if (!n1) {
            mountComponent(n2, container, parentComponent);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2, container) {
        console.log("更新组件");
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            console.log("组件需要更新");
            instance.next = n2;
            instance.update();
        }
        else {
            n2.component = n1.component;
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function mountComponent(vnode, container, parentComponent) {
        const instance = (vnode.component = createComponentInstance(vnode, parentComponent));
        console.log(`创建组件实例:${instance.type.name}`);
        setupComponent(instance);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        function componentUpdateFn() {
            if (!instance.isMounted) {
                console.log("调用 render,获取 subTree");
                const proxyToUse = instance.proxy;
                const subTree = (instance.subTree = normalizeVNode(instance.render.call(proxyToUse, proxyToUse)));
                console.log("subTree", subTree);
                console.log(`${instance.type.name}:触发 beforeMount hook`);
                console.log(`${instance.type.name}:触发 onVnodeBeforeMount hook`);
                patch(null, subTree, container, null, instance);
                vnode.el = subTree.el;
                console.log(`${instance.type.name}:触发 mounted hook`);
                instance.isMounted = true;
            }
            else {
                console.log("更新逻辑: ", Date.now());
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const proxyToUse = instance.proxy;
                const nextTree = normalizeVNode(instance.render.call(proxyToUse, proxyToUse));
                const prevTree = instance.subTree;
                instance.subTree = nextTree;
                console.log("beforeUpdated hook");
                console.log("onVnodeBeforeUpdate hook");
                patch(prevTree, nextTree, prevTree.el, null, instance);
                console.log("updated hook");
                console.log("onVnodeUpdated hook");
                console.log(Date.now());
            }
        }
        instance.update = effect(componentUpdateFn, {
            scheduler: () => {
                queueJob(instance.update);
            },
        });
    }
    function updateComponentPreRender(instance, nextVNode) {
        nextVNode.component = instance;
        instance.vnode = nextVNode;
        instance.next = null;
        const { props } = nextVNode;
        console.log("更新组件的 props", props);
        instance.props = props;
        console.log("更新组件的 slots");
    }
    return {
        createApp: createAppAPI(render),
    };
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function createElement(type) {
    console.log("CreateElement", type);
    const dom = document.createElement(type);
    return dom;
}
function createText(text) {
    return document.createTextNode(text);
}
function setText(node, text) {
    node.nodeValue = text;
}
function setElementText(el, text) {
    console.log("SetElementText", el, text);
    el.textContent = text;
}
function patchProp(el, key, preValue, nextValue) {
    console.log(`属性key: ${key} 的旧值是${preValue}，新值是:${nextValue}`);
    if (isOn(key)) {
        const invokers = el._vei || (el._vei = {});
        const existingInvoker = invokers[key];
        if (nextValue && existingInvoker) {
            existingInvoker.value = nextValue;
        }
        else {
            const eventName = key.slice(2).toLowerCase();
            if (nextValue) {
                const invoker = (invokers[key] = nextValue);
                el.addEventListener(eventName, invoker);
            }
            else {
                el.removeEventListener(eventName, existingInvoker);
                invokers[key] = undefined;
            }
        }
    }
    else {
        if (nextValue === null || nextValue === '') {
            el.removeattribute(key);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
function insert(child, parent, anchor = null) {
    console.log(`Insert`);
    parent.insertBefore(child, anchor);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent)
        parent.removeChild(child);
}
let renderer;
function ensureRenderer() {
    return renderer || (renderer = createRenderer({
        createElement,
        createText,
        setText,
        setElementText,
        patchProp,
        insert,
        remove
    }));
}
const createApp = (...args) => {
    return ensureRenderer().createApp(...args);
};

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    createAppAPI: createAppAPI,
    createRenderer: createRenderer,
    createTextVNode: createTextVNode,
    getCurrentInstance: getCurrentInstance,
    h: h,
    inject: inject,
    provide: provide,
    registerRuntimeCompiler: registerRuntimeCompiler,
    renderSlot: renderSlot,
    toDisplayString: toDisplayString
});

const TO_DISPLAY_STRING = Symbol("toDisplayString");
const helperNameMap = {
    [TO_DISPLAY_STRING]: "toDisplayString"
};

function generate(ast, options = {}) {
    const context = createCodegenContext(ast, options);
    const { push, mode } = context;
    if (mode === "module") {
        genModulePreamble(ast, context);
    }
    else {
        genFunctionPreamble(ast, context);
    }
    const functionName = "render";
    const args = ["_ctx"];
    const signature = args.join(", ");
    push(`function ${functionName}(${signature}) {`);
    push("return ");
    genNode(ast.codegenNode, context);
    push("}");
    return {
        code: context.code,
    };
}
function genFunctionPreamble(ast, context) {
    const { runtimeGlobalName, push, newline } = context;
    const VueBinging = runtimeGlobalName;
    const aliasHelper = (s) => `${helperNameMap[s]} : _${helperNameMap[s]}`;
    if (ast.helpers.length > 0) {
        push(`
        const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging} 

      `);
    }
    newline();
    push(`return `);
}
function genNode(node, context) {
    switch (node.type) {
        case 2:
            genInterpolation(node, context);
            break;
        case 3:
            genExpression(node, context);
            break;
    }
}
function genExpression(node, context) {
    context.push(node.content, node);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}
function genModulePreamble(ast, context) {
    const { push, newline, runtimeModuleName } = context;
    if (ast.helpers.length) {
        const res = ast.helpers
            .map((s) => {
            return `${helperNameMap[s]} as _${helperNameMap[s]}`;
        })
            .join(", ");
        const code = `import {${res}} from ${JSON.stringify(runtimeModuleName)}`;
        push(code);
    }
    newline();
}
function createCodegenContext(ast, { runtimeModuleName = "vue", runtimeGlobalName = "Vue", mode = "function" }) {
    const context = {
        code: "",
        mode,
        runtimeModuleName,
        runtimeGlobalName,
        helper(key) {
            return `_${helperNameMap[key]}`;
        },
        push(code) {
            context.code += code;
        },
        newline() {
            context.code += "\n" + "    ";
        },
    };
    return context;
}

var TagType;
(function (TagType) {
    TagType[TagType["Start"] = 0] = "Start";
    TagType[TagType["End"] = 1] = "End";
})(TagType || (TagType = {}));
function baseParse(content) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context));
}
function createParserContext(content) {
    console.log("创建 paserContext");
    return {
        source: content,
    };
}
function parseChildren(context) {
    console.log("开始解析 children");
    const nodes = [];
    while (!isEnd(context)) {
        let node;
        if (context.source.startsWith("{{")) {
            node = parseMustache(context);
        }
        else if (context.source.startsWith("<")) {
            if (/[a-z]/i.test(context.source[1])) {
                node = parseElement(context, 0);
            }
            else if (context.source[1] === "/") {
                if (/[a-z]/i.test(context.source[2])) {
                    parseTag(context, 1);
                    continue;
                }
            }
        }
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function parseText(context) {
    console.log("解析 text", context);
    let endIndex = context.source.length;
    const endTokens = ["<", "{{"];
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (index !== -1) {
            endIndex = index;
        }
    }
    const content = parseTextData(context, endIndex);
    return {
        type: 0,
        content,
    };
}
function parseTextData(context, length) {
    console.log("解析 textData");
    const rawText = context.source.slice(0, length);
    advanceBy(context, length);
    return rawText;
}
function parseMustache(context) {
    console.log("解析 mustache", context);
    let content = context.source;
    const startIndex = context.source.indexOf("{{");
    const endIndex = context.source.indexOf("}}");
    if (startIndex == -1 || endIndex == -1) {
        console.warn(`${context.source} is not a valid interpolation`);
    }
    else {
        advanceBy(context, 2);
        content = parseSimpleExpress(startIndex, endIndex - 2, context);
        advanceBy(context, 2);
    }
    return {
        type: 2,
        content,
    };
}
function parseSimpleExpress(startIndex, endIndex, context) {
    console.log("解析 simple express");
    const rawText = context.source.slice(startIndex, endIndex);
    advanceBy(context, endIndex);
    return {
        type: 3,
        content: rawText.trim(),
    };
}
function parseElement(context, tagType) {
    const element = parseTag(context, tagType);
    const children = parseChildren(context);
    if (element && startsWithEndTagOpen(context, element.tag)) {
        parseTag(context, 1);
    }
    if (element) {
        element["children"] = children;
    }
    return element;
}
function parseTag(context, tagType) {
    const match = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source);
    let tag = "";
    if (match) {
        tag = match[1];
        advanceBy(context, match[0].length);
        advanceBy(context, 1);
    }
    if (tagType === 1)
        return;
    return {
        type: 4,
        tag: tag,
        tagType: 0,
    };
}
function startsWithEndTagOpen(context, tag) {
    return (context.source.startsWith("</") &&
        context.source.slice(2, tag.length).toLowerCase() === tag.toLowerCase());
}
function advanceBy(context, numberOfCharacters) {
    console.log("移动光标", context, numberOfCharacters);
    context.source = context.source.slice(numberOfCharacters);
}
function isEnd(context) {
    return !context.source;
}
function createRoot(children) {
    return {
        type: 1,
        children,
        helpers: [],
    };
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    craeteRootCodegen(root);
    root.helpers.push(...context.helpers.keys());
}
function traverseNode(node, context) {
    node.type;
    const nodeTransforms = context.nodeTransforms;
    nodeTransforms.forEach((fn) => {
        fn(node, context);
    });
    switch (node.type) {
        case 2:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 1:
        case 4:
            traverseChildren(node, context);
            break;
    }
}
function traverseChildren(node, context) {
    node.children &&
        node.children.forEach((childNode) => {
            traverseNode(childNode, context);
        });
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(name) {
            const count = context.helpers.get(name) || 0;
            context.helpers.set(name, count + 1);
        },
    };
    return context;
}
function craeteRootCodegen(root, context) {
    const { children } = root;
    const child = children[0];
    root.codegenNode = child;
}

function transformExpression(node) {
    if (node.type === 2) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function baseCompile(template, options) {
    const ast = baseParse(template);
    transform(ast, Object.assign(options, {
        nodeTransforms: [transformExpression],
    }));
    return generate(ast);
}

function compileToFunction(template, options = {}) {
    const { code } = baseCompile(template, options);
    const func = new Function("Vue", code);
    const render = func(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

exports.computed = computed;
exports.createApp = createApp;
exports.createAppAPI = createAppAPI;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.registerRuntimeCompiler = registerRuntimeCompiler;
exports.renderSlot = renderSlot;
exports.shallowReadonly = shallowReadonly;
exports.stop = stop;
exports.toDisplayString = toDisplayString;
exports.unRef = unRef;
//# sourceMappingURL=tiny-vue.cjs.js.map
