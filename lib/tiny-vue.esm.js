function baseParse(content) {
    var context = createParserContext(content);
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
    var nodes = [];
    var node = parseText(context);
    nodes.push(node);
    return nodes;
}
function parseText(context) {
    console.log("解析 text", context);
    var endIndex = context.source.length;
    var content = parseTextData(context, endIndex);
    return {
        type: 0,
        content: content,
    };
}
function parseTextData(context, length) {
    console.log("解析 textData");
    var rawText = context.source.slice(0, length);
    advanceBy(context, length);
    return rawText;
}
function advanceBy(context, numberOfCharacters) {
    console.log("移动光标", context, numberOfCharacters);
    context.source = context.source.slice(numberOfCharacters);
}
function createRoot(children) {
    return {
        type: 1,
        children: children,
    };
}

export { baseParse };
//# sourceMappingURL=tiny-vue.esm.js.map
