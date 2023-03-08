import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";
import { emit } from "./componentEmits";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { proxyRefs, shallowReadonly } from "@tiny-vue/reactivity";

/**
 * @description: 创建组件实例
 * @param {any} vnode
 * @return {*}
 */
export const createComponentInstance = function (vnode: any, parent) {
    const instance = {
        type: vnode.type,
        vnode,
        next: null, // 需要更新的 vnode, 用于更新 component 类型的组件
        props: {},
        proxy: null,
        isMounted: false,
        attrs: {}, // 属性
        slots: {}, // 插槽
        ctx: {}, // 上下文
        setupState: {}, // setup 的返回值
        parent,
        provides: parent ? parent.provides : {},
        emit: () => {},
    };

    // 在 prod 环境下的 ctx 只是下面简单的结构
    // 在 dev 中更复杂
    instance.ctx = {
        _: instance,
    };

    // emit 的实现绑定
    instance.emit = emit.bind(null, instance) as any;

    return instance;
};

export function setupComponent(instance) {
    // 从实例上取出 props
    const { props, children } = instance.vnode;
    // 处理 props
    initProps(instance, props);
    // 处理 slots
    initSlots(instance, children);

    setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
    // 1. 创建 proxy
    console.log("创建 proxy");
    // proxy 对象代理了 instance.ctx 对象
    // 在使用的时候需要使用 instance.proxy 对象
    // 因为在 prod 和 dev 下 instance.ctx 是不同的
    instance.proxy = new Proxy(
        instance.ctx,
        PublicInstanceProxyHandlers as any
    );
    const { setup } = instance.type;
    if (setup) {
        // 2. 调用 setup() 参数: props、context
        const context = createSetupContext(instance);
        // 设置 currentInstance 的值
        setCurrentInstance(instance);
        // 真实场景里应该只有 dev 环境会把 props 设置为只读
        const setupResult =
            setup && setup(shallowReadonly(instance.props), context);
        setCurrentInstance(null);
        // 3. 处理 setupResult
        handleSetupResult(instance, setupResult);
    } else {
        finishComponentSetup(instance);
    }
}

function createSetupContext(instance) {
    console.log("初始化 setup context");
    return {
        attrs: instance.attrs,
        slots: instance.slots,
        emit: instance.emit,
        expose: () => {},
    };
}

function handleSetupResult(instance, setupResult) {
    // 设置 render

    if (typeof setupResult === "function") {
        // 返回的渲染函数
        // setup() {return () => h1('div')}
        instance.render = setupResult;
    } else if (typeof setupResult === "object") {
        // 对象则先存到 setupState 上
        instance.setupState = proxyRefs(setupResult);
    }

    finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
    // 给 instance 设置 render

    // 先取到用户设置的 component options
    const component = instance.type;

    if (!instance.render) {
        // 调用 compile 模板编译 template
        if (compile && !component.render) {
            if (component.template) {
                const template = component.template;
                component.render = compile(template);
            }
        }
        instance.render = component.render;
    }

    // applyOptions()
}

function applyOptions() {
    // 兼容 vue2.x
}

let currentInstance = null;
export function getCurrentInstance() {
    return currentInstance;
}

export function setCurrentInstance(instance) {
    currentInstance = instance;
}

let compile;
export function registerRuntimeCompiler(_compile) {
    compile = _compile;
}
