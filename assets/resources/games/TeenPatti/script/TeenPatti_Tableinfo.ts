
const { ccclass, property } = cc._decorator;

@ccclass
export default class BlackJack21Tableinfo extends cc.Component {

    protected onLoad(): void {
        cc.find("layout/db_point/lbl", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(facade.dm.deskInfo.conf.score);
        cc.find("layout/db_maxBlinds/lbl", this.node).getComponent(cc.Label).string = facade.dm.deskInfo.conf.blindCnt;
        cc.find("layout/db_chaalLimit/lbl", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(facade.dm.deskInfo.conf.betLimit);
        cc.find("layout/db_potLimit/lbl", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(facade.dm.deskInfo.conf.potLimit);
    }

}
