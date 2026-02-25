const { ccclass, property } = cc._decorator;

@ccclass
export default class PagePrivateChat extends cc.Component {

    @property(cc.Node)
    listViewNode: cc.Node = null;
    @property(cc.Node)
    noDataNode: cc.Node = null;

    @property(cc.EditBox)
    editBox: cc.EditBox = null;
    @property(cc.Button)
    btn_friend: cc.Button = null;
    @property(cc.Button)
    btn_delete: cc.Button = null;
    @property(cc.Button)
    btn_complete: cc.Button = null;

    @property(cc.Prefab)
    friendPrefab: cc.Prefab = null;


    private netListener: any;
    private eventListener: any;
    private listView: any;

    private listData: any = [];
    private showData: any = [];
    private searchList: any[] = [];
    private isRemoveModel: boolean = false;

    onLoad() {
        this.listView = this.listViewNode.getComponent("ListView");
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.eventListener = this.node.addComponent("EventListenerCmp");
        this.noDataNode.active = true;
        this.btn_friend.node.on("click", this.onClickFriend, this);
        this.btn_delete.node.on("click", this.onClickDelete, this);
        this.btn_complete.node.on("click", this.onClickComplete, this);
    }
    onEnable() {
        this.isRemoveModel = false;

        cc.vv.RedHitManager.setFilterKeys(["friendscnt"]);
        // 最近好友消息列表
        this.netListener.registerMsg(MsgId.SOCIAL_FRIEND_MESSAGE_LIST, this.SOCIAL_FRIEND_MESSAGE_LIST, this);
        // 自己删除好友成功
        this.netListener.registerMsg(MsgId.SOCIAL_FRIEND_HANDLE_REMOVE, this.SOCIAL_FRIEND_HANDLE_REMOVE, this);
        // 被好友删除通知
        this.netListener.registerMsg(MsgId.RET_ADD_FRIENDS_NOTICE, this.RET_ADD_FRIENDS_NOTICE, this);
        // 删除聊天记录结果
        this.netListener.registerMsg(MsgId.DELETE_FRIEND_RECORD, this.DELETE_FRIEND_RECORD, this);
        // 用户信息更新
        this.eventListener.registerEvent("USER_INFO_CHANGE", this.USER_INFO_CHANGE, this);

        this.editBox.string = '';
        this.onSearchUserName("");

        cc.vv.NetManager.sendAndCache({ c: MsgId.SOCIAL_FRIEND_MESSAGE_LIST }, true);
    }

    onDisable() {
        this.netListener.clear();
        this.eventListener.clear();
        cc.vv.RedHitManager.setFilterKeys([]);
    }

    // 刷新列表数据
    SOCIAL_FRIEND_MESSAGE_LIST(msg) {
        if (this.isRemoveModel) return;
        if (msg.code != 200) return;
        this.listData = msg.datalist;
        // 更新列表界面
        this.updateView();
        this.listView.scrollTo(0);
    }
    // 删除好友成功
    SOCIAL_FRIEND_HANDLE_REMOVE(msg) {
        if (this.isRemoveModel) return;
        if (msg.code != 200) return;
        let tempItems = [];
        for (const item of this.listData) {
            if (msg.frienduids.indexOf(item.uid) >= 0) {
                tempItems.push(item);
            }
        }
        if (tempItems.length > 0) {
            for (const tempItem of tempItems) {
                this.listData.splice(this.listData.indexOf(tempItem), 1);
                if (this.showData != this.listData) {
                    this.showData.splice(this.showData.indexOf(tempItem), 1);
                }
            }
            this.updateView();
        }
    }
    // 被通知好友变动(你被某个好友删除了)
    RET_ADD_FRIENDS_NOTICE(msg) {
        if (this.isRemoveModel) return;
        if (msg.code != 200) return;
        if (msg.act != 2) return;
        let tempItem = null;
        for (const item of this.listData) {
            if (item.uid == msg.uid) {
                tempItem = item;
            }
        }
        if (tempItem) {
            this.listData.splice(this.listData.indexOf(tempItem), 1);
            if (this.showData != this.listData) {
                this.showData.splice(this.showData.indexOf(tempItem), 1);
            }
            this.updateView();
        }
    }

    // 删除聊天记录结果
    DELETE_FRIEND_RECORD(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        // 删除本地记录
        let tempItems = [];
        for (const item of this.listData) {
            if (msg.frienduids.indexOf(item.uid) >= 0) {
                tempItems.push(item);
            }
        }
        if (tempItems.length > 0) {
            for (const tempItem of tempItems) {
                this.listView.aniDelItem(this.showData.indexOf(tempItem), (idx) => {
                    this.listData.splice(this.listData.indexOf(tempItem), 1);
                    if (this.showData != this.listData) {
                        this.showData.splice(this.showData.indexOf(tempItem), 1);
                    }
                    // 如果删除后,没有聊天记录了
                    if (this.listData.length <= 0) {
                        this.isRemoveModel = false;
                    }
                    this.updateView();
                }, 3)
            }
        }
    }

    // 点击好友列表按钮
    onClickFriend(event) {
        let endPos = cc.v3(0, cc.winSize.height * -0.5);
        cc.vv.PopupManager.addPopup(this.friendPrefab, {
            onShow: (node) => {
                node.position = endPos.add(cc.v3(0, -node.height));
                cc.tween(node).to(0.2, { position: endPos }, { easing: "quadOut" }).start();
            },
            onClose: (node) => {
                let tempNode = cc.instantiate(node);
                for (const cpt of tempNode.getComponentsInChildren(cc.Component)) {
                    if (cpt instanceof cc.Sprite || cpt instanceof cc.Label) {
                    } else {
                        cpt.enabled = false;
                    }
                }
                tempNode.parent = cc.find("Canvas");
                tempNode.zIndex = 1000
                cc.tween(tempNode)
                    .by(0.2, { y: -node.height }, { easing: "quadIn" })
                    .call(() => {
                        tempNode.destroy();
                    })
                    .start();
            },
        })
    }
    // 点击删除按钮
    onClickDelete(event) {
        this.isRemoveModel = true;
        this.updateView();
    }
    // 点击完成按钮
    onClickComplete(event) {
        this.isRemoveModel = false;
        this.updateView();
        cc.vv.NetManager.send({ c: MsgId.SOCIAL_FRIEND_MESSAGE_LIST }, true);
    }
    // 刷新界面
    updateView() {
        // 确定显示的数据
        this.showData = this.searchList.length > 0 ? this.searchList : this.listData;
        if (this.showData.length <= 0) {
            this.listView.node.active = false;
            this.noDataNode.active = true;
        } else {
            this.listView.node.active = true;
            this.noDataNode.active = false;
            this.listView.numItems = this.showData.length;
        }
        this.btn_delete.node.active = !this.isRemoveModel;
        this.btn_complete.node.active = this.isRemoveModel;
    }
    // 用户搜索
    onSearchUserName(username) {
        if (!username || username == "") {
            this.searchList = [];
        } else {
            // 生成一个临时的好友数组 用于显示
            this.searchList = this.listData.filter((item) => {
                return item.playername.indexOf(username) >= 0;
            });
        }
        this.updateView();
    }
    // 刷新Item
    onUpdateItemView(item, index) {
        let data = this.showData[index];
        cc.find("name", item).getComponent(cc.Label).string = data.playername;
        // cc.find("level", item).getComponent(cc.Label).string = data.level + ":LV";
        // cc.find("uid/value", item).getComponent(cc.Label).string = data.uid;
        cc.find("online/icon_online", item).active = data.online == 1;
        cc.find("online/icon_offline", item).active = data.online == 0;
        cc.find("time", item).getComponent(cc.Label).string = Global.formatTime("yyyy/MM/dd hh:mm:ss", data.create_time);

        cc.find("status/remove", item).active = this.isRemoveModel;
        cc.find("status/arrow", item).active = !this.isRemoveModel;

        cc.find("UserHead", item).getComponent("HeadCmp").setHead(data.uid, data.usericon);
        cc.find("UserHead", item).getComponent("HeadCmp").setAvatarFrame(data.avatarframe);
        // 设置红点数据
        cc.find("RedHit", item).getComponent("RedHitMsgCmp").setUid(data.uid);
        // cc.find("btn_addfriend", item).active = data.friend > 0;
        let stype = data.type;
        let msgNode = cc.find("msg", item)
        let emojiNode = cc.find("emoji", item)
        msgNode.active = false
        emojiNode.active = false

        if (stype == 1) {
            msgNode.active = true
            let endMsg = data.msg;
            if (!!data.msg && data.msg.length > 15) {
                endMsg = __(data.msg.substring(0, 15), "...")
            }
            msgNode.getComponent(cc.Label).string = endMsg;
        } else if (stype == 2) {
            emojiNode.active = true
            cc.vv.UserConfig.setEmoji(emojiNode.getComponent(sp.Skeleton), data.msg, (skeletonCpt, emojiType) => {
                skeletonCpt.node.scale = 0.25;
                skeletonCpt.node.y = -63;
            });
            // emojiNode.getComponent(sp.Skeleton).setAnimation(0, 'emoji_' + (Array(2).join(0) + Number(data.msg)).slice(-2), true)
        }
        if (cc.vv.UserManager.blockuids.indexOf(data.uid) >= 0) {
            msgNode.active = false
            emojiNode.active = false
        }
    }
    // 点击最近的聊天Item
    onClickItem(event) {
        let index = event.currentTarget._listId;
        let data = this.showData[index];
        if (this.isRemoveModel) {
            // 请求服务器删除聊天记录
            cc.vv.NetManager.send({ c: MsgId.DELETE_FRIEND_RECORD, frienduids: data.uid + "" });
        } else {
            // 打开点对点聊天
            cc.vv.EventManager.emit("OPEN_PRIVATE_CHAT_VIEW", { uid: data.uid });
        }
    }
    // 个人资料更新
    USER_INFO_CHANGE() {
        // 更新列表界面
        this.updateView();
    }
}
