export function hostCreateElement(type: any) {
    console.log("hostCreateElement", type);
    const dom = document.createElement(type);
    return dom;
}

export function hostSetElementText(el: HTMLElement, text) {
    console.log("hostSetElementText", el, text);
    el.innerText = text;
}

export function hostPatchProp(el, key, preValue, nextValue) {
    console.log(`属性key: ${key} 的旧值是${preValue}，新值是:${nextValue}`);
    switch (key) {
        case "id":
        case "tId":
            // 当新值设置为 null 或者 undefined时，说明要移除该属性
            if (nextValue === null || nextValue === undefined) {
                el.removeattribute(key);
            } else {
                el.setAttribute(key, nextValue);
            }
            break;
        case "onClick":
            el.addEventListener("click", nextValue);
            break;
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
    el.textContent = text
}

export function hostCreateText(type) {
    console.log('hostCreateText');
    const dom = document.createTextNode(type)
    return dom
}