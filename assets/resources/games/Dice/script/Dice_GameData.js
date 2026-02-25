/**
 * Dice 数据模块
 */
cc.Class({
    extends: require("Table_GameData_Base"),
    properties: {
        DIV:97,
    },

    RegisterMsg(){
        this._super()
        cc.vv.NetManager.registerMsg(MsgId.PLACE_BET, this.OnRcvNetGameResult, this);
    },

    UnregisterMsg(){
        this._super()
        cc.vv.NetManager.unregisterMsg(MsgId.PLACE_BET, this.OnRcvNetGameResult,false,this);
    },

    isBackgroundReConn(){
        return false
    },

    getDiv(){
        return this._deskInfo.dividend
    },
    
    //通过回报计算under
    getUnder(nPayout){
        return this.getDiv()/Number(nPayout)
    },

    //通过回报计算over
    getOver(nPayout){
        return 99.99 - this.getUnder(nPayout)
    },

    //通过机会参数计算回报
    getPayout(nChance){
        return this.getDiv()/Number(nChance)
    },

    getMinChange(){
        return this.getUnder(970)
    },

    getMaxChange(){
        return this.getUnder(1.1)
    },

    //bet：押注额
    //payout：赔率
    //roll:1 under 2 over
    sendBetReq(bet,payout,roll){
        let req  ={c:MsgId.PLACE_BET}
        req.betcoin = bet
        req.payout = payout
        req.roll = roll
        cc.vv.NetManager.send(req)

        this.addMyCoin(-bet,true)
        StatisticsMgr.reqReport(ReportConfig.SG_BET);
    },

    OnRcvNetGameResult(msg){
        if(msg.code == 200){
            //更新历史记录
            this.addGameRecord(msg.result)
            //更新金币
            if(msg.wincoin){
                this.addMyCoin(msg.wincoin)
            }

            this.getScriptGame().showGameResult(msg)
        }
    }

    // update (dt) {},
});
