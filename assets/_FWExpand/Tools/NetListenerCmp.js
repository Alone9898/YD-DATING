// 网络请求管理组件
cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.listenerList = [];
    },

    registerMsg(cmd, fn, target, bHighpriority) {
        let listenerObj = { cmd: cmd, fn: fn, target: target, bHighpriority: bHighpriority }
        cc.vv.NetManager.registerMsg(listenerObj.cmd, listenerObj.fn, listenerObj.target, listenerObj.bHighpriority);
        this.listenerList.push(listenerObj)
    },

    onDestroy() {
        this.clear();
    },

    clear() {
        for (const listenerObj of this.listenerList) {
            cc.vv.NetManager.unregisterMsg(listenerObj.cmd, listenerObj.fn, listenerObj.bHighpriority, listenerObj.target);
        }
        this.listenerList = [];
    }

});
