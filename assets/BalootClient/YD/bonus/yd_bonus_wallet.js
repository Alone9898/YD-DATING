import {CommonStyle} from "../../game_common/CommonStyle";

cc.Class({
    extends: cc.Component,

    properties: {
        lblTotal:cc.Label,
        lblCash:cc.Label,   //  62协议

        btnRecord:cc.Button,
        btnTranfer:cc.Button,

        btnTip1:cc.Button,
        btnTip2:cc.Button,
        // btnTip3:cc.Button,
        // btnTip4:cc.Button,

        panelTip1:cc.Node,
        panelTip2:cc.Node,
        // panelTip3:cc.Node,
        // panelTip4:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:



    onLoad () {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.UPDATE_USER_INFO, this.UPDATE_USER_INFO, this);

        let eventListener = this.node.addComponent("EventListenerCmp");
        eventListener.registerEvent(EventId.UPATE_COINS, this.updateCoin, this); // // 监听更新钻石更新

        this.init();
    },

    updateWalletView(){
        this.lblTotal.string = cc.vv.UserManager.cashbonus;
        this.lblCash.string = cc.vv.UserManager.todaybonus || 0;
    },

    init(){
        this.updateWalletView()

        Global.btnClickEvent(this.btnRecord.node, function () {
            cc.vv.PopupManager.addPopup("YD_Pro/prefab/yd_transaction")
        }, this)

        Global.btnClickEvent(this.btnTranfer.node, function () {
            cc.vv.PopupManager.addPopup("YD_Pro/prefab/yd_bonus_transfer")
        }, this)

        Global.btnClickEvent(this.btnTip1.node, function () {
            this.showPanelTip(this.panelTip1)
        }, this)
        Global.btnClickEvent(this.btnTip2.node, function () {
            this.showPanelTip(this.panelTip2)
        }, this)
        // Global.btnClickEvent(this.btnTip3.node, function () {
        //     let url = "YD_Pro/prefab/yd_bonus_transfer_help"
        //     cc.vv.PopupManager.addPopup(url)
        //     // cc.vv.PopupManager.addPopup(url, {
        //     //     noMask: true,
        //     //     scaleIn: true,
        //     //     noCloseHit: true,
        //     // })
        // }, this)
        // Global.btnClickEvent(this.btnTip4.node, function () {
        //     this.showPanelTip(this.panelTip4)
        // }, this)

    },

    start () {

    },


    showPanelTip(node){
        if(node){
            node.stopAllActions();
            if(node.active){
                CommonStyle.fastHide(node);
            } else {
                CommonStyle.fastShow(node);
                cc.tween(node)
                    .delay(2)
                    .call(()=>{
                        CommonStyle.fastHide(node);
                    })
                    .start()
            }
        }
    },

    UPDATE_USER_INFO(){
        this.updateWalletView();
    },

    updateCoin(){
        this.updateWalletView();
    },

    // update (dt) {},
});
