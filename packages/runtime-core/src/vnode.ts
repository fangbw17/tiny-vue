import { ShapeFlags } from "@tiny-vue/shared";

export { createVNode as createElementVNode };

/**
 * @description: 创建虚拟节点
 * @param {any} type 节点类型
 * @param {any} props 节点上的属性
 * @param {any} children 子节点
 * @return {VNode}
 */
export const createVNode = function (
    type: any,
    props?: any,
    children?: string | Array<any>
): any {
    const vnode = {
        el: null,
        component: null,
        key: props?.key,
        type,
        props: props || {},
        children,
        shapeFlag: getShapeFlag(type),
    };

    // 存在子节点
    if (Array.isArray(children)) {
        // 按位或运算，重设 shapeFlag 标识
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    } else if (typeof children === "string") {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }

    normalizeChildren(vnode, children);

    return vnode;
};

// 判断组件类型 (标签或组件)
function getShapeFlag(type: any): any {
    return typeof type === "string"
        ? ShapeFlags.ELEMENT
        : ShapeFlags.STATEFUL_COMPONENT;
}

export function normalizeChildren(vnode, children) {
    if (typeof children === "object") {
        // 标识 slots_children 类型
        if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
        } else {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
        }
    }
}

// 标准化 vnode 格式
// 让 child 支持多种格式
export function normalizeVNode(child) {
    // 暂时只支持处理 child 为 string 和 number 的情况
    if (typeof child === "string" || typeof child === "number") {
        return createVNode(Text, null, String(child));
    } else {
        return child;
    }
}

// Text 使用 Symbol 唯一标识
export const Text = Symbol("Text");
export const Fragment = Symbol("Fragment");

export function createTextVNode(text: string = "") {
    return createVNode(Text, {}, text);
}
