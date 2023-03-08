import { reactive, h, ref } from "../../../dist/tiny-vue.esm-bundler.js";

const Child = {
    name: "Child",
    setup(props, context) {},
    render() {
        console.log('this.$prosp', this.$props);
        return h("div", {}, 'child' + '-' + this.$props.msg);
    },
};

export default {
    name: "App",
    setup() {
        const msg = ref("old");

        const changeProps = () => {
            msg.value = msg.value === 'old' ? 'new' : 'old';
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
