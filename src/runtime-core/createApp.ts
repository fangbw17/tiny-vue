import { render } from "./renderer";
import { createVNode } from "./createVNode";
export const createApp = function (rootComponent: any, rootProps: object) {
    const app = {
        _component: rootComponent,
        _container: null,
        mount,
    };

    // 挂载
    function mount(rootContainer: any) {
        console.log("基于根组件创建 vnode");
        const vnode = createVNode(rootComponent, rootProps, '');
        app._container = rootContainer;
        console.log("调用 render，基于 vnode 进行开箱");
        render(vnode, rootContainer);
    }

    return app;
};
