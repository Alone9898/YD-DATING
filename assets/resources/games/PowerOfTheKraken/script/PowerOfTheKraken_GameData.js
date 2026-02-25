cc.Class({
    extends: require('LMSlots_GameData_Base'),

    properties: {},

    init(deskInfo,gameId,gameJackpot){
        this._superFree = deskInfo.superFree;
        this._jackpotGame = deskInfo.jackpotGame;
        this._bonusGame = deskInfo.bonusGame;
        this._boxInfo = deskInfo.boxInfo;
        this._freeWinCoin = deskInfo.freeWinCoin;

        this._super(deskInfo,gameId,gameJackpot);
    },

    OnRcvNetSpine:function(msg) {

        if (msg.code == 200) {
            this._superFree = msg.superFree;
            this._jackpotGame = msg.jackpotGame;
            this._bonusGame = msg.bonusGame;
            this._boxInfo = msg.boxInfo;
            this._freeWinCoin = msg.freeWinCoin;
        }
        this._super(msg);
    },

    GetCollectMinBet() {
        return this._deskInfo.needBet;
    },

    GetSuperFree(){
        return this._superFree;
    },

    IsSuper(){
        return this._isSuper
    },
    setIsSuper(val){
        this._isSuper = val;
    },

    IsFree(){
        return cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()
    },

    IsBonus(){
        return this._isBonusGame;
    },
    setIsBonus(val){
        this._isBonusGame = val;
    },

    // // 图标颜色变黑
    // setSymbolDark(bDark){
    //     this._symDark = bDark;
    // },
    //
    // getSymbolDark(){
    //     return this._symDark;
    // },

    GetJackpotGame(){
        return this._jackpotGame;
    },

    GetBonusGame(){
        return this._bonusGame;
    },

    GetBoxInfo(){
        return this._boxInfo;
    },

    GetGameTotalFreeWin(){
        return this._freeWinCoin;
    },
});
