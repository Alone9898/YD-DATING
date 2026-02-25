const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupZCService extends cc.Component {

    @property(cc.Button)
    acceptBtn: cc.Button = null;
    callback: Function;

    onLoad() {
        this.acceptBtn.node.on("click", this.onClickAccept, this);
    }

    onClickAccept() {
        this.callback && this.callback();
        Global.saveLocal("IS_SHOW_ZC", "1");
        cc.vv.PopupManager.removePopup(this.node);
    }

    setCallback(callback) {
        this.callback = callback;
    }

}
