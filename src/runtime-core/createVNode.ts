import { ShapeFlags } from '../shared'

/**
 * @description: 创建虚拟节点
 * @param {any} type 节点类型
 * @param {any} props 节点上的属性
 * @param {any} children 子节点
 * @return {VNode}
 */
export const createVNode = function (
    type: any,
    props: any = {},
    children: string | Array<any>
): any {

    const vnode = {
        el: null,
        component: null,
        key: props.key || null,
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type)
    }

    // 存在子节点
    if (Array.isArray(children)) {
        // 按位或运算，重设 shapeFlag 标识
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
    } else if (typeof children === 'string'){
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
    }

    normalizeChildren(vnode, children)

    return vnode
}

// 判断组件类型 (标签或组件)
function getShapeFlag(type: any): any {
    return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}