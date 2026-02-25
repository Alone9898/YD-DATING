
cc.Class({
    extends: require("Table_BetAreas_Base"),

    properties: {
        totalBet:cc.Node,
    },

    init:function(){
        this._super();

        let total = 0;
        let roundInfo = cc.vv.gameData.getAreaInfo();
        roundInfo.bets.forEach(bet=>{
            total += bet
        });
        Global.setLabelString("lbl",this.totalBet,total);
    },

    //更新各个方位上的押注总额
    updateBetTotalNum:function(){
        this._super();

        let total = 0;
        let roundInfo = cc.vv.gameData.getAreaInfo();
        roundInfo.bets.forEach(bet=>{
            total += bet
        });
        Global.setLabelString("lbl",this.totalBet,total);
    }


    // update (dt) {},
});
