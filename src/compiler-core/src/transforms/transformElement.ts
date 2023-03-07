import { NodeTypes, createVNodeCall } from "../ast";

export function transformElement(node, context) {
    if (node.type === NodeTypes.ELEMENT) {
        // 没有实现 block
        const vnodeTag = `'${node.tag}'`;
        const vnodeProps = null
        let vnodeChildren = null
        if (node.children.length > 0) {
            if (node.children.length === 1) {
                // 只有一个孩子节点，那么当生成 render 函数的时候就不用【】包裹
                const child = node.children[0]
                vnodeChildren = child
            }
        }

        // 创建一个新的 node 用于 codegen 的时候使用
        node.codegenNode = createVNodeCall(
            context,
            vnodeTag,
            vnodeProps,
            vnodeChildren
        )
    }
}
