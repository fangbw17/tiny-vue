const publicPropertiesMap = {
    // 当用户调用 instance.proxy.$emit 时会触发
    $emit: (i) => i.emit,
    $slots: (i) => i.slots
};

export const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        console.log("触发 proxy 的 hook. key: ", key);

        // 不是 $, 检测 是否在setupState 中
        if (key !== '$') {
            if (key in setupState) {
                return setupState[key]
            }   
        }
        const publicGetter = publicPropertiesMap[key];

        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};
