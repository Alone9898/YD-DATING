
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(this.node,function () {
            if(Global.isIOSAndroidReview()){
                cc.vv.PopupManager.addPopup("YD_Pro/Review/yd_more_coins");
            } else {
                cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                    onShow: (node) => {
                        node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl);
                    }
                })
            }
        },this);
    },

    start () {

    },

    // update (dt) {},
});
