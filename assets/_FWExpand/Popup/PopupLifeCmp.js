// 用来辅助监听弹窗节点销毁时候的回调
cc.Class({
    extends: cc.Component,

    properties: {
    },

    setOnDestroy(callback) {
        this.onPopupDestroy = callback;
    },

    onDestroy() {
        if (this.onPopupDestroy)
            this.onPopupDestroy();
    }

});
