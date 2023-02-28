import { initProps } from "./componentProps";
/**
 * @description: 创建组件实例
 * @param {any} vnode
 * @return {*}
 */
export const createComponentInstance = function (vnode: any) {
    const instance = {
        type: vnode.type,
        vnode,
        props: {},
        proxy: null,
        isMounted: false,
    };
    return instance;
};

export function setupComponent(instance) {
    // 从实例上取出 props
    const { props } = instance.props;
    // 处理 props
    initProps(instance, props);
    // 处理 slots
    // initSlots()
    setupStatefulComponent(instance)
}

function initSlots() {

}

function setupStatefulComponent(instance) {
    // 1. 创建 proxy
    console.log('创建 proxy');
    // 2. 调用 setup() 参数: props、context
    const setupResult = instance.setup && instance.setup(instance.props, {})
    // 3. 处理 setupResult
    handleSetupResult(instance, setupResult)
}

function handleSetupResult(instance, setupResult) {
    // 设置 render

    if (typeof setupResult === "function") {
        // 返回的渲染函数
        // setup() {return () => h1('div')}
        instance.render = setupResult;
    } else if (typeof setupResult === "object") {
        // 对象则先存到 setupState 上
        instance.setupState = setupResult;
    }


    const component = instance.type

    if (!instance.render) {
        // 调用 compile 模板编译 template
    }
    instance.render = component.render

    // applyOptions()
}

function applyOptions() {
    // 兼容 vue2.x
}
