import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}) {
    // 创建 context
    const context = createTransformContext(root, options);

    // 遍历 node
    traverseNode(root, context);

    craeteRootCodegen(root, context);

    root.helpers.push(...context.helpers.keys());
}

function traverseNode(node, context) {
    const type: NodeTypes = node.type;

    // 节点转换 方法
    const nodeTransforms = context.nodeTransforms;
    nodeTransforms.forEach((fn) => {
        fn(node, context);
    });

    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            // 插值的点，在于后续生成 render 代码的时候获取变量的值
            context.helper(TO_DISPLAY_STRING);
            break;
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
        case NodeTypes.COMPOUND_EXPRESSION:
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
            context.helpers.set(name, count + 1);
        },
    };
    return context;
}

function craeteRootCodegen(root, context) {
    const { children } = root;
    const child = children[0];

    // 如果是 element 类型的话 ， 那么我们需要把它的 codegenNode 赋值给 root
    // root 其实是个空的什么数据都没有的节点
    // 所以这里需要额外的处理 codegenNode
    // codegenNode 的目的是专门为了 codegen 准备的  为的就是和 ast 的 node 分离开
    if (child.type === NodeTypes.ELEMENT && child.codegenNode) {
        // const codegenNode = child.codegenNode
        root.codegenNode = child.codegenNode;
    } else {
        root.codegenNode = child;
    }
}
