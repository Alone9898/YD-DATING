// 社交系统 -- 最近一起玩的游戏玩家列表组件
cc.Class({
    extends: cc.Component,

    properties: {
        list: require("List"),
    },

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.SOCIAL_RECENT_PLAYER_LIST, this.SOCIAL_RECENT_PLAYER_LIST, this)
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_HANDLE_ADD, this.SOCIAL_FRIEND_HANDLE_ADD, this)
    },

    onEnable() {
        // 发送请求
        cc.vv.NetManager.sendAndCache({ c: MsgId.SOCIAL_RECENT_PLAYER_LIST }, true);
    },
    SOCIAL_RECENT_PLAYER_LIST(msg) {
        if (msg.code != 200) return;
        this.listData = msg.list;
        // 更新列表界面
        this.list.numItems = this.listData.length;
    },
    // 申请好友结果
    SOCIAL_FRIEND_HANDLE_ADD(msg) {
        if (msg.code != 200) return;
        // 修改本地数据 进行刷新
        for (const item of this.listData) {
            if (item.uid == msg.friend.uid) {
                item.isreq = 1;
            }
        }
        this.list.updateAll();
    },
    // 刷新Item
    onUpdateItemView(item, index) {
        let data = this.listData[index];
        cc.find("name", item).getComponent(cc.Label).string = data.playername;
        cc.find("level", item).getComponent(cc.Label).string = __("LV", ":", data.level);
        let rankData = cc.vv.UserConfig.getRank(data.score)
        cc.find("rank", item).getComponent(cc.Label).string = rankData.text;
        // cc.find("uid/value", item).getComponent(cc.Label).string = data.uid;
        cc.find("UserHead", item).getComponent("HeadCmp").setHead(data.uid, data.usericon);
        cc.find("UserHead", item).getComponent("HeadCmp").setAvatarFrame(data.avatarframe);
        cc.find("btn_addfriend", item).active = data.isfriend <= 0 && data.isreq <= 0;
        cc.find("label_ok", item).active = data.isreq > 0 && data.isfriend <= 0;
    },
    // 点击添加按钮
    onClickItem(event) {
        let index = event.currentTarget.parent._listId;
        let data = this.listData[index];
        // 发送请求
        cc.vv.NetManager.send({ c: MsgId.SOCIAL_FRIEND_HANDLE_ADD, frienduid: data.uid });
        StatisticsMgr.reqReport(ReportConfig.SOCIAL_RECENT_FRIEND_ADD);
    },

});
