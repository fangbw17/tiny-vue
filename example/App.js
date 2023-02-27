import { h, ref } from "../lib/tiny-vue.esm.js";
import PatchChildren from "./components/PatchChildren.js";

const flag = ref(true)
const children = [
    h('p', {}, 'p1'),
    h('p', {}, 'p2')
]

setTimeout(() => {
    flag.value = !flag.value
    console.log('ssssssss', flag.value);
}, 3000)

export default {
    name: "App",
    setup() {},
    render() {
        return h("div", { tId: 1 }, [
            h("p", {}, "主页"),
            h(PatchChildren),
        ]);
        // return h('div', {tId: 1}, flag.value ? [h('p', {}, 'p1')] : children)
    },
};
