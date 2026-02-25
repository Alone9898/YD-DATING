import {getLevelProgress} from "../../../BalootClient/game_common/LevelCfg";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskCompleteHintCpt extends cc.Component {

    @property(cc.Button)
    button: cc.Button = null;

    @property(cc.Label)
    infoLabel: cc.Label = null;

    @property(cc.Node)
    nextNode: cc.Node = null;
    @property(cc.Label)
    nextLabel: cc.Label = null;
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    @property(cc.Label)
    progressLabel: cc.Label = null;

    private taskid: number;
    private type: number;
    private showPos: cc.Vec3;
    private hidePos: cc.Vec3;

    protected onLoad(): void {
        let netListener = this.node.addComponent("NetListenerCmp");
        this.button.node.on("click", this.onClickComplete, this);
        netListener.registerMsg(MsgId.EVENT_TASK_MAIN_REWARD, this.EVENT_TASK_MAIN_REWARD, this);
        this.button.interactable = false;


    }

    run(data) {
        let showH;
        if(data.nextcount == -1){
            this.nextNode.active = false;
            showH = 160;
        } else {
            this.nextNode.active = true;
            this.nextLabel.string = data.nextdesc;
            this.progressBar.progress = Math.min(1,data.count/data.nextcount);
            this.progressLabel.string = `${Global.FormatNumToComma(data.count)}/${Global.FormatNumToComma(data.nextcount)}`
            showH = 325;
        }

        let safeArea = cc.sys.getSafeAreaRect();
        let topY = cc.winSize.height / 2 - (cc.winSize.height - safeArea.height);
        this.showPos = cc.v3(0, topY - showH / 2);
        this.hidePos = cc.v3(0, cc.winSize.height / 2 + showH / 2);

        this.taskid = data.taskid;
        this.type = data.type;
        this.infoLabel.string = data.desc;
        this.node.position = this.hidePos;
        cc.tween(this.node)
            .to(0.3, { position: this.showPos }, { easing: "quadOut" })
            .call(() => { this.button.interactable = true; })
            .delay(8)
            .call(() => { this.button.interactable = false; })
            .to(0.3, { position: this.hidePos }, { easing: "quadIn" })
            .call(() => { this.node.destroy(); })
            .start();
    }

    onClickComplete() {
        // 停止关闭倒计时
        this.node.stopAllActions();
        // 请求完成任务
        cc.vv.NetManager.send({ c: MsgId.EVENT_TASK_MAIN_REWARD, taskid: this.taskid, type: this.type});
        StatisticsMgr.reqReport(ReportConfig.EVENT_REWARD_GET_SG, this.taskid);
    }

    EVENT_TASK_MAIN_REWARD(msg) {
        this.button.interactable = false;
        cc.tween(this.node)
            .delay(0.5)
            .to(0.3, { position: this.hidePos }, { easing: "quadIn" })
            .call(() => { this.node.destroy(); })
            .start();
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            return;
        }
        if (!!msg.rewards) {
            Global.RewardFly(msg.rewards, this.button.node.convertToWorldSpaceAR(cc.v2(0, 0)));
        }
    }

}
