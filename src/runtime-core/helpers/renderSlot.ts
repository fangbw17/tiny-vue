export function renderSlot(slots, name: string, props = {}) {
    const slot = slots[name]
    console.log('渲染插槽 slot -> ${name}');
    if (slot) {
        return slot(props)
    }
}