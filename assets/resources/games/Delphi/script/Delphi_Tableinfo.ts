
const { ccclass, property } = cc._decorator;

@ccclass
export default class BlackJack21Tableinfo extends cc.Component {

    protected onLoad(): void {
        cc.find("layout/db_blind/lbl", this.node).getComponent(cc.Label).string =
            Global.FormatNumToComma((facade.dm.deskInfo.conf.score/2))+"/"+Global.FormatNumToComma(facade.dm.deskInfo.conf.score));
        cc.find("layout/db_decks/lbl", this.node).getComponent(cc.Label).string = "1";
        cc.find("layout/db_maxplayer/lbl", this.node).getComponent(cc.Label).string = facade.dm.deskInfo.conf.seat;
        cc.find("layout/db_maxtime/lbl", this.node).getComponent(cc.Label).string = facade.dm.deskInfo.delayTime + "s";
        // cc.find("layout/node_note/lbl", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(cc.vv.gameData.betcoin);
    }

}
