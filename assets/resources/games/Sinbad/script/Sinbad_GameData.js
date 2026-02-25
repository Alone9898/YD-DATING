
cc.Class({
    extends: require("LMSlots_GameData_Base"),

    properties: {

    },

    RegisterMsg(){
        this._super();

        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, this);
    },

    UnregisterMsg(){
        this._super();

        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, false, this);
    },

    //重写deskInfo进入游戏获得的服务端数据
    init(deskInfo,gameId,gameJackpot){
        this._collectGame = deskInfo.collectGame;
        if(this._collectGame){
            this._progressData = this._collectGame.progressData;
        }
        this._wildInfo = deskInfo.wildInfo;
        this._bonusGame = deskInfo.bonusGame;
        this._freeWinCoin =  deskInfo.freeWinCoin;

        this._super(deskInfo,gameId,gameJackpot);
    },

    //重写接收旋转消息
    OnRcvNetSpine:function(msg){
        if(msg.code == 200){
            this._collectGame = msg.collectGame;
            if(this._collectGame){
                this._progressData = this._collectGame.progressData;
            }
            this._wildInfo = msg.wildInfo;
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

    setCollectScript(val){
        this._collectScp = val;
    },
    getCollectScript(){
        return this._collectScp;
    },

    setMapScript(val){
        this._mapScp = val;
    },
    getMapScript(){
        return this._mapScp;
    },

    setWheelScript(val){
        this._wheelScp = val;
    },
    getWheelScript(){
        return this._wheelScp;
    },

    setBonusSlotsScript(val){
        this._bonusSlotsScp = val;
    },
    getBonusSlotsScript(){
        return this._bonusSlotsScp;
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

    getCollectGame(){
        return this._collectGame
    },
    setCollectGame(val){
        this._collectGame = val;
    },

    getProgressData(){
        return this._progressData;
    },
    setProgressData(val){
        this._progressData = val;
    },

    getWildInfo(){
        return this._wildInfo
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

    setWheelWin(val){
        this._wheelWin = val;
    },
    getWheelWin(){
        return this._wheelWin;
    },

    /**
     * 请求子游戏数据51
     * @param gameType
     */
    reqSubGame(dt) {
        return new Promise(res=>{
            this._subCallBack = res;

            let req = {
                c:MsgId.SLOT_SUBGAME_DATA,
                gameid:this._gameId,
                data:dt
            };
            cc.vv.NetManager.send(req, true);
        });
    },

    onRcvSubGameAction(msg){
        if(this._subCallBack){
            this._subCallBack(msg);
            this._subCallBack = null;
        }
    },

    // update (dt) {},
});
