cc.Class({
    extends: cc.Component,

    properties: {
        fbShare: cc.Node,
        // online: cc.Node,
    },

    onLoad() {
        // 添加监听变动
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.eventListener = this.node.addComponent("EventListenerCmp");
        this.eventListener.registerEvent("BONUS_CHANGE", () => {
            // this.updateView();
        }, this)
    },

    onEnable() {
        // this.netListener.registerMsg(MsgId.EVENT_LOGIN_BONUS_CONFIG, this.EVENT_LOGIN_BONUS_CONFIG, this);
        // 发送请求
        // cc.vv.NetManager.sendAndCache({ c: MsgId.EVENT_LOGIN_BONUS_CONFIG });

        this.checkWalletShow();
        this.checkVipShow()
    },

    onDisable() {
        this.netListener.clear();
    },

    checkVipShow(){
        if(cc.vv.UserManager.vipsign == 2){
            let sign = cc.find("EventList/view/content/PopupVipSign",this.node)
            sign.active = false
        }
    },

    checkWalletShow(){
        if(Global.isIOSAndroidReview()){
            let sign = cc.find("EventList/view/content/wallet",this.node)
            sign.active = false
        }
    },


    // EVENT_LOGIN_BONUS_CONFIG(msg) {
    //     if (msg.code != 200) return;
    //     this.localData = msg.data;
    //     this.updateView();
    // },

    // updateView() {
    //     if (this.localData) {
    //         let nodeMap = this.fbShare.getComponent("RewardListCpt").updateView(this.localData.sharefb);
    //         if (nodeMap[1]) nodeMap[1].icon.scale = 0.55;
    //         if (nodeMap[25]) nodeMap[25].icon.scale = 0.55;
    //         if (nodeMap[44]) nodeMap[44].icon.scale = 1.1;
    //         if (nodeMap[43]) nodeMap[43].avatar.scale = 0.38;
    //         cc.find("icon_event_select_box_1/coin", this.online).getComponent(cc.Label).string = Global.FormatNumToComma(this.localData.online[0].count);
    //         cc.find("icon_event_select_box_2/coin", this.online).getComponent(cc.Label).string = Global.FormatNumToComma(this.localData.online[1].count);
    //     }

    // },

});
