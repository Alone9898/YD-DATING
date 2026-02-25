/**
 * 数据结构管理
 */
let BigGate = [2,7,13,20]
cc.Class({
    extends: require("LMSlots_GameData_Base"),

    properties: {
        _isFreeGame:false,
        _noCanOperate:false,
    },

    start () {

    },

    //重写deskInfo进入游戏获得的服务端数据
    init(deskInfo,gameId,gameJackpot){
        this._super(deskInfo,gameId,gameJackpot);
        this._energyData = this._deskInfo.energyData;
        this._bonusData = this._deskInfo.bonusData;
        this.needBet = this._energyData.minBetIdx;
        this._bonusCardInfo = this._deskInfo.bonusCardInfo;
     },

     //重写消息接收
     OnRcvNetSpine:function(msg){
        // msg = {"c":44,"lastBetCoin":1399100,"betcoin":10000,"wincoin":12200,"bonusCardInfo":{"idx_3":{"rtype":"MINI","num":90700},"idx_7":{"rtype":"MULT","num":20000}},"bonusData":{"open":false},"subGameInfo":{"subGamid":-1,"isMustJoin":-1},"addMult":1,"pooljp":0,"zjLuXian":[{"mult":1,"coin":200,"xlid":1,"card":3,"indexs":[1,2]},{"mult":1,"coin":200,"xlid":2,"card":3,"indexs":[1,2]},{"mult":1,"coin":200,"xlid":3,"card":3,"indexs":[1,2]},{"mult":1,"coin":200,"xlid":4,"card":3,"indexs":[1,2]},{"mult":1,"coin":200,"xlid":5,"card":3,"indexs":[1,2]},{"mult":1,"coin":200,"xlid":6,"card":3,"indexs":[1,2]},{"mult":1,"coin":500,"xlid":49,"card":4,"indexs":[11,12,13]},{"mult":1,"coin":500,"xlid":50,"card":4,"indexs":[11,12,13]}],"coin":1399100,"spcode":200,"spLuXian":0,"freeResult":{"freeInfo":{"scatter":2,"idxs":[6,9,10],"freeCnt":6,"addMult":1},"triFreeCnt":1},"spEffect":{"wincoin":12200,"kind":0},"resultCards":[3,1,12,5,10,2,12,7,2,2,4,4,1,6,4],"freeCnt":6,"mults":[10000,20000],"scatterZJLuXian":{"mult":1,"coin":10000,"indexs":[6,9,10]},"energyData":{"needCoins":200,"minBetIdx":1,"avgbet":0,"map_idx":0,"next_game":0,"totalCoin":22},"code":200,"freeWinCoin":12200,"allFreeCnt":6,"nextBetLine":{"spcode":500}}
        if(msg.code == 200){
            this._super(msg);
            this._energyData = msg.energyData;
            this._bonusData = msg.bonusData;
            this._deskInfo.restFreeCount = msg.freeCnt;
            this._deskInfo.allFreeCount = msg.allFreeCnt;
            this._bonusCardInfo = msg.bonusCardInfo;
        }
    },

    isOpenCollectProgress: function () {
        return this.GetBetIdx() >= this.needBet;
    },

    //清除大地图数据
    clearEnergyData(){
        if(this._energyData){
            this._energyData.next_game = 0;
        }
    },

    //是否地图大关免费
    isBigMapFree(){
        if(this._energyData&&this._energyData.next_game == 2)
            return true;
        return false;
    },

    //如果时地图大关结算
    isBigMapSettlement(){
        if(this._energyData&&this._energyData.next_game == 2){
            if(this._energyData.freeGame.rest != this._energyData.freeGame.all)
                return true;
        }
        return false;
    },

    //获取地图大关结算coin
    getBigMapTotalWinCoin(){
        return this._energyData.freeGame.totalWinCoin;
    },

    //获取bonus数据
    GetBonusData(){
        return this._bonusData;
    },

    //设置免费游戏脚本
    SetGameScript:function(fgame){
        this._freeGame = fgame
    },

    GetFreeGameScript:function(){
        return this._freeGame
    },

    //设置uimgr脚本
    SetUIMgrScript(uimgr){
        this._uiMgr = uimgr;
    },

    //获取uimgr脚本
    GetUIMgr(){
        return this._uiMgr;
    },

    //获取能量相关属性
    getEnergyData(){
        return this._energyData;
    },

    //是否旋转中
    isReelMove(){
        return this._isReelMove||this._autoTime>0;
    },

    //设置reel移动中
    setReelMove(ismove){
        this._isReelMove = ismove;
    },

    //是否免费游戏结束
    isFinishFreeGames: function () {
        return this._deskInfo.restFreeCount == 0 && this._deskInfo.allFreeCount > 0;
    },

    //是否触发普通免费
    isTriggerNormalFree: function(){
        return (this._deskInfo.allFreeCount > 0&&this._deskInfo.restFreeCount == this._deskInfo.allFreeCount);
    },

    //是否触发地图游戏
    isTriggerMap(){
        if(this._energyData){
            if(this._energyData.next_game == 1||
                (this._energyData.freeGame&&this._energyData.freeGame.all > 0&&this._energyData.freeGame.all == this._energyData.freeGame.rest))
                return true;
        }
    },

    //地图游戏大关进行中
    isBigMaping(){
        if(this._energyData){
            if(this._energyData.freeGame&&this._energyData.freeGame.all > 0&&this._energyData.freeGame.all != this._energyData.freeGame.rest)
            return true;
        }
    },

    //获取免费次数
    getAllFreeTimes(){
        return this._deskInfo.allFreeCount;
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

    

    //是否大关
    isBigGate:function(idx){
        let res
        for(let i = 0; i < BigGate.length; i++){
            if(idx == BigGate[i]){
                res = true
            }
        }
        return res
    },

    //是否bonus游戏
    isBonusGame(){
        let bonusdata = this._bonusData;
        if(bonusdata){
            if(bonusdata.open)
                return true;
            if(bonusdata.idxs&&bonusdata.idxs.length>0)
                return true;
        }
        
        return false;
    },

    //是否bonus游戏中(不包括触发的时候)
    isBonusGameing(){
        let bonusdata = this._bonusData;
        if(bonusdata){
            if(bonusdata.idxs&&bonusdata.idxs.length>0)
                return true;
        }
        
        return false;
    },

    //id 12金币通过idx获取rtype和num
    getCoinData(idx){
        if(this._bonusCardInfo){
            return this._bonusCardInfo['idx_'+idx];
        }
    },

    //获取bonuscardinfo
    getBonusCardInfo(){
        return this._bonusCardInfo;
    },

    //还原bonuscardinfo
    resetBounsCardInfo(bonuscardinfo){
        this._bonusCardInfo = bonuscardinfo;
    },

    //返回金币是否显示红色(大于5倍)
    isGoldCoinHong(num){
        return num/this.GetTotalBet()>=5;
    },

    getNeedBet(){
        return this._deskInfo.needbet;
    },
});
