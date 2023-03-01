import { h, ref, reactive } from "../../lib/tiny-vue.esm.js";
export default {
  name: "Child",
  setup(props, { emit }) {},
  render(proxy) {
    return h("div", {}, [
      h(
        "button",
        {
          onClick() {
            console.log(proxy);
            console.log("click");
            proxy && proxy.$emit("change", "aaa", "bbbb");
          },
        },
        "emit"
      ),
    ]);
  },
};
