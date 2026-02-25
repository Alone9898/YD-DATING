import TimeDownCpt from "../../../../_FWExpand/UI/TimeDownCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KnockoutHintStartView extends cc.Component {


    @property(TimeDownCpt)
    timeDown: TimeDownCpt = null;

    private localData: any;

    onLoad() {
        this.timeDown.setTimeFormatStr("ss");
        this.timeDown.setCallback(() => {
            cc.vv.PopupManager.removePopup(this.node);
        });
        this.timeDown.setUpdateFunc((time, label) => {
            label.string = time > 0 ? `<b><color=#FFDA48>${time}</color>s</b>` : "";
        })
        cc.find("btn_play", this.node).on("click", () => {
            Global.dispatchEvent("HALL_TO_GAME");
            cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_JOIN, tn_id: this.localData.tn_id }, true);
        })
    }

    onInit(data) {
        this.localData = data;
        this.updateView();
    }

    updateView() {
        // 设置开始时间
        cc.find("node_time/value", this.node).getComponent(cc.Label).string = Global.formatTime("hh:mm", this.localData.start_time);
        // 设置倒计时
        this.timeDown.timelife = this.localData.start_time - Math.ceil(new Date().getTime() / 1000);
    }

}
