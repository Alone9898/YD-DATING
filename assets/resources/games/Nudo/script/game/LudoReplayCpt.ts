const { ccclass, property } = cc._decorator;

@ccclass
export default class LudoReplayCpt extends cc.Component {

    @property(cc.Button)
    button: cc.Button = null;
    resolve: Function;
    @property(cc.Label)
    valueLabel: cc.Label = null;

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;


    set active(value) {
        this.node.active = value;
    }
    onLoad() {
        this.button.node.on("click", () => {
            cc.vv.NetManager.send({ c: facade.dm.msgCmd.LUDO_RE_PLAY });
        })
        let netListener = this.node.addComponent("NetListenerCmp");
        netListener.registerMsg(facade.dm.msgCmd.LUDO_RE_PLAY, this.LUDO_RE_PLAY, this);
    }
    async waitOpr(value, time) {
        this.valueLabel.string = value;
        this.progress.progress = 1;
        cc.tween(this.progress)
            .to(time, { progress: 0 })
            .start();
        return new Promise<boolean>((resolve, reject) => {
            this.resolve = resolve;
            this.unscheduleAllCallbacks();
            this.scheduleOnce(() => {
                resolve(false);
                this.progress.node.stopAllActions();
                this.progress.progress = 0;
                this.resolve = null;
            }, time)
        })
    }
    LUDO_RE_PLAY(msg) {
        if (msg.code != 200) return;
        if (msg.spcode && msg.spcode > 0) {
            if (msg.spcode == 652) {
                cc.vv.FloatTip.show(cc.vv.UserConfig.spcode2String(msg.spcode), true);
            }
            return;
        }
        // 成功重置
        if (this.resolve) {
            this.resolve(true);
        }
    }

}
