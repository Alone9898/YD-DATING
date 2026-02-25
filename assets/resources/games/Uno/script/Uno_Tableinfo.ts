
const {ccclass, property} = cc._decorator;

@ccclass
export default class UnoTableinfo extends cc.Component {


    protected onLoad(): void {
        cc.find("layout/db_buyIn/lbl", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(facade.dm.deskInfo.conf.entry);
        // cc.find("layout/db_decks", this.node).active = false;
        cc.find("layout/db_maxplayer/lbl", this.node).getComponent(cc.Label).string = facade.dm.deskInfo.seat;
        cc.find("layout/db_maxtime/lbl", this.node).getComponent(cc.Label).string = facade.dm.deskInfo.delayTime + "s";
        cc.find("layout/node_note", this.node).active = false;
    }


    // update (dt) {}
}
