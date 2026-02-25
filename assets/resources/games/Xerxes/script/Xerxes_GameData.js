
cc.Class({
    extends: require("LMSlots_GameData_Base"),

    properties: {

    },

    //重写deskInfo进入游戏获得的服务端数据
    init(deskInfo,gameId,gameJackpot){
        this._bonusGame = deskInfo.bonusGame;

        this._freeWinCoin =  deskInfo.freeWinCoin;

        this._super(deskInfo,gameId,gameJackpot);
    },

    //重写接收旋转消息
    OnRcvNetSpine:function(msg){
        if(msg.code == 200){
            this._bonusGame = msg.bonusGame;

            this._freeWinCoin = msg.freeWinCoin;
        }
        this._super(msg);
    },

    setPopupScript(val){
        this._popouScp = val;
    },
    getPopupScript(){
        return this._popouScp;
    },

    setBonusSlots(val){
        this._bonusSlotsScp = val;
    },
    getBonusSlots(){
        return this._bonusSlotsScp;
    },

    getFreeWinCoin(){
        return this._freeWinCoin;
    },
    setFreeWinCoin(val){
        this._freeWinCoin = val;
    },

    getBonusGame(){
        return this._bonusGame;
    },
    setBonusGame(val){
        this._bonusGame = val;
    },

    setIsFreeGame(val){
        this._isFreeGame = val;
    },
    isFreeGame(){
        return this._isFreeGame;
    },

    setIsBonusGame(val){
        this._isBonusGame = val
    },
    isBonusGame(){
        return this._isBonusGame
    },

    // update (dt) {},
});
