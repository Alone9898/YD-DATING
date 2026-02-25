// 好友列表
cc.Class({
    extends: cc.Component,
    properties: {
        list: require("List"),
        recommListView: require("List"),
        labelNumber: cc.Label,
        onlineFrame: cc.SpriteFrame,
        offlineFrame: cc.SpriteFrame,
        searchInput: cc.EditBox,
        searchList: [],
        listData: [],
        recommendList: [],
        removeBtn: cc.Button,

        removeBtnOKFrame: cc.SpriteFrame,
        removeBtnRemoveFrame: cc.SpriteFrame,
    },
    onLoad() {
        this.isRemoveModel = false;
        this.isInviteModel = false;
        this.inviteUids = [];
        this.netListener = this.node.addComponent("NetListenerCmp");
        this.removeBtn.node.on("click", () => {
            this.isRemoveModel = !this.isRemoveModel;
            this.removeBtn.node.getComponent(cc.Sprite).spriteFrame = this.isRemoveModel ? this.removeBtnOKFrame : this.removeBtnRemoveFrame;
            this.updateView();
        }, this);
    },
    onEnable() {
        this.netListener.registerMsg(MsgId.SOCIAL_FRIEND_LIST, this.SOCIAL_FRIEND_LIST, this);
        this.netListener.registerMsg(MsgId.FRIEND_ROOM_INVITE, this.FRIEND_ROOM_INVITE, this);
        this.netListener.registerMsg(MsgId.SOCIAL_FRIEND_HANDLE_RECOMMEND, this.SOCIAL_FRIEND_HANDLE_RECOMMEND, this);
        this.netListener.registerMsg(MsgId.SOCIAL_FRIEND_HANDLE_REMOVE, this.SOCIAL_FRIEND_HANDLE_REMOVE, this);
        this.netListener.registerMsg(MsgId.RET_ADD_FRIENDS_NOTICE, this.RET_ADD_FRIENDS_NOTICE, this);
        this.netListener.registerMsg(MsgId.SOCIAL_FRIEND_HANDLE_ADD, this.SOCIAL_FRIEND_HANDLE_ADD, this);
        this.netListener.registerMsg(MsgId.SOCIAL_FRIEND_REQUEST_HANDLE, this.SOCIAL_FRIEND_REQUEST_HANDLE, this)
        this.searchInput.string = '';
        this.onSearchUserName("");
        // 发送请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.SOCIAL_FRIEND_LIST }, true);
        cc.vv.NetManager.sendAndCache({ c: MsgId.SOCIAL_FRIEND_HANDLE_RECOMMEND }, true);
        // 重置邀请好友记录
    },
    onDisable() {
        this.isRemoveModel = false;
        this.removeBtn.node.getComponent(cc.Sprite).spriteFrame = this.isRemoveModel ? this.removeBtnOKFrame : this.removeBtnRemoveFrame;
        // this.isInviteModel = false;
        this.netListener.clear();
    },
    // 好友列表数据
    SOCIAL_FRIEND_LIST(msg) {
        if (msg.code != 200) return;
        this.listData = msg.items;
        this.hadFriends = msg.hadFriends;
        this.maxFriends = msg.maxFriends;
        this.updateView();
    },
    // 推荐好友列表
    SOCIAL_FRIEND_HANDLE_RECOMMEND(msg) {
        if (msg.code != 200) return;
        this.recommendList = Global.deepClone(msg.recommendItems).splice(0, 3);
        this.recommendList.unshift({
            oprType: "add",
        })
        this.updateView();
    },
    // 添加好友结果
    SOCIAL_FRIEND_HANDLE_ADD(msg) {
        if (msg.code != 200) return;
        // 刷新推荐好友列表
        cc.vv.NetManager.send({ c: MsgId.SOCIAL_FRIEND_HANDLE_RECOMMEND }, true);
    },
    // 删除好友成功
    SOCIAL_FRIEND_HANDLE_REMOVE(msg) {
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
                if (this.searchList.indexOf(tempItem) >= 0) {
                    this.searchList.splice(this.searchList.indexOf(tempItem), 1);
                }
                this.hadFriends -= 1;
                this.hadFriends = Math.max(this.hadFriends, 0);
            }
            if (this.listData.length <= 0) {
                this.isRemoveModel = false;
            }
            // 提示删除成功
            cc.vv.FloatTip.show(___("删除成功"));
            this.updateView();
        }
    },
    // 被通知好友变动(你被某个好友删除了)
    RET_ADD_FRIENDS_NOTICE(msg) {
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
            this.updateView();
        }
    },
    // 处理好友请求结果
    SOCIAL_FRIEND_REQUEST_HANDLE(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        // 刷新推荐好友列表
        cc.vv.NetManager.send({ c: MsgId.SOCIAL_FRIEND_HANDLE_RECOMMEND }, true);
    },
    // 处理沙龙邀请发送结果
    FRIEND_ROOM_INVITE(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        // 加入统计
        // this.inviteUids.push(msg.frienduid);
        cc.vv.FloatTip.show(___("邀请发送成功!"));
        this.updateView();
    },
    // 更新界面显示
    updateView() {
        // 排序
        this.listData.sort((a, b) => { return b.badge - a.badge })
        this.listData.sort((a, b) => { return b.isonline - a.isonline })
        // if (this.isInviteModel) {
        // } else {
        //     this.listData.sort((a, b) => { return b.badge - a.badge })
        // }
        // 更新推荐好友列表
        this.recommListView.numItems = this.recommendList.length;
        // 更新所有好友列表
        if (this.searchList.length <= 0) {
            this.list.numItems = this.listData.length;
            this.list.scrollTo(0);
        } else {
            this.list.numItems = this.searchList.length;
        }
        this.labelNumber.string = __(this.hadFriends, "/", this.maxFriends);
    },
    // 刷新好友Item
    onUpdateItemView(item, index) {
        if (this.searchList.length <= 0) {
            this.updateItem(item, this.listData[index], this.isInviteModel);
        } else {
            this.updateItem(item, this.searchList[index], this.isInviteModel);
        }
    },
    // 更新推荐好友Item
    onUpdateRecommItemView(item, index) {
        let data = this.recommendList[index];
        if (data.oprType == "add") {
            cc.find("btn_add_friend", item).active = true;
            cc.find("vip", item).active = false;
            cc.find("btn_add", item).active = false;
            cc.find("btn_accept", item).active = false;
            cc.find("btn_refuse", item).active = false;
            cc.find("name", item).active = false;
            cc.find("online", item).active = false;
        } else if (data.re == 1) {
            cc.find("btn_add_friend", item).active = false;
            cc.find("btn_add", item).active = false;
            cc.find("btn_accept", item).active = true;
            cc.find("btn_refuse", item).active = true;
            cc.find("name", item).active = true;
            cc.find("online", item).active = true;
            this.updateItem(item, this.recommendList[index]);
        } else {
            cc.find("btn_add_friend", item).active = false;
            cc.find("btn_add", item).active = true;
            cc.find("btn_accept", item).active = false;
            cc.find("btn_refuse", item).active = false;
            cc.find("name", item).active = true;
            cc.find("online", item).active = true;
            this.updateItem(item, this.recommendList[index]);
        }
    },
    // 更新好友Item
    updateItem(item, data, isInvite) {
        cc.find("name", item).getComponent(cc.Label).string = data.playername;
        cc.find("UserHead", item).getComponent("HeadCmp").setHead(data.uid, data.usericon);
        cc.find("UserHead", item).getComponent("HeadCmp").setAvatarFrame(data.avatarframe || 0);
        cc.find("online", item).getComponent(cc.Sprite).spriteFrame = data.isonline == 1 ? this.onlineFrame : this.offlineFrame;
        let vip = data.vip || data.badge;
        cc.vv.UserConfig.setVipFrame(cc.find("vip", item).getComponent(cc.Sprite), vip);
        cc.find("vip", item).active = vip > 0;
        // 删除按钮
        let removeBtnNode = cc.find("btn_remove", item)
        if (removeBtnNode) {
            removeBtnNode.active = this.isRemoveModel;
        }
        let inviteBtnNode = cc.find("btn_invite", item);
        let inviteOk = cc.find("invite_ok", item);
        // 邀请按钮
        // if (isInvite && data.isonline == 1) {
        if(isInvite){
            if (this.inviteUids.indexOf(data.uid) >= 0) {
                if (inviteBtnNode) inviteBtnNode.active = false;
                if (inviteOk) inviteOk.active = true;
            } else {
                if (inviteBtnNode) inviteBtnNode.active = true;
                if (inviteOk) inviteOk.active = false;
            }
        } else {
            if (inviteBtnNode) inviteBtnNode.active = false;
            if (inviteOk) inviteOk.active = false;
        }
    },
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
    },
    // 点击添加好友
    onClickAddFriend(event) {
        let data = this.recommendList[event.currentTarget.parent._listId];
        if(data){
            cc.vv.NetManager.send({ c: MsgId.SOCIAL_FRIEND_HANDLE_ADD, frienduid: data.uid });
        }
        
    },
    // 点击同意好友申请
    onClickAcceptFriend(event) {
        let data = this.recommendList[event.currentTarget.parent._listId];
        cc.vv.NetManager.send({
            c: MsgId.SOCIAL_FRIEND_REQUEST_HANDLE,
            frienduid: data.uid,
            type: 1,
        });
    },
    // 点击拒绝好友申请
    onClickRefuseFriend(event) {
        let data = this.recommendList[event.currentTarget.parent._listId];
        cc.vv.NetManager.send({
            c: MsgId.SOCIAL_FRIEND_REQUEST_HANDLE,
            frienduid: data.uid,
            type: 2,
        });
    },
    // 点击删除好友
    onClickRemoveFriend(event) {
        let index = event.currentTarget.parent._listId;
        let data = null;
        if (this.searchList.length <= 0) {
            data = this.listData[index];
        } else {
            data = this.searchList[index];
        }
        if (data) {
            cc.vv.NetManager.send({ c: MsgId.SOCIAL_FRIEND_HANDLE_REMOVE, frienduids: [data.uid] }, true);
        }
    },
    // 点击邀请好友参加沙龙房间
    onClickInviteFriend(event) {
        let index = event.currentTarget.parent._listId;
        let data = null;
        if (this.searchList.length <= 0) {
            data = this.listData[index];
        } else {
            data = this.searchList[index];
        }
        if (data) {
            cc.vv.NetManager.send({
                c: MsgId.FRIEND_ROOM_INVITE,
                frienduid: data.uid,
                deskid: this.getTableid(),
                gameid: this.getGameid(),
            }, true);
        }
    },

    getTableid(){
        // return facade.dm.tableInfo.tableId
        if(cc.vv.gameData.deskInfo){
            return cc.vv.gameData.deskInfo.deskid
        }
        else{
            return cc.vv.gameData.getDeskInfo().deskid
        }
    },

    getGameid(){
        // return facade.dm.tableInfo.gameId
        if(cc.vv.gameData.deskInfo){
            return cc.vv.gameData.deskInfo.gameid
        }
        else{
            return cc.vv.gameData.getDeskInfo().gameid
        }
    }


});
