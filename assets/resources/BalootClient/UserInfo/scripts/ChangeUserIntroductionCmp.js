cc.Class({
    extends: cc.Component,

    properties: {
        inputEdit: cc.EditBox,
        button: cc.Button,
        numberLabel: cc.Label,
    },

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.UPDATE_USER_INFO, this.UPDATE_USER_INFO, this);

        this.button.getComponent("ButtonGrayCmp").interactable = false;
        this.button.node.on("click", this.onClickSave, this)
        this.numberLabel.string = "0/" + this.inputEdit.maxLength;
    },

    init(playerInfo) {
        if (playerInfo.memo) {
            this.inputEdit.string = playerInfo.memo;
            this.numberLabel.string = playerInfo.memo.length + "/" + this.inputEdit.maxLength;
        }
    },

    onChangeText(text, editbox, customEventData) {
        this.button.getComponent("ButtonGrayCmp").interactable = text.length > 0;
        this.numberLabel.string = text.length + "/" + editbox.maxLength;
    },

    onClickSave() {
        // 发送请求
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, introduction: this.inputEdit.string });
        StatisticsMgr.reqReport(ReportConfig.USERINFO_CHANGE_MEMO);
    },

    UPDATE_USER_INFO(msg) {
        if (msg.code != 200) return;
        // 关闭修改窗口
        cc.vv.PopupManager.removePopup(this.node);
    },
});
