import { NodeTypes, ElementTypes } from "./ast";

const enum TagType {
    Start,
    End,
}

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

    while (!isEnd(context)) {
        let node;
        if (context.source.startsWith("{{")) {
            // {{ 开头
            node = parseMustache(context);
        } else if (context.source.startsWith("<")) {
            // 标签开头
            if (/[a-z]/i.test(context.source[1])) {
                // 字母开头
                node = parseElement(context, TagType.Start);
            } else if (context.source[1] === "/") {
                // 结束标签
                if (/[a-z]/i.test(context.source[2])) {
                    parseTag(context, TagType.End);

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

// 解析文本
function parseText(context): any {
    console.log("解析 text", context);
    let endIndex = context.source.length;

    const endTokens = ["<", "{{"];
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i])
        if (index !== -1) {
            endIndex = index
        }
    }    

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

// 解析花括号语法
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
        advanceBy(context, 2);
        content = parseSimpleExpress(
            startIndex,
            endIndex - 2,
            context
        );
        // 移除 }}
        advanceBy(context, 2);
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

function parseElement(context, tagType) {
    const element = parseTag(context, tagType);

    const children = parseChildren(context);

    // 解析尾部标签</div>
    if (element && startsWithEndTagOpen(context, element.tag)) {
        parseTag(context, TagType.End);
    } else {
    }

    if (element) {
        element["children"] = children;
    }
    return element;
}

function parseTag(context, tagType) {
    // 以 < 开头，后面可能存在 /, 再后面是标签，标签后 制表符等 /> 存在0至多个
    const match = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source);

    let tag = "";
    if (match) {
        tag = match[1];
        // 移除开始标签
        // <div></div>
        advanceBy(context, match[0].length); // ></div>

        // 暂不考虑 自闭合
        advanceBy(context, 1); //</div>
    }

    if (tagType === TagType.End) return;

    return {
        type: NodeTypes.ELEMENT,
        tag: tag,
        tagType: ElementTypes.ELEMENT,
    };
}

function startsWithEndTagOpen(context, tag) {
    // 以 </ 开头，并且 取开始标签值对应的长度，转成小写后，对比是否相同
    return (
        context.source.startsWith("</") &&
        context.source.slice(2, tag.length).toLowerCase() === tag.toLowerCase()
    );
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
        type: NodeTypes.ROOT,
        children,
    };
}
