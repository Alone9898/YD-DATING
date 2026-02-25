const { ccclass, property } = cc._decorator;

@ccclass
export default class ChatReportView extends cc.Component {
    data: any;
    @property(cc.Node)
    btnsNode: cc.Node = null;

    protected onLoad(): void {
        let netListener = this.node.addComponent("NetListenerCmp");
        // USER_REPORT_CHAT
        netListener.registerMsg(MsgId.USER_REPORT_CHAT, this.USER_REPORT_CHAT, this, false);


        for (let i = 0; i < this.btnsNode.children.length; i++) {
            const btnNode = this.btnsNode.children[i];
            let btnCpt = btnNode.getComponent(cc.Button);
            if (btnCpt) {
                btnCpt.node.on("click", () => {
                    if (!this.data) return;
                    cc.vv.NetManager.send({
                        stype: i + 1,
                        c: MsgId.USER_REPORT_CHAT,
                        msgid: this.data.id,
                        otheruid: this.data.uid,
                        content: this.data.content || this.data.msg,
                    });
                }, this)
            }
        }
    }

    onInit(data) {
        this.data = data;
    }


    USER_REPORT_CHAT(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        cc.vv.FloatTip.show(___("举报成功"));
        cc.vv.PopupManager.removePopup(this.node);

    }
    // update (dt) {}
}
