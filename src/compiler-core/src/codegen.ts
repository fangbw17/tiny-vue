import { NodeTypes } from "./ast";
import { helperNameMap, TO_DISPLAY_STRING } from "./runtimeHelpers";

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
        default:
            break;
    }
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
