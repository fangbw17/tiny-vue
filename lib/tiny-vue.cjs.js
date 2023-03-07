'use strict';

exports.NodeTypes = void 0;
(function (NodeTypes) {
    NodeTypes[NodeTypes["TEXT"] = 0] = "TEXT";
    NodeTypes[NodeTypes["ROOT"] = 1] = "ROOT";
    NodeTypes[NodeTypes["INTERPOLATION"] = 2] = "INTERPOLATION";
    NodeTypes[NodeTypes["SIMPLE_EXPRESSION"] = 3] = "SIMPLE_EXPRESSION";
    NodeTypes[NodeTypes["ELEMENT"] = 4] = "ELEMENT";
})(exports.NodeTypes || (exports.NodeTypes = {}));
exports.ElementTypes = void 0;
(function (ElementTypes) {
    ElementTypes[ElementTypes["ELEMENT"] = 0] = "ELEMENT";
})(exports.ElementTypes || (exports.ElementTypes = {}));
function createSimpleExpression(content) {
    return {
        type: 3,
        content
    };
}
function createInterpolation(content) {
    return {
        type: 2,
        content
    };
}

var TagType;
(function (TagType) {
    TagType[TagType["Start"] = 0] = "Start";
    TagType[TagType["End"] = 1] = "End";
})(TagType || (TagType = {}));
function baseParse(content) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context));
}
function createParserContext(content) {
    console.log("创建 paserContext");
    return {
        source: content,
    };
}
function parseChildren(context) {
    console.log("开始解析 children");
    const nodes = [];
    while (!isEnd(context)) {
        let node;
        if (context.source.startsWith("{{")) {
            node = parseMustache(context);
        }
        else if (context.source.startsWith("<")) {
            if (/[a-z]/i.test(context.source[1])) {
                node = parseElement(context, 0);
            }
            else if (context.source[1] === "/") {
                if (/[a-z]/i.test(context.source[2])) {
                    parseTag(context, 1);
                    continue;
                }
            }
        }
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function parseText(context) {
    console.log("解析 text", context);
    let endIndex = context.source.length;
    const endTokens = ["<", "{{"];
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (index !== -1) {
            endIndex = index;
        }
    }
    const content = parseTextData(context, endIndex);
    return {
        type: 0,
        content,
    };
}
function parseTextData(context, length) {
    console.log("解析 textData");
    const rawText = context.source.slice(0, length);
    advanceBy(context, length);
    return rawText;
}
function parseMustache(context) {
    console.log("解析 mustache", context);
    let content = context.source;
    const startIndex = context.source.indexOf("{{");
    const endIndex = context.source.indexOf("}}");
    if (startIndex == -1 || endIndex == -1) {
        console.warn(`${context.source} is not a valid interpolation`);
    }
    else {
        advanceBy(context, 2);
        content = parseSimpleExpress(startIndex, endIndex - 2, context);
        advanceBy(context, 2);
    }
    return {
        type: 2,
        content,
    };
}
function parseSimpleExpress(startIndex, endIndex, context) {
    console.log("解析 simple express");
    const rawText = context.source.slice(startIndex, endIndex);
    advanceBy(context, endIndex);
    return {
        type: 3,
        content: rawText.trim(),
    };
}
function parseElement(context, tagType) {
    const element = parseTag(context, tagType);
    const children = parseChildren(context);
    if (element && startsWithEndTagOpen(context, element.tag)) {
        parseTag(context, 1);
    }
    if (element) {
        element["children"] = children;
    }
    return element;
}
function parseTag(context, tagType) {
    const match = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source);
    let tag = "";
    if (match) {
        tag = match[1];
        advanceBy(context, match[0].length);
        advanceBy(context, 1);
    }
    if (tagType === 1)
        return;
    return {
        type: 4,
        tag: tag,
        tagType: 0,
    };
}
function startsWithEndTagOpen(context, tag) {
    return (context.source.startsWith("</") &&
        context.source.slice(2, tag.length).toLowerCase() === tag.toLowerCase());
}
function advanceBy(context, numberOfCharacters) {
    console.log("移动光标", context, numberOfCharacters);
    context.source = context.source.slice(numberOfCharacters);
}
function isEnd(context) {
    return !context.source;
}
function createRoot(children) {
    return {
        type: 1,
        children,
        helpers: [],
    };
}

const TO_DISPLAY_STRING = Symbol("toDisplayString");
const helperNameMap = {
    [TO_DISPLAY_STRING]: "toDisplayString"
};

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    craeteRootCodegen(root);
    root.helpers.push(...context.helpers.keys());
}
function traverseNode(node, context) {
    node.type;
    const nodeTransforms = context.nodeTransforms;
    nodeTransforms.forEach((fn) => {
        fn(node, context);
    });
    switch (node.type) {
        case 2:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 1:
        case 4:
            traverseChildren(node, context);
            break;
    }
}
function traverseChildren(node, context) {
    node.children &&
        node.children.forEach((childNode) => {
            traverseNode(childNode, context);
        });
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(name) {
            const count = context.helpers.get(name) || 0;
            context.helpers.set(name, count + 1);
        },
    };
    return context;
}
function craeteRootCodegen(root, context) {
    const { children } = root;
    const child = children[0];
    root.codegenNode = child;
}

function generate(ast, options = {}) {
    const context = createCodegenContext(ast, options);
    const { push } = context;
    genModulePreamble(ast, context);
    const functionName = "render";
    const args = ["_ctx"];
    const signature = args.join(", ");
    push(`function ${functionName}(${signature}) {`);
    push("return ");
    genNode(ast.codegenNode, context);
    push("}");
    return {
        code: context.code,
    };
}
function genNode(node, context) {
    switch (node.type) {
        case 2:
            genInterpolation(node, context);
            break;
        case 3:
            genExpression(node, context);
            break;
    }
}
function genExpression(node, context) {
    context.push(node.content, node);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}
function genModulePreamble(ast, context) {
    const { push, newline, runtimeModuleName } = context;
    if (ast.helpers.length) {
        const res = ast.helpers
            .map((s) => {
            return `${helperNameMap[s]} as _${helperNameMap[s]}`;
        })
            .join(", ");
        const code = `import {${res}} from ${JSON.stringify(runtimeModuleName)}`;
        push(code);
    }
    newline();
}
function createCodegenContext(ast, { runtimeModuleName = "vue" }) {
    const context = {
        code: "",
        runtimeModuleName,
        helper(key) {
            return `_${helperNameMap[key]}`;
        },
        push(code) {
            context.code += code;
        },
        newline() {
            context.code += "\n" + "    ";
        },
    };
    return context;
}

function transformExpression(node) {
    if (node.type === 2) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

exports.baseParse = baseParse;
exports.createInterpolation = createInterpolation;
exports.createSimpleExpression = createSimpleExpression;
exports.generate = generate;
exports.transform = transform;
exports.transformExpression = transformExpression;
//# sourceMappingURL=tiny-vue.cjs.js.map
