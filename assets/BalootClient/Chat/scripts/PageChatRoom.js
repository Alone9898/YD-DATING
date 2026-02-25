// 全服聊天
cc.Class({
    extends: cc.Component,
    properties: {
        chatList: require('ListView'),
    },
    onLoad() {
        this.chatData = [];
        // 添加事件管理器
        this.eventListener = this.node.addComponent("EventListenerCmp");
        // 注册网络管理器
        this.netListener = this.node.addComponent("NetListenerCmp");
    },
    onEnable() {
        this.netListener.registerMsg(MsgId.VIP_ROOM_LIST, this.VIP_ROOM_LIST, this, false);
        this.netListener.registerMsg(MsgId.FRIEND_ROOM_CREATE, this.FRIEND_ROOM_CREATE, this, false);
        // this.netListener.registerMsg(MsgId.VIP_FAST_JOIN, this.VIP_FAST_JOIN, this, false);
        this.netListener.registerMsg(MsgId.FRIEND_ROOM_DISSOLVE, this.FRIEND_ROOM_DISSOLVE, this, false);
        // 请求数据
        cc.vv.NetManager.sendAndCache({ c: MsgId.VIP_ROOM_LIST, sort: 2 })


        this.unschedule(this.onRefreshList);
        this.schedule(this.onRefreshList, 10);
    },
    onDisable() {
        // 关闭发送表情监听
        this.eventListener.clear();
        this.netListener.clear();
        this.unschedule(this.onRefreshList);
    },

    VIP_ROOM_LIST(msg) {
        this.listData = msg.data;
        this.chatList.numItems = this.listData.length;
    },

    // 更新Item
    onUpdateItem: function (item, idx) {
        if (!this.listData) return;
        if (!this.listData[idx]) return;
        item.getComponent('PageChatRoomItem').updateView(this.listData[idx]);
    },

    // 点击刷新按钮
    onRefreshList() {
        cc.vv.NetManager.sendAndCache({ c: MsgId.VIP_ROOM_LIST, sort: 2 })
    }

});
