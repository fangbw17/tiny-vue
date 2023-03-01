const publicPropertiesMap = {
    // 当用户调用 instance.proxy.$emit 时会触发
    $emit: (i) => i.emit,
};

export const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        console.log("触发 proxy 的 hook");
        const publicGetter = publicPropertiesMap[key];

        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};
