
cc.Class({
    extends: require("LMSlots_GameData_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init(deskInfo,gameId,gameJackpot){
        this._bonusTrail = deskInfo.bonusTrail;
        this._bonusInfo = deskInfo.bonusInfo;
        this._jackpotGame = deskInfo.jackpotGame;

        this._freeWinCoin =  deskInfo.freeWinCoin

        this._super(deskInfo,gameId,gameJackpot);
    },

    OnRcvNetSpine:function(msg) {
        if (msg.code == 200) {
            this._bonusTrail = msg.bonusTrail;
            this._bonusInfo = msg.bonusInfo;
            this._jackpotGame = msg.jackpotGame;

            this._freeWinCoin = msg.freeWinCoin
        }

        this._super(msg);
    },

    _checkReconnect:function(){
        if(this._bReconnect){
            this._bonusTrail = this._deskInfo.bonusTrail;
            this._bonusInfo = this._deskInfo.bonusInfo;
            this._jackpotGame = this._deskInfo.jackpotGame;
            this._freeWinCoin =  this._deskInfo.freeWinCoin;

            cc.vv.gameData.GetSlotsScript().ReconnectNet();
        }
    },

    setPopupScript(scp){
        this._popupScp = scp;
    },
    getPopupScript(){
        return this._popupScp;
    },

    setCollectScript(scp){
        this._collectScp = scp;
    },
    getCollectScript(){
        return this._collectScp;
    },

    setPickScript(scp){
        this._pickScp = scp;
    },
    getPickScript(){
        return this._pickScp;
    },

    isSuperGame(){
        return this._isSuper;
    },
    setIsSuper(val){
        this._isSuper = val;
    },

    isFreeGame(){
        return this._isFree;
    },
    setIsFree(val){
        this._isFree = val;
    },

    isBonusGame(){
        return this._isBonus;
    },
    setIsBonus(val){
        this._isBonus = val;
    },

    getFreeWinCoin(){
        return this._freeWinCoin;
    },
    setFreeWinCoin(val){
        this._freeWinCoin = val;
    },

    getNeedBet(){
        return this._deskInfo.needBet;
    },

    getBonusTrail(){
        return this._bonusTrail;
    },

    getBonusInfo(){
        return this._bonusInfo;
    },

    getJackpotGame(){
        return this._jackpotGame;
    },
    setJackpotGame(val){
        this._jackpotGame = val;
    },

    // update (dt) {},
});
