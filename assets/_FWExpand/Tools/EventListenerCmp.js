// 事件管理组件
cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.listenerList = [];
    },

    registerEvent(eventName, func, obj) {
        let listenerObj = {
            eventName: eventName,
            func: func,
            obj: obj,
        }
        Global.registerEvent(listenerObj.eventName, listenerObj.func, listenerObj.obj);
        this.listenerList.push(listenerObj)
    },

    clear() {
        let canvas = cc.find("Canvas");
        for (const listenerObj of this.listenerList) {
            if (canvas) {
                canvas.off(listenerObj.eventName, listenerObj.func, listenerObj.obj);
            }
        }
        this.listenerList = [];
    },

    onDestroy() {
        this.clear();
    },

});
