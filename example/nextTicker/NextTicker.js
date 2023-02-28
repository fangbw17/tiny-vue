import { h, ref } from "../../lib/tiny-vue.esm.js";

window.count = ref(1);

const child1 = {
    name: "NextTickerChild1",
    setup() {},
    render() {
        return h("div", {}, `child1 count: ${window.count.value}`);
    },
};

const child2 = {
    name: "NextTickerChild2",
    setup() {},
    render() {
        return h("div", {}, `child2 count: ${window.count.value}`);
    },
};

// let time = 0
// const inerval = setInterval(() => {
//     time++
//     if (time === 10) {
//         clearInterval(inerval)
//         return
//     }
//     count.value++
// }, 1000)

export default {
    name: "NextTicker",
    setup() {},
    render() {
        return h("div", { tId: "nextTicker" }, [h(child1), h(child2)]);
    },
};
