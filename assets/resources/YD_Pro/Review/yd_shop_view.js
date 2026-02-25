
cc.Class({
    extends: cc.Component,

    properties: {
        goldsNode:cc.Node,
        item_support:cc.Node,
        itemList:[],
        localData:[],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        for (let i = 1; i <= 6; i++) {
            let item = cc.find("layout/item"+i, this.goldsNode);
            cc.find("btn", item).on("click", this.onClickPay.bind(this, item), this);
            this.itemList.push(item);
        }

        let btn_support = cc.find("btn_go", this.item_support)
        btn_support.on("click",()=>{
            let url = "YD_Pro/prefab/yd_service"
            cc.vv.PopupManager.addPopup(url, {isWait: true, scaleIn: true })
        })

        this.netListener = this.node.addComponent("NetListenerCmp");
    },

    onEnable() {

        this.netListener.registerMsg(MsgId.REQ_SHOP_EX, this.REQ_SHOP_EX, this);
        this.netListener.registerMsg(MsgId.PURCHASE_RECHARGE_SUC, this.PURCHASE_RECHARGE_SUC, this);
        cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_SHOP_EX, stype: "1", platform: Global.isIOS() ? 2 : 1 }, true);
    },

    start () {

    },

    REQ_SHOP_EX(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        let shoplist = msg.shoplist || {};
        this.localData = [];
        if (shoplist.data1) {
            this.localData = shoplist.data1;
            this.updateView();
        }
    },

    updateView() {
        for (let i = 0; i < this.itemList.length; i++) {
            const itemNode = this.itemList[i];
            let data = this.localData[i];
            if (data) {
                itemNode.active = true;
                itemNode["data"] = data;
                cc.find("lbl_val", itemNode).getComponent(cc.Label).string = Global.FormatNumToComma(data.count);
                // 价格
                let localPrice = "";
                if (cc.vv.PayMgr.getLocalPrice) {
                    localPrice = cc.vv.PayMgr.getLocalPrice(data.productid);
                }
                localPrice = localPrice || __(data.unit, Global.FormatNumToComma(data.amount));
                cc.find("btn/label", itemNode).getComponent(cc.Label).string = localPrice

            } else {
                itemNode.active = false;
            }
        }
    },

    onClickPay(itemNode) {
        let data = itemNode["data"];
        if (data) {
            this.lastClickPos = cc.find("btn", itemNode).convertToWorldSpaceAR(cc.v2(0, 0));
            if (Global.isNative()) {
                if (Global.appId == Global.APPID.TestPokerHero) {
                    cc.vv.NetManager.send({ c: 356, id: data.id });
                } else {
                    cc.vv.PayMgr.reqPurchaseOrder(data.id);
                }
            } else if (CC_DEBUG) {
                cc.vv.NetManager.send({ c: 356, id: data.id });
            }
        }
    },

    // 充值金币成功
    PURCHASE_RECHARGE_SUC(msg) {
        if (msg.code != 200) return;
        if (msg.rewards) {
            Global.RewardFly(msg.rewards, this.lastClickPos);
        }
    },


    // update (dt) {},
});
