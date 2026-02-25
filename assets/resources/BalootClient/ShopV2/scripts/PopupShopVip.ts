const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupShopVip extends cc.Component {

    private netListener: any;
    private vipgift: any;

    @property(cc.Node)
    vipHintNode: cc.Node = null;
    @property(cc.Button)
    btn_go: cc.Button = null;

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        cc.find("btn_gift/btn_green", this.node).on("click", () => {
            if (this.vipgift) {
                if (Global.isNative()) {
                    cc.vv.PayMgr.reqPurchaseOrder(this.vipgift.id);
                } else if (CC_DEBUG) {
                    cc.vv.NetManager.send({ c: 356, id: this.vipgift.id });
                }
            }
        })
        // 点击去完成任务
        this.btn_go.node.on("click", () => {
            cc.vv.GameManager.jumpTo(9);
        }, this)
        this.vipHintNode.active = cc.vv.UserManager.tmpvip > 0;
    }

    start() {
        cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_SHOP_EX, stype: "30", platform: Global.isIOS() ? 2 : 1 }, true);
    }

    protected onEnable(): void {
        this.netListener.registerMsg(MsgId.REQ_SHOP_EX, this.REQ_SHOP_EX, this);
        this.netListener.registerMsg(MsgId.PURCHASE_RECHARGE_SUC, this.PURCHASE_RECHARGE_SUC, this);
    }

    protected onDestroy(): void {
        this.netListener.clear();
    }

    REQ_SHOP_EX(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        let shoplist = msg.shoplist || {};
        if (shoplist.data30 && shoplist.data30.length > 0) {
            this.vipgift = msg.shoplist.data30[0];
            this.updateView();
        } else {
        }
    }

    updateView() {
        if (this.vipgift) {
            let localPrice = "";
            if (cc.vv.PayMgr.getLocalPrice) {
                localPrice = cc.vv.PayMgr.getLocalPrice(this.vipgift.productid);
            }
            localPrice = localPrice || __(this.vipgift.unit, Global.FormatNumToComma(this.vipgift.amount));
            cc.find("btn_gift/btn_green/label", this.node).getComponent(cc.Label).string = localPrice;
            cc.find("btn_gift/layout/price/value", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(this.vipgift.diamond)
        }
    }

    // 购买VIP成功
    PURCHASE_RECHARGE_SUC(msg) {
        if (msg.code != 200) return;
        if (msg.rewards) {
            Global.RewardFly(msg.rewards, cc.find("btn_gift", this.node).convertToWorldSpaceAR(cc.v2(0, 0)));
            Global.dispatchEvent("PURCHASE_VIP_SUC")
            this.node.destroy();
        }
    }
    // update (dt) {}
}
