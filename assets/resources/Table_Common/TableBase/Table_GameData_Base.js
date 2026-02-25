/**
 * 数据基类
 */

cc.Class({
    extends: cc.Component,

    properties: {
        _deskInfo:null,
        _gameId:null,
        _cfg:null,
        _atlas:[], //挂载的资源图集
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

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
            this.setResultMsg(null)
            this.setShowResultFinish(true)

            let web_yd = cc.director.getScene().getChildByName("yd_charge")
            if(web_yd){
                
                cc.game.addPersistRootNode(web_yd)
                // web_yd.removeFromParent(false)
            }

            if(cc.vv.BroadcastManager){
                cc.vv.BroadcastManager.stop()
            }
            let cfgData = cc.vv.GameDataCfg.getGameData(this.getGameId())
            cc.director.loadScene(cfgData.gameScene,(err,target)=>{
                if(web_yd){
                    web_yd.parent = target
                   
                }

                if(cc.vv.BroadcastManager){
                    cc.vv.BroadcastManager.run()
                }
                
            })
            
            // if(this._script_game){
            //     this._script_game.StartGame()
            // }
        }
        
        // this.RegisterMsg()
        
        
        
    },

    
    RegisterMsg(){
        cc.vv.NetManager.registerMsg(MsgId.GAME_LEVELROOM, this.OnRcvNetExitRoom, this); //退出房间
        cc.vv.NetManager.registerMsg(MsgId.PULL_FREE_STATUE,this.onRcvFreeStatu,this);  //进入空闲阶段
        cc.vv.NetManager.registerMsg(MsgId.PULL_BETTING_STATUE,this.onRcvBettingStatu,this);  //进入押注阶段
        cc.vv.NetManager.registerMsg(MsgId.PULL_RESULT_STATUE,this.onRcvResultStatu,this);  //进入结算阶段
        cc.vv.NetManager.registerMsg(MsgId.TABLE_BET_REQ,this.onRcvMyDoBet,this); //我下注
        cc.vv.NetManager.registerMsg(MsgId.PULL_OTHER_BET,this.onRcvOtherDoBet,this); //其它下注
        cc.vv.NetManager.registerMsg(MsgId.PULL_TABLE_PLAYER,this.onRcvTablePlayerJoin,this); //桌上玩家进来
        cc.vv.NetManager.registerMsg(MsgId.PULL_OBSERVERS_NUM, this.OnRcvNetObserNum, this); //观众人数变化
        cc.vv.NetManager.registerMsg(MsgId.LEFT_TABLE_PLAYER, this.OnRcvTablePlayerLeft, this);//桌上玩家出去
        
        //财富改变（金币改变）
        cc.vv.NetManager.registerMsg(MsgId.MONEY_CHANGED, this.onRcvNetMoneyChanged, this);
    },

    UnregisterMsg(){
        cc.vv.NetManager.unregisterMsg(MsgId.GAME_LEVELROOM, this.OnRcvNetExitRoom,false,this);
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_FREE_STATUE,this.onRcvFreeStatu,false,this);  //进入空闲阶段
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_BETTING_STATUE,this.onRcvBettingStatu,false,this);  //进入押注阶段
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_RESULT_STATUE,this.onRcvResultStatu,false,this);  //进入结算阶段
        cc.vv.NetManager.unregisterMsg(MsgId.TABLE_BET_REQ,this.onRcvMyDoBet,false,this); //我下注
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_OTHER_BET,this.onRcvOtherDoBet,false,this); //其它下注
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_TABLE_PLAYER,this.onRcvTablePlayerJoin,false,this); //桌上玩家进来
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_OBSERVERS_NUM, this.OnRcvNetObserNum,false, this); //桌上玩家进来
        cc.vv.NetManager.unregisterMsg(MsgId.LEFT_TABLE_PLAYER, this.OnRcvTablePlayerLeft,false, this);

        cc.vv.NetManager.unregisterMsg(MsgId.MONEY_CHANGED, this.onRcvNetMoneyChanged, false,this);
    },

    //退出游戏清理数据
    onExit:function(){
        this.UnregisterMsg()
    },

    clear:function(){
        this._deskInfo = null
        cc.vv.gameData = null
    },

    isBackgroundReConn() {
        return true;
    },


    getDeskInfo(){
        return this._deskInfo
    },



     //获取游戏配置,一般命名 ***_Cfg.js
     getGameCfg(){
        if(!this._cfg){
            let cfgName = cc.vv.GameDataCfg.getGameData(this.getGameId())
            if(cfgName && cfgName.cfgCmp){
                this._cfg = require(cfgName.cfgCmp)
            }
        }
        return this._cfg
    },

    //获取场次id
    getTableSsid:function(){
        return this.getDeskInfo().ssid
    },

    //设置图集：logic有绑定就回自动调用
    setAtlas:function(arr){
        this._atlas = []
        for(let i = 0; i < arr.length; i++){
            this._atlas.push(arr[i])
        }
    },

    //获取图集
    getAtlas:function(atlasIdx){
        return this._atlas[atlasIdx]
        
    },

    //是否表现神算子飞星星表现
    showRaterBetAni:function(){
        let bShow = true
        if(this._cfg.notShowRaterAni){
            bShow = false
        }
        return bShow
    },

    //退出游戏返回大厅
    ReqBackLobby:function(){
        let req = {c: MsgId.GAME_LEVELROOM};
        req.deskid = this._gameId;
        cc.vv.NetManager.send(req);
    },

    //获取当前游戏id
    getGameId(){
        return this._gameId
    },

    //底部筹码列表
    getBetChipList:function(){
        return this._deskInfo.chips
    },

    //获取筹码的序号
    getChipIdxByVal:function(betVal){
        let res
        let betlist = this.getBetChipList()
        for(let i = 0; i < betlist.length; i++){
            let item = betlist[i]
            if(item == betVal){
                res = i
                break
            }
        }

        return res
    },

    //获取筹码面值:0开始
    getChipValByIdx:function(idx){
        let betlist = this.getBetChipList()
        return betlist[idx]
    },

    //桌上玩家列表
    getTablePlayers:function(){
        return this._deskInfo.users
    },
    setTablePlayers:function(data){
        this._deskInfo.users = Global.copy(data) 
    },

    //获取我的信息
    getMyInfo:function(){
        return this._deskInfo.user
    },

    //获取我的金币
    getMyCoin:function(){
        return this._deskInfo.user && this._deskInfo.user.coin
    },
    setMyCoin:function(val){
        if(this._deskInfo && this._deskInfo.user){
            this._deskInfo.user.coin = val
        }
    },
    addMyCoin:function(val,bRefush){
        this._deskInfo.user.coin += val
        if(bRefush){
            //刷新显示
            this.refushMyCoin()
            
        }
    },
    //金币是否足够
    isCoinEncough:function(val){
        let nCoin = this.getMyCoin()
        return nCoin >= val
    },

    //刷新我的金币
    refushMyCoin:function(){
        if(this._script_bottom){
            this._script_bottom.showCoin()
        }
    },

    //获取我在某个方位的押注总额
    getMyBetByAreanIdx:function(idx){
        return this._deskInfo.user.round.bets[idx]
    },
    //更新我的押注总额
    addMyBet:function(betIdx,val){
        this._deskInfo.user.round.bets[betIdx-1] += val
    },
    //重置我上一轮的押注数据
    resetMyRoundBet:function(){
        let myRoundBet = this._deskInfo.user.round.bets
        for(let i= 0; i < myRoundBet.length; i++ ){
            myRoundBet[i] = 0
        }
    },    


    //获取总的押注方位信息
    getAreaInfo:function(){
        return this._deskInfo.round
    },

    //方位的总押注
    //idx:押注方位1开始
    getAreaTotalBet:function(idx){
        let info = this.getAreaInfo()
        return info.bets[idx-1]
    },

    //方位的筹码详情
    //idx:押注方位1开始
    getAreaChipsDetail:function(idx){
        let info = this.getAreaInfo()
        if(info && info.chips){
            return info.chips[idx-1]
        }
        
    },

    //更新总的方位上押注数据
    updateAreanBetData:function(areanIdx,betVal){
        let betIdx = this.getChipIdxByVal(betVal)
        this._deskInfo.round.chips[areanIdx-1][betIdx] += 1
        this._deskInfo.round.bets[areanIdx-1] += betVal
    },

    //重置方位押注信息
    resetAreaRoundBet:function(){
        let chips_detail = this._deskInfo.round.chips
        let total_detail = this._deskInfo.round.bets
        for(let i = 0; i < total_detail.length; i++){
            total_detail[i] = 0
        }
        for(let i= 0; i < chips_detail.length; i++){
            let area_detail = chips_detail[i]
            for(let j = 0; j < area_detail.length; j++){
                area_detail[j] = 0
            }
        }
    },

    //获取游戏阶段:(1:空闲，2：押注，3：计算)
    getGameStatus:function(){
        return this._deskInfo.state
    },
    setGameStatus:function(val,bRefush=true,bFirstChange){
        this._deskInfo.state = val
        if(this._script_game && bRefush){
            this._script_game.doStatusChange(bFirstChange)
        }
    },

    //获取阶段剩余时间
    getStatusTime:function(){
        return this._deskInfo.time
    },
    setStatusTime:function(val){
        this._deskInfo.time = (val<=0?0:val)
    },
    //设置此轮结果
    getResultMsg:function(){
        return this._resultMsg
    },
    setResultMsg:function(val){
        this._resultMsg = val
    },

    //获取观众人数
    getObservers:function(){
        return this._deskInfo.playercnt
    },

    //获取游戏记录字段
    getGameRecords:function(){
        return this._deskInfo.records
    },

    addGameRecord:function(item){
        this._deskInfo.records.push(item)
    },

    //获取桌子本轮信息
    getRoundInfo:function(){
        return this._deskInfo.round
    },


    //设置游戏主逻辑脚本
    setScriptGame:function(val){
        this._script_game = val
    },

    //获取游戏控制脚本
    getScriptGame:function(){
        return this._script_game
    },

    //设置底部控制脚本
    setBottomScript:function(scp){
        this._script_bottom = scp
    },
    getBottomScript:function(){
        return this._script_bottom
    },

    //获取游戏目录
    getGameDir(){
        let gameCfg = cc.vv.GameItemCfg[this.getGameId()]
        if(gameCfg){
            return cc.js.formatStr('games/%s/',gameCfg.name)
        } 
    },

    //获取押注的第一个方位:1开始
    getFirstBetArea:function(chips){
        let idx = 0
        for(let i= 0; i < chips.length; i++){
            let arenItem = chips[i]
            for(let j = 0; j < arenItem.length; j++){
                if(arenItem[j]>0){
                    idx = i
                    break
                }
            }
            

        }
        return idx+1
    },


    //计算筹码列表总数[方位1总数，方位2总数...]
    countChipsTotalVal:function(chips){
        let count = [];
        for(let i= 0; i < chips.length; i++){
            let arenItem = chips[i]
            count[i] = 0
            for(let j = 0; j < arenItem.length; j++){
                let itemVal = this.getChipValByIdx(j)
                count[i] += arenItem[j]*itemVal
            }
            

        }
        return count;
    },

    //将押注额转化成押注筹码列表
    formatVal2Chiplist(betcoin){
        let list = this.getBetChipList();

        let chipList = [];
        let rem = betcoin
        for (let i = list.length-1; i >= 0; i--){
            let curC =  Math.floor(rem / list[i]);
            rem = rem%list[i];
            chipList[i] = curC
            
        }

        return chipList;
    },

    //发送押注请求
    sendBetReq:function(val){
        //记录投注记录
        if(!this._lastbets) this._lastbets = []
        if(this._lastbets) this._lastbets.push(Global.copy(val))

        let req  ={c:MsgId.TABLE_BET_REQ}
        req.chips = val
        cc.vv.NetManager.send(req)

        StatisticsMgr.reqReport(ReportConfig.SG_BET);
    },

    //上一把的投注数据
    getLastbet:function(){
        return this._lastbets
    },

    // //获取上一把押注的总额
    // getLastbetSum:function(){
    //     let nTotal = 0
    //     if(this._lastbets){
    //         for(let i = 0; i < this._lastbets; i++){
    //             let itembet = this._lastbets[i]
    //             for(let i = 0; i < itembet.length; i++){
    //                 let areachip = 
    //             }
    //             nTotal += this._lastbets[i]*this.getBetChipList[i]
    //         }
    //     }
    //     return nTotal
    // },

    //清理上一次下注数据
    clearLastBet:function(){
        this._lastbets = null
        
    },

    //是否开局的首次下注
    setIsFirstBet:function(val){
        this._bFirstBet = val
    },
    getIsFirstBet:function(){
        return this._bFirstBet
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

    getPlayByUid:function(uid){
        let players = cc.vv.gameData.getTablePlayers()
        for(let i = 0; i < players.length; i++){
            let item = players[i]
            if(item.uid == uid){
                return item
            }
        }
    },


    //获取我自己的节点
    getMyNode:function(){
        let myUid = cc.vv.UserManager.uid
        let parentObj = cc.find("Canvas") 
        let cmps = parentObj.getComponentsInChildren("Table_Player_Base")
        for(let i = 0; i < cmps.length; i++){
            let info = cmps[i].getPlayerInfo()
            if(myUid == info.uid){
                return cmps[i].node
            }
        }
    },

    //获取观众节点
    getObserveNode:function(){
        let parentObj = cc.find("Canvas") 
        let cmp = parentObj.getComponentInChildren("Table_Observers")
        if(cmp){
            return cmp.node
        }
    },



    OnRcvNetExitRoom:function(msg){
        if(msg.code == 200){
            if(msg.spcode == 101015){
                cc.vv.FloatTip.show(___("Please complete the game before leaving the room"));
                return
            }

            this.doExitRoom()
            
        }
    },

    doExitRoom:function(){
        Global.saveLocal("SAVE_FROM_SUBGAME_ID", this._gameId);

        cc.vv.PopupManager.addPopup("BalootClient/BaseRes/prefabs/SceneTranslate", {
            noMask: true,
            noCloseHit:true,
            onShow: (node) => {
                let showEndCall = function(){
                    let gamescp = cc.vv.gameData.getScriptGame()
                    if(cc.isValid(gamescp)){
                       let areascp = gamescp._getBetAreaScript()
                       if(cc.isValid(areascp)){
                        areascp.clearTableBet(true)
                       }
                    }
                }
                node.getComponent("SceneTranslate").toHall(showEndCall);
            }
        })

           
    },

    //阶段切换-进入Free阶段
    onRcvFreeStatu:function(msg){
        if(msg.code == 200){
            this.setIsFirstBet(true)
            this.setStatusTime(msg.time)
            this.setCurRoundIssue(msg.issue)
            //桌上换人
            if(msg.users){
                this.setTablePlayers(msg.users)
            }
            
            //清理我的上轮押注数据
            this.resetMyRoundBet()
            //清理方位总押注数据
            this.resetAreaRoundBet()

            this.setGameStatus(1)
        }
    },

    //阶段切换-进入下注阶段
    onRcvBettingStatu:function(msg){
        if(msg.code == 200){
            this.setIsFirstBet(true)
            this.setStatusTime(msg.time)
            this.setGameStatus(2,true,true)
        }
    },

    //阶段切换-进入结果展示阶段
    onRcvResultStatu:function(msg){
        if(msg.code == 200){
            //开始进入结果表现
            this.setShowResultFinish(false)
            //更新我自己的金币，然后合适的时机刷新
            if(msg.user && msg.user.coin){
                this.setMyCoin(msg.user.coin)
            }
            

            this.setResultMsg(msg)
            this.setStatusTime(msg.time)
            this.setGameStatus(3)
            
        }
    },

    //自己下注返回
    onRcvMyDoBet:function(msg){
        if(msg.code == 200){
            if(msg.spcode){
                if(msg.spcode == 101015){
                    //过了押注阶段
                }
                else if(msg.spcode == 804){
                    //金币不足
                    
                }
                else{
                    if(!CC_BUILD){
                        cc.vv.FloatTip.show("spcode:"+msg.spcode)
                    }
                    
                }
                
                //移除已经押注的筹码
                if(msg.bets){
                    this._deskInfo.user.round.bets = msg.bets
                }
                
                return
            }

            //更新个区域筹码数量
            this._deskInfo.round.chips = msg.chips
            

        }
    },

    //其它玩家下注推送
    onRcvOtherDoBet:function(msg){
        if(msg.code == 200){
            //增量表现。客户端可分多断的来表现
            let chips_add = msg.chips
            //uid为0表示是玩家列表中来的，有uid的，是桌上玩家的
            let uid = msg.uid
            if(cc.isValid(this._script_game)){
                this._script_game.playOtherBet(msg)
            }
            else{
                //直接更新总的

            }
            
        }
    },

    //
    onRcvTablePlayerJoin:function(msg){
        if(msg.code == 200){
            //插入到桌上玩家
            let uid = msg.user.uid
            this._deskInfo.users.push(msg.user)
            //通知刷新桌面
            Global.dispatchEvent("Table_Player_Change",uid)

        }
    },

    //更新观众人数
    OnRcvNetObserNum:function(msg){
        if(msg.code == 200){
            this._deskInfo.playercnt = msg.count
            let scp = cc.find("Canvas").getComponentInChildren("Table_Observers")
            if(cc.isValid(scp)){
                scp.showWatchers(msg.count)
            }
        }
    },

    OnRcvTablePlayerLeft:function(msg){
        if(msg.code == 200){
            
        }
    },



    //sync的延迟
    awaitTime(nTime){
        return new Promise((res, rej) => {
            //绑定在logic上
            let can = cc.find("Canvas")
            if(can.isValid){
                let logicCmp = can.getComponent('Table_Logic_Base')
                if(cc.isValid(logicCmp)){
                    logicCmp.scheduleOnce(()=>{res()}, nTime);
                }
                
            }
            // this.scheduleOnce(()=>{res()}, nTime);
        });
    },

    //自己模拟的1s执行一次
    update (dt) {

    },

    //将16进制的数据转化成color,value类型
    convert16PokertoDatavalue:function(card16Idx){
        //新的服务端对应
        var item ={}
        let colorConvert = [3,2,1,0,4]
        item.color = 16*colorConvert[(((card16Idx & 0xf0) >> 4) - 1)]
        let tempVal = card16Idx & 0x0f
        if(item.color == 64){
            //王
            if(tempVal == 1){
                tempVal = 14
            }
            else if(tempVal == 2){
                tempVal = 15
            }
        }
        else{
            if(tempVal == 14){
                tempVal = 1
            }
        }

        item.value = tempVal
        return item
    },

    onRcvNetMoneyChanged:function(msg){
        if(msg.code == 200){
            if(cc.vv.UserManager.isMySelf(msg.uid)){
                let outcoin = msg.coin
                this.setMyCoin(outcoin)
        
                if(this._script_bottom){
                    this._script_bottom.showCoin()
                }
            }
        }
        
    },

    //充值提示
    showChargeTips:function(){
        if(Global.isYDApp()){
            cc.vv.AlertView.show(___("金币不足"), () => {
                if(Global.isIOSAndroidReview()){
                    cc.vv.PopupManager.addPopup("YD_Pro/Review/yd_more_coins");
                } else {
                    cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                        onShow: (node) => {
                            node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl);
                        }
                    })
                }
            }, () => {
            }, false, () => { }, ___("提示"), ___("取消"), ___("Deposit"))
        }else {
            cc.vv.EventManager.emit(EventId.NOT_ENOUGH_COINS);
        }
    }

    // update (dt) {},
});
