import { h, ref } from "../../lib/tiny-vue.esm.js";

const count = ref(1);
window.count = count;

export default {
    name: "Count",
    setup() {},
    render() {
        return h(
            "div",
            { tId: "helloWorld" },
            `hello world: count: ${count.value}`
        );
    },
};
