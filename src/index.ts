import "./tiny-core";
import * as runtimeDom from "./runtime-dom";
import { registerRuntimeCompiler } from "./runtime-dom";

import { baseCompile } from "./compiler-core/src";
export * from "./reactivity/src";
export * from "./runtime-dom";

function compileToFunction(template, options = {}) {
    const { code } = baseCompile(template, options);

    // 调用 compile 得到的代码在给封装到函数内,
    // 这里会依赖 runtimeDom 的一些函数，所以在这里通过参数的形式注入进去
    const func = new Function("Vue", code);

    // function func(Vue) {
    //     const { toDisplayString: _toDisplayString } = Vue;
    
    //     return function render(_ctx) {
    //         return _toDisplayString(_ctx.msg);
    //     };
    // }

    const render = func(runtimeDom);

    return render;
}

registerRuntimeCompiler(compileToFunction);



// 1. render
// 2. mount
// 3. compile