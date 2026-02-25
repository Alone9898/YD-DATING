const { ccclass, property } = cc._decorator;

@ccclass
export default class UserGiftListCmp extends cc.Component {
    @property(cc.Node)
    tabbarNode: cc.Node = null;
    @property(cc.Node)
    listNode: cc.Node = null;
    private listView: any = null;
    @property(cc.Label)
    tipNameLabel: cc.Label = null;
    @property(cc.Node)
    nodeDataNode: cc.Node = null;
    @property(cc.SpriteAtlas)
    texture: cc.SpriteAtlas = null;

    private dataList = [];
    private tabbarCpt: any;

    onLoad() {
        this.listView = this.listNode.getComponent("ListView");
        // 监听请求数据
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.USER_GIFT_SEND_LIST, this.USER_GIFT_SEND_LIST, this);
        netListener.registerMsg(MsgId.USER_GIFT_GET_LIST, this.USER_GIFT_GET_LIST, this);
        this.tabbarCpt = this.tabbarNode.getComponent("Tabbar");
        this.tabbarCpt.setChangeCallback(this.onChangeTabbar.bind(this));
    }

    onChangeTabbar(index, item, items) {
        if (index == 0) {
            this.tipNameLabel.string = ___("赠送玩家");
            cc.vv.NetManager.sendAndCache({ c: MsgId.USER_GIFT_GET_LIST }, true);
        } else {
            this.tipNameLabel.string = ___("接受玩家");
            cc.vv.NetManager.sendAndCache({ c: MsgId.USER_GIFT_SEND_LIST }, true);
        }
    }

    USER_GIFT_SEND_LIST(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        this.dataList = msg.data;
        this.updateView();
    }
    USER_GIFT_GET_LIST(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) return;
        this.dataList = msg.data;
        this.updateView();
    }

    updateView() {
        // 请求数据
        this.nodeDataNode.active = this.dataList.length <= 0;
        this.listView.numItems = this.dataList.length;
    }

    onUpdataItem(item, index) {
        let data = this.dataList[index];
        cc.find("name", item).getComponent(cc.Label).string = data.playername;
        cc.find("icon", item).getComponent(cc.Sprite).spriteFrame = this.texture.getSpriteFrame(data.img);
        cc.find("price", item).getComponent(cc.Label).string = data.coin;
        cc.find("UserHead", item).getComponent("HeadCmp").setHead(data.uid, data.usericon);
        cc.find("UserHead", item).getComponent("HeadCmp").setAvatarFrame(data.avatarframe);
    }

}
