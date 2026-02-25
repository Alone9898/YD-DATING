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

    onLoad () {
        this._super()

        //logo
        let nRetimer = this.getRetimerNode()
        let logo = cc.find("logo",nRetimer)
        cc.tween(logo)
        .repeatForever(
            cc.tween()
            .by(2.5,{angle:-360}))
        .start()
    },

    // start () {

    // },

    // update (dt) {},

    getRetimerNode(){
        return cc.find("node_game/node_retimer",this.node)
    },

    showBetStatu:function(){
        Global.TableSoundMgr.stopEffectByName("Ball")
        
        let self = this 
        //设置可以下注
        this._showOPUIStatu(2)
        //清理结算界面
        this.showBall(false)
        this._setMulResult(false)
        this._setBgColor(-1)
        this._setLightAction(false)
        this._showGray(true)
        this._showXYMoveing(0)

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
        let spinObj = cc.find("node_game/line",this.node)
        spinObj.active = false
        this.showBall(false)
        // let spincmp = spinObj.getComponent(sp.Skeleton)
        // spincmp.setToSetupPose()
        // spincmp.setAnimation(0,"mtavarifoni",false)
        // spincmp.addAnimation(0,"ballflycosmosskyloop",false)
        // spincmp.addAnimation(0,"ballflystratosferaskyloop",true)
        // spincmp.setCompleteListener((tck)=>{
        //     if(tck.animation && tck.animation.name == "mtavarifoni"){
        //         Global.TableSoundMgr.playEffect("ballfly_bgm")
        //     }
        // })
        // let trackentiy = spincmp.getCurrent(0)
        // trackentiy.animationStart = STATUS_TIME.BET - nTime
        // this.scheduleOnce(()=>{
        //     this._showReTime(false)
        //     this.showBall(true)
        // },nTime-0.5)

        cc.vv.gameData.sendNextBet()
        // Global.TableSoundMgr.playEffect("Start_1")
    },

    showResultStatu:function(){
        //隐藏倒计时
        this._showReTime(false)
        //显示动画状态
        let spinObj = cc.find("node_game/line",this.node)
        spinObj.active = true
        let spincmp = spinObj.getComponent(sp.Skeleton)
        spincmp.setToSetupPose()
        spincmp.setAnimation(0,"animation3",true)
        this._showXYMoveing(0)
        this._showXYMoveing(1)
        
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
        let ball = cc.find("node_game/flyer",this.node)
        ball.active = bShow
        // ball.getComponent(sp.Skeleton).setAnimation(0,"ballflycosmos",false)
        // ball.getComponent(sp.Skeleton).addAnimation(0,"ballflycosmosloop",true)
    },

    //开始表现结果
    showStartFly:function(){
        let self = this
        //隐藏倒计时
        this._showReTime(false)
        this._showGray(false)
        let spinObj = cc.find("node_game/line",this.node)
        spinObj.active = true
        let spincmp = spinObj.getComponent(sp.Skeleton)
        spincmp.setToSetupPose()
        spincmp.setAnimation(0,"animation",false)
        spincmp.addAnimation(0,"animation3",true)
        spincmp.setCompleteListener((tck)=>{
            if(tck.animation && tck.animation.name == "animation"){
                self._showXYMoveing(1)
            }
        })
        this._showRocketFly()

        this._showOPUIStatu(3)
        
        Global.TableSoundMgr.playEffect("startfly")
    },

    //飞机起飞
    _showRocketFly:function(){
        
        //显示倍率
        let roundInfo = cc.vv.gameData.getAreaInfo()
        let objRack = cc.find("node_game/flyer",this.node)
      
        // objRack.getComponent(sp.Skeleton).setAnimation(0,"ballflycosmosloop",true)
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
                // Global.TableSoundMgr.playEffect("Ball",true)
            }
            text_bust.active = false
            this._bFly = true
            
            let datas =  this._getCurNul()
            nMul = datas[0]
        }

        //倍率
        this._setMulResult(true,nMul,color)
        this._setBgColor(nMul)
        this._setLightAction(true)
    },

     //飞机爆炸
     _showRocketOver:function(nMul){
        this._bFly = null
        
        Global.TableSoundMgr.stopEffectByName("startfly")

        let objRack = cc.find("node_game/flyer",this.node)
        cc.tween(objRack)
        .to(0.1,{x:700,y:objRack.y+100})
        .call(()=>{
            objRack.active = false
        })
        .start()
        let spinObj = cc.find("node_game/line",this.node)
        spinObj.active = false
        let text_bust = cc.find("node_game/spr_brust",this.node)
        text_bust.active = true

        // objRack.getComponent(sp.Skeleton).setAnimation(0,"wageba",false)
        //重置押注数据
        cc.vv.gameData.resetMyRoundBet()
        //更新倍率
        this._setMulResult(true,nMul,cc.Color(243,87,94,255))
        this._setLightAction(false)
        this._showGray(true)
        //更新趋势
        cc.find("node_records",this.node).getComponent("Aviator_Records").showRecords(true)

        Global.TableSoundMgr.playEffect("flyaway")
        this.refushBetOPUI()

        this.doShowResultFinish()

        this._showXYMoveing(2)
    },

    refushBetOPUI:function(){
        let status = cc.vv.gameData.getGameStatus()
        this._showOPUIStatu(status)
    },

    updateCashOutCoin:function(){
        let nMul = this._getCurNul()
        let node_op = cc.find("node_op",this.node)
        let cmps = node_op.getComponentsInChildren("Aviator_OP")
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
            Global.TableSoundMgr.playEffect("cashout")
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
            },0.2)
            let playname = msg.playername
            let nMul = msg.mult
            let node_result = cc.find("node_game",this.node)
            let node_other = cc.instantiate(cc.find("lbl_others",node_result))
            node_other.active = true
            node_other.parent = node_result
            node_other.position = cc.find("flyer",node_result).position
            node_other.getComponent(cc.Label).string = playname + " " +"@ "+nMul
            cc.tween(node_other)
            .to(0.7,{x:node_other.position.x - 100,y:-240})
            .removeSelf()
            .start()

        }
    },



    _showOPUIStatu(statusVal){
        let node_op = cc.find("node_op",this.node)
        let cmps = node_op.getComponentsInChildren("Aviator_OP")
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

        let rockObj = cc.find("node_game/flyer",this.node)
        rockObj.active = true
        let baseNode = cc.find("node_game/line/ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:zong/ATTACHED_NODE:luj16/New Sprite",this.node)
        let toPos = cc.find("node_game",this.node).convertToNodeSpaceAR(baseNode.convertToWorldSpaceAR(cc.v2(0,0)))
        rockObj.x = toPos.x+100
        rockObj.y = toPos.y+50
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

    //背景上的倍率颜色
    _setBgColor:function(nMul){
        let bShow = nMul>0?true:false
        let spr_color = cc.find("node_game/bg/bg_color",this.node)
        spr_color.active = bShow

        let bglight = cc.find("node_game/bg/node_light",this.node)

        if(bShow){
            spr_color.getComponent("Aviator_Game_Color").setColor(nMul>2?2:1)
            cc.tween(bglight)
            .repeatForever(
                cc.tween()
                .by(36,{angle:-360})
            )
            .start()
        }
        else{
            bglight.stopAllActions()
        }

    },

    _setLightAction(bShow){
        let bglight = cc.find("node_game/bg/node_light",this.node)

        if(bShow){
            cc.tween(bglight)
            .repeatForever(
                cc.tween()
                .by(36,{angle:-360})
            )
            .start()
        }
        else{
            bglight.stopAllActions()
        }
    },

    //dir:x,y
    //act:0 归位 1 moving 2 stopmoveing
    _showXYMoveing(act){
        let ars = ['x','y']
        for(let j = 0; j < ars.length; j++){
            let dir_node = cc.find(cc.js.formatStr("node_game/%sline",ars[j]),this.node)
            if(dir_node){
                if(act == 0){
                    let i1 = cc.find("i_1",dir_node)
                    let i2 = cc.find("i_2",dir_node)
                    i1.x = 0
                    i2.x = i1.width
                }
                else if(act == 1){
                    this._startMove = true
                }
                else if(act == 2){
                    this._startMove = null
                }
            }
        }
        
    },

    _moveXYAction(dt){
        let dir_x = cc.find("node_game/xline",this.node)
        let dir_y = cc.find("node_game/yline",this.node)

        for(let i= 0; i <2; i++){
            let item = cc.find("i_"+(i+1),dir_x)
            item.x -= 5
            if(item.x <=-item.width){
                item.x = item.width
            }
        }

        for(let i= 0; i <2; i++){
            let item = cc.find("i_"+(i+1),dir_y)
            item.x -= 3
            if(item.x <=-item.width){
                item.x = item.width
            }
        }
    },

    _showGray(bShow){
        let bglight = cc.find("node_game/bg/gray_mask",this.node)
        bglight.active = bShow
        // let nBegin = 0
        // let nEnd = 150
        // if(!bShow){
        //     nBegin = 150
        //     nEnd = 0
        // }
        // bglight.opacity = nBegin
        // cc.tween(bglight)
        // .to(0.1,{opacity:nEnd})
        // .start()
    },

    update (dt) {
        if(this._bFly){
            //更新当前时间
            if(cc.vv.gameData){
                cc.vv.gameData.addCurTime(dt)
                this._updateRocketPos()
            }
            

        }

        if(this._startMove){
            this._moveXYAction(dt)
        }
    },

});
