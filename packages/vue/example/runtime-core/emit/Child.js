import { h } from "../../../dist/tiny-vue.esm-bundler.js";

export default {
    name: "Child",
    setup(props, context) {
        console.log(`child component props: ${JSON.stringify(props)}`);
        console.log(`child component context: ${JSON.stringify(context)}`);
        
        context.emit("change", "old", "new");
        context.emit('print-message-to-window', 'ssssssssssssss')
    },
    render() {
        return h("div", {}, "this is child");
    },
};
