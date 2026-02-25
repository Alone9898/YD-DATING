/**
 * Keno 数据结构
 */
cc.Class({
    extends: require("Table_GameData_Base"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

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

    //根据选择的数给出倍率数组
    getMulCfg(num){    
        let info = this.getDeskInfo()
        return info.config.multipliers[num-1]
    },

    sendBetReq(bet,nums){
        let req  ={c:MsgId.PLACE_BET}
        req.betcoin = bet
        req.nums = nums
        cc.vv.NetManager.send(req)

        this.addMyCoin(-bet,true)
        StatisticsMgr.reqReport(ReportConfig.SG_BET);
    },

    OnRcvNetGameResult(msg){
        if(msg.code == 200){
            //更新历史记录
            this.addGameRecord(msg.result)
            //更新金币
            this.setMyCoin(msg.coin)
            

            this.getScriptGame().showGameResult(msg)
        }
    }

    // update (dt) {},
});
