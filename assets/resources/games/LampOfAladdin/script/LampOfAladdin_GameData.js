/**
 * 游戏自己的gamedata
 */
let BigGate = [3,7,12,19]
cc.Class({
    extends: require("LMSlots_GameData_Base"),

    properties: {
        _collectData: null,
        _collectWildData: null,

        //客户端开启收集显示
        _isClientOpenCollectEnergy: true,
        //客户端开启收集显示
        _isClientOpenCollectWild: true,
    },

    /**
     * 请求子游戏数据51
     * @param rType 1能量免费777 2能量大关免费 3转盘 4bonus点击
     */
    reqSubGame(rType,data=null) {
        return new Promise(res=>{
            let req = {
                c:MsgId.SLOT_SUBGAME_DATA,
                gameid:this._gameId,
            };
            req.data = data || {};
            req.data.rtype = rType;

            let resp = (msg)=>{
                cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, resp, false, this);
                res(msg);
            }
            cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, resp, this);
            cc.vv.NetManager.send(req, true);
        });
    },

    OnRcvNetSpine:function(msg){
        if (msg.spcode && msg.spcode==967) {
            cc.vv.FloatTip.show("流程错误！！！");
            return;
        }

         this._super(msg);
    },

    SetSubGameData:function(data){
        this._subGame = data
    },

    GetSubGameData:function(){
        return this._subGame
    },

    //是否选择了wheel结果
    IsSelectSubGame:function(){
        let select = this._gameInfo?this._gameInfo.select:this._deskInfo.select;
        return select && select.state;
    },

    //获取游戏数据
    getGameInfo(){
        return this._gameInfo;
    },

    //获取收集数据
    getCollectData(){
        let gamedata = this.getGameInfo();
        if(gamedata){
            if(gamedata.collect){
                this._collectData = gamedata.collect;
            }
        }else
            gamedata = this.getDeskInfo();
            if(gamedata&&gamedata.collect){
                this._collectData = gamedata.collect;
            }
        return this._collectData;
    },

    //获取收集Wild数据
    getCollectWildData () {
        let gamedata = this.getGameInfo();
        if (!gamedata) {
            gamedata = this.getDeskInfo();
        }
        if(gamedata && gamedata.pool){
            this._collectWildData = gamedata.pool;
        }
        return this._collectWildData;
    },

    //清除收集数据
    clearCollectData(){
        let gameinfo = this.getGameDataInfo();
        if(gameinfo.collect){
            gameinfo.collect.open = 0;
        }
    },
    //清除免费数据
    clearFreeData(){
        this._gameInfo.allFreeCnt = 0;
    },

    //获取游戏数据
    getGameDataInfo(){
        let gamedata = cc.vv.gameData.getGameInfo();
        if(gamedata)
            return gamedata;
        gamedata = cc.vv.gameData.getDeskInfo();
        if(gamedata)
            return gamedata;
        return null;
    },

    //是否是大关卡
    isBigGate:function(idx){
        let res
        for(let i = 0; i < BigGate.length; i++){
            if(idx == BigGate[i]){
                res = true
            }
        }
        return res
    },

    //按节点播放spine
    playSpine:function(node,aniName,loop,endCall){
        if(node){
            node.active = true
            let ske = node.getComponent(sp.Skeleton)
            if(ske){
                ske.setAnimation(0,aniName,loop)
                ske.setCompleteListener(() => {
                    if(endCall){
                        endCall()
                    }
                })
            }
        }
        
    },

    //是否免费中
    isFreeTime:function(){
        let gameinfo = this.getGameDataInfo();
        if(gameinfo.allFreeCnt > 0 && gameinfo.freeCnt !=  gameinfo.allFreeCnt)
            return true;
        return false;
    },

    //是否免费结束
    isFinishFreeTime: function () {
        let gameinfo = this.getGameDataInfo();
        if(gameinfo.allFreeCnt > 0 && gameinfo.freeCnt == 0){
            return true;
        }
        return false;
    },

    //是否进入免费
    isEnterFreeGame:function(){
        let gameinfo = this.getGameDataInfo();
        if(gameinfo.freeCnt == gameinfo.allFreeCnt && gameinfo.allFreeCnt > 0){
           return true;
        }
        return false;
    },

    //是否开启收集能量
    isOpenCollectProgress: function () {
        let collect = this.getGameDataInfo().collect || cc.vv.gameData.getDeskInfo().collect;
        return collect && this.GetBetIdx() >= collect.min && this._isClientOpenCollectEnergy;
    },

    //设置客户是否显示能量收集
    setClientOpenCollectEnergy (isOpen) {
        this._isClientOpenCollectEnergy = isOpen;
    },

    //是否开启收集Wild
    isOpenCollectWild: function () {
        return this._isClientOpenCollectWild;
    },

    //设置客户是否显示Wild收集
    setClientOpenCollectWild (isOpen) {
        this._isClientOpenCollectWild = isOpen;
    },
});
