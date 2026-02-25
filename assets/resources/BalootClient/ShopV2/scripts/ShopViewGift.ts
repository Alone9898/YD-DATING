const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopViewGift extends cc.Component {

    @property(cc.Node)
    contentNode: cc.Node = null;
    @property(cc.Node)
    itemNode: cc.Node = null;
    @property(cc.SpriteAtlas)
    commonAtlas: cc.SpriteAtlas = null;
    private config: any;
    onLoad() {
        this.initView();
    }
    protected onEnable(): void {
        this.updateView();
    }
    initView() {
        for (let i = 0; i < 2; i++) {
            let node = cc.instantiate(this.itemNode);
            node.parent = this.contentNode;
            node.active = true;
            let button = node.getComponentInChildren(cc.Button);
            if (button) {
                button.node.on("click", this.onClickItem.bind(this, i), this);
            }
        }
        this.itemNode.active = false;
    }

    initData(config: any) {
        this.config = config;
        this.updateView();
    }
    updateView() {
        if (!this.config) return;
        for (let i = 0; i < 2; i++) {
            let item = this.contentNode.children[i];
            if (!item) continue;
            let data = this.config[i];
            cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.commonAtlas.getSpriteFrame(`icon_shop_gift_${i + 1}`);
            // cc.find("lbl_num", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.count);
            // cc.find("btn_pay/lbl_price", item).getComponent(cc.Label).string = __(data.unit, Global.FormatNumToComma(data.amount));
            let localPrice = "";
            if (cc.vv.PayMgr.getLocalPrice) {
                localPrice = cc.vv.PayMgr.getLocalPrice(data.productid);
            }
            localPrice = localPrice || __(data.unit, Global.FormatNumToComma(data.amount));
            cc.find("btn_pay/lbl_price", item).getComponent(cc.Label).string = localPrice;

        }
    }

    onClickItem(index) {
        if (!this.config) return;
        if (!this.config[index]) return;
        // 发起支付
        let data = this.config[index];
        if (Global.isNative()) {
            cc.vv.PayMgr.reqPurchaseOrder(data.id);
        } else if (CC_DEBUG) {
            cc.vv.NetManager.send({ c: 356, id: data.id });
        }
    }
}
