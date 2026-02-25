const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupReport extends cc.Component {

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    @property(cc.Button)
    reportBtn: cc.Button = null;
    private playerInfo: any;

    protected onLoad(): void {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.REPORT_USER, this.REPORT_USER, this);
        this.reportBtn.node.on("click", this.onClickReport, this);
    }

    onInit(playerInfo) {
        this.playerInfo = playerInfo;

        cc.find("UserHead", this.node).getComponent('HeadCmp').setHead(playerInfo.uid, playerInfo.usericon);
        cc.find("name", this.node).getComponent(cc.Label).string = playerInfo.playername;
        cc.find("uid", this.node).getComponent(cc.Label).string = "ID:" + playerInfo.uid;

        this.reportBtn.getComponent("ButtonGrayCmp").interactable = false;
    }

    onChangeText() {
        this.reportBtn.getComponent("ButtonGrayCmp").interactable = this.editBox.string.trim().length > 0;
    }

    onClickReport() {
        let content = this.editBox.string.trim();
        if (content.length <= 0) return;
        cc.vv.NetManager.send({
            c: MsgId.REPORT_USER,
            otheruid: this.playerInfo.uid,
            content: this.editBox.string,
            stype: 6,
        });
    }

    REPORT_USER(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        cc.vv.FloatTip.show(___("举报成功"), true);
        cc.vv.PopupManager.removePopup(this.node);
    }

}
