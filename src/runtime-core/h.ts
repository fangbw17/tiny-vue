import { createVNode } from "./createVNode";
export const h = function (
    type: any,
    props: any,
    children: string | Array<any>
): any {
    return createVNode(type, props, children);
};
