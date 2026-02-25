
cc.Class({
    extends: require('LMSlots_GameData_Base'),

    properties: {
        _collectFreeState:false,//是否在收集的免费游戏中
    },

    //deskInfo进入游戏获得的服务端数据
    init(deskInfo,gameId,gameJackpot){
        this.selectData = deskInfo.select;
        this._collectFree = deskInfo.collectFree;
        this.needBet = deskInfo.collectFree.min;
        if(deskInfo.poolGame){
            this.wheelData = deskInfo.poolGame.wheel;
            this._poolList = deskInfo.poolGame.poolList;
        }
        this._super(deskInfo,gameId,gameJackpot);
        //设置收集进入的免费游戏的平均下注
        if(deskInfo.collectFree.startPrize){
            this.setCollectFreeGameStartPrize(deskInfo.collectFree.startPrize)
        }
     },

     //注册event
    RegisterEvent(){
        this._super();
        this._EventId.G_CLEOPATRA_UNLOCK_ENERGY = 'G_CLEOPATRA_UNLOCK_ENERGY'
    },

     OnRcvNetSpine:function(msg){
        //msg = {"c":44,"code":200,"betcoin":90000,"wincoin":0,"allFreeCnt":0,"pyramid":{"before":222,"info":{"idx_7":8,"idx_9":15,"idx_2":2,"idx_16":8,"idx_5":12,"idx_1":2,"idx_18":10,"idx_8":15,"idx_12":17,"idx_4":5},"after":316},"addMult":1,"mults":[10000,20000,30000,40000,50000,60000,70000,80000,90000],"lastBetCoin":353000,"coin":353000,"nextBetLine":{"spcode":500},"select":{"state":false},"spcode":200,"pooljp":0,"freeResult":{"freeInfo":[],"triFreeCnt":0},"scatterZJLuXian":{"indexs":[],"mult":0,"coin":0},"subGameInfo":{"subGamid":-1,"isMustJoin":-1},"zjLuXian":[],"freeCnt":0,"resultCards":[12,5,8,11,12,12,10,8,8,12,10,10,2,8,4,10,10,5,9,4],"freeWinCoin":0,"spEffect":{"wincoin":0,"kind":0},"spLuXian":0}
        if(msg.code == 200){
            this.selectData = msg.select; 
            this._deskInfo.select = msg.select;
            this.wheelData = msg.wheel;
            this._collectFree = msg.collectFree;
            this._poolList = msg.poolList;
            this._super(msg);
            //设置收集进入的免费游戏的平均下注
            if(msg.collectFree && msg.collectFree.startPrize){
                this.setCollectFreeGameStartPrize(msg.collectFree.startPrize)
            }
        }
    },

    _checkReconnect:function(){
        if(this._bReconnect){



            this.selectData = this._deskInfo.select;
            this._collectFree = this._deskInfo.collectFree;
            this.needBet = this._deskInfo.collectFree.min;
            if(this._deskInfo.poolGame){
                this.wheelData = this._deskInfo.poolGame.wheel;
                this._poolList = this._deskInfo.poolGame.poolList;
            }

            cc.vv.gameData.GetSlotsScript().ReconnectShow(true);
        }
    },


    //重写本轮旋转赢钱
    GetGameWin:function(){
        if(this._gameInfo)
            return this._gameInfo.wincoin
        return 0;
    },

    //获取poolList
    getPoolList(){
        return this._poolList;
    },

    //获取select数据
    getSelectData(){
        return this.selectData;
    },

    //设置top/bottom的脚本
    SetGameScript:function(fgame){
        this._freeGame = fgame
    },

    GetFreeGameScript:function(){
        return this._freeGame
    },

    SetCollectFreeScript:function(fgame){
        this._collectFreeGame = fgame
    },

    GetCollectFreeScript:function(){
        return this._collectFreeGame
    },

    //logic脚本
    SetGameLogicScript:function(logic){
        this._gameLogic = logic;
    },

    //获取logic脚本
    GetGameLogic:function(){
        return this._gameLogic;
    },

    //本轮旋转赢钱
    GetFreeWinCoin:function(){
        return this._gameInfo.freeWinCoin;
    },

    //获取baseFree
    GetBaseFree:function(){
        return this._gameInfo.baseFree;
    },

    //获取奖金游戏的wheel
    getWheel:function(){
        return this.wheelData;
    },

    //是否在免费游戏中
    isFreeGamesTime: function () {
        return this._deskInfo.allFreeCount > 0;
    },

    //是否在奖励游戏中
    isRewardGame: function(){
        if(this.selectData&&this.selectData.rtype == 4)
            return 4;
        return 0;
    },

    //清除select状态
    clearSelectState(){
        if(this.selectData&&this.selectData.state){
            this.selectData.state = false;
        }
    },

    //是否在操作中
    isOperateGame:function(){
        if(this.selectData&&this.selectData.state)
            return this.selectData.rtype;
        return 0;
    },

    isOpenCollectProgress: function () {
        return this.GetBetIdx() >= this.needBet;
    },

    //获取最低押注bet
    getMinBet(){
        return this.needBet;
    },

    //获取金字塔数据
    getPyramidNum(){
        if(this._gameInfo&&this._gameInfo.pyramid)return this._gameInfo.pyramid.after;
        if(this._collectFree)return this._collectFree.pyramid;
        return 0;
    },

    //获取金子塔数据(普通旋转时)
    getPyramidData(){
        if(this._gameInfo&&this._gameInfo.pyramid)
            return this._gameInfo.pyramid;
    },

    //获取断线重连数据
    getCollectFree(){
        return this._collectFree;
    },

    //是否触发普通免费 返回select type
    isTriggerNormalFree: function(){
        let enterfree = (this._gameInfo.freeResult.freeInfo.idxs&&this._gameInfo.freeResult.freeInfo.idxs.length>0);
        if(enterfree){
            if(this.selectData.state){
                return this.selectData.rtype;
            }
        }
        return 0;
    },

    //触发免费游戏
    isTriggerFree(){
        return (this._gameInfo.freeResult.freeInfo.idxs&&this._gameInfo.freeResult.freeInfo.idxs.length>0);
    },

    //是否是免费游戏中
    isFreeToPlay(){
        return (this._gameInfo.baseFree&&this._gameInfo.baseFree.type);
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

    //是否等待操作中
    isWaitOperate(){
        return this._isWait;
    },

    //设置等待操作
    setWaitOperate(iswait){
        this._isWait = iswait;
    },

    //从数组移除id
    removeValue(arr,val) {
        let index = this.indexOf(arr,val);
        if(index > -1){
            arr.splice(index,1);
        }
    },
    //清除上一局赢钱
    clearLastWinCoin(){
        if(this._gameInfo)this._gameInfo.wincoin = 0;
        this._bottomScp.SetWin(0);
    },

    //是否旋转中
    isReelMove(){
        return this._isReelMove||this._autoTime>0;
    },

    //设置reel移动中
    setReelMove(ismove){
        this._isReelMove = ismove;
    },
    
    indexOf(arr,val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) return i;
        }
        return -1;
    },

    //收集游戏进的免费游戏中 平均下注显示
    setCollectFreeGameStartPrize(num){
        this._startPrize = num;
    },

    getCollectFreeGameStartPrize(){
        return this._startPrize;
    }
});
