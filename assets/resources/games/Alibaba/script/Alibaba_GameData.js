/**
 * @author Cui Guoyang
 * @date 2021/9/24
 * @description
 */

cc.Class({
    extends: require('LMSlots_GameData_Base'),

    properties: {
        scatterNum: 0,
    },

    RegisterMsg(){
        this._super();

        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, this);
    },

    UnregisterMsg(){
        this._super();

        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, false, this);
    },

    //是否普通免费结束
    isNormalFreeOver:function(){
        return this._gameInfo.allFreeCnt > 0 && this._gameInfo.freeCnt === 0;
    },

    setIsBonusGame(val){
        this._isBonusGame = val;
    },

    isBonusGame(){
        return this._isBonusGame;
    },

    /**
     * 请求子游戏数据51
     * @param dt
     */
    reqSubGame(dt) {
        return new Promise(res=>{
            let req = {
                c:MsgId.SLOT_SUBGAME_DATA,
                gameid:this._gameId,
                data:dt
            };
            cc.vv.NetManager.send(req, true);

            this._subCallBack = res;
        });
    },

    onRcvSubGameAction(msg){
        if(this._subCallBack){
            this._subCallBack(msg);
            this._subCallBack = null;
        }
    },

    //bonus游戏管理
    setBonusGameMgr(bonusmgr){
        this._bonusMgr = bonusmgr;
    },

    //获取bonus游戏管理器
    getBonusGameMgr(){
        return this._bonusMgr;
    },

});