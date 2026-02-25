const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopFriendSendCoin extends cc.Component {

    private data: any;
    listData: any;
    listView: any;

    @property(cc.Node)
    listViewNode: cc.Node = null;
    @property(cc.SpriteFrame)
    onlineFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    offlineFrame: cc.SpriteFrame = null;


    onLoad() {
        this.listView = this.listViewNode.getComponent("ListView");
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_LIST, this.SOCIAL_FRIEND_LIST, this);
        netListener.registerMsg(MsgId.DIAMOND_TO_COIN, this.DIAMOND_TO_COIN, this);
    }

    protected start(): void {
        cc.vv.NetManager.sendAndCache({ c: MsgId.SOCIAL_FRIEND_LIST }, true);
    }

    onInit(data) {
        this.data = data;
        // this.sendPriceLabel.string = Global.FormatNumToComma(data.amount);
        // this.giftPriceLabel.string = Global.FormatNumToComma(data.ocount);
    }

    SOCIAL_FRIEND_LIST(msg) {
        if (msg.code != 200) return;
        this.listData = msg.items;
        this.updateView();
    }

    updateView() {
        // 排序
        this.listView.numItems = this.listData.length;
    }

    onUpdateItem(item, index) {
        let data = this.listData[index];
        cc.find("name", item).getComponent(cc.Label).string = data.playername;
        cc.find("UserHead", item).getComponent("HeadCmp").setHead(data.uid, data.usericon);
        cc.find("UserHead", item).getComponent("HeadCmp").setAvatarFrame(data.avatarframe || 0);
        cc.find("online", item).getComponent(cc.Sprite).spriteFrame = data.isonline == 1 ? this.onlineFrame : this.offlineFrame;
        let vip = data.vip || data.badge;
        cc.vv.UserConfig.setVipFrame(cc.find("vip", item).getComponent(cc.Sprite), vip);
        cc.find("vip", item).active = vip > 0;
    }

    onClickSend(event) {
        let friendData = this.listData[event.currentTarget._listId];
        cc.vv.NetManager.send({ c: MsgId.DIAMOND_TO_COIN, frienduid: friendData.uid, id: this.data.id });
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

}
