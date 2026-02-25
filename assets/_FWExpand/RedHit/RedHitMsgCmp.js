// 聊天消息红点
cc.Class({
    extends: cc.Component,
    properties: {
        valueLabel: cc.Label,
    },
    onLoad() {
        this.uid = -1;
        cc.vv.RedHitManager.register(this);
    },
    onEnable() {
        // 更新自己的显示
        this.updateView();
    },
    // 设置UID
    setUid(uid) {
        this.uid = uid;
        this.updateView();
    },
    // 更新界面
    updateView() {
        let data = cc.vv.RedHitManager.data;
        // 取出 friendsmsg 的数据
        let friendsmsg = data.friendsmsg || [];
        // 找到对应UID的数据
        if (friendsmsg[this.uid] && friendsmsg[this.uid] > 0) {
            this.node.active = true;
            if (this.valueLabel) {
                this.valueLabel.string = friendsmsg[this.uid];
            }
        } else {
            this.node.active = false;
        }
    },
    onDestroy() {
        cc.vv.RedHitManager.unregister(this);
    },
});
