/**
 * @description: 创建组件实例
 * @param {any} vnode
 * @return {*}
 */
export const createComponentInstance = function (vnode: any) {
    const instance = {
        type: vnode.type,
        vnode,
        props: {},
        proxy: null,
        isMounted: false,
    };
    return instance;
};
