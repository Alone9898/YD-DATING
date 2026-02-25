const { ccclass, property } = cc._decorator;

@ccclass
export default class InviteBindCodeView extends cc.Component {

    @property(cc.Button)
    button: cc.Button = null;
    @property(cc.EditBox)
    inputEdit: cc.EditBox = null;

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.EVENT_FB_INVITE_BIND_CODE, this.EVENT_FB_INVITE_BIND_CODE, this);

        this.button.getComponent("ButtonGrayCmp").interactable = false;
        this.button.node.on("click", this.onClickSave, this)
    }

    onChangeText(text, editbox, customEventData) {
        let str = text.trim()
        this.button.getComponent("ButtonGrayCmp").interactable = str.length > 0;
    }

    onClickSave() {
        // 发送请求
        cc.vv.NetManager.send({ c: MsgId.EVENT_FB_INVITE_BIND_CODE, code: this.inputEdit.string.trim() });
    }

    EVENT_FB_INVITE_BIND_CODE(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        // 关闭修改窗口
        cc.vv.PopupManager.removePopup(this.node);
        // 弹出获取奖励弹窗
        Global.RewardFly(msg.rewards, this.button.node.convertToWorldSpaceAR(cc.v2(0, 0)));
    }

}
