import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}) {
    // 创建 context
    const context = createTransformContext(root, options);

    // 遍历 node
    traverseNode(root, context);

    root.helpers.push(...context.helpers.keys())
}

function traverseNode(node, context) {
    // 节点转换 方法
    const nodeTransforms = context.nodeTransforms;
    nodeTransforms.forEach((fn) => {
        fn(node, context);
    });

    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            // 插值的点，在于后续生成 render 代码的时候获取变量的值
            context.helper(TO_DISPLAY_STRING)
            break;
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
        helpers: new Map(),
        helper(name) {
            // 收集调用的次数
            // TODO 但是为什么收集次数呢
            // helpers 数据会在后续生成代码的时候用到
            const count = context.helpers.get(name) || 0;
            context.helpers.set(name, count + 1)
        }
    };
    return context;
}