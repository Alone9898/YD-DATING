/**
 * CricketX 游戏逻辑
 */
let STATUS_TIME = {
    FREE:5,
    BET:7,
    RESULT:4
}
cc.Class({
    extends: require("Table_Game_Base"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    // update (dt) {},

    getRetimerNode(){
        return cc.find("node_game/node_retimer",this.node)
    },

    showBetStatu:function(){
        Global.TableSoundMgr.stopEffectByName("Ball")
        Global.TableSoundMgr.stopEffectByName("ballfly_bgm")
        let self = this 
        //设置可以下注
        this._showOPUIStatu(2)
        //清理结算界面
        this.showBall(false)
        this._setMulResult(false)

        let text_bust = cc.find("node_game/spr_brust",this.node)
        text_bust.active = false

        //显示下注倒计时
        let perCall = function(val){
            let pro = cc.find("pro",self.getRetimerNode())
            let nPer = val/STATUS_TIME.BET
            
            let cmp = pro.getComponent(cc.ProgressBar)
            cc.tween(cmp)
            .to(1,{progress:nPer})
            .start()
        }
        let pro = cc.find("pro",self.getRetimerNode())
        pro.getComponent(cc.ProgressBar).progress = 1
        this._showReTime(true,null,"%ss",perCall)

        //显示动画状态
        let nTime = cc.vv.gameData.getStatusTime()
        let spinObj = cc.find("node_game/cricket",this.node)
        let spincmp = spinObj.getComponent(sp.Skeleton)
        spincmp.setToSetupPose()
        spincmp.setAnimation(0,"mtavarifoni",false)
        spincmp.addAnimation(0,"ballflycosmosskyloop",false)
        spincmp.addAnimation(0,"ballflystratosferaskyloop",true)
        spincmp.setCompleteListener((tck)=>{
            if(tck.animation && tck.animation.name == "mtavarifoni"){
                Global.TableSoundMgr.playEffect("ballfly_bgm")
            }
        })
        let trackentiy = spincmp.getCurrent(0)
        trackentiy.animationStart = STATUS_TIME.BET - nTime
        this.scheduleOnce(()=>{
            this._showReTime(false)
            this.showBall(true)
        },nTime-0.5)

        cc.vv.gameData.sendNextBet()
        Global.TableSoundMgr.playEffect("Start_1")
    },

    showResultStatu:function(){
        //隐藏倒计时
        this._showReTime(false)
        //显示动画状态
        let spinObj = cc.find("node_game/cricket",this.node)
        let spincmp = spinObj.getComponent(sp.Skeleton)
        spincmp.setToSetupPose()
        spincmp.setAnimation(0,"ballflycosmosskyloop",true)

        
        this._showOPUIStatu(3)
 
        
        //还没爆炸
        this._showRocketFly()
        let resultMsg = cc.vv.gameData.getResultMsg()
        if(resultMsg){
            //飞机爆炸
            this._showRocketOver(resultMsg.result.mult)
        }
        else{

        }

    },

    showBall:function(bShow){
        let ball = cc.find("node_game/ball",this.node)
        ball.active = bShow
        ball.getComponent(sp.Skeleton).setAnimation(0,"ballflycosmos",false)
        ball.getComponent(sp.Skeleton).addAnimation(0,"ballflycosmosloop",true)
    },

    //开始表现结果
    showStartFly:function(){
        //隐藏倒计时
        this._showReTime(false)
        
        this._showRocketFly()

        this._showOPUIStatu(3)
        
    },

    //飞机起飞
    _showRocketFly:function(){
        
        //显示倍率
        let roundInfo = cc.vv.gameData.getAreaInfo()
        let objRack = cc.find("node_game/ball",this.node)
        objRack.getComponent(sp.Skeleton).setAnimation(0,"ballflycosmosloop",true)
        let text_bust = cc.find("node_game/spr_brust",this.node)
        let nMul
        let color
        if(roundInfo.crash){
            //已爆炸
            nMul = roundInfo.mult
            objRack.active = false
            
            text_bust.active = true
            color = cc.Color(243,87,94,255)
        }
        else{
            objRack.active = true
            //没有爆炸
            if(!this._bFly){
                Global.TableSoundMgr.playEffect("Ball",true)
            }
            text_bust.active = false
            this._bFly = true
            
            let datas =  this._getCurNul()
            nMul = datas[0]
        }

        //倍率
        this._setMulResult(true,nMul,color)
        
    },

     //飞机爆炸
     _showRocketOver:function(nMul){
        this._bFly = null
        Global.TableSoundMgr.stopEffectByName("ballfly_bgm")
        Global.TableSoundMgr.stopEffectByName("Ball")
        let objRack = cc.find("node_game/ball",this.node)
        objRack.getComponent(sp.Skeleton).setAnimation(0,"wageba",false)
        //重置押注数据
        cc.vv.gameData.resetMyRoundBet()
        //更新倍率
        this._setMulResult(true,nMul,cc.Color(243,87,94,255))
        

        //更新趋势
        cc.find("node_records",this.node).getComponent("CricketX_Records").showRecords(true)

        Global.TableSoundMgr.playEffect("Boom")
        this.refushBetOPUI()

        this.doShowResultFinish()
    },

    refushBetOPUI:function(){
        let status = cc.vv.gameData.getGameStatus()
        this._showOPUIStatu(status)
    },

    updateCashOutCoin:function(){
        let nMul = this._getCurNul()
        let node_op = cc.find("node_op",this.node)
        let cmps = node_op.getComponentsInChildren("CricketX_OP")
        for(let i = 0; i < cmps.length; i++){
            let item = cmps[i]
            item.updateCoin(nMul[0])
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
            // let playname = msg.playername
            // let nMul = msg.mult
            let node_result = cc.find("node_game",this.node)
            let node_other = cc.instantiate(cc.find("icon_coin",node_result))
            node_other.active = true
            node_other.parent = node_result
            node_other.position = cc.v2(0,110)
            var action = cc.spawn([cc.jumpBy(0.5, cc.v2(-Global.random(300,500), -Global.random(300,500)), Global.random(300,500), 1), cc.rotateBy(0.5, 720),cc.fadeOut(0.5)]);
            node_other.runAction(cc.sequence(action,cc.destroySelf()))
            // node_other.getComponent(cc.Label).string = playname + " " +"@ "+nMul
            // cc.tween(node_other)
            // .to(0.3,{x:node_other.position.x - ((Math.random()-0.5)*50+100),y:node_other.position.y-((Math.random()-0.5)*100+240),angle:Math.random()*180,opacity:Math.random()*100})
            // .removeSelf()
            // .start()

        }
    },




    _showOPUIStatu(statusVal){
        let node_op = cc.find("node_op",this.node)
        let cmps = node_op.getComponentsInChildren("CricketX_OP")
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

    _updateRocketPos:function(){
        let datas = this._getCurNul()
        let nMul = datas[0]
        //倍率
        this._setMulResult(true,nMul)

        this.updateCashOutCoin()
    },

    _setMulResult:function(bShow,nMul,color){
        let lblM = cc.find("node_game/multVal",this.node)
        lblM.active = bShow
        if(bShow){
            lblM.getComponent(cc.Label).string = Number(nMul).toFixed(2)+"x"
            if(!color){
                color = cc.Color(255,255,255)
            }
            lblM.color = color
        }
        
        
    },

    update (dt) {
        if(this._bFly){
            //更新当前时间
            if(cc.vv.gameData){
                cc.vv.gameData.addCurTime(dt)
                this._updateRocketPos()
            }
            

        }
    },

});
