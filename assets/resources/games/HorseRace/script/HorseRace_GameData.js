
cc.Class({
    extends: require("Table_GameData_Base"),

    properties: {
        _odds : [],
    },

    init:function(deskInfo,gameId){
        this._super(deskInfo,gameId);

        if( deskInfo.round && deskInfo.round.odds){
            this._odds = deskInfo.round.odds;
        }
        let bReconnect = (deskInfo.deskFlag == 1 || deskInfo.isReconnect)
        if(bReconnect){
            this._resultMsg = null;
        }
    },

    //阶段切换-进入下注阶段
    onRcvBettingStatu:function(msg){
        if(msg.code == 200){
            this._odds = msg.odds;
        }
        this._super(msg);
    },


    getOdds(){
        return this._odds;
    }

    // update (dt) {},
});
