import { h } from "../lib/tiny-vue.esm.js";
import Count from "./components/Count.js";

export default {
    name: "App",
    setup() {},
    render() {
        return h("div", { tId: 1 }, [h("p", {}, "hello, this is p"), h(Count)]);
    },
};
