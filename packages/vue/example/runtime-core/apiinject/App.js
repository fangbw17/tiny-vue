// 在 render 中可以通过 this.xxx 访问到 setup 返回的对象
import {
    h,
    getCurrentInstance,
    provide,
    inject,
} from "../../../dist/tiny-vue.esm-bundler.js";

const son = {
    name: "son",
    setup() {
        const grandName = inject("grand-name");
        const fatherMsg = inject("msg");
        console.log(`grandName --- ${grandName}...... father: ${fatherMsg}`);
        return () => h("div", {}, "son");
    },
};

const father = {
    name: "father",
    setup() {
        provide("grand-name", "father-custom");
        provide("father", "msg");
    },
    render() {
        return h("div", {}, [h("div", {}, "father"), h(son)]);
    },
};

const grandFather = {
    name: "grandFather",
    setup() {
        provide("grand-name", "foo");

        return () => {
            return h("div", {}, [h("div", {}, "grandFather"), h(father)]);
        };
    },
};

export default {
    name: "App",
    setup() {
        const instance = getCurrentInstance();

        console.log("currentInstance ----", instance);
    },

    render() {
        return h("div", {}, [h("div", {}, "App"), h(grandFather)]);
    },
};

/**
 * const son = {
            name: 'son',
            setup() {
                const grandName = inject('grand-name')
                const fatherMsg = inject('father')
                console.log(`grandName --- ${grandName}...... father: ${fatherMsg}`);
                return {
                    grandName,
                    fatherMsg
                }
            },
            render() {
                return h('div', {}, `${this.grandName}-${this.fatherMsg}-son`)
            }
        }

        const father = {
            name: 'father',
            setup() {
                provide('grand-name', 'grandFather')
                provide('father', 'father')
                const name = inject('grand-name') // foo
                if (name === 'father-custom') {
                    throw new Error('inject("grand-name") value must equal to "foo"')
                } else {
                    console.log("inject('grand-name') value is", name);
                }
            },
            render() {
                // return h(son)
                return  h('div', {}, [
                    h('div', {}, 'father'),
                    h(son)
                ])
            }
        }

        const grandFather = {
            name: "grandFather",
            setup() {
                provide("grand-name", "foo");

                return () => h("div", {}, [
                    h('div', {}, 'grandFather'),
                    h(father)
                ])
            },
        };

        export default {
            name: "App",
            setup() {
                const instance = getCurrentInstance();

                console.log("currentInstance ----", instance);
            },

            render() {
                return h("div", {}, [h("div", {}, "App"), h(grandFather)]);
            },
        };
 */
