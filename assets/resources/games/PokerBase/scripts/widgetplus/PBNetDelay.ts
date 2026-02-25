const { ccclass, property } = cc._decorator;

@ccclass
export default class PBNetDelay extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.SpriteAtlas)
    iconAtlas: cc.SpriteAtlas = null;
    @property(cc.Label)
    valueLabel: cc.Label = null;

    onLoad() {
        this.onUpdateNetDelay();
    }

    protected onEnable(): void {
        this.schedule(this.onUpdateNetDelay, 2);
    }

    protected onDestroy(): void {
        this.unschedule(this.onUpdateNetDelay);
    }

    onUpdateNetDelay() {
        let netDelay = Math.max(Math.floor(cc.vv.NetManager.getNetworkInterval()), 1)
        this.valueLabel.string = netDelay + "ms";
        let netLv = cc.vv.NetManager.getNetworkLevel();
        netLv = Math.max(netLv, 1)
        netLv = Math.min(netLv, 3)
        cc.log("NET DELAY:", netDelay, netLv)
        if (netDelay >= 300) {
            StatisticsMgr.reqReportNow(ReportConfig.NET_DELAY, netDelay);
        }
        this.icon.spriteFrame = this.iconAtlas.getSpriteFrame(netLv.toString());
        if (netLv == 1) {
            this.valueLabel.node.color = new cc.Color(255, 0, 0);
        } else if (netLv == 2) {
            this.valueLabel.node.color = new cc.Color(255, 198, 0);
        } else if (netLv == 3) {
            this.valueLabel.node.color = new cc.Color(12, 255, 0);
        }
    }


    // update (dt) {}
}
