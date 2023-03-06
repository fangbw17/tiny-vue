import { reactive, h, renderSlot } from "../../lib/tiny-vue.esm.js";

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
        return h("div", { id: "div" }, [
            h("div", {}, "hello"),
            h(
                Child,
                {
                    msg: "this is child",
                },
                {
                    // 默认插槽
                    default: () => h("p", {}, "hey"),
                    // 具名插槽
                    footer: () => h('p', {}, 'slot footer')
                }
            ),
        ]);
    },
};
