const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopViewSalon extends cc.Component {

    // @property(cc.Node)
    // contentNode: cc.Node = null;
    @property(cc.Node)
    itemNode: cc.Node = null;
    @property(cc.Button)
    btn_play: cc.Button = null;

    private netListener: any;
    private loading: boolean;
    private localData: any;

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.btn_play.node.on("click", this.onClickItem, this);
    }

    protected onEnable(): void {
        // 获取配置
        this.netListener.registerMsg(MsgId.REQ_SKIN_SHOP, this.REQ_SKIN_SHOP, this);
        // 购买结果
        this.netListener.registerMsg(MsgId.REQ_BUY_SKIN_SHOP_ITEM, this.REQ_BUY_SKIN_SHOP_ITEM, this);
        // 请求配置
        cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_SKIN_SHOP, platform: Global.isIOS() ? 2 : 1 }, true);
    }
    protected onDisable(): void {
        this.netListener.clear()
    }

    // 拿到所有配置
    REQ_SKIN_SHOP(msg: any) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        this.localData = msg.shoplist.data10 && msg.shoplist.data10[0] || {};
        this.updateView();
    }
    // 购买结果
    REQ_BUY_SKIN_SHOP_ITEM(msg) {
        this.loading = false;
        if (msg.code != 200) return;
        if (msg.spcode == 2) {
            cc.vv.FloatTip.show(___("金币不足"));
            return;
        }
        if (msg.item && this.localData.id == msg.item.id) {
            cc.vv.FloatTip.show(___("购买成功"));
            this.localData.have = 1;
        }
        this.updateView();
    }

    updateView() {
        cc.find("btn_play/layout/value", this.itemNode).getComponent(cc.Label).string = Global.formatNumber(this.localData.diamond, { threshold: 10000 });
        cc.find("btn_play", this.itemNode).active = this.localData.have != 1;
        cc.find("hit", this.itemNode).active = this.localData.have == 1;
    }

    onClickItem() {
        if (this.localData.have == 0) {
            cc.vv.NetManager.send({ c: MsgId.REQ_BUY_SKIN_SHOP_ITEM, id: this.localData.id });
        }
    }


}
