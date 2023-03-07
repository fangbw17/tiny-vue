import { isOn } from "../shared";
import { createRenderer } from "../runtime-core";

function createElement(type: any) {
    console.log("CreateElement", type);
    const dom = document.createElement(type);
    return dom;
}

function createText(text) {
    return document.createTextNode(text)
}

function setText(node, text) {
    node.nodeValue = text
}

 function setElementText(el: HTMLElement, text) {
    console.log("SetElementText", el, text);
    el.textContent = text;
}

 function patchProp(el, key, preValue, nextValue) {
    console.log(`属性key: ${key} 的旧值是${preValue}，新值是:${nextValue}`);

    if (isOn(key)) {
        // 添加事件处理函数的时候需要注意一下
        // 添加的和删除的必须是一个函数，不然的话 删除不掉
        // 那么就需要把之前 add 的函数给存起来，后面删除的时候需要用到
        // 存储所有的事件函数
        const invokers = el._vei || (el._vei = {});
        const existingInvoker = invokers[key];
        if (nextValue && existingInvoker) {
            // patch
            // 修改函数值
            existingInvoker.value = nextValue
        } else {
            const eventName = key.slice(2).toLowerCase()
            if (nextValue) {
                const invoker = (invokers[key] = nextValue)
                el.addEventListener(eventName, invoker)
            } else {
                el.removeEventListener(eventName, existingInvoker)
                invokers[key] = undefined
            }
        }
    } else {
        if (nextValue === null || nextValue === '') {
            el.removeattribute(key)
        } else {
            el.setAttribute(key, nextValue)
        }
    }
}

 function insert(child, parent, anchor = null) {
    console.log(`Insert`);
    parent.insertBefore(child, anchor)
}

 function remove(child) {
    const parent = child.parentNode;
    if (parent) parent.removeChild(child);
}

let renderer;

function ensureRenderer() {
    // 如果 renderer 有值的话，那么以后都不会初始化了
    return renderer || (renderer = createRenderer({
        createElement,
        createText,
        setText,
        setElementText,
        patchProp,
        insert,
        remove
    }))
}

export const createApp = (...args) => {
    return ensureRenderer().createApp(...args)
}

export * from '../runtime-core'