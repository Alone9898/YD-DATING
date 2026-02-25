/**
 * slot数据管理类
 */
let GameEventId = require("SlotMachine_GameEventId");
let GAME_ID = require("GameIdMgr");

cc.Class({
    extends: cc.Component,

    properties: {
        _gameId:null,   //游戏id
        _deskInfo:null, //进入游戏的数据结构
        _cfg:null,      //游戏配置的数据
        _gameInfo:null, //旋转一轮的数据返回
        _slotsScp:null, //slots的脚本
        _assetScp:null, //资源管理脚本
        _autoTime:0,   //自动模式的次数
        _respinTime:0, //重复旋转次数
        _topScp:null,   //top部分的脚本
        _bottomScp:null,    //bottom部分的脚本
        _puzzleData: null,  // 拼图数据
        _secBetVal:null,    //保存客户端移除的压住档位
        _reqStartTime:0,  //请求开始时间
        _reqTotalTime:0, //请求累计时间
        _reqTotalCount:0, //请求累计次数
        _autoPlayTime: 5,   // 自动模式下跳过流程的时间
        _serverRawMult: 0,   // 服务器原始下注数据
        _manualAutoPlayTime: 8, // 手动模式下跳过流程的时间
        _bAutoGame:false,   //是否处于自动游戏（包括自动最后一局）
        _newGameTipSpinCount: 0,    //推荐新游戏累计spin次数
        _newGameTipID: 0,   //首次到达八级或者以上玩家处于的游戏ID
        _isFirstPop:true,  //进入游戏首次弹弹窗
    },
    

    //deskInfo进入游戏获得的服务端数据
    init(deskInfo,gameId,gameJackpot){
        if (this._deskInfo) {
            return;
        }
        this._deskInfo = deskInfo
        // this._checkClientBet()

        //设置选中的档位
        this._serverRawMult = deskInfo.currmult;
        let selectBet = cc.vv.UserManager.getEnterSelectBet()
        if(selectBet){
            if(!this.GetFreeTime()){
                for(let i = 0; i < deskInfo.mults.length; i++){
                    if(deskInfo.mults[i] == selectBet){
                        this.SetBetIdx(i+1)
                        break
                    }
                }
            }
        } else if (cc.vv.UserManager.getEnterMaxBet()) {
            cc.vv.UserManager.setEnterMaxBet(null)
            if(!this.GetFreeTime()){
                this.SetBetIdx(deskInfo.mults.length)
            }
        }

        this._gameId = gameId
        this._gameJackpot = gameJackpot;  //奖池信息：{id:420, jp:[10,50,100,500], unlock:[10000,20000,50000,100000]}
        this._puzzleData = deskInfo.chipGame;
        this.clearLevelupData();

        this.RegisterEvent()
        this.RegisterMsg()

        if (cc.vv.UserManager.playedGameIds.indexOf(gameId) < 0) {
            cc.vv.UserManager.playedGameIds.push(gameId)
        }

        
    },

    //注册event
    RegisterEvent(){
        if(!this._EventId){
            this._EventId = GameEventId;
        }
        this._EventId.SLOT_STOP_MOVE = "SLOT_STOP_MOVE"
    },
    UnregisterEvent(){

    },

    //注册msg
    RegisterMsg(){
        cc.vv.NetManager.registerMsg(MsgId.GAME_LEVELROOM, this.OnRcvNetExitRoom, this); //退出房间
        cc.vv.NetManager.registerMsg(MsgId.SLOT_START, this.OnRcvNetSpine, this); //旋转一次
        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.OnRcvNetSubAction, this,true); //子游戏操作
        //监听等级提升
        cc.vv.NetManager.registerMsg(MsgId.PULL_LEVEL_UP_EXP, this.onRecvLevelupExp, this);
        //监听等级exp变化
        cc.vv.NetManager.registerMsg(MsgId.PULL_CHANGE_EXP, this.onRecvChangeExp, this);
        //财富改变（金币改变）
        cc.vv.NetManager.registerMsg(MsgId.MONEY_CHANGED, this.onRcvNetMoneyChanged, this);
        //主动同步金币（金币改变）
        cc.vv.NetManager.registerMsg(MsgId.SYNC_COIN, this.onRcvNetMoneyChanged, this);
        //主动同步引导任务
        cc.vv.NetManager.registerMsg(MsgId.PULL_GUIDETASK_UPDATEINFO, this.onRcvNetUpdateGuideTask, this);
        cc.vv.NetManager.registerMsg(MsgId.GAME_RECONNECT_DESKINFO, this.onRecvNetReconnectDeskinfo, this);
        
    },
    UnregisterMsg(){
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_LEVELROOM, this.OnRcvNetExitRoom);
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_START, this.OnRcvNetSpine);
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_LEVEL_UP_EXP, this.onRecvLevelupExp, false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_CHANGE_EXP, this.onRecvChangeExp, false,this);
        cc.vv.NetManager.unregisterMsg(MsgId.MONEY_CHANGED, this.onRcvNetMoneyChanged, false,this);
        cc.vv.NetManager.unregisterMsg(MsgId.SYNC_COIN, this.onRcvNetMoneyChanged, false,this);
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.OnRcvNetSubAction,true, this);
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_GUIDETASK_UPDATEINFO, this.onRcvNetUpdateGuideTask,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_RECONNECT_DESKINFO, this.onRecvNetReconnectDeskinfo);
        
    },

    //获取房间信息
    getDeskInfo:function(){
        return this._deskInfo
    },

    getGameInfo:function() {
        return this._gameInfo;
    },

    //获取奖池信息
    getGameJackpot:function(){
        return this._gameJackpot;
    },

    //设置top/bottom的脚本
    SetTopBottomScript:function(top,bottom){
        this._topScp = top
        this._bottomScp = bottom
    },

    GetTopScript:function(){
        return this._topScp
    },

    GetBottomScript:function(){
        return this._bottomScp
    },

    //设置slots的脚本
    //可将消息传递到slot中
    SetSlotsScript:function(scp){
        this._slotsScp = scp
    },

    //获得游戏的slots脚本
    GetSlotsScript:function(){
        return this._slotsScp
    },

    //设置资源存放脚本
    SetAssetScript:function(scp){
        this._assetScp = scp
    },
    GetAssetScript:function(){
        return this._assetScp
    },

    //获取assetbase中的预制
    GetPrefabByName:function(name){
        return this._assetScp.GetPrefabByName(name)
    },

    //获取图集
    GetAtlasByName:function(name){
        return this._assetScp.GetAtlasByName(name)
    },

    //获取spriteframe
    GetSpriteFrameByName:function(name){
        return this._assetScp.GetSpriteByName(name)
    },

    //获取font
    GetFontByName:function(name){
        return this._assetScp.GetFontByName(name)
    },

    //获取当前游戏id
    getGameId(){
        return this._gameId
    },

    //获取游戏配置:就是配置了symbols的文件 一般命名 ***_Cfg.js
    getGameCfg(){
        if(!this._cfg){
            let cfgName = cc.vv.GameDataCfg.getGameData(this.getGameId())
            this._cfg = require(cfgName.cfgCmp)
        }
        return this._cfg
    },

    //获取游戏目录
    getGameDir(){
        let gameCfg = cc.vv.GameItemCfg[this.getGameId()]
        if(gameCfg){
            return cc.js.formatStr('games/%s/',gameCfg.name)
        } 
    },

    //记录slot的状态
    SetSlotState(stateStr){
        this._slotStateStr = stateStr
    },
    GetSlotState(){
        return this._slotStateStr || 'idle'
    },


    //设置自己拥有的金币
    //设置后，自己需要在合适的时机刷新金币显示
    setCoins(val,bRefresh){
        this._deskInfo.user.coin = val
        cc.vv.UserManager.coin = val
        if (bRefresh) {
            this.RefushMyCoin()
        }
    },

    //获取我的金币
    GetCoin(){
        return this._deskInfo.user.coin
    },

    //增减金币
    AddCoin(nVal, bRefresh=false){
        let nCoin = this.GetCoin()
        this.setCoins(nCoin+nVal)
        if (bRefresh) {
            this.RefushMyCoin()
        }
    },

    //刷新金币显示
    RefushMyCoin(){
        this._topScp.ShowCoin()
    },

    //获取我的押注额
    GetTotalBet(){
        if(this._bAllin){
            return this._allinBet
        }
        //因为客户端是从0开始，所以-1
        let betIdx = this.GetBetIdx()
        return this._deskInfo.mults[betIdx-1];
    },

    //获取押注序号
    GetBetIdx(){
        return this._deskInfo.currmult
    },

    //将押注额度转换成押注等级
    //押注等级是从1开始，和服务端保持一致
    BetToIdx(betNum){
        let lv 
        for(let i = 0; i < this._deskInfo.mults.length; i++){
            if(this._deskInfo.mults[i] >= betNum){
                lv = i
                break
            }
        }
        return lv+1
    },

    /**
     * 
     * @param {*} idx 1开始
     * @returns 
     */
    IdxToBet(idx){
        return this._deskInfo.mults[idx-1];
    },

    //设置押注序号
    // 1开始
    SetBetIdx(val){
        this._deskInfo.currmult = val
        cc.vv.gameData._serverRawMult = val;
        cc.vv.UserManager.setEnterSelectBet(null);
    },

    //改变押注
    //bAdd:true 正向，反之负向
    ChangeBetIdx(bAdd){

        let betMaxIdx = this.GetBetMaxIdx()
        let betMinIdx = this.GetBetMinIdx()
        
        if(bAdd){
            this._deskInfo.currmult += 1
            if(this._deskInfo.currmult > betMaxIdx){
                this._deskInfo.currmult = betMinIdx
            }
        }
        else{
            this._deskInfo.currmult -= 1
            if(this._deskInfo.currmult < betMinIdx){
                this._deskInfo.currmult = betMaxIdx
            }
        }
        this._serverRawMult = this._deskInfo.currmult;
        cc.vv.UserManager.setEnterSelectBet(null);
    },
    
    GetBetMinIdx:function(){
        
        let betMinIdx = 1
        if(this._deskInfo.betRange){
           
            betMinIdx = this._deskInfo.betRange[0]
        }
        return betMinIdx
    },

    GetBetMaxIdx:function(){
        let mutllist = this.GetBetMults()
        let betMaxIdx = mutllist.length
       
        if(this._deskInfo.betRange){
            betMaxIdx = this._deskInfo.betRange[1]

        }
        return betMaxIdx
    },

    //当前场次最大押注额
    GetMaxBetVal:function(){
        let idx = this.GetBetMaxIdx()
        return this._deskInfo.mults[idx-1];
    },

    //押注列表
    GetBetMults:function(){
        return this._deskInfo.mults
    },

    //当前是否是最大押注额
    IsMaxBet:function(){
        let betIdx = this.GetBetIdx()
        let maxIdx = this.GetBetMaxIdx()

        return betIdx == maxIdx
    },
    //当前是否是最小押注额
    IsMinBet:function(){
        let betIdx = this.GetBetIdx()
        let minIdx = this.GetBetMinIdx()

        return betIdx == minIdx
    },

    //3级前客户端只显示第一个档位。服务端会发2个，
    //如果已经选择了最高档位就不删除了，因为3级就不出现加注引导
    _checkClientBet:function(){
        let lv = cc.vv.UserManager.getCurLv()
        
        if(lv < Global.SYS_OPEN.GUIDE_CHANGEBET && this._deskInfo.mults.length == 2 ){
            this._secBetVal = this._deskInfo.mults.pop()
        }
    },

    //本轮旋转赢钱
    GetGameWin:function(){
        return this._gameInfo.wincoin
    },

    //自动模式的次数
    GetAutoModelTime:function(){
        return this._autoTime
    },
    SetAutoModelTime:function(val){
        this._autoTime = (val>0?val:0)
    },

    isAutoGame:function(){
        return this._bAutoGame
    },
    SetAutoGame:function(bAuto){
        this._bAutoGame = bAuto
    },

    //重复旋转respin次数
    GetRespinTime:function() {
        return this._respinTime;
    },
    SetRespinTime:function(val) {
        this._respinTime = (val>0?val:0)
    },

    //获取剩余免费次数
    GetFreeTime:function(){
        return this._deskInfo.restFreeCount
    },
    SetFreeTime:function(val){
        this._deskInfo.restFreeCount = val
    },

    //获取total free
    GetTotalFree:function(){
        return this._deskInfo.allFreeCount
    },
    SetTotalFree:function(val){
        return this._deskInfo.allFreeCount = val
    },

    //免费游戏总共赢钱.断线重连免费赢钱
    GetTotalFreeWin:function(){
        return this._deskInfo.freeWinCoin;
    },

    //免费游戏总共赢钱.当前局数免费赢钱
    GetGameTotalFreeWin:function(){
        return this._gameInfo.freeWinCoin;
    },

    //获取100次旋转送卡包活动信息
    GetSpinePackFloat:function(){
        return this._deskInfo.spinInfo
    },
    SetSpinePackFloat:function(val){
        this._deskInfo.spinInfo = val
    },

    //增加免费次数，并刷新显示
    AddTotalFreeTime(add){
        let old = this.GetTotalFree()
        let rest = this.GetFreeTime()
        let newTotalNum = old + add
        let newRestNum = rest + add
        this.SetTotalFree(newTotalNum)
        this.SetFreeTime(newRestNum)
        this._bottomScp.UpdateFreeTime(newTotalNum,newTotalNum-newRestNum)
    },

    //播放公共音效
    //path目录：slots_common/SlotRes/audio(默认)
    //如果自己传了path则使用传人的
    PlayCommAudio:function(fileName,endCall,path){
        if(!path){
            path = "slots_common/SlotRes/"
        }
        cc.vv.AudioManager.playEff(path,fileName,true,false,endCall)
    },


    //清理一轮游戏的数据
    //每次旋转开始的时候清理
    ClearOneRoundData(){

    },

    //检查奖池是否解锁
    // return true 锁住的，反之
    IsPrizePoolLock:function(prizeType){
        let res = true
        let jpData = this.getGameJackpot()
        if(jpData){
            let lockNum = jpData.unlock[prizeType]
            let curBet = this.GetTotalBet()
            res = curBet < lockNum;
        }
        return res
    },

    //转一次
    //autoVal:服务端打点用all-总次数，rmd-剩余次数
    ReqSpin:function(curBetIdx,autoVal,bAllin){
        //已经准备离开游戏了
        if(this._bSendingLevel) return

        let req = {c: MsgId.SLOT_START};
        req.betIndex = curBetIdx
        if(autoVal){
            req.bAuto = JSON.stringify(autoVal)
        }
        if(bAllin){
            req.allin = 1
        }
        
        cc.vv.NetManager.send(req,true);
        this._sendInter = 0
        this._reqStartTime = new Date().getTime()
    },

    OnRcvNetSpine:function(msg){
        this._sendInter = null
        this._bReconnect = null
        if(msg.code == 200){
            //msg = {"resultCards":[1,7,10,6,15,1,6,10,6,7,1,6,8,6,7],"c":44,"code":200,"nextBetLine":{"spcode":500},"betcoin":10000,"wincoin":9110000,"scatterZJLuXian":{"mult":0,"coin":0,"indexs":[]},"addMult":1,"allFreeCnt":0,"coin":96637000,"bonusGame":{"cards":[19,7,10,13,13,19,15,14,14,3,1,9,13,4,15,1,14,12,15,5,1,11,14,11,13],"free":[],"open":1,"wincoin":9110000,"coins":[{"idx":22,"num":1200000},{"idx":24,"num":1200000},{"idx":18,"num":1000000},{"idx":4,"num":800000},{"idx":5,"num":800000},{"idx":13,"num":800000},{"idx":25,"num":800000},{"idx":8,"num":600000},{"idx":9,"num":600000},{"idx":17,"num":600000},{"idx":23,"num":600000},{"idx":7,"num":20000},{"idx":15,"num":40000},{"idx":19,"num":50000}]},"lastBetCoin":78417000,"spcode":200,"spEffect":{"wincoin":0,"kind":0},"mults":[10000,20000,30000,50000,100000],"pooljp":0,"zjLuXian":[],"spLuXian":0,"freeCnt":0,"freeWinCoin":0,"subGameInfo":{"subGamid":-1,"isMustJoin":-1},"freeResult":{"freeInfo":[],"triFreeCnt":1}}
            // msg = {"select":true,"resultCards":[9,8,3,9,9,9,4,2,15,9,9,4,5,2,2],"code":200,"zjLuXian":[],"betcoin":10000,"wincoin":0,"lastBetCoin":3361522000,"subGameInfo":{"subGamid":-1,"isMustJoin":-1},"mults":[10000,20000,30000,50000,100000,150000],"coin":3361522000,"spLuXian":0,"allFreeCnt":0,"spcode":200,"bonusGame":{"open":0},"freeCnt":0,"pooljp":0,"scatterZJLuXian":{"mult":0,"coin":0,"indexs":[8,14,15]},"nextBetLine":{"spcode":500},"c":44,"spEffect":{"wincoin":0,"kind":0},"freeWinCoin":0,"addMult":1,"freeResult":{"freeInfo":{"idxs":[8,14,15],"scatter":2,"addMult":1,"freeCnt":0},"triFreeCnt":1}}
            // msg = {"freeCnt":0,"c":44,"code":200,"gameid":490,"wincoin":0,"transCards":[0,6,0,1,0,9,6,10,13,1,7,6,10,13,1,14,6,5,11,10,14,4,5,11,10],"spEffect":{"wincoin":0,"kind":0},"lastBetCoin":30188602526,"scatterZJLuXian":{"indexs":[],"mult":0,"coin":0},"bonus":{"curmult":12,"frames":[19,23],"randomAdd":[]},"allFreeCnt":0,"coin":30188602526,"betcoin":900000,"mults":[10000,20000,50000,100000,150000,200000,400000,500000,600000,700000,800000,900000,1500000,2000000,2500000,3000000,3500000,4000000,5000000,6000000,7000000,8000000,9000000,10000000,11000000],"nextBetLine":{"spcode":500},"resultCards":[0,6,0,3,0,9,6,10,13,4,7,6,10,13,4,14,6,5,11,10,14,4,5,11,10],"freeWinCoin":0,"spLuXian":0,"spcode":200,"addMult":1,"zjLuXian":[],"pooljp":0,"subGameInfo":{"subGamid":-1,"isMustJoin":-1},"freeResult":{"triFreeCnt":0,"freeInfo":[]}}
            this.setCurRoundIssue(msg.issue)
            this.setShowResultFinish(false)
            //更新玩家RP
            if(msg.rp){
                if(msg.rp.cur){
                    cc.vv.UserManager.rp = msg.rp.cur
                }
                
            }
            
            this._deskInfo.user.coin = msg.coin
            this._gameInfo = msg
            this._deskInfo.restFreeCount = msg.freeCnt
            this._deskInfo.allFreeCount = msg.allFreeCnt
            if (msg.mults) {
                this._deskInfo.mults =  msg.mults
            } 
            // this._checkClientBet()

            this._puzzleData = msg.chipGame;
            if(msg.gameTask){ //更新Quest数据
                cc.vv.UserManager.updateQuestInfoData(msg.gameTask)
            }

            this.GetSlotsScript().onMsgSpine(msg)
            this.GetTopScript().onMsgSpine(msg)

            Global.dispatchEvent("EVENT_SPIN_MSG",msg)

            //是否有puzzle小游戏
            if (this._puzzleData && this._cfg.puzzleCfg  && this._puzzleData.currChipInfo) {
                cc.find("Canvas").getComponent("LMSlots_Puzzle").puzzleFly();
            }
        }

        if (this._reqStartTime && this._reqStartTime > 0) {
            let dt = new Date().getTime() - this._reqStartTime
            this._reqTotalTime += dt
            this._reqTotalCount += 1
            if (this._reqTotalCount >= 5) {
                //没5次上报平均时间
                let avgTime = Math.floor(this._reqTotalTime/this._reqTotalCount)
                StatisticsMgr.httpReport(StatisticsMgr.HTTP_SPIN_NET_TIME, avgTime, {key:"gameid", val:this._gameId})
                this._reqTotalTime = 0
                this._reqTotalCount = 0
            }
            this._reqStartTime = 0
        }
    },

    //收到子游戏消息
    OnRcvNetSubAction:function(msg){
        if(msg.code == 200){
            if(msg.gameTask){ //更新Quest数据
                cc.vv.UserManager.updateQuestInfoData(msg.gameTask)
            }
        }
    },

    onRecvNetReconnectDeskinfo:function(msg){
        if (msg.gameid !== this._gameId) {
            return false
        }
        this._bReconnect = true
        this._deskInfo = msg.deskinfo;
        this._checkReconnectNet()
        this._checkTimeout()
        return true;
    },

    _checkReconnectNet:function(){
        if(this._bReconnect && this.GetSlotsScript()){
            this.GetSlotsScript().ReconnectNet();
        }
    },

    SetMoveingTimeOut:function(val){
        this._bmoveTimeout = val
        this._checkTimeout()
    },
    //检查超时重新进入游戏
    _checkTimeout:function(){
        if(this._bmoveTimeout && this._bReconnect){
            this._bReconnect = null
            this._bmoveTimeout = null
            if(this.GetIsQuestModel()){
                cc.vv.GameManager.setEnterOpation({gameTask:1})
            }
            
            cc.vv.GameManager.EnterGame(this._gameId)
        }
    },

    //一局结束
    CanDoNextRound:function(){
        //更新qest进度
        Global.dispatchEvent(EventId.REFUSH_QUEST_PRO)
        this.setShowResultFinish(true)
        // //引导加注
        // let bDone15 = cc.vv.NewGuide._isDoneGuide(15)
        // if(!bDone15){
            
        //     let lv = cc.vv.UserManager.getCurLv()
        //     if(lv >= Global.SYS_OPEN.GUIDE_CHANGEBET && this.GetTotalFree() == 0){
        //         this.SetGuideId(15)
        //     }
            
            
        // }
        //是否还有现金返现
        if (this.getDeskInfo().cashBackInfo) {
            Global.dispatchEvent(EventId.SHOW_CASHBACK_ANIM)
        }

        if (this._newGameTipID) {
            if (this._newGameTipID==this._gameId) {
                let lv = cc.vv.UserManager.getCurLv()
                if (!this.GetIsQuestModel() && lv >= Global.SYS_OPEN.NEW_GAMETIP && !this.GetFreeTime()) {
                    if (this.getNewGameTipSpinCount() == 9) {
                        //已经九次则弹出新游戏推荐
                        let url = 'CashHero/prefab/new_game_tip'
                        let callbacks = function(node,data){
                            node.getComponent('NewGameTip').ShowGame(GAME_ID.SLOT_ZUES)
                        }
                        cc.vv.QueueWinMrg.addPop("new_game_tip","new_game_tip",{type:1,prefabUrl:url,initDataCall:callbacks})
                    }
                    this.addNewGameTipSpinCount()
                }
            }else {
                this._newGameTipID = null
            }
        }

        //检查是否破产
        this.doCheckBreakGrant()

        if(cc.vv.QueueWinMrg){
            cc.vv.QueueWinMrg.startPop()
        }
        
        
        // 如果是进入免费，那么客户端的betidx信任deskinfo里面的
        if (this._deskInfo.allFreeCount > 0 &&  this._deskInfo.allFreeCount === this._deskInfo.restFreeCount) {
            this._bottomScp.SetBetIdx(this._serverRawMult);
        } else if (this._deskInfo.allFreeCount > 0 && this._deskInfo.restFreeCount === 0) {
            // 出免费的时候设置成进游戏选择的
            let selectBet = cc.vv.UserManager.getEnterSelectBet()
            if(selectBet){
                if(!this.GetFreeTime()){
                    for(let i = 0; i < this._deskInfo.mults.length; i++){
                        if(this._deskInfo.mults[i] === selectBet){
                            this._bottomScp.SetBetIdx(i+1);
                            this._serverRawMult = (i + 1);
                            break;
                        }
                    }
                }
            }
        }
        
        
    },

    //退出游戏返回大厅
    ReqBackLobby:function(){
        let req = {c: MsgId.GAME_LEVELROOM};
        req.deskid = this._gameId;
        cc.vv.NetManager.send(req);

        this._bSendingLevel = true
        this._backRecount = 3
        //
    },

    setExitToHall:function(bBackHall){
        this._bBackHall = bBackHall
    },
    //兼容老的设置界面的退出接口
    requestExit:function(){
        this.ReqBackLobby()
    },

    OnRcvNetExitRoom:function(msg){
        if (msg.code === 200) {
            
            // cc.director.pause()
            
            // let runCall = function(err,scene){
            //     if(!err){
            //         scene.getChildByName('CH_hall_pre_loading').getComponent('hall_pre_loading').setEnterType(2)
            //     }
            // }
            Global.saveLocal("SAVE_FROM_SUBGAME_ID", this._gameId);
            let showExitAni = function(){
                // let url = "CashHero/prefab/node_transion"
                // cc.loader.loadRes(url,cc.Prefab, (err, prefab) => {
                //     if (!err) {
                //         let node_trans = cc.instantiate(prefab)
                //         node_trans.parent = cc.find('Canvas')
                //         node_trans.x = 0
                //         node_trans.y = 0
                //         node_trans.getComponent("LMSlots_Transition").play(1)
                //     }
                //     else{
                //         AppLog.err('未找到资源:'+url)
                //     }
                // });
                
                cc.vv.PopupManager.addPopup("BalootClient/BaseRes/prefabs/SceneTranslate", {
                    noMask: true,
                    noCloseHit:true,
                    onShow: (node) => {
                        node.getComponent("SceneTranslate").toHall();
                    }
                })

            }

            if(cc.vv.UserManager.getEnterHallAction()){
                //需要强制直接推出到大厅
                // if (cc.vv.SceneMgr){
                //     cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL_PRELOAD,runCall);
                // }

                showExitAni()
            }
            else{
                
    
                if(this._bBackHall != false){ //是否设置了不退出到大厅
                    //可以推到大厅的时候，需要先判断是否是quest
                    let bQuest = this.GetIsQuestModel()
                    if(bQuest){
                        this.SetIsQuestModel(null)
                        cc.vv.NetManager.send({c:MsgId.REQ_QUEST_INFO})
                        return
                    }

                    // if (cc.vv.SceneMgr){
                    //     cc.vv.SceneMgr.enterScene(Global.SCENE_NAME.HALL_PRELOAD,runCall);
                    // }

                    showExitAni()
                }
            }
            
            
        }
    },

    onRecvLevelupExp:function(msg){
        if(msg.code == 200){
            //更新经验
            this.levelupData = msg.info
            cc.vv.UserManager.setCurLv(msg.info.level)
            cc.vv.UserManager.setCurExp(msg.info.levelexp)
            cc.vv.UserManager.setUpdateExp(msg.info.levelup)
            cc.vv.UserManager.setNextLvReward(msg.next_level_reward)

            this.levelupData.totalCoin = msg.coin
            //通知升级了
            Global.dispatchEvent(EventId.PULL_LV_UP)
            cc.vv.EventManager.emit(EventId.PULL_LV_UP)

            if(msg.info.level == Global.SYS_OPEN.GUIDE_CHANGEBET){
                if(this._secBetVal){
                    if(this._deskInfo.mults.length == 1){
                        this._deskInfo.mults.push(this._secBetVal)
                        this._secBetVal = null
                    }
                }
            }
            
            if(msg.cashback){
                this._deskInfo.cashBackInfo = msg.cashback
            }

            
            if(msg.gameids){
                //有游戏解锁
                let showId = msg.gameids
                let parObj = cc.find('Canvas')
                let oldObj = cc.find('new_game_notice',parObj)
                if(!oldObj){
                    cc.loader.loadRes('CashHero/prefab/new_game_notice',cc.Prefab,(err,res) => {
                        if(err) return
                        if(cc.isValid(parObj)){
                            oldObj = cc.instantiate(res)
                            oldObj.name = 'new_game_notice'
                            oldObj.parent = parObj
                            oldObj.getComponent('new_game_notice').setGameId(showId)
                        }
                        
                    })
                }
            }

            //onetimeonly替换levelgift
            if(msg.onetimeleft && msg.onetimeleft > 0){
                cc.vv.UserManager.setLevelGift(msg.onetimeleft)
                
            }

            // if (msg.info.level == 8 && !this._newGameTipID && this._gameId!=GAME_ID.SLOT_ZUES && !this.GetIsQuestModel()) {
            //     //玩家首次到了八级 记录当前游戏id 不在宙斯游戏里 不在quest里
            //     let _clickQuest = Global.getLocal('click_questUnlock')
            //     if (_clickQuest != 1) {
            //         //未点击quest引导
            //         this._newGameTipID = this.getGameId()
            //     }
            // }
        }
    },

    getPuzzleData() {
        return this._puzzleData;
    },

    /**
     * 升级数据
     */
    getLevelupExp:function(){
        return this.levelupData
    },

    /**
     * 清理升级数据
     */
    clearLevelupData:function(){
        this.levelupData = null
    },

    /**
     * 经验变化数据
     */
    getExpChangeData:function(){
        return this.expChangeData
    },

    clearExpChangeData:function(){
        this.expChangeData = null
    },

    onRecvChangeExp:function(msg){
        if(msg.code == 200){
            cc.vv.UserManager.setCurExp(msg.info.levelexp)
            cc.vv.UserManager.setUpdateExp(msg.info.levelup)
            this.expChangeData = msg.info
            Global.dispatchEvent(EventId.REFUSH_LV_EXP,msg.info)
        }
    },

    onRcvNetMoneyChanged:function(msg){
        if (msg.code === 200) {
            if(msg.uid === Global.playerData.uid){
                this.setCoins(msg.coin)
                if(this._topScp){
                    this._topScp.ShowCoin()
                }
                
            }
        }
    },


    //退出游戏清理数据
    onExit:function(){
        this.UnregisterMsg()
    },
    //退出游戏
    clear:function(){
        this.onExit()
        
        //释放子游戏目录
        // cc.loader.releaseResDir(this.getGameDir())

        cc.sys.garbageCollect()

        if(cc.vv.QueueWinMrg){
            cc.vv.QueueWinMrg.clearQueueList()
        }
        
        this._deskInfo = null
        cc.vv.gameData = null

    },

    //sync的延迟
    awaitTime(nTime){
        return new Promise((res, rej) => {
            //绑定在logic上
            let can = cc.find("Canvas")
            if(can.isValid){
                let logicCmp = can.getComponent('LMSlots_Logic_Base')
                if(cc.isValid(logicCmp)){
                    logicCmp.scheduleOnce(()=>{res()}, nTime);
                }
                
            }
            // this.scheduleOnce(()=>{res()}, nTime);
        });
    },

    /**
     * 
     * @param {*} val 音量.
     * 降低背景音，需要背景音乐是开启的状态
     */
    SetBgmVol:function(val){
        let old = cc.vv.AudioManager.getBgmVolume()
        if(old != 0){
            cc.vv.AudioManager.setBgmVolume(val)
        }
    },

    //设置引导选择5次
    SetGuideId:function(val){
        this._newGuideSpine = val
    },
    GetGuideId:function(){
        return this._newGuideSpine || 0
    },

    //获取卷轴的随机的序号
    GetReelRandomIdx:function(nReel){
        this._reelIdx = this._reelIdx || []
        
        return this._reelIdx[nReel]
    },
    //设置卷轴的随机序号
    SetReelRandomIdx:function(nReel,idx){
        if(this._reelIdx){
            this._reelIdx[nReel] = idx
        }
    },
    //设置是否是Quest任务模式
    GetIsQuestModel:function(){
        return this._deskInfo.gameTask
    },

    //临时设置一下模式
    SetIsQuestModel:function(val){
        this._deskInfo.gameTask = val
    },

    //是否收到破产消息
    SetBreakGrant:function(val){
        this._breakMsgData = val
    },
    GetBreakGrant:function(){
        return this._breakMsgData
    },
    doCheckBreakGrant:function(){
        let val = this.GetBreakGrant()
        if(val){
            let canvas = cc.find("Canvas");
            let prefabPath = "hall_prefab/BreakGrant";
            cc.loader.loadRes(prefabPath,cc.Prefab, (err, prefab) => {
                if (!err) {
                    if(!canvas.getChildByName('BreakGrant')){
                        let node = cc.instantiate(prefab);
                        node.parent = canvas;
                        node.getComponent("BreakGrant").init(val);
                    }
                }
                else{
                    AppLog.err('未找到资源')
                }
            });
        }
    },

    /**
     * 获取新手任务信息
     */
    GetGuideTask:function(){
        return this._deskInfo.newbieTask
    },
    //更新引导任务
    onRcvNetUpdateGuideTask:function(msg){
        if(msg.code == 200){
            if(msg.newbieTask){
                this._deskInfo.newbieTask.state = msg.newbieTask.state
                this._deskInfo.newbieTask.count = msg.newbieTask.count
    
                // if(msg.newbieTask.type == 1){ //=1选择次数任务
                    //旋转次数
                    Global.dispatchEvent(EventId.GET_GUIDETASK_REFUSH)
                // }
            }
            
        }
    },

    //检查服务端初始化需要的弹窗
    checkServerInitpopUI:function(){
        let info = this._deskInfo.popInfo
        if(info){
            // cc.vv.UserManager.setNodtEncoughPopList(info.poplist)
            cc.vv.EventManager.emit(EventId.POPUI_BY_ID,info.poplist[0]);
            this._deskInfo.popInfo = null
            this._isFirstPop = false;
        }
        else{
            if(this._isFirstPop){
                this._isFirstPop = false;
                //弹窗结束
                Global.dispatchEvent(EventId.END_QUEUE_POP)
            }
        }
    },
    //清理掉本次的弹窗数据
    clearServerInitpop:function(){
        this._deskInfo.popInfo = null
    },


    /**
     * 暂停slot界面动画/逻辑
     */
    PauseSlot:function(){
        this._doPauseAction(false)
        
    },

    /**
     * 恢复slot界面的动画/逻辑
     */
    ResumeSlot:function(){
        this._doPauseAction(true)
    },

    /**
     * 
     * @param {true/false} val 
     */
    SetIsPuzzleModel:function(val){
        this._bPuzzleModel = val
    },

    GetIsPuzzleModel:function(){
        return this._bPuzzleModel
    },

    //bPause false 表示暂停 true 表示恢复
    _doPauseAction:function(bPause){
        let pCanvas = cc.find('Canvas')
        if(!cc.isValid(pCanvas,true)) return

        let logicCmp = pCanvas.getComponent('LMSlots_Logic_Base')
        if(!cc.isValid(logicCmp)){
            return
        }

        if(!bPause){
            this._bPasuseState = this._bPasuseState || 0
            this._bPasuseState++
            if(this._bPasuseState>1){
                return
            }
        }
        else{
            if(this._bPasuseState){
                this._bPasuseState--
                if(this._bPasuseState>0){
                    return
                }
            }
                
        }
        
        
        let pauseActionNode = []
        let pauseSpinNode = []
        let pauscriptFun = function(scp,pause){
            if(cc.isValid(scp)){
                scp.enabled = pause
                var scheduler = cc.director.getScheduler();
                if(pause){
                    scheduler.resumeTarget(scp)
                }
                else{
                    scheduler.pauseTarget(scp)
                }
                
            }
        }
        //公共组建的暂停
        pauscriptFun(logicCmp,bPause)
        
        let tSlotCmp = this.GetSlotsScript()
        pauscriptFun(tSlotCmp, bPause)
        
        pauscriptFun(this._bottomScp,bPause)
        // this._topScp.enabled = bPause

        let reels = tSlotCmp._reels
        
        for(let i = 0; i < reels.length; i++){
            let item = reels[i]
            pauscriptFun(item,bPause)
            let symbols = item._symbols
            if(symbols){
                for(let j = 0; j < symbols.length; j++){
                    let sysItem = symbols[j]
                    pauscriptFun(sysItem,bPause)
                    pauseActionNode.push(sysItem.node)
                    
                }
            }
            
        }
        if(!bPause){
            this._bgmVol = cc.vv.AudioManager.getBgmVolume()
            this.SetBgmVol(this._bgmVol*0.5)
            cc.vv.AudioManager.pauseAllEffect()
        }
        else{
            cc.vv.AudioManager.resumeAllEffect()
            if(!this._bgmVol){//以免打开了音效，这里却不知道
                this._bgmVol = cc.vv.AudioManager.getBgmVolume()
            }
            this.SetBgmVol(this._bgmVol)
        }
        //1暂停Action数据整理
        pauseActionNode.push(this._bottomScp.node)
        

        //2暂停Spin数据整理
        let slotNode = tSlotCmp.node

        pauseActionNode.push(slotNode)
        pauseSpinNode.push(slotNode)
        let bottomChilds = this._bottomScp.node
        pauseSpinNode.push(bottomChilds)
        
        //用户自定义的需要暂停的组建
        let userDefCmp = cc.find('safe_node',pCanvas).getComponentsInChildren('LMSlots_PauseUI_Base')
        for(let i = 0; i < userDefCmp.length; i++){
            let itemScp = userDefCmp[i]
            pauscriptFun(itemScp,bPause)

            pauseActionNode.push(itemScp.node)
            pauseSpinNode.push(itemScp.node)
        }
        
        //开始执行暂停操作
        for(let it = 0; it < pauseActionNode.length; it++){
            if(pauseActionNode[it].active){
                if(!bPause){
                    pauseActionNode[it].pauseAllActions()       //暂停此节点action
                    
                }
                else{
                    pauseActionNode[it].resumeAllActions()       //恢复此节点action
                    
                }
                
            }
            
            let symChild = pauseActionNode[it].children //暂停子节点action
            for(let k = 0; k < symChild.length; k++){
                if(symChild[k].active){
                    
                    if(!bPause){
                        symChild[k].pauseAllActions()
                    }
                    else{
                        symChild[k].resumeAllActions()
                    }
                }
                
            }
        }
        
        for(let it = 0; it < pauseSpinNode.length; it++){

            let allSpines = pauseSpinNode[it].getComponentsInChildren(sp.Skeleton) //暂停子节点的spin 播放
            for(let i = 0; i < allSpines.length; i++){
                if(allSpines[i].node.active){
                    
                    allSpines[i].paused = !bPause
                }
                else{
                    if(allSpines[i].paused == true && bPause){ //有些因为逻辑没有暂停导致，节点被隐藏了，恢复的时候也需要恢复
                        allSpines[i].paused = !bPause
                    }
                }
                
            }
        }

        
    },

    //自己模拟的1s执行一次
    update (dt) {
        if(cc.js.isNumber(this._sendInter)){
            this._sendInter += 1
            if(this._sendInter == 20){
                this._sendInter = null
                this.SetMoveingTimeOut(true)
                
            }
        }
        if(cc.js.isNumber(this._backRecount)){
            this._backRecount -= 1
            if(this._backRecount <= 0){
                this._bSendingLevel = null
            }
        }
    },

    /**
     * 是否需要跳过部分点击操作，如进入免费，结算等等
     * @returns {*}
     */
    isNeedAutoPlay() {
        return this.isAutoGame();
    },

    /**
     * 跳过部分流程的延时时间，在gamedata初始化中定义，不需要自行修改，直接获取即可
     * @returns {number}
     */
    getAutoPlayTime() {
        return this._autoPlayTime;
    },

    /**
     *
     * @param node
     * @param func
     * @param bManual 手动模式是否可跳过
     * @param manualTime 手动模式等待时间
     */
    checkAutoPlay(node, func, bManual, manualTime=8) {
        if (this.isNeedAutoPlay()) {
            node.stopAllActions();
            cc.tween(node)
                .delay(this._autoPlayTime)
                .call(()=>{
                    func()
                })
                .start();
        } else {
            if(bManual){
                node.stopAllActions();
                cc.tween(node)
                    .delay(manualTime)
                    .call(()=>{
                        func()
                    })
                    .start();
            }
        }
    },

    getManualAutoPlayTime() {
        return this._manualAutoPlayTime;
    },

    addNewGameTipSpinCount() {
        this._newGameTipSpinCount++
    },

    getNewGameTipSpinCount() {
        return this._newGameTipSpinCount
    },

    /**
     * 设置Allin开关
     */
    setAllInVal(val,coin){
        this._bAllin = val
        this._allinBet = coin
    },

    //获取当前的轮次
    getCurRoundIssue(){
        return this._deskInfo.issue
    },
    //设置当前轮次
    setCurRoundIssue(val){
        this._deskInfo.issue = val
    },
    //设置结果展示完成了
    setShowResultFinish(val){
        this._bResultFinish = val
    },
    getShowReulstFinish(){
        return this._bResultFinish
    },
});
