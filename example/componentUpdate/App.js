import { reactive, h, ref } from "../../lib/tiny-vue.esm.js";

const Child = {
    name: "Child",
    setup(props, context) {},
    render() {
        return h("div", {}, 'child');
    },
};

export default {
    name: "App",
    setup() {
        const msg = ref("old");

        const changeProps = () => {
            msg.value = "new";
        };

        return {
            msg,
            changeProps,
        };
    },
    render() {
        return h("div", { id: "box" }, [
            h("div", {}, "update component's props"),
            h("button", { onClick: this.changeProps }, "change"),
            h(Child, { msg: this.msg }),
        ]);
    },
};
