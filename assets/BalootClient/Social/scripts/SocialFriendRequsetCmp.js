// 社交系统 -- 好友申请列表
cc.Class({
    extends: cc.Component,

    properties: {
        list: require("List"),
    },

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_REQUEST_LIST, this.SOCIAL_FRIEND_REQUEST_LIST, this)
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_REQUEST_HANDLE, this.SOCIAL_FRIEND_REQUEST_HANDLE, this)
    },
    onEnable() {
        cc.vv.NetManager.sendAndCache({ c: MsgId.SOCIAL_FRIEND_REQUEST_LIST }, true);
    },
    // 刷新列表数据
    SOCIAL_FRIEND_REQUEST_LIST(msg) {
        if (msg.code != 200) return;
        this.listData = msg.datalist;
        // 更新列表界面
        this.list.numItems = this.listData.length;
    },
    // 同意或者拒绝好友返回
    SOCIAL_FRIEND_REQUEST_HANDLE(msg) {
        // 更新列表
        if (msg.code != 200) return;
        // 修改邮件的状态, 让邮件可以被删除
        let tempItem = null;
        for (const item of this.listData) {
            if (item.uid == msg.friend.uid) {
                tempItem = item;
            }
        }
        // 删除已经处理的
        this.list.aniDelItem(this.listData.indexOf(tempItem), (idx) => {
            this.listData.splice(idx, 1);
            this.list.numItems = this.listData.length;
        }, 3)
    },
    // 刷新Item
    onUpdateItemView(item, index) {
        let data = this.listData[index];
        cc.find("name", item).getComponent(cc.Label).string = data.playername;
        cc.find("level", item).getComponent(cc.Label).string = data.level + ":LV";
        cc.find("UserHead", item).getComponent("HeadCmp").setHead(data.uid, data.usericon);
        cc.find("UserHead", item).getComponent("HeadCmp").setAvatarFrame(data.avatarframe);
    },
    // 同意请求
    onClickItemAccept(event) {
        let index = event.currentTarget.parent._listId;
        let data = this.listData[index];
        cc.find("btn_accept", event.currentTarget.parent).getComponent("ButtonGrayCmp").interactable = false;
        cc.find("btn_refuse", event.currentTarget.parent).getComponent("ButtonGrayCmp").interactable = false;
        cc.vv.NetManager.send({
            c: MsgId.SOCIAL_FRIEND_REQUEST_HANDLE,
            frienduid: data.uid,
            type: 1,
        });
        StatisticsMgr.reqReport(ReportConfig.SOCIAL_MESSAGE_ADDFRIEND_AGREE);
    },
    // 拒绝请求
    onClickItemRefuse(event) {
        let index = event.currentTarget.parent._listId;
        let data = this.listData[index];
        cc.find("btn_accept", event.currentTarget.parent).getComponent("ButtonGrayCmp").interactable = false;
        cc.find("btn_refuse", event.currentTarget.parent).getComponent("ButtonGrayCmp").interactable = false;
        cc.vv.NetManager.send({
            c: MsgId.SOCIAL_FRIEND_REQUEST_HANDLE,
            frienduid: data.uid,
            type: 2,
        });
        StatisticsMgr.reqReport(ReportConfig.SOCIAL_MESSAGE_ADDFRIEND_REFUSE);
    },
});
