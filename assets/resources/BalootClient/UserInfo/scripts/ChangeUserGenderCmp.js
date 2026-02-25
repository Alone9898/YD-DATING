cc.Class({
    extends: cc.Component,

    properties: {
        toggleContainer: cc.ToggleContainer,
        button: cc.Button,
    },

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.UPDATE_USER_INFO, this.UPDATE_USER_INFO, this);
        this.button.node.on("click", this.onClickSave, this);
        this.button.getComponent("ButtonGrayCmp").interactable = true;
    },

    init(playerInfo) {
        this.sex = playerInfo.sex;
        this.updateToggleContainer(playerInfo.sex);
    },

    // 更新选着
    updateToggleContainer(gender) {
        this.toggleContainer.toggleItems[gender].isChecked = true;
    },

    onChange(toggle) {
        let index = this.toggleContainer.toggleItems.indexOf(toggle)
        // this.tempGender = index;
        // if (this.tempGender != this.sex) {
        // this.button.interactable = true;
        cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, gender: index });
        StatisticsMgr.reqReport(ReportConfig.USERINFO_CHANGE_SEX);
        // }
        //  else {
        //     this.button.getComponent("ButtonGrayCmp").interactable = false;
        // }
    },

    onClickSave() {
        // if (this.tempGender != undefined) {
        //     // 发送请求
        //     cc.vv.NetManager.send({ c: MsgId.UPDATE_USER_INFO, gender: this.tempGender });
        //     StatisticsMgr.reqReport(ReportConfig.USERINFO_CHANGE_SEX);
        // }
        cc.vv.PopupManager.removePopup(this.node);
    },

    UPDATE_USER_INFO(msg) {
        if (msg.code != 200) return;
        // 关闭修改窗口
        // cc.vv.PopupManager.removePopup(this.node);
    },
});
