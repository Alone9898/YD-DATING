const { ccclass, property } = cc._decorator;

@ccclass
export default class SocialFriendRemove extends cc.Component {

    @property(cc.Node)
    listNode: cc.Node = null;
    @property(cc.Button)
    selectAllBtn: cc.Button = null;
    @property(cc.Button)
    unSelectAllBtn: cc.Button = null;
    @property(cc.SpriteFrame)
    onlineFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    offlineFrame: cc.SpriteFrame = null;
    @property(cc.Button)
    removeBtn: cc.Button = null;
    private netListener: any;
    listData: any;
    listView: any;

    private _isAllSelect = false;
    set isAllSelect(value) {
        this._isAllSelect = value;
        if (this.listView && this.listData) {
            let listIDList = [];
            for (let i = 0; i < this.listData.length; i++) {
                listIDList.push(i);
            }
            this.listView.setMultSelected(listIDList, this._isAllSelect);
        }
    }

    onLoad() {
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.netListener.registerMsg(MsgId.SOCIAL_FRIEND_LIST, this.SOCIAL_FRIEND_LIST, this);
        this.netListener.registerMsg(MsgId.SOCIAL_FRIEND_HANDLE_REMOVE, this.SOCIAL_FRIEND_HANDLE_REMOVE, this);
        this.selectAllBtn.node.on("click", this.onClickSelectAll, this);
        this.unSelectAllBtn.node.on("click", this.onClickUnSelectAll, this);
        this.removeBtn.node.on("click", this.onClickRemove, this);
        this.listView = this.listNode.getComponent("ListView")
    }

    protected start(): void {
        cc.vv.NetManager.sendAndCache({ c: MsgId.SOCIAL_FRIEND_LIST }, true);
    }

    SOCIAL_FRIEND_LIST(msg) {
        if (msg.code != 200) return;
        this.listData = Global.deepClone(msg.items);
        this.updateView();
    }

    SOCIAL_FRIEND_HANDLE_REMOVE(msg) {
        if (msg.code != 200) return;
        // 更新列表
        for (let i = 0; i < this.listData.length; i++) {
            const element = this.listData[i];
            if (element.uid === msg.frienduids[0]) {
                this.listData.splice(i, 1);
                break
            }
        }
        this.updateView();
        // cc.vv.PopupManager.removePopup(this.node);
        cc.vv.FloatTip.show(___("删除好友成功"))
    }

    updateView() {
        this.listView.numItems = this.listData.length;
        // this.updateBtn();
    }

    updateBtn() {
        // if (this.listView.getMultSelected().length < this.listData.length) {
        //     this.selectAllBtn.node.active = true;
        //     this.unSelectAllBtn.node.active = false;
        // } else {
        //     this.selectAllBtn.node.active = false;
        //     this.unSelectAllBtn.node.active = true;
        // }
        // this.removeBtn.getComponent("ButtonGrayCmp").interactable = this.listView.getMultSelected().length > 0;
    }

    onUpdateItem(item, index) {
        let data = this.listData[index];
        cc.find("name", item).getComponent(cc.Label).string = data.playername;
        // cc.find("level", item).getComponent(cc.Label).string = __("LV", ":", data.level);// + ;
        // let rankData = cc.vv.UserConfig.getRank(data.score)
        // cc.find("rank", item).getComponent(cc.Label).string = rankData.text;
        cc.find("UserHead", item).getComponent("HeadCmp").setHead(data.uid, data.usericon);
        cc.find("UserHead", item).getComponent("HeadCmp").setAvatarFrame(data.avatarframe || 0);
        // cc.find("online", item).getComponent(cc.Sprite).spriteFrame = data.isonline == 1 ? this.onlineFrame : this.offlineFrame;
    }

    onSelectItem(node, index) {
        this.updateBtn();
    }

    onClickSelectAll() {
        this.isAllSelect = true;
        this.updateBtn();
    }

    onClickUnSelectAll() {
        this.isAllSelect = false;
        this.updateBtn();
    }

    onClickRemove() {
        let listIds = this.listView.getMultSelected();
        let uids = [];
        for (const lid of listIds) {
            uids.push(this.listData[lid].uid);
        }
        if (uids.length > 0) {
            cc.vv.NetManager.send({ c: MsgId.SOCIAL_FRIEND_HANDLE_REMOVE, frienduids: uids }, true);
        }
    }


    onClickRemoveItem(event) {
        let data = this.listData[event.currentTarget._listId];
        if (data && data.uid) {
            cc.vv.NetManager.send({ c: MsgId.SOCIAL_FRIEND_HANDLE_REMOVE, frienduids: [data.uid] }, true);
        }
    }
}
