import { isOn } from "../shared";

export function hostCreateElement(type: any) {
    console.log("hostCreateElement", type);
    const dom = document.createElement(type);
    return dom;
}

export function hostSetElementText(el: HTMLElement, text) {
    console.log("hostSetElementText", el, text);
    el.textContent = text;
}

export function hostPatchProp(el, key, preValue, nextValue) {
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

export function hostInsert(child, parent, anchor = null) {
    console.log(`hostInsert`);
    if (anchor) {
        parent.insertBefore(child, anchor);
    } else {
        parent.append(child);
    }
}

export function hostRemove(child) {
    const parent = child.parentNode;
    if (parent) parent.removeChild(child);
}

export function hostSetText(el, text) {
    el.textContent = text;
}

export function hostCreateText(type) {
    console.log("hostCreateText");
    const dom = document.createTextNode(type);
    return dom;
}
