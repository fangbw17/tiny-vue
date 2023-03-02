import { ShapeFlags } from "../shared";
export function initSlots(instance, children) {
    const {vnode} = instance

    if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        normalizeObjectSlots(children, (instance.slots = {}))
    }
}

const normalizeObjectSlots = (rawSlots, slots) => {
    for (const key in rawSlots) {
        const value = rawSlots[key]
        if (typeof value === 'function') {
            // 如果是函数，则存入到 slots上
            slots[key] = value
        }
    }
}
