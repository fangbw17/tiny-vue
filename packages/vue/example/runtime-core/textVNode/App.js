import { reactive, h, renderSlot, createTextVNode } from "../../../dist/tiny-vue.esm-bundler.js";

const Child = {
    name: "Child",
    setup(props, context) {},
    render() {
        return h("div", {}, [
            renderSlot(this.$slots, "default"),
            h("div", {}, "child"),
            renderSlot(this.$slots, "footer"),
        ]);
    },
};

export default {
    name: "App",
    setup() {},
    render() {
        return h("div", { id: "box" }, [
            h("div", {}, "test text"),
            createTextVNode('this is Text VNode')
        ]);
    },
};
