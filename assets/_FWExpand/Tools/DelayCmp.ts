
/**
 * 异步延迟函数
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class DelayCmp extends cc.Component {
    abortFunc: Function[] = [];
    onLoad() {
    }
    onDestroy() {
        this.clear();
    }
    clear() {
        for (const func of this.abortFunc) {
            if (func) func();
        }
        this.abortFunc = [];
    }
    // 获取承诺
    getPromise(callback, abortFunc?) {
        let _reject;
        const promise = new Promise((resolve, reject) => {
            _reject = reject;
            callback(resolve, reject)
        });
        return {
            promise,
            abort: () => {
                abortFunc && abortFunc();
                _reject({ message: "the promise is aborted" })
            }
        }
    }
    // 延迟
    delay(time) {
        const { promise, abort } = this.getPromise((resolve, reject) => {
            this.scheduleOnce(() => {
                resolve();
                this.abortFunc = this.abortFunc.filter(item => item != abort);
            }, time);
        });
        this.abortFunc.push(abort);
        // 返回承诺
        return promise;
    }
}
