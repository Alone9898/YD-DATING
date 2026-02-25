import TimeDownCpt from "../../../../_FWExpand/UI/TimeDownCpt";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KnockoutResultRegisterView extends cc.Component {


    @property(TimeDownCpt)
    timeDown: TimeDownCpt = null;

    private localData: any;
    private isJoin: boolean = false;

    onLoad() {
        this.timeDown.setTimeFormatStr("hh:mm:ss");
        this.timeDown.setCallback(this.updateView.bind(this));

        cc.find("btn_play", this.node).on("click", () => {
            Global.dispatchEvent("HALL_TO_GAME");
            cc.vv.NetManager.send({ c: MsgId.REQ_KNOCKOUT_JOIN, tn_id: this.localData.tn_id }, true);
        })
    }

    onInit(isJoin, data) {
        this.localData = data;
        this.isJoin = isJoin;
        this.updateView();
    }

    updateView() {
        let data = this.localData;
        // 更新游戏标题与图片
        cc.vv.UserConfig.setGameIconFrame(cc.find("game_icon", this.node).getComponent(cc.Sprite), data.gameid);
        cc.vv.UserConfig.setGameTitleFrame(cc.find("game_name", this.node).getComponent(cc.Sprite), data.gameid);
        // 时间更新
        cc.find("node_time/value", this.node).getComponent(cc.Label).string = Global.formatTime("hh:mm", data.start_time);
        // 标题
        cc.find("node_title/text_knockout_title_registered_en", this.node).active = this.isJoin;
        cc.find("node_title/text_knockout_title_cancel_en", this.node).active = !this.isJoin;
        // 状态
        cc.find("node_status/icon_knockout_join", this.node).active = this.isJoin;
        cc.find("node_status/icon_knockout_cancel", this.node).active = !this.isJoin;
        // 提示内容
        cc.find("node_start_hint", this.node).active = this.isJoin;
        cc.find("node_cancel_hint", this.node).active = !this.isJoin;;
        // 关闭所有按钮
        cc.find("btn_ok", this.node).active = false;
        cc.find("btn_play", this.node).active = false;
        // 如果是报名成功,显示倒计时
        let currTime = Math.ceil(new Date().getTime() / 1000);
        if (this.isJoin) {
            this.timeDown.timelife = data.start_time - currTime;
            // 如果游戏已经可以开始了,则显示开始按钮
            if (currTime > (data.start_time - data.ahead_time)) {
                cc.find("btn_play", this.node).active = true;
                // 关闭倒计时提示
                cc.find("node_start_hint", this.node).active = false;
            } else {
                cc.find("btn_ok", this.node).active = true;
            }
        } else {
            cc.find("btn_ok", this.node).active = true;
        }
    }

}
