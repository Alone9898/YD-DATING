cc.Class({
    extends: cc.Component,

    properties: {
        inputEdit: cc.EditBox,
        // button: cc.Button,
        noDataNode: cc.Node,
        list: require("List"),
    },

    onLoad() {
        this.listData = [];
        // this.button.getComponent("ButtonGrayCmp").interactable = false;
        // this.button.node.on("click", this.onClickSave, this)
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.SOCIAL_FRIEND_HANDLE_ADD, this.SOCIAL_FRIEND_HANDLE_ADD, this);
        // 查找玩家
        netListener.registerMsg(MsgId.SOCIAL_SEARCH_USER, this.SOCIAL_SEARCH_USER, this);
    },

    onChangeText(text, editbox, customEventData) {
        // this.button.getComponent("ButtonGrayCmp").interactable = text.length > 0;
        cc.vv.NetManager.send({ c: MsgId.SOCIAL_SEARCH_USER, mobile: this.inputEdit.string.trim() });
    },

    // onClickSave() {
    //     // 发送请求
    //     cc.vv.NetManager.send({
    //         c: MsgId.SOCIAL_FRIEND_HANDLE_ADD,
    //         frienduid: this.inputEdit.string,
    //     });
    //     StatisticsMgr.reqReport(ReportConfig.SOCIAL_FRIEND_ADD);
    // },

    SOCIAL_FRIEND_HANDLE_ADD(msg) {
        if (msg.code != 200) return;
        // 关闭自己
        // cc.vv.PopupManager.removePopup(this.node);
        for (const item of this.listData) {
            if (item.uid == msg.friend.uid) {
                item.isreq = 1;
            }
        }
        this.updateView();
    },

    SOCIAL_SEARCH_USER(msg) {
        if (msg.code != 200) return;
        this.listData = msg.list;
        this.updateView();
    },

    updateView() {
        if (this.listData.length > 0) {
            this.noDataNode.active = false;
        } else {
            this.noDataNode.active = true;
        }
        this.list.numItems = this.listData.length;
    },


    // 刷新Item
    onUpdateItemView(item, index) {
        let data = this.listData[index];
        cc.find("name", item).getComponent(cc.Label).string = data.playername;
        let level = cc.vv.UserConfig.totalExp2Level(data.levelexp);
        cc.find("level", item).getComponent(cc.Label).string = `Lv.${level}`;
        cc.find("rank", item).getComponent(cc.Label).string = `ID:${data.uid}`;
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
        cc.vv.NetManager.send({ c: MsgId.SOCIAL_FRIEND_HANDLE_ADD, mobile: data.mobile });
        StatisticsMgr.reqReport(ReportConfig.SOCIAL_RECENT_FRIEND_ADD);
    },

});
