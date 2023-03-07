import { ShapeFlags } from "../shared";
import { createComponentInstance } from "./component";
import { queueJob } from "./scheduler";
import { effect } from "../reactivity/src";
import { setupComponent } from "./component";
import { Text, Fragment } from "./vnode";
import { shouldUpdateComponent } from "./componentRenderUtils";
import { createAppAPI } from "./createApp";

export function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        setElementText: hostSetElementText,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setText: hostSetText,
        createText: hostCreateText,
    } = options;

    const render = (vnode, container) => {
        // console.log("调用 patch");
        const debug = window["debug"];
        debug && debug.mainPath("调用 patch")();
        patch(null, vnode, container);
    };

    /**
     * @description: 更新
     * @param {*} n1 旧节点
     * @param {*} n2 新节点
     * @param {*} container 容器
     * @return {*}
     */
    function patch(
        n1,
        n2,
        container = null,
        anchor = null,
        parentComponent = null
    ) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Text:
                // 文字
                processText(n1, n2, container);
                break;
            case "comment":
                // 注释
                break;
            case "static":
                break;
            case Fragment:
                processFragment(n1, n2, container);
                break;
            default:
                // 其他类型基于 shapeFlag 处理，按位与
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    console.log("处理 element");
                    processElement(n1, n2, container, anchor, parentComponent);
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    console.log("处理 component");
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }

    function processFragment(n1, n2, container) {
        if (!n1) {
            console.log("初始化 Fragment 类型节点");
            mountChildren(n2.children, container);
        }
    }

    // 文字处理
    function processText(n1, n2, container) {
        console.log("处理 Text 节点");
        if (n1 === null) {
            // n1 是 null 说明是 init 的阶段
            // 基于 createText 创建出 text 节点，然后使用 insert 添加到 el 内
            console.log("初始化 Text 类型的节点");
            hostInsert(
                (n2.el = hostCreateText(n2.children as string)),
                container
            );
        } else {
            // update
            // 先对比一下 updated 之后的内容是否和之前的不一样
            // 在不一样的时候才需要 update text
            // 这里抽离出来的接口是 setText
            // 注意，这里一定要记得把 n1.el 赋值给 n2.el, 不然后续是找不到值的
            const el = (n2.el = n1.el!);
            if (n2.children !== n1.children) {
                console.log("更新 Text 类型的节点");
                hostSetText(el, n2.children as string);
            }
        }
    }

    // 处理标签
    function processElement(n1, n2, container, anchor, parentComponent) {
        // 旧节点不存在, 直接挂载
        if (!n1) {
            mountElement(n2, container, anchor);
            // hostCreateElement(n2.type)
        } else {
            updateElement(n1, n2, container, anchor, parentComponent);
        }
    }

    // 更新标签
    function updateElement(n1, n2, container, anchor, parentComponent) {
        const oldProps = (n1 && n1.props) || {};
        const newProps = n2.props || {};

        console.log("更新 element");
        console.log("旧节点：", n1);
        console.log("新节点：", n2);

        const el = (n2.el = n1.el);
        // 对比 props
        patchProps(el, oldProps, newProps);
        // 对比 children
        patchChildren(n1, n2, el, anchor, parentComponent);
    }

    function patchProps(el, oldProps = {}, newProps = {}) {
        // 新旧有值，更新值
        for (const key in newProps) {
            const oldValue = oldProps[key];
            const newValue = newProps[key];
            if (oldValue !== newValue) {
                // 更新
                hostPatchProp(el, key, oldValue, newValue);
            }
        }

        // 旧有，新无
        for (const key in oldProps) {
            const oldValue = oldProps[key];
            // 新的节点 props 中没有该属性
            if (!(key in newProps)) {
                // 更新
                hostPatchProp(el, key, oldValue, null);
            }
        }
    }

    function patchChildren(n1, n2, container, anchor, parentComponent) {
        // 如果 c2 的 children 是 text 类型的话
        // 对比 n1 的 children ，不一样直接更新即可
        if (n2.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (n1.children !== n2.children) {
                console.log("类型为 text_children, 当前需要更新");
                hostSetElementText(container, n2.children as string);
            }
        } else {
            // 旧节点的子节点是 Array
            if (n1.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 新节点的子节点是 Array
                if (n2.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    patchKeyedChildren(
                        n1.children,
                        n2.children,
                        container,
                        anchor,
                        parentComponent
                    );
                }
            }
        }
    }

    function patchKeyedChildren(
        c1: any[],
        c2: any[],
        container,
        parentAnchor,
        parentComponent
    ) {
        // 粗暴更新 直接移除旧节点的 DOM，再更新新节点的 DOM
        // c1.forEach(c => hostRemove(c.el))
        // c2.forEach(c => patch(null, c, container))

        // 快速算法
        var j = 0;
        const l2 = c2.length;
        var oldEnd = c1.length - 1,
            newEnd = l2 - 1;
        // 检查新旧节点的 type 和 key 是否相同
        var isSameVNodeType = function (n1, n2) {
            // if (n1 === undefined || n2 === undefined) return false
            return n1.type === n2.type && n1.key === n2.key;
        };
        // 新旧节点从头开始遍历
        while (j <= oldEnd && j <= newEnd) {
            const prevChild = c1[j];
            const nextChild = c2[j];
            if (!isSameVNodeType(prevChild, nextChild)) {
                // 不同跳出 while 循环
                console.log("头部遍历 - 新旧节点不同");
                break;
            }
            // 节点一样，则更新数据
            patch(
                prevChild,
                nextChild,
                container,
                parentAnchor,
                parentComponent
            );
            j++;
        }
        // 新旧节点从尾部开始遍历
        while (j <= oldEnd && j <= newEnd) {
            const prevChild = c1[oldEnd];
            const nextChild = c2[newEnd];
            if (!isSameVNodeType(prevChild, nextChild)) {
                // 不同跳出 while 循环
                console.log("尾部遍历 - 新旧节点不同");
                break;
            }
            // 节点一样，则更新数据
            patch(
                prevChild,
                nextChild,
                container,
                parentAnchor,
                parentComponent
            );
            oldEnd--;
            newEnd--;
        }

        // 从头与从尾部遍历结束
        // 条件成立则说明新数据中有新增节点
        //               新      旧
        //               p-1     p-1  <- oldEnd = 0
        //      j = 1 -> p-4     p-2  <- j = 1
        // newEnd = 2 -> p-5     p-3
        //               p-2
        //               p-3
        //
        if (j > oldEnd && newEnd >= j) {
            // 锚点的计算：新的节点有可能需要添加到尾部，也可能添加到头部，所以需要指定添加的问题
            // 要添加的位置是当前的位置+1
            // 因为对于往左侧添加的话，应该获取到 c1 的第一个元素（因为它是被 mount 过的）
            // 而新的就添加到c1的第一个元素之前就可以
            const nextPos = j + 1
            const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
            while (newEnd >= j) {
                console.log("新增一个节点：", c2[j].key);
                patch(null, c2[j++], container, anchor, parentComponent);
            }
        } else if (j > newEnd && j <= oldEnd) {
            //               新      旧
            // newEnd = 0 -> p-1     p-1
            //      j = 1 -> p-2     p-4 <- j = 1
            //               p-3     p-5 <- oldEnd = 2
            //                       p-2
            //                       p-3
            //
            while (oldEnd >= j) {
                console.log("移除一个节点: ", c1[j].key);
                hostRemove(c1[j++].el);
            }
        } else {
            // 前后都对比完了、中间节点是乱序的对比情况
            // 新 p1 p3 p2 p4 p6 p7
            // 旧 p1 p2 p3 p4 p5 p7
            let oldIndex = j,
                newIndex = j;
            // 节点 map : {VNode1.key: 1, VNode2.key: 2}
            const keyMap = new Map();
            // 遍历新节点
            for (let i = newIndex; i <= newEnd; i++) {
                const nextChild = c2[i];
                keyMap.set(nextChild.key, i);
            }
            // 需要处理新节点的数量
            const toBePatched = newEnd - newIndex + 1;
            // 用来记录新节点对应旧节点的下标值
            const newIndexArray = new Array(toBePatched);
            for (let index = 0; index < newIndexArray.length; index++) {
                // 每个新节点初始 -1
                newIndexArray[index] = -1;
            }

            // 遍历老节点
            // 1. 老节点有，新节点没有则删除
            // 2. 新节点有，老节点没有则新增
            for (let k = oldIndex; k <= oldEnd; k++) {
                const prevChild = c1[k];
                const newIndex = keyMap.get(prevChild.key);
                newIndexArray[newIndex] = k;

                // 因为有可能 newIndex 的值为0 （0也是正常值）
                // 所以需要用 undefined 判断
                if (newIndex === undefined) {
                    // 旧数据中的当前节点的 key，未在新数据中找到，则移除当前旧节点
                    hostRemove(prevChild.el);
                } else {
                    // 新老节点都有
                    patch(prevChild, c2[newIndex], container, null, parentComponent);
                }
            }

            // 遍历新节点
            // 老节点没有，新节点有则创建
            for (let n = newEnd; n >= newIndex; n--) {
                const nextChild = c2[n];
                if (newIndexArray[n] === -1) {
                    // 初始为 -1，未在老节点中查找到
                    patch(null, nextChild, container);
                } else {
                    // n: 当前元素
                    // n + 1: 下一个元素 （锚点元素）
                    // 当 n 为新数据中最后一个节点时， n + 1 可能没有元素，没有则设置为 null
                    const anchor = n + 1 >= newEnd + 1 ? null : c2[n + 1];
                    hostInsert(nextChild.el, container, anchor && anchor.el);
                }
            }
        }
    }

    // 挂载标签
    function mountElement(vnode, container, anchor) {
        const { shapeFlag, props } = vnode;
        // 根据 type 创建元素
        const el = (vnode.el = hostCreateElement(vnode.type));
        // 单子组件
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            console.log(`处理文本:${vnode.children}`);
            hostSetElementText(el, vnode.children);
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 多子组件
            mountChildren(vnode.children, el);
        }

        // 处理属性
        if (props) {
            for (const key in props) {
                const nextVal = props[key];
                hostPatchProp(el, key, null, nextVal);
            }
        }

        // beforeMount 钩子
        console.log("vnodeHook -> onVnodeBeforeMount");
        console.log("DirectiveHook -> beforeMount");
        console.log("transition -> beforeEnter");

        // 将创建的 el 插入到 容器中
        hostInsert(el, container, anchor);

        // mount 钩子
        console.log("vnodeHook -> onVnodeMount");
        console.log("DirectiveHook -> mount");
        console.log("transition -> enter");
    }

    // 挂载子节点
    function mountChildren(children, container) {
        children.forEach((c) => {
            console.log("mountChildren:", c);
            patch(null, c, container);
        });
    }

    // 处理组件
    function processComponent(n1, n2, container, parentComponent) {
        if (!n1) {
            // 挂载组件
            mountComponent(n2, container, parentComponent);
        } else {
            // 更新组件
            updateComponent(n1, n2, container);
        }
    }

    // 更新组件
    function updateComponent(n1, n2, container) {
        console.log("更新组件");
        const instance = (n2.component = n1.component);
        // 是否有更新 props
        if (shouldUpdateComponent(n1, n2)) {
            console.log("组件需要更新");
            instance.next = n2;
            // 更新组件
            // update 是在 setupRenderEffect 中初始化的
            // update 函数除了当内部的响应式对象发生改变时会调用
            // 还可以主动的调用（effect 特性）
            // 调用 update 更新调用 patch 逻辑
            // 在 update 中调用 next 变成了 n2
            // TODO 在 update 中处理 next 逻辑
            instance.update();
        } else {
            n2.component = n1.component;
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }

    // 挂载组件
    function mountComponent(vnode, container, parentComponent) {
        // 创建组件实例
        const instance = (vnode.component = createComponentInstance(
            vnode,
            parentComponent
        ));
        console.log(`创建组件实例:${instance.type.name}`);
        // 加工组件实例
        setupComponent(instance);

        setupRenderEffect(instance, vnode, container);
    }

    function setupRenderEffect(instance, vnode, container) {
        // 调用 render
        // 应该传入 ctx 也就是 proxy
        // ctx 可以选择暴露给用户的 api
        // 源代码里面是调用的 renderComponentRoot 函数
        // 这里为了简化直接调用 render

        function componentUpdateFn() {
            if (!instance.isMounted) {
                console.log("调用 render,获取 subTree");
                const proxyToUse = instance.proxy;
                const subTree = (instance.subTree = instance.render.call(
                    proxyToUse,
                    proxyToUse
                ));
                console.log("subTree", subTree);

                console.log(`${instance.type.name}:触发 beforeMount hook`);
                console.log(
                    `${instance.type.name}:触发 onVnodeBeforeMount hook`
                );

                // 这里基于 subTree 再次调用 patch
                // 基于 render 返回的 vnode ，再次进行渲染
                // 这里我把这个行为隐喻成开箱
                // 一个组件就是一个箱子
                // 里面有可能是 element （也就是可以直接渲染的）
                // 也有可能还是 component
                // 这里就是递归的开箱
                // 而 subTree 就是当前的这个箱子（组件）装的东西
                // 箱子（组件）只是个概念，它实际是不需要渲染的
                // 要渲染的是箱子里面的 subTree
                patch(null, subTree, container, null, instance);
                // 把 root element 赋值给 组件的vnode.el ，为后续调用 $el 的时候获取值
                vnode.el = subTree.el;

                console.log(`${instance.type.name}:触发 mounted hook`);
                instance.isMounted = true;
            } else {
                console.log("更新逻辑: ", Date.now());
                const { next, vnode } = instance;

                // next 存在，说明需要更新组件的 props、slots 等
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                // 获取新的 subTree
                const proxyToUse = instance.proxy;
                const nextTree = instance.render.call(proxyToUse, proxyToUse);
                // 替换之前的 subTree
                const prevTree = instance.subTree;
                instance.subTree = nextTree;

                // 触发 beforeUpdated hook
                console.log("beforeUpdated hook");
                console.log("onVnodeBeforeUpdate hook");

                // 用旧的 vnode 和新的 vnode 交给 patch 来处理
                patch(prevTree, nextTree, prevTree.el, null, instance);

                // 触发 updated hook
                console.log("updated hook");
                console.log("onVnodeUpdated hook");
                console.log(Date.now());
            }
        }

        instance.update = effect(componentUpdateFn, {
            scheduler: () => {
                // const that = this.scheduler
                queueJob(instance.update);
            },
        });
    }

    function updateComponentPreRender(instance, nextVNode) {
        const { props } = nextVNode;
        console.log("更新组件的 props", props);
        instance.props = props;
        console.log("更新组件的 slots");
        // TODO
    }

    return {
        createApp: createAppAPI(render),
    };
}
