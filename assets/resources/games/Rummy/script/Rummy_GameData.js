import {facade} from "../../PokerBase/scripts/PBLogic";

/**
 * gamedata
 */
 let Rummy_Tools = require("Rummy_Tools")
cc.Class({
    extends: require("Table_GameData_Base"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },
    init:function(deskInfo,gameId){
        // if (this._deskInfo) {
        //     return;
        // }
        if(!this._deskInfo){
            this.RegisterMsg()
        }

        //兼容arabohero写法
        this.deskInfo = deskInfo

        this._deskInfo = deskInfo
        this._gameId = gameId
        
        //断线重连
        let bReconnect = (deskInfo.deskFlag == 1 || deskInfo.isReconnect)
        if(bReconnect){
            this.setLasetActiveSeat(null)
            if(this._script_game){
                this._script_game.StartGame()
            }
        }
        
        
        
    },

    RegisterMsg(){
        this._super()

        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_DISCARD, this.OnRcvDiscard, this); //退出房间
        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_DEAL, this.OnRcvGameStart, this); //开始游戏
        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_COLLECT_CARD, this.OnRcvOpCollect, this); //摸牌
        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_DROP, this.OnRcvOpDrop, this); //认输
        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_GROUP_CARD, this.OnRcvOpGroup, this); //理牌
        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_ROUND_OVER, this.OnRcvRoundOver, this); //回合结束
        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_SHOW_RESULT, this.OnRcvShowResult, this);//show牌
        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_CONFIRM_RESULT, this.OnRcvConfirmResult, this);//Confirm牌
        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_AUTO_CHANGE, this.OnRcvAutoChange, this);//托管改变
        cc.vv.NetManager.registerMsg(MsgId.YD_RUMMY_RECOUNT, this.OnRcvRecountShow, this);//显示倒计时UI
        cc.vv.NetManager.registerMsg(MsgId.GAME_SWITCH_TABLE, this.OnRcvSwitchTable, this);//换桌
        cc.vv.NetManager.registerMsg(MsgId.PULL_SWITCH_TABLE, this.OnRcvPullSwitchTable, this);//推送换桌成功
        cc.vv.NetManager.registerMsg(MsgId.GAME_PULL_READY_STATUE, this.OnRcvPullReadyState, this);//Ready状态改变
        cc.vv.NetManager.registerMsg(MsgId.GAME_DISMISS_ROOM, this.OnRcvRoomDismiss, this);//房间解散
        
    },
    UnregisterMsg(){
        this._super()
        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_DISCARD, this.OnRcvDiscard,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_DEAL, this.OnRcvGameStart, false,this);
        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_COLLECT_CARD, this.OnRcvOpCollect, false,this);
        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_DROP, this.OnRcvOpDrop,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_GROUP_CARD, this.OnRcvOpGroup,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_ROUND_OVER, this.OnRcvRoundOver,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_SHOW_RESULT, this.OnRcvShowResult,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_CONFIRM_RESULT, this.OnRcvConfirmResult,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_AUTO_CHANGE, this.OnRcvAutoChange,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.YD_RUMMY_RECOUNT, this.OnRcvRecountShow,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_SWITCH_TABLE, this.OnRcvSwitchTable,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_SWITCH_TABLE, this.OnRcvPullSwitchTable,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_PULL_READY_STATUE, this.OnRcvPullReadyState,false, this);
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_DISMISS_ROOM, this.OnRcvRoomDismiss,false, this);
    },

    //是否是好友房
    isFriendRoom:function(){
        if(this._deskInfo && this._deskInfo.conf && this._deskInfo.conf.roomtype == 5){
            return true
        }
        return false
    },

    //是否是比赛场
    isMatchRoom:function(){
        if(this._deskInfo && this._deskInfo.conf && this._deskInfo.conf.roomtype == 6){
            return true
        }
        return false
    },

    sendExitReq:function(){
        let req = {c: MsgId.GAME_LEVELROOM};
        req.deskid = this._gameId;
        cc.vv.NetManager.send(req);
    },
    //退出游戏返回大厅
    ReqBackLobby:function(){
        let self = this
        let sendReq = function(){
            self.sendExitReq()
        }
        

        let str = ""
        let levelcoin = this.getDropCoin()
        let myInfo = this.getMyInfo()
        if(myInfo){
            if(myInfo.state == 8 || myInfo.state == 7 || myInfo.state == 1){
                //弃牌了，可直接退出
                sendReq()
                return
            }
        }

        let gameState = this.getGameStatus()
        if(gameState == 1 || gameState == 5){
            //牌局在匹配或者结算，可直接退出
            sendReq()
            return
        }
        if(myInfo && myInfo.state != 1 && levelcoin>0){
            // //直接提示扣80倍
            // let deskInfo = this.getDeskInfo()
            // let nCoin = 80 * deskInfo.basecoin

            // str += cc.js.formatStr("lose %s coins ",Global.FormatNumToComma(nCoin))
            // cc.vv.AlertView.show(str, () => {
            //     sendReq()
            // }, () => {

            // },false,null,___("Leave Table"),null,___("Leave"));

            cc.vv.FloatTip.show(___("Please complete the game before leaving the room"));
        } else {
            sendReq()
        }
        

    },


    getMyInfo(){
        let uid = cc.vv.UserManager.uid
        return this.getPlayByUid(uid)
        
    },

    
    //获取我的手牌
    getMyHand:function(){

        // return [[53,54,19,21],[22,23,38,39],[43,45,56,59,78]]
        return this.getMyInfo().round.groupcards
    },
    updateHand:function(duiidx,data){
        this.getMyInfo().round.groupcards[duiidx] = data
    },

    setHand:function(datas){
        this.getMyInfo().round.groupcards = datas
    },

    //获取手牌张数
    getTotalHandCards:function(){
        let nTotal = 0
        let hands = this.getMyHand()
        for(let i = 0; i < hands.length; i++){
            let dui = hands[i]
            nTotal += dui.length
        }
        return nTotal
    },

    //每局的wild
    getRoundWild:function(){
        let roundInfo = cc.vv.gameData.getRoundInfo()
        return roundInfo.wildCard
    },

    isHasPureSeq:function(){
        let bRes = 0
        let hands = this.getMyHand()
        for(let i= 0; i < hands.length; i++){
            let item = hands[i]
            let val = Rummy_Tools.isPureSequence(item)
            if(val){
                bRes +=1 
            }

        }
        return bRes
    },

    isHasSeq:function(){
        let bRes = 0
        let wildVal = this.getRoundWild()
        let hands = this.getMyHand()
        for(let i= 0; i < hands.length; i++){
            let item = hands[i]
            let val = Rummy_Tools.isSequence(item,wildVal)
            if(val){
                bRes +=1 
            }

        }
        return bRes
    },

    getActiveSeat:function(){
        let roundInfo = cc.vv.gameData.getRoundInfo()
        return roundInfo.activeSeat 
    },

    //更新活动玩家信息
    _updateActiveSeat(seat,ntime,statu){
        let roundInfo = cc.vv.gameData.getRoundInfo()
        //记录上一个活动者
        this.setLasetActiveSeat(roundInfo.activeSeat)

        roundInfo.activeSeat = seat
        roundInfo.activeState = statu
        if(ntime != null){
            roundInfo.delayTime = ntime
        }
        
        let all_player = this.getTablePlayers()
        for(let i = 0; i < all_player.length; i++){
            let item = all_player[i]
            if(item.seatid == seat){
                item.state = statu
                break
            }
        }
    },

    setLasetActiveSeat(val){
        this._lastActiveSeat = val
    },

    getLastActiveSeat(){
        return this._lastActiveSeat
    },

    isMyActive:function(){
        let roundInfo = cc.vv.gameData.getRoundInfo()
        let myInfo = this.getMyInfo()
        if(myInfo){
            if(myInfo.seatid == roundInfo.activeSeat){
                return true
            }
        }
        
        return false
    },

     //根据服务器座位号获取玩家信息
     getPlayByServiceSeat:function(servSeat){
        let players = this.getTablePlayers()
        for(let i = 0; i < players.length; i++ ){
            let item = players[i]
            if(item.seatid == servSeat){
                return item
            }
        }
    },

    //弃牌堆中加入一张
    _addDiscardCard(card){
        let roundInfo = cc.vv.gameData.getRoundInfo()
        
        if(roundInfo){
            if(!roundInfo.discardCards) { //代码预防
                roundInfo.discardCards = []
            }
            roundInfo.discardCards.push(card)
        }
        
    },
    //弃牌堆中删除最上面的牌
    popDirscards:function(){
        let roundInfo = this.getRoundInfo()
        if(!roundInfo.discardCards) { //代码预防
            roundInfo.discardCards = []
        }
        if(roundInfo.discardCards.length>0){
            roundInfo.discardCards.pop()
        }
        else{
            roundInfo.discardCards = []
        }
        
    },
    //
    getCurShowDiscard(){
        let roundInfo = cc.vv.gameData.getRoundInfo()
        if(roundInfo){
            let alldis = roundInfo.discardCards
            if(alldis){
                return alldis[alldis.length-1]
            }
            
        }
        
    },

    delHandCard:function(card){
        let hands = this.getMyHand()
        let delKey = -1
        for(let i = 0; i < hands.length; i++){
            let dui = hands[i]
            for(let j = 0; j < dui.length; j++){
                if(card == dui[j]){
                    delKey = j
                    
                }
            }
            if(delKey != -1){
                dui.splice(delKey,1)
                break
            }
        }
    },

    _updatePoolCoin:function(val){
        let roundInfo = this.getRoundInfo()
        roundInfo.poolcoin = val
    },
    getPoolCoin:function(){
        let roundInfo = this.getRoundInfo()
        return roundInfo.poolcoin
    },

    getDropCoin:function(){
        let myInfo = this.getMyInfo()
        let deskInfo = this.getDeskInfo()
        let add = 0
        if(myInfo){
            add = myInfo.round.dropmult
        }
        return deskInfo.basecoin * add
    },


    //是否是首轮第一张牌
    isRoundFirstCard:function(){
        let deskInfo = this.getDeskInfo()
        if(deskInfo){
            return deskInfo.round.firstcard
        }
        
    },

    setRoundFirstCard:function(val){
        let deskInfo = this.getDeskInfo()
        if(deskInfo){
            deskInfo.round.firstcard = val
        }
    },


    //好友房准备
    sendReadyReq(){
        let req = {c:MsgId.GAME_SEND_READY}
        cc.vv.NetManager.send(req)
    },

    

    sendReqDiscard(card,group){
        let req= {c:MsgId.YD_RUMMY_DISCARD}
        req.card = card
        req.groupcards = group
        cc.vv.NetManager.send(req)

        this._updatePlayerState(cc.vv.UserManager.uid,4.5)
    },

    //1 发牌堆摸 2 弃牌堆摸
    sendReqClickCard(op){
        let req = {c:MsgId.YD_RUMMY_COLLECT_CARD}
        req.op = op
        cc.vv.NetManager.send(req)
    },

    sendReqDrop(){
        let req = {c:MsgId.YD_RUMMY_DROP}
        cc.vv.NetManager.send(req)
    },

    sendGroupCard(group){

        //如果一堆中的牌超过7张，就放到第一行
        let res = -1
        for(let i = 0; i < group.length; i++){
            let item = group[i]
            if((item.length>7) || ((item.length>4) && group.length>4) || ((item.length>=5) && group.length>=4)){
                res = i
                break
            }
        }
        if(res>0){
            let popval = group.splice(res,1)
            group.unshift(popval[0])
        }

        this.setHand(group)

        let status = this.getGameStatus()
        if(status == 5){ //都结算阶段了，就不发送了。以免一直拖着牌报错
            return
        }
        let req = {c:MsgId.YD_RUMMY_GROUP_CARD}
        req.groupcards = group
        cc.vv.NetManager.send(req)
    },

    sendShowResult(card,group){
        let req = {c:MsgId.YD_RUMMY_SHOW_RESULT}
        req.card = card
        req.groupcards = group
        cc.vv.NetManager.send(req)
    },

    sendConfirm:function(group){
        let req = {c:MsgId.YD_RUMMY_CONFIRM_RESULT}
        req.groupcards = group
        cc.vv.NetManager.send(req)
    },

    //更新玩家状态
    _updatePlayerState:function(uid,state){
        let allPlayer = this.getTablePlayers()
        for(let i = 0; i < allPlayer.length; i++){
            let item= allPlayer[i]
            if(item.uid == uid){
                item.state = state
                break
            }
        }
    },

    getMyState:function(){
        let myInfo = this.getMyInfo()
        return myInfo.state
    },

    //加一张手牌
    _addPoker:function(card){
        let myHands = this.getMyHand()
        if(myHands.length>=6){
            //添加到最后一堆
            myHands[myHands.length-1].push(card)
        }
        else{
            //新建一堆
            myHands[myHands.length] = [card]
        }
    },

    addMyCoin:function(val){
        let myInfo = this.getMyInfo()
        myInfo.coin += val
    },

    

    setLastDrawFlag:function(data){
        this._lastDraw = data
    },
    getLasDrawFlag:function(){
        return this._lastDraw
    },
    clearLastDraw:function(){
        this._lastDraw = null
    },

    //最大操作时间
    getMaxDelaytime:function(){
        if(this._deskInfo){
            return this._deskInfo.delayTime
        }
        return 0
        
    },

    //获取桌上所有玩家的id,pbchat需要
    getAllPlayerIdsInTable:function(){
        let uids = []
        let players = cc.vv.gameData.getTablePlayers()
        for(let i = 0; i < players.length; i++){
            uids.push(players[i].uid)
        }
        return uids
    },

    getMatchRetime:function(){
        if(this._deskInfo){
            return this._deskInfo.waitTime
        }
        return 0
    },

    getTableId:function(){
        if(this._deskInfo){
            return this._deskInfo.deskid
        }
        return 0
    },
    getTablePwd:function(){
        if(this._deskInfo){
            return this._deskInfo.conf.pwd
        }
    },

    //发送换桌请求
    sendSwitchReq:function(){
        let req = {c:MsgId.GAME_SWITCH_TABLE}
        cc.vv.NetManager.send(req)
    },



    OnRcvDiscard:function(msg){
        if(msg.code == 200){
            cc.vv.gameData.setRoundFirstCard(0)
            if(msg.spcode){
                //弃牌失败
                if(msg.groupcards){
                    this.setHand(msg.groupcards)
                    if(this._script_game){
                        this._script_game.refushHandCards()
                    }
                }
                return
            }
            //更新活动玩家
            this._updateActiveSeat(msg.activeSeat,msg.delayTime,msg.activeState)
            //将丢弃的牌压入到丢弃牌堆中
            this._addDiscardCard(msg.card)
            if(this._script_game){
                this._script_game.onMsgDiscardCard(msg)
            }
            else{
                //删除手牌数据
                if(cc.vv.UserManager.isMySelf(msg.uid)){
                    this.delHandCard(msg.card)
                }
                
            }
            
        }
    },

    OnRcvGameStart:function(msg){
        if(msg.code == 200){
            cc.vv.gameData.setRoundFirstCard(1)
            //更新桌子状态
            // this._updatePlayerState(cc.vv.UserManager.uid,3)
            let all_player = this.getTablePlayers()
            for(let i = 0; i < all_player.length; i++){
                let item = all_player[i]
                item.state = 3
            }
            this.setGameStatus(3)
            
            //更新活动玩家
            this._updateActiveSeat(msg.activeSeat,msg.delayTime,msg.activeState)
            //更新桌面牌信息
            let roundInfo = cc.vv.gameData.getRoundInfo()
            roundInfo.wildCard = msg.wildCard
            roundInfo.discardCards = msg.discardCards
            roundInfo.dealseat = msg.dealseat
            roundInfo.cardCnt = msg.cardCnt
            

            //更新我自己的牌
            let myInfo = this.getMyInfo()
            myInfo.round.groupcards = msg.groupcards
            myInfo.round.cards = msg.cards
            myInfo.round.dropmult = 20
            
                
            this._updatePoolCoin(0)

            //通知切换桌面状态
            if(this._script_game){
                this._script_game.onMsgGameStart(msg)
            }
        }
    },

    //提示抓牌
    OnRcvOpCollect:function(msg){
        if(msg.code == 200){
            cc.vv.gameData.setRoundFirstCard(0)
            if(msg.spcode){
                if(msg.groupcards){
                    this.setHand(msg.groupcards)
                    if(this._script_game){
                        this._script_game.refushHandCards()
                    }
                }
                
                return
            }
            
            let roundInfo = cc.vv.gameData.getRoundInfo()
            //更新活动玩家:此处不更新定时器，沿用之前的阶段
            this._updateActiveSeat(msg.activeSeat,null,msg.activeState)
            //更新玩家状态
            this._updatePlayerState(msg.uid,msg.userState)
            if(msg.op == 2){
                //从弃牌堆拿的
                cc.vv.gameData.popDirscards()
            }
            if(msg.shuffle){
                //摸牌堆牌不够，需要重新洗牌了。清空弃牌堆
                roundInfo.discardCards = []
                //洗牌的时候牌堆先设置成一张，洗完后，设置成msg.cardCnt
                roundInfo.cardCnt = 1
            }
            else{
                //更新牌堆中的张数
                
                roundInfo.cardCnt = msg.cardCnt
            }

            //更新操作倍率
            let bMy = cc.vv.UserManager.isMySelf(msg.uid)
            if(bMy){
                //更新手牌
                // this.setLastDrawFlag(msg.card)
                this._addPoker(msg.card)
                let myInfo = this.getMyInfo()
                myInfo.round.dropmult = msg.dropmult

            }
            if(this._script_game){
                this._script_game.showDrawAni(msg)
            }
            
        }
    },

    OnRcvOpDrop:function(msg){
        if(msg.code == 200){
            //
            let bMySelf = cc.vv.UserManager.isMySelf(msg.uid)

            if(bMySelf){
                this.getMyInfo().round.cards = msg.cards
                this.getMyInfo().round.groupcards = msg.groupcards
                //同步金币
                this.getMyInfo().coin = msg.coin
            }
            else{
                let info = this.getPlayByUid(msg.uid)
                info.coin = msg.coin
            }
            
            //更新活动玩家
            this._updateActiveSeat(msg.activeSeat,msg.delayTime,msg.activeState)
            //更新玩家状态
            this._updatePlayerState(msg.uid,msg.userState)
            //更新poolcoin
            this._updatePoolCoin(msg.poolcoin)
            //
            if(this._script_game){
                this._script_game.showGameDrop(msg)
            }

        }
    },

    OnRcvOpGroup:function(msg){
        if(msg.code == 200){
            if(msg.spcode){
                if(!CC_BUILD){
                    cc.vv.FloatTip.show("Error:"+msg.spcode)
                }
                
                if(msg.groupcards){
                    this.setHand(msg.groupcards)
                    if(this._script_game){
                        this._script_game.refushHandCards()
                    }
                }
                return
            }
        }
        
    },

    OnRcvRoundOver:function(msg){
        if(msg.code == 200){
            this.setGameStatus(4)
            let roundInfo = this.getRoundInfo()
            roundInfo.winCard = 0
            roundInfo.dealseat = null
            roundInfo.delayTime = msg.waitTime
            roundInfo.waitTime = msg.waitTime
            roundInfo.activeSeat = null
            this.setLasetActiveSeat(null)
            let myInfo = this.getMyInfo()
            if(myInfo){
                myInfo.round.dropmult = 0
            }
            
            
            //更新玩家金币
            for(let i = 0; i < msg.settle.length; i++){
                let playerid = msg.settle[i].uid
                if(cc.vv.UserManager.isMySelf(playerid)){
                    let myState = this.getMyState()
                    if(myState == 8 || myState == 7){ //已经drop了或者show fial的钱已经当时就扣过了
                        
                    }
                    else{
                        this.addMyCoin(msg.settle[i].wincoin)
                    }
                    
                }
                else{
                    let info = this.getPlayByUid(playerid)
                    info.coin = msg.settle[i].coin
                }
            }

            //各个玩家飘分，更新金币
            if(this._script_game){
                this._script_game.doRoundOver(msg)
            }
            
        }
    },

    OnRcvShowResult:function(msg){
        if(msg.code == 200){
            if(msg.success){
                if(msg.card){
                    let roundInfo = this.getRoundInfo()
                    roundInfo.winCard = msg.card
                }

                //将所有玩家状态修改成confirm 4.5是本地状态：表示他已经出牌了
                let players = this.getTablePlayers()
                for(let i = 0; i < players.length; i++){
                    if(players[i].uid != msg.uid){
                        if(players[i].state == 2 || players[i].state == 3 || players[i].state == 4 || players[i].state == 4.5){
                            players[i].state = 5
                        }
                       
                    }
                }
            }
            else{
                //更新poolcoin
                this._updatePoolCoin(msg.poolcoin)

                //将牌放到弃牌堆顶
                this._addDiscardCard(msg.card)
                //更新活动玩家
               this._updateActiveSeat(msg.activeSeat,msg.delayTime,msg.activeState)

               //如果是自己需要扣除金币
               let delCoin = msg.failcoin
                if(cc.vv.UserManager.isMySelf(msg.uid)){
                    this.addMyCoin(delCoin*(-1))
                }
                else{
                    let info = this.getPlayByUid(msg.uid)
                    info.coin -= delCoin
                    if(info.coin < 0){
                        info.coin = 0
                    }
                }
            
            }
            
            if(this._script_game){
                this._script_game.doPlayerShow(msg)
            }
        }
    },

    OnRcvConfirmResult:function(msg){
        if(msg.code == 200){
            //更新玩家状态
            this._updatePlayerState(msg.uid,6)
            if(this._script_game){
                this._script_game.doConfirmSuccess(msg)
            }
        }
    },

    OnRcvAutoChange:function(msg){
        if(msg.code == 200){
            let mySelf = cc.vv.UserManager.isMySelf(msg.uid)
            if(mySelf){
                let val = msg.auto
                let myInfo = cc.vv.gameData.getMyInfo()
                myInfo.auto = val
                if(this._script_game){
                    this._script_game.onAutoChange(val)
                }
            }
            
        }
    },

    OnRcvTablePlayerLeft:function(msg){
        let self = this
        if(msg.code == 200){
            let uid = msg.uid
            if(cc.vv.UserManager.isMySelf(uid)){
                let spcode = msg.spcode

                let sureCall = function(){
                    //自己离开，退出到大厅
                    self.OnRcvNetExitRoom(msg)
                }
                //804 金币不足
                //1097 用户离线
                //522 房间解散
                //536 淘汰赛被淘汰
                //1103 托管踢人
                if(spcode == 1103){
                    let tips = "Automatically exit room without operation in rule time"
                    cc.vv.AlertView.show(tips,
                        null,null,false,null,null,null,null,
                        2,
                        () => {
                            sureCall()
                        }
                    );
                }
                else if(spcode == 536){
                    //先卡在界面，待点了淘汰赛提示后退出
                }
                else if(spcode == 804){
                    //金币不足,被提出房间
                    let tips = ___("Cash balance is lower than the room minimum balance!")
                    cc.vv.AlertView.showTips(tips,()=>{
                        sureCall()
                    })
                }
                else{
                    sureCall()
                }
                
            }
            else{
                let del = -1
                let players = this.getTablePlayers()
                for(let i = 0; i < players.length; i++){
                    if(players[i].uid == uid){
                       del = i
                       break
                    }
                }
                if(del != -1){
                    players.splice(del,1)
                }
    
                //刷新桌面玩家
                if(this._script_game){
                    Global.dispatchEvent("Table_Player_Change",uid)
                }
            }
            
        }
    },

    OnRcvRecountShow:function(msg){
        if(msg.code == 200){
            this.setGameStatus(3)
            if(this._script_game){
                this._script_game.showRecountUI()
            }
        }
    },

    OnRcvSwitchTable:function(msg){
        if(msg.code == 200){
            
            if(msg.spcode){
                
                if(msg.spcode == 4){
                    cc.vv.FloatTip.show(___("金币不足"))
                    this.sendExitReq()
                }
                else{
                    if(!CC_BUILD){
                        cc.vv.FloatTip.show("Switch Table:"+msg.spcode)
                    }
                }
                return
            }
            
            cc.vv.FloatTip.show("Switch Table Success!")
            if(this._script_game){
                this._script_game.clearTable(true)
            }
            
            
        }
    },

    OnRcvPullSwitchTable:function(msg){
        if(msg.code == 200){
            
            msg.deskinfo.deskFlag = 1 //重新走断线重连的逻辑即可
            this.init(msg.deskinfo,msg.gameid)
            
            if(this._script_game){
                this._script_game.showSwitchTableSuccess()
            }
        }
        else{
            this.doExitRoom()
        }
    },

    OnRcvPullReadyState:function(msg){
        if(msg.code == 200){
            //更新玩家准备状态
            this._updatePlayerState(msg.uid,2)
            if(this._script_game){
                this._script_game.showPlayerReayChange(msg)
            }
        }
    },

    OnRcvRoomDismiss:function(msg){
        if(msg.code == 200){
            cc.vv.AlertView.show("The Room has been dismissed!",()=>{
                this.doExitRoom()
            },)
        }
    },


    updateLocalTime(){
        if(this._deskInfo){
            let roundInfo = this.getRoundInfo()
            roundInfo.delayTime -=1
            if(roundInfo.delayTime<=0){
                roundInfo.delayTime = 0
            }
            // cc.log("剩余："+roundInfo.delayTime)
        }
    },

    // 收到记录立马展示
    getShowReulstFinish(){
        return true
    },

    update (dt) {

        this.updateLocalTime()
    },
});
