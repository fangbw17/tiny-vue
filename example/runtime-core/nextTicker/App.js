import { h, ref } from "../../lib/tiny-vue.esm.js";
import PatchChildren from "./PatchChildren.js";
import NextTicker from './NextTicker.js'

export default {
    name: "App",
    setup() {},
    render() {
        return h("div", { tId: 1 }, [
            h("p", {}, "主页"),
            // h(PatchChildren),
            h(NextTicker)
        ]);
    },
};