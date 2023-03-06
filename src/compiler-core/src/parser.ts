import { NodeTypes } from "./ast";

export function baseParse(content: string) {
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
    const nodes: any[] = [];

    let node = {};
    // {{ 开头
    if (context.source.startsWith("{{")) {
        node = parseMustache(context);
    } else {
        node = parseText(context);
    }
    nodes.push(node);

    return nodes;
}

function parseText(context): any {
    console.log("解析 text", context);
    const endIndex = context.source.length;
    const content = parseTextData(context, endIndex);

    return {
        type: NodeTypes.TEXT,
        content,
    };
}

function parseTextData(context: any, length: number): any {
    console.log("解析 textData");
    //
    const rawText = context.source.slice(0, length);
    // 移动光标
    advanceBy(context, length);

    return rawText;
}

function parseMustache(context) {
    console.log("解析 mustache", context);
    let content = context.source;

    // 查找结束标识
    const startIndex = context.source.indexOf("{{");
    const endIndex = context.source.indexOf("}}");


    // 没有 {{ 或者 }}
    if (startIndex == -1 || endIndex == -1) {
        console.warn(`${context.source} is not a valid interpolation`);
    } else {
        // 移除 {{
        advanceBy(context, 2)
        content = parseSimpleExpress(startIndex, context.source.length - 2, context);
        // 移除 }}
        advanceBy(context, 2)
    }
    return {
        type: NodeTypes.INTERPOLATION,
        content,
    };
}

function parseSimpleExpress(startIndex, endIndex, context) {
    console.log("解析 simple express");

    const rawText = context.source.slice(startIndex, endIndex);

    // 移除 值
    advanceBy(context, endIndex);

    return {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: rawText.trim(),
    };
}

function advanceBy(context, numberOfCharacters) {
    console.log("移动光标", context, numberOfCharacters);
    context.source = context.source.slice(numberOfCharacters);
}

function createRoot(children) {
    return {
        type: NodeTypes.ROOT,
        children,
    };
}
