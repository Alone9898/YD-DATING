/**
 * Aviatrix 游戏逻辑
 */
let STATUS_TIME = {
    FREE:5,
    BET:6,
    RESULT:3
}
cc.Class({
    extends: require("Table_Game_Base"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._map = cc.find("node_map", this.node).getComponent("Aviatrix_Map")
    },

    getRetimerNode(){
        return cc.find("node_retimer",this.node)
    },

    //下注阶段
    showBetStatu:function(){
        Global.TableSoundMgr.stopEffectByName("Ball")
        Global.TableSoundMgr.stopEffectByName("ballfly_bgm")
        let self = this 
        //设置可以下注
        this._showOPUIStatu(2)
        this._map.reset()

        //显示下注倒计时
        let perCall = function(val){
            let pro = cc.find("pro",self.getRetimerNode())
            let nPer = val/STATUS_TIME.BET
            
            let cmp = pro.getComponent(cc.ProgressBar)
            cc.tween(cmp)
            .to(1,{progress:nPer})
            .start()
        }
        let endCall = function() {
            let retimerNode = self.getRetimerNode()
            retimerNode.active = false
        }
        let pro = cc.find("pro",self.getRetimerNode())
        pro.getComponent(cc.ProgressBar).progress = 1
        this._showReTime(true,endCall,"%ss",perCall)

        cc.vv.gameData.sendNextBet()
        Global.TableSoundMgr.playEffect("Start_1")
    },

    //结算阶段
    showResultStatu:function(){
        //隐藏倒计时
        this._showReTime(false)

        //操作面板
        this._showOPUIStatu(3)

        let resultMsg = cc.vv.gameData.getResultMsg()
        if(resultMsg){
            //飞机爆炸
            this._showRocketOver(resultMsg.result.mult)
        } else {        //还没爆炸
            let elapse = 0
            let roundInfo = cc.vv.gameData.getAreaInfo()
            if (roundInfo.curtime && roundInfo.launchtime) {
                elapse = roundInfo.curtime - roundInfo.launchtime
            } 
            this._showRocketFly(elapse)
        }
    },

    //开始表现结果
    showStartFly:function(){
        //隐藏倒计时
        this._showReTime(false)
        
        this._showRocketFly(0)

        this._showOPUIStatu(3)
        
    },

    //飞机起飞
    _showRocketFly:function(t){
        //显示倍率
        let roundInfo = cc.vv.gameData.getAreaInfo()
        this._map.run(t)
        if(roundInfo.crash){
        }
        else{
            //没有爆炸
            if(!this._bFly){
                Global.TableSoundMgr.playEffect("Ball",true)
            }
            this._bFly = true
        }
        
    },

     //飞机爆炸
     _showRocketOver:function(nMul){
        this._bFly = null
        Global.TableSoundMgr.stopEffectByName("ballfly_bgm")
        Global.TableSoundMgr.stopEffectByName("Ball")
        this._map.stop(nMul)
        //重置押注数据
        cc.vv.gameData.resetMyRoundBet()
        
        //更新趋势
        cc.find("node_records",this.node).getComponent("Aviatrix_Record").showRecords(true)

        Global.TableSoundMgr.playEffect("Boom")
        this.refushBetOPUI()

        this.doShowResultFinish()
    },

    refushBetOPUI:function(){
        let status = cc.vv.gameData.getGameStatus()
        this._showOPUIStatu(status)
    },

    updateCashOutCoin:function(){
        let nMul = this._map.getCurMult()
        let node_op = cc.find("node_op",this.node)
        let cmps = node_op.getComponentsInChildren("Aviatrix_Op")
        for(let i = 0; i < cmps.length; i++){
            let item = cmps[i]
            item.updateCoin(nMul)
        }
    },

    //手动提现
    showCashoutWin:function(val){
        //飞一下金币
        if(val != 0){
            let bottomscp =  cc.vv.gameData.getBottomScript()
            let fly_score = cc.find("fly_score",bottomscp.node)
            fly_score.active = true
            fly_score.getComponent("Table_FlyScore").setScore(val)
            Global.TableSoundMgr.playEffect("Win")
        }

        cc.vv.gameData.refushMyCoin()
        this.refushBetOPUI()
    },

    //自动提现
    autoTakeRewards:function(msg){
        let bMySelf = cc.vv.UserManager.isMySelf(msg.uid)
        if(bMySelf){
            //自己的
            this.showCashoutWin(msg.wincoin)
        }
        else{
            //别人的
            if(this._bHasOther) return
            this._bHasOther = true
            this.scheduleOnce(()=>{
                this._bHasOther = false
            },0.1)

            // let node_result = cc.find("node_game",this.node)
            // let node_other = cc.instantiate(cc.find("icon_coin",node_result))
            // node_other.active = true
            // node_other.parent = node_result
            // node_other.position = cc.v2(0,110)
            // var action = cc.spawn([cc.jumpBy(0.5, cc.v2(-Global.random(300,500), -Global.random(300,500)), Global.random(300,500), 1), cc.rotateBy(0.5, 720),cc.fadeOut(0.5)]);
            // node_other.runAction(cc.sequence(action,cc.destroySelf()))
        }
    },



    _showOPUIStatu(statusVal){
        let node_op = cc.find("node_op",this.node)
        let cmps = node_op.getComponentsInChildren("Aviatrix_Op")
        for(let i = 0; i < cmps.length; i++){
            let item = cmps[i]
            item.showOPUI(statusVal)
        }
    },

    //飞机没爆炸的时候获取【当前倍率，时间差】
    _getCurNul:function(tval){
        let roundInfo = cc.vv.gameData.getAreaInfo()
        let quantCfg = cc.vv.gameData.getQuantParam()
        let t = roundInfo.curtime - roundInfo.launchtime
        if(tval){
            t = tval
        }
        let a = quantCfg.a
        let b = quantCfg.b
        let c = quantCfg.c
        return [Number((a*t*t + b*t + c)),t]
    },

    update() {
        if(this._bFly){
            //更新当前时间
            if(cc.vv.gameData){
                this.updateCashOutCoin()
            }
            

        }  
    }
});
