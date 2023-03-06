import { NodeTypes } from "./ast";

export function transform(root, options = {}) {
    // 创建 context
    const context = createTransformContext(root, options);

    // 遍历 node
    traverseNode(root, context);
}

function traverseNode(node, context) {
    // 节点转换 方法
    const nodeTransforms = context.nodeTransforms;
    nodeTransforms.forEach((fn) => {
        fn(node, context);
    });

    switch (node.type) {
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            traverseChildren(node, context);
            break;

        default:
            break;
    }
}

function traverseChildren(node, context) {
    node.children &&
        node.children.forEach((childNode) => {
            // TODO: 需要设置 context 的值
            traverseNode(childNode, context);
        });
}

function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
    };
    return context;
}
