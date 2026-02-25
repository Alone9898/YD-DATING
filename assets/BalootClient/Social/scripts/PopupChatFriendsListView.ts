const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupChatFriendsListView extends cc.Component {

    @property(cc.Node)
    listViewNode: cc.Node = null;
    @property(cc.Node)
    noDataHint: cc.Node = null;

    private listData = [];
    private listView: any;


    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        this.listView = this.listViewNode.getComponent("ListView");
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_LIST, this.SOCIAL_FRIEND_LIST, this);
        cc.vv.NetManager.sendAndCache({ c: MsgId.SOCIAL_FRIEND_LIST });
    }

    SOCIAL_FRIEND_LIST(msg) {
        if (msg.code != 200) return;
        this.listData = msg.items;
        this.listData.sort((a, b) => { return b.badge - a.badge })
        this.listData.sort((a, b) => { return b.isonline - a.isonline })
        this.updateView();
    }

    updateView() {
        this.noDataHint.active = this.listData.length <= 0;
        this.listView.numItems = this.listData.length;
    }

    onUpdateItem(item, index) {
        let data = this.listData[index];
        cc.find("name", item).getComponent(cc.Label).string = data.playername;
        cc.find("UserHead", item).getComponent("HeadCmp").setHead(data.uid, data.usericon);
        cc.find("UserHead", item).getComponent("HeadCmp").setAvatarFrame(data.avatarframe || 0);
        cc.find("online/icon_online", item).active = data.isonline == 1;
        cc.find("online/icon_offline", item).active = data.isonline == 0;
        let vip = data.vip || data.badge;
        cc.vv.UserConfig.setVipFrame(cc.find("vip", item).getComponent(cc.Sprite), vip);
        cc.find("vip", item).active = vip > 0;
    }

    onClickItem(event) {
        let data = this.listData[event.currentTarget._listId];
        // 唤起私聊界面
        if (data) {
            cc.vv.PopupManager.removePopup(this.node);
            cc.vv.EventManager.emit("OPEN_PRIVATE_CHAT_VIEW", { uid: data.uid });
        }
    }

}
