import { toHandlerKey, camelize } from "../shared";

export function emit(instance, event: string, ...rawArgs) {
    const props = instance.props
    const handlerName = toHandlerKey(camelize(event))
    // const handlerName = 'on' + event.substring(0, 1).toUpperCase() + event.substring(1)
    console.log(`方法名为: ${handlerName} 的事件被触发了。 参数为:${rawArgs}`);
    const handler = props[handlerName]
    handler && handler(...rawArgs)
}