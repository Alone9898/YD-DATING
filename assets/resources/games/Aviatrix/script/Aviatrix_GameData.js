/**
 * CricketX数据处理模块
 */
cc.Class({
    extends: require("Table_GameData_Base"),

    properties: {
        
    },

    
    RegisterMsg(){
        this._super()
        cc.vv.NetManager.registerMsg(MsgId.PULL_CRASH_FLY, this.OnRcvNetCashFly, this); //飞机起飞
        cc.vv.NetManager.registerMsg(MsgId.PULL_CRASH_TAKEREWARD, this.OnRcvNetCashTaskReward, this); //自动提现
        cc.vv.NetManager.registerMsg(MsgId.MSG_Cash_Out, this.OnRcvNetMunalCashout, this); //主动提现
        
    },

    UnregisterMsg(){
        this._super()
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_CRASH_FLY, this.OnRcvNetCashFly,false,this);
        cc.vv.NetManager.unregisterMsg(MsgId.PULL_CRASH_TAKEREWARD, this.OnRcvNetCashTaskReward,false,this);
        cc.vv.NetManager.unregisterMsg(MsgId.MSG_Cash_Out, this.OnRcvNetMunalCashout,false, this);
    },


    //flee：0表示手动取出
    sendBetReq:function(flee,bet,idx){
        let req  ={c:MsgId.TABLE_BET_REQ}
        req.betcoin = bet
        req.flee = flee
        req.idx = idx
        cc.vv.NetManager.send(req)

        StatisticsMgr.reqReport(ReportConfig.SG_BET);
    },

    //add:起飞
    OnRcvNetCashFly:function(msg){
        if(msg.code == 200){
            let roundInfo = this.getAreaInfo()
            roundInfo.launchtime = msg.launchtime
            roundInfo.crash = 0
            roundInfo.curtime = msg.launchtime
            this.setGameStatus(3,false)

            if(this._script_game){
                this._script_game.showStartFly()
            }
        }
    },

    //add:自动提取
    OnRcvNetCashTaskReward:function(msg){
        if(msg.code == 200){
            if(this._script_game){
                if(cc.vv.UserManager.isMySelf(msg.uid)){
                    this._deskInfo.user.round.cashout[msg.idx] = 1
                    this.addMyCoin(msg.wincoin)
                }
                this._script_game.autoTakeRewards(msg)
            }
        }
    },

    //add:手动提取
    OnRcvNetMunalCashout:function(msg){
        if(msg.code == 200){
            cc.vv.gameData.addMyCoin(msg.wincoin)
            this._deskInfo.user.round.cashout[msg.idx] = 1
            if(cc.isValid(this._script_game)){
                this._script_game.showCashoutWin(msg.wincoin)
            }
        }
    },

    //overwrite:保存历史记录
    setResultMsg:function(msg){
        this._super(msg)
        if(msg && msg.result){
            this.addGameRecord(msg.result.mult)
        }
        
    },

    //overwrite:自己下注返回
    onRcvMyDoBet:function(msg){
        if(msg.code == 200){
            if(msg.spcode){
                if(!CC_BUILD){
                    cc.vv.FloatTip.show("spcode:"+msg.spcode)
                }
                return
            }

            this._deskInfo.user.round.betcoin[msg.idx] = msg.betcoin
            this._deskInfo.user.round.flee[msg.idx] = msg.flee
            // cc.vv.gameData.addMyCoin(-msg.betcoin,true)
            cc.vv.gameData.setMyCoin(msg.coin)
            cc.vv.gameData.refushMyCoin()
            this._script_game.refushBetOPUI()
            

        }
    },





    //更新当前时间
    addCurTime:function(val){
        let roundInfo = this.getAreaInfo()
        roundInfo.curtime += val
    },

    //获取配置
    getQuantParam:function(){
        return this._deskInfo.quad
    },

    resetMyRoundBet:function(){
        this._deskInfo.user.round.betcoin = []
        this._deskInfo.user.round.flee = []
        this._deskInfo.user.round.cashout = []
    },   
    
    getMyRoundBet:function(){
        return this._deskInfo.user.round
    },

    //下注方位是否下过注
    isBetOPId:function(idx){
        let mybet = this.getMyRoundBet()
        let val = mybet.betcoin[idx]
        return val > 0
    },

    //下注方位是否已经cashout了
    isCollectOPId:function(idx){
        let mybet = this.getMyRoundBet()
        let val = mybet.cashout[idx]
        return val 
    },

    //保存下一轮下注数据
    saveNextBet:function(flee,bet,idx){
        let req  ={c:MsgId.TABLE_BET_REQ}
        req.betcoin = bet
        req.flee = flee
        req.idx = idx
        this.nextBetReq = this.nextBetReq || []
        this.nextBetReq.push(req)
    },
    //发送下一轮的下注
    sendNextBet:function(){
        if(this.nextBetReq){
            for(let i=0; i < this.nextBetReq.length; i++){
                cc.vv.NetManager.send(this.nextBetReq[i])
            }
        }
        this.nextBetReq = null
    },

    //删除下一轮的下注
    delNextBet:function(idx){
        if(this.nextBetReq){
            let key = -1
            let ncoin = 0
            for(let i = 0; i < this.nextBetReq.length; i++){
                if(this.nextBetReq[i].idx == idx){
                    key = i
                    ncoin = this.nextBetReq[i].betcoin
                    break
                }
            }
            if(key>=0){
                let data = this.nextBetReq.splice(key,1)
                this.addMyCoin(ncoin,true)
                if(this._script_game){
                    this._script_game.refushBetOPUI()
                }
            }
            
        }
    },

    sendCashout:function(idx){
        let req  ={c:MsgId.MSG_Cash_Out}
        req.idx = idx
        cc.vv.NetManager.send(req)
    },

    isHasNextBet:function(idx){
        let res = false
        if(this.nextBetReq){
            for(let i = 0; i < this.nextBetReq.length; i++){
                if(this.nextBetReq[i].idx == idx){
                    res = true
                    break
                }
            }
        }
        return res
    },

    


});
