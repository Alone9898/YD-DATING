
const {ccclass, property} = cc._decorator;

@ccclass
export default class BlackJack21Tableinfo extends cc.Component {




    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(cc.find("btn_okay",this.node),this.onClickOkay,this);
    }

    start () {

    }

    init(){
        cc.find("layout/db_buyIn/lbl", this.node).getComponent(cc.Label).string =
            Global.FormatNumToComma(facade.dm.deskInfo.minBet) +"/"+ Global.FormatNumToComma(facade.dm.deskInfo.maxBet);
        cc.find("layout/db_decks/lbl", this.node).getComponent(cc.Label).string = "1";
        cc.find("layout/db_maxplayer/lbl", this.node).getComponent(cc.Label).string = "5";
        cc.find("layout/db_maxtime/lbl", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(facade.dm.deskInfo.delayTime||0);
        cc.find("layout/node_note/lbl", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(facade.dm.betcoin);
    }

    onClickOkay(){
        cc.vv.PopupManager.removePopup(this.node);
    }

    // update (dt) {}
}
