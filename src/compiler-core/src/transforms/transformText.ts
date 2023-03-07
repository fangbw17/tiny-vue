import { NodeTypes } from "../ast";
import { isText } from "../utils";

export function transformText(node, context) {
    if (node.type === NodeTypes.ELEMENT) {
        return () => {
            // 标签元素
            const children = node.children;
            let currentContainer;

            // 遍历子标签
            for (let i = 0; i < children.length; i++) {
                const child = children[i];

                // 当前子标签是否是 文本 或者 插值
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];

                        if (!currentContainer) {
                            currentContainer = children[i] = {
                                type: NodeTypes.COMPOUND_EXPRESSION,
                                loc: child.loc,
                                children: [child],
                            };
                        }

                        currentContainer.children.push(" + ", next);
                        // 把当前的节点放到容器内，然后删除j
                        children.splice(j, 1);
                        // 删除了一个元素，需要--
                        j--;
                    }
                } else {
                    currentContainer = undefined;
                }
            }
        };
    }
}
