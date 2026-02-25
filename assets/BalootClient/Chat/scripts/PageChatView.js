// 全服聊天
cc.Class({
    extends: cc.Component,
    properties: {
        topNode: cc.Node,
        editBox: cc.EditBox,
        chatList: require('ListView'),
        scrollView: cc.ScrollView,
        _lastId: 0,         //最新消息id
        _sendTime: 0,       //上次发送时间
        _listData: [],    //消息数据
        btnSend: cc.Button,
        btnEmoji: cc.Button,
        btnVoice: cc.Button,
        emojiShowPos: cc.Node,
        popupEmojiPrefab: cc.Prefab,
    },
    onLoad() {
        // cc.log("PageChatView", "onLoad")
        this.chatData = [];
        this._listData = [];
        // 添加事件管理器
        this.eventListener = this.node.addComponent("EventListenerCmp");
        // 注册网络管理器
        this.netListener = this.node.addComponent("NetListenerCmp");
        // 按钮事件
        this.btnSend.node.on("click", this.onClickSend, this)
        this.btnEmoji.node.on("click", this.onClickEmoji, this)
        this.btnVoice.node.on("click", this.onClickVoice, this)
        //edit box event
        if (Global.isNative()) {
            this.editBox.node.on("editing-did-ended", this.onEditboxDidEnd, this)
        }
        this.editBox.node.on("text-changed",this.onEditBoxChange,this)
        // 关闭顶部
        this.topNode.active = false;
    },

    req() {
        cc.vv.NetManager.send({ c: MsgId.REQ_WORLD_CHAT, lastid: 0 }, true);
    },

    onEnable() {
        // 监听数据更新
        this.netListener.registerMsg(MsgId.REQ_WORLD_CHAT, this.REQ_WORLD_CHAT, this);
        // 自己发送消息结果
        this.netListener.registerMsg(MsgId.CHAT_SEND_MSG, this.CHAT_SEND_MSG, this);
        // 用户数据发生变化
        this.netListener.registerMsg(MsgId.CHAT_USER_INFO_UPDATE, this.CHAT_USER_INFO_UPDATE, this);
        // 接收到新消息
        this.netListener.registerMsg(MsgId.CHAT_NEW_MSG, this.CHAT_NEW_MSG, this);
        //
        cc.vv.NetManager.registerMsg(MsgId.UPDATE_PINMSG, this.UPDATE_PINMSG, this);
        cc.vv.NetManager.registerMsg(MsgId.CHAT_DEL_MSG, this.CHAT_DEL_MSG, this);
        cc.vv.NetManager.registerMsg(MsgId.CHAT_DELALL_MSG, this.CHAT_DELALL_MSG, this);

        // 用户信息更新
        this.eventListener.registerEvent("USER_INFO_CHANGE", this.USER_INFO_CHANGE, this);
        // 发送表情监听
        this.eventListener.registerEvent("REQ_CHAT_SEND", (args) => {
            // 发送表情
            if (args.detail.type == 1) {
                if (this.sendChatSeq(2, args.detail.key)) { }
            }
        }, this)
        // 请求加入聊天室
        cc.vv.NetManager.sendAndCache({ c: MsgId.REQ_WORLD_CHAT, lastid: 0 }, true);
    },
    onDisable() {
        // 通知离开聊天室
        cc.vv.NetManager.send({ c: MsgId.CHAT_LEAVE_ROOM }, true);
        // 关闭发送表情监听
        this.eventListener.clear();
        this.netListener.clear();
    },
    //如果信息有效就直接发送了
    onEditboxDidEnd() {
        let str = this.editBox.string;
        let filterStr = str.trim();
        if (str && str.length > 0 && filterStr && filterStr.length > 0) {
            if (this.sendChatSeq(1, filterStr)) {
                this.editBox.string = ""
            }
        }
    },

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
        
    },

    // 点击发送文本
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
    },
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
                // let k = cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR ? 1 : -1;
                node.position = endPos.add(cc.v2(50, -100))
                cc.tween(node).to(0.1, { opacity: 255, position: endPos.add(cc.v2(50, 0)) }).start();
                node.getComponent("PopupEmojiCmp").type = 1;
            }
        });
    },
    // 点击语音聊天
    onClickVoice() {
        if (cc.vv.UserManager.svip < 6) {
            // cc.vv.FloatTip.show(___("需开通VIP5,才可以使用语音功能"));
            return;
        }
    },
    // 发送数据
    sendChatSeq(tp, txt) {
        // let isShowZC = Global.getLocal("IS_SHOW_ZC");
        // if (!isShowZC) {
        //     cc.vv.PopupManager.addPopup("BalootClient/Setting/prefabs/PopupZCService", { scaleIn: true });
        //     return;
        // }
        //检测发送间隔时间是否超过5秒，防止刷数据
        let now = new Date().getTime();
        if (now - this._sendTime < 2000) {
            cc.vv.FloatTip.show(___("发送太频繁"))
            return false;
        }
        this._sendTime = now;
        // 发送请求
        cc.vv.NetManager.send({ c: MsgId.CHAT_SEND_MSG, content: txt, stype: tp });
        if (tp == 1) {
            StatisticsMgr.reqReport(ReportConfig.CHAT_SEND_TEXT, txt);
        }
        return true;
    },
    // 更新Item
    onUpdateItem: function (item, idx) {
        if (!this.chatData) return;
        if (!this.chatData[idx]) return;
        item.getComponent('PageChatItem').init(this.chatData[idx], item)
    },
    // 加入聊天室并且拿到最新的聊天数据
    REQ_WORLD_CHAT: function (msg) {
        if (msg.code != 200) return;
        this.chatDataList = msg.data.items
        this.updateView()
        this.node.stopAllActions();
        this.scheduleOnce(() => {
            this.chatList.scrollTo(this.chatData.length - 1, 0.05)
        }, 0.1);
    },
    // 设置数据
    updateView() {
        let tempData = Global.deepClone(this.chatDataList);
        tempData = tempData.filter((data) => { return cc.vv.UserManager.blockuids.indexOf(data.uid) < 0 })
        // 过滤房间邀请
        // tempData = tempData.filter((item) => { return item.stype != 5; });
        let limit = 50;
        if (tempData.length > limit) {
            this.chatData = tempData.splice(tempData.length - limit, limit);
        } else {
            this.chatData = tempData;
        }
        this.chatList.numItems = this.chatData.length;

        // 判断是否有顶部信息
        this.showPinmsg()
        // if (cc.vv.UserManager.pinmsg) {
        //     this.topNode.active = true;
        //     cc.find("sprite", this.topNode).active = false;
        //     cc.find("label", this.topNode).active = false;
        //     if (cc.vv.UserManager.pinmsg.text) {
        //         cc.find("label", this.topNode).active = true;
        //         cc.find("label", this.topNode).getComponent(cc.Label).string = cc.vv.UserManager.pinmsg.text;
        //     }
        //     if (cc.vv.UserManager.pinmsg.url) {
        //         cc.find("sprite", this.topNode).active = true;
        //         let tempSprite = cc.find("sprite", this.topNode).getComponent(cc.Sprite);
        //         cc.vv.ResManager.loadImage(cc.vv.UserManager.pinmsg.url, (err, res) => {
        //             if (res && cc.isValid(tempSprite)) {
        //                 tempSprite.spriteFrame = new cc.SpriteFrame(res);
        //             }
        //         });
        //     }
        //     this.chatList.getComponent(cc.Widget).top = 180;
        // } else {
        //     this.topNode.active = false;
        //     this.chatList.getComponent(cc.Widget).top = 0;
        //     // this.chatList.getComponent(cc.ScrollView).content.getComponent(cc.Layout).paddingTop = 20;
        // }

    },

    UPDATE_PINMSG(msg){
        if(msg.code == 200){
            this.showPinmsg()
        }
    },

    //置顶消息
    showPinmsg(){
        if(!this.topNode) return
        if (cc.vv.UserManager.pinmsg) {
            this.topNode.active = true;
            cc.find("sprite", this.topNode).active = false;
            cc.find("label", this.topNode).active = false;
            if (cc.vv.UserManager.pinmsg.text) {
                cc.find("label", this.topNode).active = true;
                cc.find("label", this.topNode).getComponent(cc.Label).string = cc.vv.UserManager.pinmsg.text;
            }
            if (cc.vv.UserManager.pinmsg.url) {
                cc.find("sprite", this.topNode).active = true;
                let tempSprite = cc.find("sprite", this.topNode).getComponent(cc.Sprite);
                cc.vv.ResManager.loadImage(cc.vv.UserManager.pinmsg.url, (err, res) => {
                    if (res && cc.isValid(tempSprite)) {
                        tempSprite.spriteFrame = new cc.SpriteFrame(res);
                    }
                });
            }
            this.chatList.getComponent(cc.Widget).top = 180;
        } else {
            this.topNode.active = false;
            this.chatList.getComponent(cc.Widget).top = 0;
            // this.chatList.getComponent(cc.ScrollView).content.getComponent(cc.Layout).paddingTop = 20;
        }
        this.chatList.getComponent(cc.Widget).updateAlignment()
    },

    // 发送消息结果
    CHAT_SEND_MSG(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        // this.chatData.push(msg.data.items[0]);
        this.chatDataList.push(msg.data.items[0])
        // 本地添加
        // this.chatList.numItems = this.chatData.length;
        this.updateView();
        this.chatList.scrollTo(this.chatData.length - 1);
    },
    // 收到新消息
    CHAT_NEW_MSG(msg) {
        if (msg.code != 200) return;
        // 判断是不是房间邀请
        // if (msg.data.items[0].stype == 5) {
        //     return;
        // }
        this.chatDataList.push(msg.data.items[0])
        this.updateView();
        this.chatList.scrollTo(this.chatData.length - 1);
    },
    // 删除一条世界聊天信息
    CHAT_DEL_MSG(msg) {
        if (msg.code != 200) return;
        let msgid = msg.msgid;
        for (let i = 0; i < this.chatDataList.length; i++){
            if(this.chatDataList[i].id == msgid){
                this.chatDataList.splice(i,1);
                break;
            }
        }
        this.updateView();
        this.chatList.scrollTo(this.chatData.length - 1);
    },
    // 清空聊天室
    CHAT_DELALL_MSG(msg) {
        if (msg.code != 200) return;
        this.chatDataList = [];
        this.updateView();
    },
    // 聊天数据更新
    CHAT_USER_INFO_UPDATE(msg) {
        if (msg.code != 200) return;
        if (!this.chatData) return;
        // 本地数据用户的变化
        for (const item of this.chatData) {
            // 更新玩家状态
            if (msg.userInfo && item.uid == msg.userInfo.uid) {
                item.avatarframe = msg.userInfo.avatarframe;
                item.name = msg.userInfo.playername;
                item.chatskin = msg.userInfo.chatskin;
                item.avatar = msg.userInfo.avatar;
            }
            // 更新房间状态
            if (msg.room && item.room &&
                msg.room.deskid && item.room.deskid &&
                msg.room.gameid && item.room.gameid &&
                msg.room.deskid == item.room.deskid &&
                msg.room.gameid == item.room.gameid
            ) {
                item.room.status = msg.room.status;
                item.room.users = msg.room.users;
            }
        }
        this.chatList.numItems = this.chatData.length;
    },
    // 个人资料更新
    USER_INFO_CHANGE() {
        this.updateView();
        this.chatList.scrollTo(this.chatData.length - 1);
    },
});
