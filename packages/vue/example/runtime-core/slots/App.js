import { reactive, h, renderSlot } from "../../../dist/tiny-vue.esm-bundler.js";

const Child = {
    name: "Child",
    setup(props, context) {},
    render() {
        return h("div", {}, [
            renderSlot(this.$slots, "default", {
                age: 16,
              }),
            h("div", {}, "child"),
        ]);
    },
};

export default {
    name: "App",
    setup() {},
    render() {
        return h("div", { id: "div" }, [
            h("div", {}, "hello"),
            h(
                Child,
                {
                    msg: "this is child",
                },
                {
                    default: ({ age }) => [
                        h("p", {}, "我是通过 slot 渲染出来的第一个元素 "),
                        h("p", {}, "我是通过 slot 渲染出来的第二个元素"),
                        h("p", {}, `我可以接收到 age: ${age}`),
                      ],
                }
            ),
        ]);
    },
};
