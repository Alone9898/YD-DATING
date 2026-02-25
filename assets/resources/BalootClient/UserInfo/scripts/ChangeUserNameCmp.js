cc.Class({
    extends: cc.Component,

    properties: {
        inputEdit: cc.EditBox,
        button: cc.Button,
    },

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.UPDATE_USER_INFO, this.UPDATE_USER_INFO, this);

        this.button.getComponent("ButtonGrayCmp").interactable = false;
        this.button.node.on("click", this.onClickSave, this)
    },

    init(playerInfo) {
        this.inputEdit.string = playerInfo.playername;
    },

    onChangeText(text, editbox, customEventData) {
        let str = text.trim();
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
        this.inputEdit.string = str;
        this.button.getComponent("ButtonGrayCmp").interactable = str.length > 0;
    },

    onClickSave() {
        // 发送请求
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, nickname: this.inputEdit.string.trim() });
        StatisticsMgr.reqReport(ReportConfig.USERINFO_CHANGE_NAME);
    },

    UPDATE_USER_INFO(msg) {
        if (msg.code != 200) return;
        // 关闭修改窗口
        cc.vv.PopupManager.removePopup(this.node);
    },
});
