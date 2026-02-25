/**
 * 
 */


cc.Class({
    extends : require("Table_GameData_Base"),
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

    //overwirte
    //阶段切换-进入下注阶段
    onRcvBettingStatu:function(msg){
        if(msg.code == 200){
            this.setIsFirstBet(true)
            this._deskInfo.user.round.betcoin = 0
            this.setStatusTime(msg.time)
            this.setGameStatus(2,true,true)
        }
    },


    //获取配置
    getQuantParam:function(){
        return this._deskInfo.quad
    },

    //更新当前时间
    addCurTime:function(val){
        let roundInfo = this.getAreaInfo()
        roundInfo.curtime += val
    },

    OnRcvNetCashFly:function(msg){
        if(msg.code == 200){
            let roundInfo = this.getAreaInfo()
            roundInfo.launchtime = msg.launchtime
            roundInfo.crash = 0
            roundInfo.curtime = msg.launchtime

            if(this._script_game){
                this._script_game.showStartFly()
            }
        }
    },

    OnRcvNetCashTaskReward:function(msg){
        if(msg.code == 200){
            if(this._script_game){
                if(cc.vv.UserManager.isMySelf(msg.uid)){
                    this._deskInfo.user.round.cashout = 1
                    this.addMyCoin(msg.wincoin)
                }
                this._script_game.autoTakeRewards(msg)
            }
        }
    },

    sendBetReq:function(flee,bet){
        let req  ={c:MsgId.TABLE_BET_REQ}
        req.betcoin = bet
        req.flee = flee
        cc.vv.NetManager.send(req)

        StatisticsMgr.reqReport(ReportConfig.SG_BET);
    },

    //自己下注返回
    onRcvMyDoBet:function(msg){
        if(msg.code == 200){
            if(msg.spcode){
                if(!CC_BUILD){
                    cc.vv.FloatTip.show("spcode:"+msg.spcode)
                }
                return
            }

            this._deskInfo.user.round.betcoin = msg.betcoin
            this._deskInfo.user.round.flee = msg.flee

            

        }
    },

    resetMyRoundBet:function(){
        this._deskInfo.user.round.betcoin = 0
        this._deskInfo.user.round.flee = 0
        this._deskInfo.user.round.cashout = 0
    },   
    
    getMyRoundBet:function(){
        return this._deskInfo.user.round
    },



    sendCashout:function(){
        let req  ={c:MsgId.MSG_Cash_Out}
        cc.vv.NetManager.send(req)
    },

    OnRcvNetMunalCashout:function(msg){
        if(msg.code == 200){
            cc.vv.gameData.addMyCoin(msg.wincoin)
            this._deskInfo.user.round.cashout = 1
            if(cc.isValid(this._script_game)){
                this._script_game.showCashoutWin(msg.wincoin)
            }
        }
    },


    setAutoStartCoin:function(val){
        this._autoStartCoin = val
    },

    getAutoStartCoin:function(){
        return this._autoStartCoin
    },

    setResultMsg:function(msg){
        this._super(msg)
        if(msg && msg.result){
            this.addGameRecord(msg.result.mult)
        }
        
    }

    

    
});
