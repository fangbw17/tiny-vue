import { h } from "../../lib/tiny-vue.esm.js";
import Child from "./Child.js";

export default {
    name: "App",
    setup() {},
    render() {
        return h("div", {}, [
            h("div", {}, "this is div"),
            h(Child, { msg: "some message" }),
        ]);
    },
};
