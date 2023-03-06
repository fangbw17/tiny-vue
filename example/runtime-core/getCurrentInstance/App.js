// 在 render 中可以通过 this.xxx 访问到 setup 返回的对象
import { h, getCurrentInstance } from "../../lib/tiny-vue.esm.js";

export default {
    name: "App",
    setup() {
        const instance = getCurrentInstance()

        console.log("currentInstance ----", instance);
    },

    render() {
        console.log(this.count);
        return h("div", {}, [h("p", {}, "getCurrentInstance")]);
    },
};
