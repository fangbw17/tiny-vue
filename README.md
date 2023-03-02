# tiny-vue

### 项目结构
- runtime-core
    - render-api
        - index (DOM 操作)
    - component (创建组件)
    - createApp (创建应用)
    - createVNode (创建虚拟节点)
    - h (渲染函数)
    - index (入口)
    - renderer (渲染器)
- shared
    - index (入口)
    - shapeFlags (节点类型定义)

### 流程
- 调用 createApp 函数
    1. 创建 app 对象。包含 component（节点）、container（容器）、mount（挂载函数）
- 调用 app 对象中的 mount 函数
    1. 根据传入的 container 和先有的 component 创建 VNode
        - VNode:
            1. el - DOM 元素
            2. component - 组件
            3. type - 节点
            4. props - 属性
            5. children - 子组件 
            6. shapeFlag - 节点类型
    2. 调用渲染器 renderer 中的 render 函数
- render 函数
    - patch 函数
        - 文字节点
        - 注释节点
        - 静态节点
        - fragment 节点
        - 标签节点
            * processElement 函数，未挂载调用 mountElement， 挂载调用 updateElement
                * mountElement
                    1. 因为是标签，则直接**创建 DOM 元素**
                    2. 判断子组件类型，文本类型 则直接将文本设置到 DOM 上，多节点则调用 mountChildren
                        - mountChildren 函数中 循环遍历每一个子节点，然后调用 patch 函数
                    3. 处理 props。调用 hostPatchProp
                    4. **beforeMount hook**
                    5. 将**当前 DOM** 插入到 **容器**中
                    6. **mounted hook**
                * updateElement
                    1. 设置 n2.el = n1.el
                    2. patchProps 函数比较新旧节点的属性
                        - 循环新节点的 props，prop 不一致则更新
                        - 查找旧节点中有，而新节点中没有的，则移除
                        - 新节点中有，而旧节点中没有的，则新增
                    3. patchChildren 函数比较新旧节点的子节点
                        - 判断当前节点的类型，是文本子节点，则比较新旧子节点，然后更新
        - 组件节点
            * processComponent 函数，未挂载调用 mountComponent，挂载调用 updateComponent
                * mountComponent
                    1. 创建组件实例
                    2. setupComponent 函数
                        1. initProps
                        2. initSlots
                        3. setupStatefulComponent
                            1. 调用实例上的 setup 函数
                            2. 处理 setup 的回调值，调用 handleSetupResult 函数
                                1. 判断是 function 还是 object
                                2. 调用 finishComponentSetup 
                    3. setupRenderEffect 函数
                        1. 调用 effect 函数，传一个方法入参
                * updateComponent
    


## bug
* example/apiinject/App.js 注释代码无法实现功能。 