import { ShapeFlags } from "../shared";
import { createComponentInstance } from "./component";
import {
    hostCreateElement,
    hostSetElementText,
    hostPatchProp,
    hostInsert,
} from "./render-api";
export const render = function (vnode, container) {
    console.log("调用 patch");
    patch(null, vnode, container);
};

/**
 * @description: 更新
 * @param {*} n1 旧节点
 * @param {*} n2 新节点
 * @param {*} container 容器
 * @return {*}
 */
function patch(n1, n2, container) {
    const { type, shapeFlag } = n2;
    switch (type) {
        case "text":
            // 文字
            break;
        case "comment":
            // 注释
            break;
        case "static":
            break;
        case "fragment":
            break;
        default:
            // 其他类型基于 shapeFlag 处理，按位与
            if (shapeFlag & ShapeFlags.ELEMENT) {
                console.log("处理 element");
                processElement(n1, n2, container);
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                console.log("处理 component");
                processComponent(n1, n2, container);
            }
    }
}

// 处理标签
function processElement(n1, n2, container) {
    // 旧节点不存在, 直接挂载
    if (!n1) {
        mountElement(n2, container)
        // hostCreateElement(n2.type)
    } else {

    }
}

// 挂载标签
function mountElement(vnode, container) {
    const {shapeFlag, props} = vnode
    // 根据 type 创建元素
    const el = (vnode.el = hostCreateElement(vnode.type))
    // 单子组件
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        console.log(`处理文本:${vnode.children}`);
        hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 多子组件
        mountChildren(vnode.children, el)
    }

    // 处理属性
    if (props) {
        for (const key in props) {
            const nextVal = props[key]
            hostPatchProp(el, key, null, nextVal)
        }
    }

    // beforeMount 钩子
    console.log("vnodeHook -> onVnodeBeforeMount");
    console.log("DirectiveHook -> beforeMount");
    console.log("transition -> beforeEnter");

    // 将创建的 el 插入到 容器中
    hostInsert(el, container)

    // mount 钩子
    console.log("vnodeHook -> onVnodeMount");
    console.log("DirectiveHook -> mount");
    console.log("transition -> enter");
}

// 挂载子节点
function mountChildren(children, container) {
    children.forEach(c => {
        console.log("mountChildren:", c);
        patch(null, c, container)
    })
}

// 处理组件
function processComponent(n1, n2, container) {
    if (!n1) {
        // 挂载组件
        mountComponent(n2, container) 
    } else {

    }
}

// 挂载组件
function mountComponent(vnode, container) {
    // 创建组件实例
    const instance = (vnode.component = createComponentInstance(vnode))
    console.log(`创建组件实例:${instance.type.name}`);
    // 加工组件实例
    setupComponent(instance)

    setupRenderEffect(instance, container)
}

// 加工组件实例
function setupComponent(instance) {
    // 处理 props
    initProps()
    // 处理 slots
    initSlots()

    setupStatefulComponent(instance)
}

function initProps() {}
function initSlots() {}

function setupStatefulComponent(instance) {
    // 1. 创建代理 proxy
    console.log(`创建 proxy`);
    // 2. 调用setup
    const setupResult = instance.setup && instance.setup(instance.props)
    // 3. 处理 setupResult
    handleSetupResult(instance, setupResult)
}

function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'function') {
        // 返回的渲染函数
        // setup() {return () => h1('div')}
        instance.render = setupResult
    } else if (typeof setupResult === 'object') {
        // 对象则先存到 setupState 上
        instance.setupState = setupResult
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    // 给 instance 设置 render
    // 获取用户设置的 component options
    const component = instance.type
    if (!instance.render) {

    }
    instance.render = component.render

    // applyOptions()
}   

function applyOptions() {
    // 兼容 vue2.x
}

function setupRenderEffect(instance, container) {
    // 源码里面是直接调用了 reactivity
  // 因为这次只处理初始化逻辑
  // 所以暂时用不到
  // 后面这里是作为 update 的主要逻辑

  // 调用 render
  // 应该传入 ctx 也就是 proxy
  // ctx 可以选择暴露给用户的 api
  // 源代码里面是调用的 renderComponentRoot 函数
  // 这里为了简化直接调用 render
  console.log("调用 render,获取 subTree");
  const subTree = instance.render(instance.proxy);
  console.log("subTree", subTree);

  // todo
  console.log(`${instance.type.name}:触发 beforeMount hook`);
  console.log(`${instance.type.name}:触发 onVnodeBeforeMount hook`);

  // 这里基于 subTree 再次调用 patch
  // 基于 render 返回的 vnode ，再次进行渲染
  // 这里我把这个行为隐喻成开箱
  // 一个组件就是一个箱子
  // 里面有可能是 element （也就是可以直接渲染的）
  // 也有可能还是 component
  // 这里就是递归的开箱
  // 而 subTree 就是当前的这个箱子（组件）装的东西
  // 箱子（组件）只是个概念，它实际是不需要渲染的
  // 要渲染的是箱子里面的 subTree
  patch(null, subTree, container);

  console.log(`${instance.type.name}:触发 mounted hook`);
}
