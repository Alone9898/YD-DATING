cc.Class({
    extends: cc.Component,
    properties: {
        maskNode: cc.Node,
    },

    onLoad() {
        Global.FixDesignScale_V(this.node, true)
    },

    toHall(endCall) {
        this.maskNode.width = 4000;
        this.maskNode.height = 4000;
        cc.tween(this.maskNode)
            .to(0.5, { width: 0, height: 0 })
            .call(() => {
                this.exitAnimed = true;
                // 停止所有定时器
                if (!Global.isYDApp()) {
                    Global.stopAllTimer();
                }
                // 预加载大厅场景
                cc.director.preloadScene(Global.SCENE_NAME.HALL, (err, data) => {
                    if (endCall) {
                        endCall()
                    }
                    this.loadHalled = true
                });
            }).start();
    },

    open() {
        this.maskNode.width = 0;
        this.maskNode.height = 0;
        cc.tween(this.maskNode)
            .to(0.5, { width: 4000, height: 4000 })
            .call(() => {
                cc.vv.PopupManager.removePopup(this.node);
            }).start();
    },


    update(dt) {
        // cc.log(this.exitAnimed, this.loadHalled)
        // 如果动画做完 并且 大厅场景加载完
        if (!this.entered && this.exitAnimed && this.loadHalled) {
            // 进入下一步
            cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL);
            this.entered = true;
        }
    },
});
