const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupPrivateChatView extends cc.Component {
    @property(cc.Node)
    headNode: cc.Node = null;
    @property(cc.Node)
    listNode: cc.Node = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.EditBox)
    editBox: cc.EditBox = null;
    @property(cc.Button)
    btnSend: cc.Button = null;
    @property(cc.Button)
    btnEmoji: cc.Button = null;
    @property(cc.Button)
    btnVoice: cc.Button = null;
    @property(cc.Node)
    emojiShowPos: cc.Node = null;
    @property(cc.Prefab)
    popupEmojiPrefab: cc.Prefab = null;

    private list: any;
    private headCmp: any;
    private chatDataList: any;
    private datalist: any;
    public uid: any;

    onLoad() {

        this.headCmp = this.headNode.getComponent('HeadCmp');
        this.list = this.listNode.getComponent('ListView');

        let netListener = this.node.addComponent("NetListenerCmp");
        let eventListener = this.node.addComponent("EventListenerCmp");
        // 按钮事件
        this.btnSend.node.on("click", this.onClickSend, this)
        this.btnEmoji.node.on("click", this.onClickEmoji, this)
        // 历史记录
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_MSG_LIST, this.SOCIAL_FRIEND_MSG_LIST, this)
        // 接受新消息
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_MSG_REV, this.SOCIAL_FRIEND_MSG_REV, this)
        // 用户数据变化
        eventListener.registerEvent("USER_INFO_CHANGE", this.USER_INFO_CHANGE, this);
        // 发送表情监听
        eventListener.registerEvent("REQ_CHAT_SEND", (args) => {
            // 发送表情
            if (args.detail.type == 2) {
                if (this.sendChatSeq(2, args.detail.key)) { }
            }
        }, this)
        //edit box event
        if (Global.isNative()) {
            this.editBox.node.on("editing-did-ended", this.onEditboxDidEnd, this)
        }

        this.editBox.node.on("text-changed",this.onEditBoxChange,this)
    }

    protected onDestroy(): void {
        cc.vv.NetManager.send({ c: MsgId.REQ_CHAT_FRIEND_EXIT, frienduid: this.uid });
    }
    // 初始化聊天对象UID
    init(uid) {
        this.uid = uid;
        // 请求聊天记录
        cc.vv.NetManager.sendAndCache({ c: MsgId.SOCIAL_FRIEND_MSG_LIST, uid: Global.playerData.uid, touid: this.uid });
    }
    // 聊天记录
    SOCIAL_FRIEND_MSG_LIST(msg) {
        if (msg.code != 200) return;
        this.nameLabel.string = msg.friend.playername;
        this.headCmp.setHead(msg.friend.uid, msg.friend.usericon)
        this.headCmp.setAvatarFrame(msg.friend.avatarframe)
        this.chatDataList = msg.datalist;
        this.updateView();
        this.list.scrollTo(this.datalist.length, 0);
    }
    // 收到一条新的私聊消息 可能是自己 也可能是其他人
    SOCIAL_FRIEND_MSG_REV(msg) {
        if (msg.code != 200) return;
        if (!msg.data.msg) return;
        if (this.uid == msg.data.uid || cc.vv.UserManager.uid == msg.data.uid) {
            // 更新本地聊天数据
            this.chatDataList.push(msg.data);
            this.updateView();
            this.list.scrollTo(this.datalist.length)
        }
    }

    USER_INFO_CHANGE() {
        this.updateView();
        this.list.scrollTo(this.datalist.length)
    }

    updateView() {
        let tempData = Global.deepClone(this.chatDataList);
        // 过滤屏蔽
        tempData = tempData.filter((data) => { return cc.vv.UserManager.blockuids.indexOf(data.uid) < 0 });
        // 生成本地数据
        this.datalist = [];
        for (const dataItem of tempData) {
            if (dataItem.msg) {
                this.datalist.push(dataItem);
            }
        }
        // 排序
        this.datalist.sort((a, b) => {
            return a.create_time - b.create_time;
        })
        // 设置数据显示
        this.list.numItems = this.datalist.length;
    }

    // 更新Item
    onUpdateItem(item, idx) {
        item.getComponent('PageChatItem').init(this.datalist[idx], item)
    }
    // 点击发送
    onClickSend() {
        let str = this.editBox.string;
        let filterStr = str.trim();
        if (str && str.length > 0 && filterStr && filterStr.length > 0) {
            if (this.sendChatSeq(1, filterStr)) {
                this.editBox.string = ""
            }
        } else {
            cc.vv.FloatTip.show(___("请输入聊天内容"));
            this.editBox.string = "";
        }
    }
    //如果信息有效就直接发送了
    onEditboxDidEnd() {
        let str = this.editBox.string;
        let filterStr = str.trim();
        if (str && str.length > 0 && filterStr && filterStr.length > 0) {
            if (this.sendChatSeq(1, filterStr)) {
                this.editBox.string = ""
            }
        }
    }
    // 点击表情
    onClickEmoji() {
        let emojiWorldPos = this.emojiShowPos.convertToWorldSpaceAR(cc.v2(0, 0))
        let endPos = cc.find("Canvas").convertToNodeSpaceAR(emojiWorldPos);
        cc.vv.PopupManager.addPopup(this.popupEmojiPrefab, {
            noMask: true,
            pos: endPos,
            noCloseHit: true,
            onShow: (node) => {
                node.opacity = 0;
                node.position = cc.v3(endPos).add(cc.v3(50, -100))
                cc.tween(node).to(0.1, { opacity: 255, position: endPos.add(cc.v2(50, 0)) }).start();
                node.getComponent("PopupEmojiCmp").type = 2;
            }
        });
    }
    // 发送数据
    sendChatSeq(tp, txt) {
        // 发送请求
        cc.vv.NetManager.send({
            c: MsgId.SOCIAL_FRIEND_MSG_SEND,
            type: tp,
            uid: Global.playerData.uid,
            touid: this.uid,
            msg: txt,
        });
        return true;
    }
    onEditBoxChange(editbox, customEventData) {
        let str = editbox.string.trim();
        // 只保留印度文,数字和英文
        let strList = str.split("");
        let newStr = [];
        for (let i = 0; i < strList.length; i++) {
            const ucode = strList[i].charCodeAt(0);
            if ((ucode > 127 && ucode < 0x0900) || ucode > 0x097F) {
                continue;
            }
            newStr.push(strList[i]);
        }
        str = newStr.join("");
        this.editBox.string = str;
        
    }
}
