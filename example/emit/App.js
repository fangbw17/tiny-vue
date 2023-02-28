import { h } from "../../lib/tiny-vue.esm.js";
import Child from "./Child.js";

export default {
    name: "App",
    setup() {},
    render() {
        return h("div", {}, [
            h("div", {}, "this is div"),
            h(Child, {
                msg: "some message",
                onChange: (c1, c2) => {
                    console.log(`旧值：${c1}`);
                    console.log(`新值：${c2}`);
                },
                onPrintMessageToWindow(msg) {
                    console.log("onPrintMessage: ", msg);
                },
            }),
        ]);
    },
};
