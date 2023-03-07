import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import {
    helperNameMap,
    TO_DISPLAY_STRING,
    CREATE_ELEMENT_VNODE,
} from "./runtimeHelpers";

export function generate(ast, options = {}) {
    // 生成 context
    const context = createCodegenContext(ast, options);
    const { push, mode } = context;

    // 生成 preambleContext
    if (mode === "module") {
        genModulePreamble(ast, context);
    } else {
        genFunctionPreamble(ast, context);
    }

    const functionName = "render";

    const args = ["_ctx"];

    const signature = args.join(", ");
    push(`function ${functionName}(${signature}) {`);
    // 生成具体的代码内容
    // 生成 vnode tree 的表达式
    push("return ");
    genNode(ast.codegenNode, context);

    push("}");

    return {
        code: context.code,
    };
}

function genFunctionPreamble(ast: any, context: any) {
    const { runtimeGlobalName, push, newline } = context;
    const VueBinging = runtimeGlobalName;

    const aliasHelper = (s) => `${helperNameMap[s]} : _${helperNameMap[s]}`;

    if (ast.helpers.length > 0) {
        push(
            `
        const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging} 

      `
        );
    }

    newline();
    push(`return `);
}

function genNode(node: any, context: any) {
    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            genInterpolation(node, context);
            break;
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node, context);
            break;
        case NodeTypes.ELEMENT:
            genElement(node, context);
            break;
        case NodeTypes.COMPOUND_EXPRESSION:
            genCompoundExpression(node, context);
            break;
        case NodeTypes.TEXT:
            genText(node, context);
            break;
        default:
            break;
    }
}

function genCompoundExpression(node: any, context: any) {
    const { push } = context;
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (isString(child)) {
            push(child);
        } else {
            genNode(child, context);
        }
    }
}

function genText(node: any, context: any) {
    const { push } = context;

    push(`'${node.content}'`);
}

function genElement(node, context) {
    const { push, helper } = context;
    const { tag, props, children } = node;

    push(`${helper(CREATE_ELEMENT_VNODE)}(`);

    genNodeList(genNullableArgs([tag, props, children]), context);
    push(`)`);
}

function genNodeList(nodes: any, context: any) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (isString(node)) {
            push(`${node}`);
        } else {
            genNode(node, context);
        }
        // node 和 node 之间需要加上 逗号(,)
        // 但是最后一个不需要 "div", [props], [children]
        if (i < nodes.length - 1) {
            push(", ");
        }
    }
}

function genNullableArgs(args) {
    // 把末尾为null 的都删除掉
    // vue3源码中，后面可能会包含 patchFlag、dynamicProps 等编译优化的信息
    // 而这些信息有可能是不存在的，所以在这边的时候需要删除掉
    let i = args.length;
    // 这里 i-- 用的还是特别的巧妙的
    // 当为0 的时候自然就退出循环了
    while (i--) {
        if (args[i] != null) break;
    }

    // 把为 falsy 的值都替换成 "null"
    return args.slice(0, i + 1).map((arg) => arg || "null");
}

function genExpression(node: any, context: any) {
    context.push(node.content, node);
}

function genInterpolation(node: any, context: any) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}

function genModulePreamble(ast, context) {
    // preamble 就是 import 语句
    const { push, newline, runtimeModuleName } = context;

    if (ast.helpers.length) {
        // ast.helpers 里面有个 [toDisplayString]
        // 生成之后就是 import { toDisplayString as _toDisplayString } from 'vue'
        const res = ast.helpers
            .map((s) => {
                return `${helperNameMap[s]} as _${helperNameMap[s]}`;
            })
            .join(", ");
        const code = `import {${res}} from ${JSON.stringify(
            runtimeModuleName
        )}`;

        push(code);
    }

    newline();
}

function createCodegenContext(
    ast,
    { runtimeModuleName = "vue", runtimeGlobalName = "Vue", mode = "function" }
) {
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
            // 换行
            // 缩进
            context.code += "\n" + "    ";
        },
    };

    return context;
}
