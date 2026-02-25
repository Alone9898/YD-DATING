/**
 * 牌桌信息
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(cc.find("btn_okay",this.node),this.onClickOkay,this);
    },

    start () {
        this.init()
    },

    init:function(){
        let perPoint = cc.vv.gameData.getDeskInfo().basecoin
        let maxWin = 80*6*perPoint
        let levelCoin = cc.vv.gameData.getDropCoin()
        let maxDelay = cc.vv.gameData.getMaxDelaytime()
        cc.find("db_point/lbl", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(perPoint);
        cc.find("db_decks/lbl", this.node).getComponent(cc.Label).string = "2";
        cc.find("db_maxwin/lbl", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(maxWin);
        cc.find("db_maxplayer/lbl", this.node).getComponent(cc.Label).string = "6";
        cc.find("node_note/lbl", this.node).getComponent(cc.Label).string = Global.FormatNumToComma(levelCoin);
        cc.find("db_maxtime/lbl", this.node).getComponent(cc.Label).string = maxDelay + "s";
    },

    onClickOkay(){
        this.node.destroy();
    }

    // update (dt) {},
});
