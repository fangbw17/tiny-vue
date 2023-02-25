export function hostCreateElement(type: any) {
    console.log('hostCreateElement', type);
    const dom = document.createElement(type)
    return dom
}

export function hostSetElementText(el: HTMLElement, text) {
    console.log('hostSetElementText', el, text);
    el.innerText = text
}

export function hostPatchProp(el, key, preValue, nextValue) {
    console.log(`hostPatchProp 设置属性:${key} 的值:${nextValue}`);
    switch(key) {
        case "tId":
            el.setAttribute(key, nextValue)
            break;
    }
}

export function hostInsert(el, container) {
    console.log(`hostInsert`);
    container.append(el)
}