import { hasOwn } from "@tiny-vue/shared";

const publicPropertiesMap = {
    // 当用户调用 instance.proxy.$emit 时会触发
    $el: (i) => i.vnode.el,
    $emit: (i) => i.emit,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};

export const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        console.log("触发 proxy 的 hook. key: ", key);

        // 不是 $, 检测 是否在setupState 中
        if (key[0] !== "$") {
            // 先检测访问的 key 是否存在于 setupState 中, 是的话直接返回
            if (hasOwn(setupState, key)) {
                return setupState[key];
            } else if (hasOwn(props, key)) {
                return props[key];
            }
        }
        const publicGetter = publicPropertiesMap[key];

        if (publicGetter) {
            return publicGetter(instance);
        }
    },
    set({ _: instance }, key, value) {
        const { setupState } = instance;

        if (hasOwn(setupState, key)) {
            setupState[key] = value;
        }
        return true
    },
};
