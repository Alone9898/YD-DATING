
cc.Class({
    extends: require("LMSlots_GameData_Base"),

    properties: {
        _slotsIndex:0,
        _slotsArray:[],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    //deskInfo进入游戏获得的服务端数据
    init(deskInfo,gameId,gameJackpot){

        this._bonusGame = deskInfo.bonusGame;

        this._freeWinCoin =  deskInfo.freeWinCoin

        this._super(deskInfo,gameId,gameJackpot);
    },

    //重写接收旋转消息
    OnRcvNetSpine(msg){
        if(msg.code == 200){

            this._bonusGame = msg.bonusGame;

            this._freeWinCoin = msg.freeWinCoin
        }

        this._super(msg);
    },


    _checkReconnectNet:function(){
        this._bonusGame = this._deskInfo.bonusGame;
        this._freeWinCoin = this._deskInfo.freeWinCoin

        this._manageScp.ReconnectNet();
    },

    setPopupScript(scp){
        this._popScp = scp;
    },
    getPopupScript(){
        return this._popScp;
    },

    setBonusScript(scp){
        this._bonusScp = scp;
    },
    getBonusScript(){
        return this._bonusScp;
    },

    setFreeScript(scp){
        this._freeScp = scp
    },
    getFreeScript(){
        return this._freeScp;
    },

    setManageScript(scp){
        this._manageScp = scp
    },
    getManageScript(){
        return this._manageScp;
    },

    addSlotsScript(script){
        this._slotsArray.push(script)
    },

    //获得游戏的slots脚本
    GetSlotsScript:function(){
        if(this._slotsIndex > 1 || this._slotsIndex < 0){
            this._slotsIndex = 0
        }
        return this._slotsArray[this._slotsIndex]
    },

    //将脚本转成免费游戏
    changeSlotsFree(){
        this._slotsIndex = 1
    },

    //将脚本转成普通游戏
    changeSlotsNormal(){
        this._slotsIndex = 0
    },


    setBonusGame(val){
        this._bonusGame = val;
    },
    getBonusGame(){
        return this._bonusGame;
    },

    getFreeWinCoin(){
        return this._freeWinCoin;
    },

    isBonusGame(){
        return this._isBonusGame;
    },
    setIsBonusGame(val){
        this._isBonusGame = val;
    },

    // update (dt) {},
});
