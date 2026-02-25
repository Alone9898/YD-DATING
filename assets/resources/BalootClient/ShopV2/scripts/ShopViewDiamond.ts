import TimeDownCpt from "../../../../_FWExpand/UI/TimeDownCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopViewDiamond extends cc.Component {

    @property(cc.Node)
    contentNode: cc.Node = null;
    @property(cc.Node)
    itemNode: cc.Node = null;
    @property(cc.SpriteAtlas)
    commonAtlas: cc.SpriteAtlas = null;
    private config: any;
    private netListener: any;
    @property(cc.SpriteFrame)
    coinFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    vipExpFrame: cc.SpriteFrame = null;

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        // cc.log("ShopViewDiamond", "onLoad");
        this.initView();
    }
    protected onEnable(): void {
        this.netListener.registerMsg(MsgId.PURCHASE_RECHARGE_SUC, this.PURCHASE_RECHARGE_SUC, this);
        cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_SHOP_EX, stype: "25", platform: Global.isIOS() ? 2 : 1 }, true);
        this.playSwingAnim()
    }
    protected onDisable(): void {
        this.netListener.clear()
    }
    initView() {
        for (let i = 0; i < 6; i++) {
            let node = cc.instantiate(this.itemNode);
            node.parent = this.contentNode;
            node.active = true;
            let button = node.getComponent(cc.Button);
            let timeCpt = cc.find("bg/time", node).getComponent(TimeDownCpt)
            if (button) {
                button.node.on("click", this.onClickItem.bind(this, i, timeCpt), this);
            }
            timeCpt.setCallback(() => {
                // 请求更新
                cc.vv.NetManager.send({ c: MsgId.REQ_SHOP_EX, stype: "25", platform: Global.isIOS() ? 2 : 1 }, true);
            })
        }
        this.itemNode.active = false;
    }
    initData(config: any) {
        this.config = config;
        this.updateView();
    }
    updateView() {
        if (!this.config) return;
        for (let i = 0; i < 6; i++) {
            let item = this.contentNode.children[i];
            if (!item) continue;
            let data = this.config[i];
            cc.find("bg/icon", item).getComponent(cc.Sprite).spriteFrame = this.commonAtlas.getSpriteFrame(`icon_diamond_${i + 1}`);
            // 是否有折扣
            //原始ocount, count = ocount + 赠送
            cc.find("bg/layout/lbl_num", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.ocount);

            //赠送百分比
            let nSend = data.count - data.ocount
            let nPer = Math.floor((nSend / data.ocount) * 100)
            let bShowSend = nPer ? true : false
            let pDisObj = cc.find("bg/discount", item)
            pDisObj.active = bShowSend
            let lblSend = cc.find("bg/layout/lbl_extra_num", item)
            lblSend.active = bShowSend
            lblSend.getComponent(cc.Label).string = Global.FormatNumToComma(nSend)
            cc.find("bg/layout/extra", item).active = bShowSend
            cc.find("label", pDisObj).getComponent(cc.Label).string = data.discount + "%"

            let localPrice = "";
            if (cc.vv.PayMgr.getLocalPrice) {
                localPrice = cc.vv.PayMgr.getLocalPrice(data.productid);
            }
            localPrice = localPrice || __(data.unit, Global.FormatNumToComma(data.amount));
            cc.find("bg/btn_pay/lbl_price", item).getComponent(cc.Label).string = localPrice;

            // 判断是不是免费的
            if (data.free && data.free == 1) {
                cc.find("bg/btn_pay", item).active = false;
                cc.find("bg/time", item).active = true;
                cc.find("bg/freeHint", item).active = data.timeout <= 0;
                cc.find("bg/hot", item).active = false;
                cc.find("bg/icon", item).getComponent(cc.Sprite).setMaterial(0, cc.Material['getBuiltinMaterial'](data.timeout <= 0 ? '2d-sprite' : '2d-gray-sprite'));
                cc.find("bg/time", item).getComponent(TimeDownCpt).timelife = data.timeout;
                if (data.timeout > 0) {
                } else {
                    cc.find("bg/time", item).getComponent(cc.Label).string = ___("FREE");
                }
            } else {
                cc.find("bg/icon", item).getComponent(cc.Sprite).setMaterial(0, cc.Material['getBuiltinMaterial']('2d-sprite'));
                cc.find("bg/freeHint", item).active = false;
                cc.find("bg/hot", item).active = data.hot > 0;
                cc.find("bg/btn_pay", item).active = true;
                cc.find("bg/time", item).active = false;
            }

        }
    }
    onClickItem(index, timeCpt) {
        if (!this.config) return;
        if (!this.config[index]) return;
        if (timeCpt.timelife > 0) {
            cc.vv.FloatTip.show(___("还未到可领取时间"));
            return;
        }
        // 发起支付
        let data = this.config[index];
        if (data.free && data.free == 1) {
            if (data.timeout <= 0) {
                cc.vv.NetManager.send({ c: MsgId.REQ_SHOP_FREE_REWARD, id: data.id });
            }
        } else {
            // if (Global.isNative()) {
            //     cc.vv.PayMgr.reqPurchaseOrder(data.id);
            // } else if (CC_DEBUG) {
            //     cc.vv.NetManager.send({ c: 356, id: data.id });

            // }
            // StatisticsMgr.reqReport(ReportConfig.SHOP_BUY_DIAMOND, data.id);

            cc.vv.YDPRO.doPay(2,data.amount)
        }
    }

    /**
     * 摇摆动画
     */
    playSwingAnim() {
        for (let i = 0; i < 6; i++) {
            let obj = this.contentNode.children[i]


            let card = cc.find("bg", obj);
            card.stopAllActions();
            card.angle = 2.5;
            let dt = 0.02;
            card.runAction(cc.sequence(cc.rotateTo(dt * 10, 5).easing(cc.easeSineInOut()),
                cc.rotateTo(dt * 10, -3).easing(cc.easeSineInOut()),
                cc.rotateTo(dt * 9, 2).easing(cc.easeSineInOut()),
                cc.rotateTo(dt * 8, -1).easing(cc.easeSineInOut()),
                cc.rotateTo(dt * 7, 0).easing(cc.easeSineIn())));
        }
    }

    // 充值金币成功
    PURCHASE_RECHARGE_SUC(msg) {
        if (msg.code != 200) return;
        // if (msg.rewards && msg.rewards.length == 1 && msg.rewards[0].type == 25) {
        //     let rollData = {
        //         addCoin: msg.rewards[0].count,
        //         begin: cc.vv.UserManager.getDiamond() - msg.rewards[0].count
        //     };
        //     let tempNode = null;
        //     for (let i = 0; i < this.config.length; i++) {
        //         if (this.config[i].id == msg.shopid) {
        //             tempNode = this.contentNode.children[i]
        //         }
        //     }
        //     if (tempNode) {
        //         Global.FlyDiamond(tempNode, null, null, rollData, true);
        //     }
        // }
        if (msg.rewards) {
            let tempNode = null;
            for (let i = 0; i < this.config.length; i++) {
                if (this.config[i].id == msg.shopid) {
                    tempNode = this.contentNode.children[i]
                }
            }
            if (tempNode) {
                Global.RewardFly(msg.rewards, tempNode.convertToWorldSpaceAR(cc.v2(0, 0)));
            }
        }
    }

}
