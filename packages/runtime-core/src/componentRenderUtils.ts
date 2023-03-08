export function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;

    // props 无变化，不需要更新
    if (prevProps === nextVNode) {
        return false
    }

    // 旧 Props 无值，取决于 nextProps 是否有值
    if (!prevProps) {
        return !!nextProps
    }

    // 旧 Props 有值，nextProps 无值
    if (!nextProps) {
        return true
    }

    // 仔细检查，上述只是初略检查
    return hasPropsChanged(prevProps, nextProps);
}

function hasPropsChanged(prevProps, nextProps): boolean {

    // 数量不一致
    const prevAllKeys = Object.keys(prevProps)
    const nextAllKeys = Object.keys(nextProps)
    if (prevAllKeys.length !== nextAllKeys.length) {
        return true
    }

    // 数量一直再继续检查
    for (let i = 0; i < nextAllKeys.length; i++) {
        const key = nextAllKeys[i];
        // 如果值不相等，或者 key 不在旧 props 中
        if (nextProps[key] !== prevProps[key] || !(key in prevAllKeys)) {
            return true
        }
        
    }
    return false
}
