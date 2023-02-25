var createVNode = function (type, props, children) {
    var vnode = {
        el: null,
        component: null,
        type: type,
        props: props,
        children: children,
        shapeFlag: getShapeFlag(type)
    };
    if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 16;
    }
    else if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 8;
    }
    return vnode;
};
function getShapeFlag(type) {
    return typeof type === 'string'
        ? 1
        : 4;
}

var h = function (type, props, children) {
    return createVNode(type, props, children);
};

var createComponentInstance = function (vnode) {
    var instance = {
        type: vnode.type,
        vnode: vnode,
        props: {},
        proxy: null,
    };
    return instance;
};

function hostCreateElement(type) {
    console.log('hostCreateElement', type);
    var dom = document.createElement(type);
    return dom;
}
function hostSetElementText(el, text) {
    console.log('hostSetElementText', el, text);
    el.innerText = text;
}
function hostPatchProp(el, key, preValue, nextValue) {
    console.log("hostPatchProp \u8BBE\u7F6E\u5C5E\u6027:".concat(key, " \u7684\u503C:").concat(nextValue));
    switch (key) {
        case "tId":
            el.setAttribute(key, nextValue);
            break;
    }
}
function hostInsert(el, container) {
    console.log("hostInsert");
    container.append(el);
}

var render = function (vnode, container) {
    console.log("调用 patch");
    patch(null, vnode, container);
};
function patch(n1, n2, container) {
    var type = n2.type, shapeFlag = n2.shapeFlag;
    switch (type) {
        case "text":
            break;
        case "comment":
            break;
        case "static":
            break;
        case "fragment":
            break;
        default:
            if (shapeFlag & 1) {
                console.log("处理 element");
                processElement(n1, n2, container);
            }
            else if (shapeFlag & 4) {
                console.log("处理 component");
                processComponent(n1, n2, container);
            }
    }
}
function processElement(n1, n2, container) {
    if (!n1) {
        mountElement(n2, container);
    }
}
function mountElement(vnode, container) {
    var shapeFlag = vnode.shapeFlag, props = vnode.props;
    var el = (vnode.el = hostCreateElement(vnode.type));
    if (shapeFlag & 8) {
        console.log("\u5904\u7406\u6587\u672C:".concat(vnode.children));
        hostSetElementText(el, vnode.children);
    }
    else if (shapeFlag & 16) {
        mountChildren(vnode.children, el);
    }
    if (props) {
        for (var key in props) {
            var nextVal = props[key];
            hostPatchProp(el, key, null, nextVal);
        }
    }
    console.log("vnodeHook -> onVnodeBeforeMount");
    console.log("DirectiveHook -> beforeMount");
    console.log("transition -> beforeEnter");
    hostInsert(el, container);
    console.log("vnodeHook -> onVnodeMount");
    console.log("DirectiveHook -> mount");
    console.log("transition -> enter");
}
function mountChildren(children, container) {
    children.forEach(function (c) {
        console.log("mountChildren:", c);
        patch(null, c, container);
    });
}
function processComponent(n1, n2, container) {
    if (!n1) {
        mountComponent(n2, container);
    }
}
function mountComponent(vnode, container) {
    var instance = (vnode.component = createComponentInstance(vnode));
    console.log("\u521B\u5EFA\u7EC4\u4EF6\u5B9E\u4F8B:".concat(instance.type.name));
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupComponent(instance) {
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    console.log("\u521B\u5EFA proxy");
    var setupResult = instance.setup && instance.setup(instance.props);
    handleSetupResult(instance, setupResult);
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'function') {
        instance.render = setupResult;
    }
    else if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var component = instance.type;
    if (!instance.render) ;
    instance.render = component.render;
}
function setupRenderEffect(instance, container) {
    console.log("调用 render,获取 subTree");
    var subTree = instance.render(instance.proxy);
    console.log("subTree", subTree);
    console.log("".concat(instance.type.name, ":\u89E6\u53D1 beforeMount hook"));
    console.log("".concat(instance.type.name, ":\u89E6\u53D1 onVnodeBeforeMount hook"));
    patch(null, subTree, container);
    console.log("".concat(instance.type.name, ":\u89E6\u53D1 mounted hook"));
}

var createApp = function (rootComponent, rootProps) {
    var app = {
        _component: rootComponent,
        _container: null,
        mount: mount,
    };
    function mount(rootContainer) {
        console.log("基于根组件创建 vnode");
        var vnode = createVNode(rootComponent, rootProps, '');
        app._container = rootContainer;
        console.log("调用 render，基于 vnode 进行开箱");
        render(vnode, rootContainer);
    }
    return app;
};

export { createApp, h };
//# sourceMappingURL=tiny-vue.esm.js.map
