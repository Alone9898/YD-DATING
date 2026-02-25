const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupExchangeCode extends cc.Component {

    @property(cc.Button)
    button: cc.Button = null;

    @property(cc.EditBox)
    inputEdit: cc.EditBox = null;

    @property(cc.Button)
    ruleBtn: cc.Button = null;
    @property(cc.Prefab)
    rulePreafb: cc.Prefab = null;

    onLoad() {
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(MsgId.USER_EXCHANGE_CODE, this.USER_EXCHANGE_CODE, this);

        this.button.getComponent("ButtonGrayCmp").interactable = false;
        this.button.node.on("click", this.onClickSave, this)
        this.ruleBtn.node.on("click", this.onClickRule, this)
    }

    onChangeText(text, editbox, customEventData) {
        let str = text.trim()
        this.button.getComponent("ButtonGrayCmp").interactable = str.length > 0;
    }

    onClickSave() {
        // 发送请求
        cc.vv.NetManager.send({ c: MsgId.USER_EXCHANGE_CODE, code: this.inputEdit.string.trim() });
    }

    USER_EXCHANGE_CODE(msg) {
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

    onClickRule() {
        let endPos = cc.v3(0, -240);

        cc.vv.PopupManager.addPopup(this.rulePreafb, {
            noMask: true,
            pos: endPos,
            noCloseHit: true,
            onShow: (node) => {
                node.opacity = 0;
                node.position = endPos.add(cc.v3(0, 300))
                cc.tween(node).to(0.1, { opacity: 255, position: endPos }).start();
            }
        })
    }
}
