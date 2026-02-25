cc.Class({
    extends: cc.Component,

    properties: {
        inputEdit: cc.EditBox,
        button: cc.Button,
        // numberLabel: cc.Label,
    },

    onLoad() {
        StatisticsMgr.reqReport(ReportConfig.SETTING_FEEDBACK);

        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.EVENT_FEEDBACK, this.EVENT_FEEDBACK, this);

        this.button.getComponent("ButtonGrayCmp").interactable = false;
        this.button.node.on("click", this.onClickSave, this)
        // this.numberLabel.string = "0/" + this.inputEdit.maxLength;
    },

    init(playerInfo) {
        if (playerInfo.memo) {
            this.inputEdit.string = playerInfo.memo;
            // this.numberLabel.string = playerInfo.memo.length + "/" + this.inputEdit.maxLength;
        }
    },

    onChangeText(text, editbox, customEventData) {
        this.button.getComponent("ButtonGrayCmp").interactable = text.length > 0;
        // this.numberLabel.string = text.length + "/" + editbox.maxLength;
    },

    onClickSave() {
        // 发送请求
        cc.vv.NetManager.send({ c: MsgId.EVENT_FEEDBACK, content: this.inputEdit.string });
    },

    EVENT_FEEDBACK(msg) {
        if (msg.code != 200) return;
        // 关闭修改窗口
        cc.vv.PopupManager.removePopup(this.node);
    },
});
