const queue: any = new Set();
const p = Promise.resolve()
let isFlushPending = false;

export const queueJob = function (effect) {
    // 容器中不包含副作用函数
    if (!queue.has(effect)) {
        // 推入容器中
        queue.add(effect);
        // 执行副作用函数
        queueFlush();
    }
    console.log(`what's the effect: ${effect}`);
};

export const nextTick = function(fn) {
    return fn ? p.then(fn).finally(() => {
            // 执行结束
        isFlushPending = false
    }) : p
}

function queueFlush() {
    // 正在执行副作用函数中
    if (isFlushPending) return;
    // 开始执行
    isFlushPending = true;

    nextTick(flushJobs)
}

function flushJobs() {
    console.log("副作用函数 微任务列表执行");
    // 执行容器中的所有副作用函数
    queue.forEach((effect) => effect && effect());
    // 清空所有副作用函数
    queue.clear();
}
