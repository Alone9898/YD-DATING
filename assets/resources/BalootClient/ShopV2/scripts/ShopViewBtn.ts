const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Button)
export default class ShopViewBtn extends cc.Component {

    @property
    open: number = -1;

    onLoad() {
        let button = this.node.getComponent(cc.Button)
        if (button) {
            this.node.on('click', () => {
                if (this.open == 0) {
                    StatisticsMgr.reqReport(ReportConfig.SHOP_OPEN_DIAMOND);
                } else if (this.open == 1) {
                    StatisticsMgr.reqReport(ReportConfig.SHOP_OPEN_GOLD);
                } else if (this.open == 2) {
                    StatisticsMgr.reqReport(ReportConfig.SHOP_OPEN_VIP);
                }
                cc.vv.EventManager.emit("HALL_OPEN_SHOP", { open: this.open });
            })
        }
    }

}
