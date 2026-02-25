const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnGameRoundCardsCpt extends cc.Component {

    private isShow = true;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.on("click", () => {
            this.isShow = !this.isShow;
            this.updateView();
            Global.dispatchEvent("SWITCH_ROOM_CARD_RECORD", this.isShow);
        }, this)
        this.updateView();
    }

    updateView() {
        cc.find("on", this.node).active = this.isShow;
        cc.find("off", this.node).active = !this.isShow;
    }

}
