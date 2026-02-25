const { ccclass, property } = cc._decorator;

@ccclass
export default class PrivateChatSendView extends cc.Component {

    @property(cc.Node)
    pageEmojiNode: cc.Node = null;
    @property(cc.Node)
    tabbarNode: cc.Node = null;
    @property(cc.SpriteAtlas)
    emojiAtlas: cc.SpriteAtlas = null;


    @property(cc.Node)
    headNode: cc.Node = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Button)
    sendBtn: cc.Button = null;
    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    allEmojiList: string[];
    userinfo: any;

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_MSG_SEND, this.SOCIAL_FRIEND_MSG_SEND, this);


        this.sendBtn.node.on("click", this.onClickSend, this);
        this.allEmojiList = ["emoji_0", "emoji_2", "emoji_3"]
        let tabbar = this.tabbarNode.getComponent("Tabbar");
        tabbar.setChangeCallback(this.onTabbarChange.bind(this));
        for (let i = 1; i <= 6; i++) {
            // emojiType
            let btnNode = cc.find(`btn_${i}`, this.pageEmojiNode)
            btnNode.on("click", () => {
                // 进行消息发送
                if (cc.vv.UserManager.emojilist.indexOf(btnNode["emojiskin"]) >= 0) {
                    this.sendChatSeq(2, btnNode["emojiKey"])
                } else {
                    cc.vv.FloatTip.show(___("您还未获得此表情"));
                }
            });
        }
        for (const cpt of this.node.getComponentsInChildren("EmojiLockCpt")) {
            cpt.node.active = cc.vv.UserManager.emojilist.indexOf(cpt.key) < 0;
        }
    }

    init(userinfo) {
        this.userinfo = userinfo;
        let headCmp = this.headNode.getComponent("HeadCmp");
        headCmp.setHead(this.userinfo.uid, this.userinfo.avatar || this.userinfo.usericon);
        if (this.userinfo.avatarframe) {
            let _avatarframe = this.userinfo.avatarframe.toString();
            _avatarframe = _avatarframe.indexOf("avatarframe_") >= 0 ? _avatarframe : "avatarframe_0";
            headCmp.setAvatarFrame(_avatarframe);
        }
        this.nameLabel.string = this.userinfo.playername;

    }

    onTabbarChange(index, item, items) {
        let emojiskin = this.allEmojiList[index];
        for (let i = 1; i <= 6; i++) {
            let btnNode = cc.find(`btn_${i}`, this.pageEmojiNode)
            let emojiKey = `${emojiskin}_${i}`;
            btnNode["emojiskin"] = emojiskin;
            btnNode["emojiKey"] = `${emojiskin}_${i}`;
            btnNode.getComponentInChildren(cc.Sprite).spriteFrame = this.emojiAtlas.getSpriteFrame(emojiKey);
        }
    }


    SOCIAL_FRIEND_MSG_SEND(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        cc.vv.PopupManager.removePopup(this.node);
        cc.vv.FloatTip.show(___("发送私信成功"));
    }

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

    // 发送数据
    sendChatSeq(tp, txt) {
        // 发送请求
        cc.vv.NetManager.send({
            c: MsgId.SOCIAL_FRIEND_MSG_SEND,
            type: tp,
            uid: Global.playerData.uid,
            touid: this.userinfo.uid,
            replyid: !!this.userinfo.id ? this.userinfo.id : undefined,
            msg: txt,
        });
        return true;
    }

}
