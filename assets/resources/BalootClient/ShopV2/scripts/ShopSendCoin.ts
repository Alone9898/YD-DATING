const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopSendCoin extends cc.Component {

    @property(cc.Node)
    contentNode: cc.Node = null;
    @property(cc.Node)
    itemNode: cc.Node = null;
    @property(cc.SpriteAtlas)
    commonAtlas: cc.SpriteAtlas = null;
    @property(cc.EditBox)
    uidInput: cc.EditBox = null;
    @property(cc.Button)
    btnSend: cc.Button = null;

    data: any;
    index: number = 0;
    toggles: cc.Toggle[] = [];

    get toUid() {
        let uid = -1;
        if (this.uidInput && this.uidInput.string.length > 0) {
            uid = parseInt(this.uidInput.string.trim());
        }
        return uid;
    }

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.DIAMOND_TO_COIN, this.DIAMOND_TO_COIN, this);
        netListener.registerMsg(MsgId.REQ_SHOP_EX, this.REQ_SHOP_EX, this);
        for (let i = 0; i < 5; i++) {
            let node = cc.instantiate(this.itemNode);
            node.position = cc.v3();
            node.parent = this.contentNode;
            node.active = true;
            cc.find("select", node).on("toggle", this.onClickToggle.bind(this, i), this);
            this.toggles.push(cc.find("select", node).getComponent(cc.Toggle));
        }
        this.itemNode.active = false;

        this.btnSend.node.on("click", this.onClickSend, this);

        cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_SHOP_EX, stype: "1,14,15,25,27,30", platform: Global.isIOS() ? 2 : 1 }, true);

        this.onEditInputChange();
    }

    onClickToggle(i, toggle: cc.Toggle) {
        if (!this.data) return;
        this.index = i;
        this.updateView();
    }


    REQ_SHOP_EX(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        if (!msg.shoplist) return;
        if (!msg.shoplist.data1) return;
        this.data = Global.deepClone(msg.shoplist.data1);
        this.data.sort((a, b) => { return a.amount - b.amount; })
        this.data.shift()
        this.updateView();
    }

    updateView() {
        if (!this.data) return;
        for (let i = 0; i < 5; i++) {
            let item = this.contentNode.children[i];
            if (!item) continue;
            let data = this.data[i];
            cc.find("icon_coin", item).getComponent(cc.Sprite).spriteFrame = this.commonAtlas.getSpriteFrame(`icon_coin_${i + 1}`);
            cc.find("icon_value", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.ocount);
            cc.find("diamond/value", item).getComponent(cc.Label).string = Global.FormatNumToComma(data.amount);
            let _color = this.index == i ? new cc.Color(255, 252, 0) : new cc.Color(216, 255, 246);
            cc.find("icon_value", item).color = _color;
            cc.find("diamond/value", item).color = _color;
        }
        for (let i = 0; i < this.toggles.length; i++) {
            const toggle = this.toggles[i];
            toggle.isChecked = i == this.index;
        }

        let data = this.data[this.index];
        this.btnSend.getComponentInChildren(cc.Label).string = Global.FormatNumToComma(data.amount);
    }

    DIAMOND_TO_COIN(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        cc.vv.FloatTip.show(___("赠送成功"));
        cc.vv.PopupManager.removePopup(this.node);
    }

    onEditInputChange() {
        this.btnSend.getComponent("ButtonGrayCmp").interactable = this.uidInput.string.trim().length > 0;
    }

    onClickSend() {
        if (!this.data) return;
        let data = this.data[this.index];
        if (!data) return;
        if (this.toUid < 0) {
            cc.vv.FloatTip.show(___("请输入邀请码"));
            return;
        }
        cc.vv.NetManager.send({ c: MsgId.DIAMOND_TO_COIN, frienduid: this.toUid, id: data.id });
    }

}
