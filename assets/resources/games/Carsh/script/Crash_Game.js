/**
 * Crash 游戏逻辑
 */

 let STATUS_TIME = {
    FREE:5,
    BET:18,
    RESULT:10
}

cc.Class({
    extends: require("Table_Game_Base"),

    properties: {
        _bFly:null,//是否起飞
        _bAuto:false,
        _totalBet:0,
        _flee:1.2,
        _bShowFleeTips:false,
        nSelectCnt:0,
    },

    onLoad () {
        this._super()

        let btn_mode = cc.find("node_bottom/mode_change",this.node)
        Global.btnClickEvent(btn_mode, this.onClickModelChange, this)

        // let btn_chip = cc.find("node_op/node_manul_c/node_chip",this.node)
        // Global.btnClickEvent(btn_chip, this.onClickAddChip, this)
        let btn_clear_chip = cc.find("node_op/node_manul_c/btn_chip_clear",this.node)
        Global.btnClickEvent(btn_clear_chip, this.onClickClearChip, this)

        //flee
        let btn_flee = cc.find("node_op/node_manul_c/btn_flee",this.node)
        Global.btnClickEvent(btn_flee, this.onClickFlee, this)
        let input_close = cc.find("node_input/btn_close",this.node)
        Global.btnClickEvent(input_close, this.onClickFleeClose, this)
        let btn_flee_add = cc.find("node_op/node_manul_c/btn_flee_change/btn_add",this.node)
        Global.btnClickEvent(btn_flee_add, this.onClickAddFlee, this)
        let btn_flee_mius = cc.find("node_op/node_manul_c/btn_flee_change/btn_minus",this.node)
        Global.btnClickEvent(btn_flee_mius, this.onClickMinusFlee, this)

        //input auto
        let btn_stop_profit = cc.find("node_op/node_auto_c/btn_stop_profit",this.node)
        Global.btnClickEvent(btn_stop_profit, this.onClickStopProfit, this)
        let btn_add_profit = cc.find("node_op/node_auto_c/btn_profit_change/btn_add",this.node)
        Global.btnClickEvent(btn_add_profit, this.onClickAddProfit, this)
        let btn_minus_profit = cc.find("node_op/node_auto_c/btn_profit_change/btn_minus",this.node)
        Global.btnClickEvent(btn_minus_profit, this.onClickMinusProfit, this)

        let btn_stop_loss = cc.find("node_op/node_auto_c/btn_stop_loss",this.node)
        Global.btnClickEvent(btn_stop_loss, this.onClickStopLoss, this)
        let btn_add_loss = cc.find("node_op/node_auto_c/btn_loss_change/btn_add",this.node)
        Global.btnClickEvent(btn_add_loss, this.onClickAddLoss, this)
        let btn_minus_loss = cc.find("node_op/node_auto_c/btn_loss_change/btn_minus",this.node)
        Global.btnClickEvent(btn_minus_loss, this.onClickMinusLoss, this)

        let btn_sure = cc.find("node_input_auto/btn_close",this.node)
        Global.btnClickEvent(btn_sure, this.onClickSure, this)

        //guess
        let btn_guess = cc.find("node_bottom/btn_guess",this.node)
        Global.btnClickEvent(btn_guess, this.onClickGuess, this)

        //cashout
        let btn_cashout = cc.find("node_result/btn_cashout",this.node)
        Global.btnClickEvent(btn_cashout, this.onClickCashout, this)

        //start auto
        let btn_startauto = cc.find("node_bottom/btn_auto_start",this.node)
        Global.btnClickEvent(btn_startauto, this.onClickStartAuto, this)
        let btn_stopauto = cc.find("node_bottom/btn_auto_stop",this.node)
        Global.btnClickEvent(btn_stopauto, this.onClickStopAuto, this)


        let pSlider = cc.find("node_input_auto/slider_bar",this.node)
        pSlider.on("slide",this.onSlidEvent,this)

        Global.registerEvent("input_num",this.onEventInputNum,this)
        Global.registerEvent("change_chip",this.onEventRefushSelect,this)
    },


    _getBetListScript(){
        if(!this._betListScp){
            this._betListScp = this.node.getComponentInChildren("Table_BetList_Base")
        }
        return this._betListScp
    },


    onClickModelChange:function(){
        this._bAuto = !this._bAuto
        this._showBetModel(this._bAuto)
    },


    onEventRefushSelect:function(data){
        this.nSelectCnt += 1
        if(this.nSelectCnt>1){ //首次进入游戏，不加筹码
            
            let val = data.detail
            let bEncough = cc.vv.gameData.isCoinEncough(val) 
            if(bEncough){
                cc.vv.gameData.addMyCoin(-val,true)
                this._totalBet += val
                this._showTotalBet()
                if(this._totalBet>0 ){
                    this.showGuessTips(true)
                    this.showFleeTips(false)
                }
            }
            else{
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
                    }, false, () => { }, ___("提示"), ___("取消"), ___("Charge"))
                    cc.vv.gameData.clearLastBet()
                } else {
                    cc.vv.EventManager.emit(EventId.NOT_ENOUGH_COINS);
                }

            }
        }
        
        
    },

    // onClickAddChip:function(){
    //     // let bet_list = this._getBetListScript()
    //     // let curVal = bet_list.getSelectChipVal()
    //     // this._totalBet += curVal
    //     // this._showTotalBet()
    // },

    onClickFlee:function(){
        this._showFleeinput(true)
        this.showFleeTips(false)
    },

    onClickAddFlee:function(){
        let curVal = this._getCurFlee()
        if(curVal){
            if(curVal<100){
                curVal += 0.01
                if(curVal>100) curVal = 100
            }
        }
        else{
            curVal = 1.01
        }
        this._fleeCont(curVal)
        this._showFleeinput(false)
    },

    onClickMinusFlee:function(){
        let curVal = this._getCurFlee()
        if(curVal){
            if(curVal>1.01){
                curVal -= 0.01
            }
        }
        else{
            curVal = 1.01
        }
        this._fleeCont(curVal)
        this._showFleeinput(false)
    },

    onClickFleeClose:function(){
        let curVal = this._getCurFlee()
        if(curVal>1 && curVal <= 100){
            //有效
        }
        else{
            this._fleeCont(0)
            cc.vv.FloatTip.show("Flee Condition shuld be 1.01 ~ 100")
        }
        
        this._showFleeinput(false)

    },

    onClickStopProfit:function(){
        this._autoType = 1
        
        this._showAutoinput(true)
    },

    onClickAddProfit:function(){
        if(this._auto_profit_con){
            this._auto_profit_con = Number(this._auto_profit_con) + 0.01
            if(this._auto_profit_con>1) this._auto_profit_con = 1
        }
        else{
            this._auto_profit_con = 0.01
        }
        this._autoProfitCont(this._auto_profit_con)
    },

    onClickMinusProfit:function(){
        if(this._auto_profit_con){
            this._auto_profit_con = Number(this._auto_profit_con) - 0.01
            if(this._auto_profit_con<0) this._auto_profit_con = 0
        }
        else{
            this._auto_profit_con = 0.01
        }
        this._autoProfitCont(this._auto_profit_con)
    },

    onClickStopLoss:function(){
        this._autoType = 2
        this._showAutoinput(true)
    },

    onClickAddLoss:function(){
        if(this._auto_loss_con){
            this._auto_loss_con = Number(this._auto_loss_con) + 0.01
            if(this._auto_loss_con>1) this._auto_loss_con = 1
        }
        else{
            this._auto_loss_con = 0.01
        }
        this._autoLossCont(this._auto_loss_con)
    },

    onClickMinusLoss:function(){
        if(this._auto_loss_con){
            this._auto_loss_con = Number(this._auto_loss_con) - 0.01
            if(this._auto_loss_con<0) this._auto_loss_con = 0
        }
        else{
            this._auto_loss_con = 0.01
        }
        this._autoLossCont(this._auto_loss_con)
    },

    onClickSure:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        let objSlider = cc.find("node_input_auto/slider_bar",this.node)
        let nPer = objSlider.getComponent(cc.Slider).progress
        if(this._autoType == 1){
            this._autoProfitCont(nPer)
        }
        else if(this._autoType == 2){
            this._autoLossCont(nPer)
        }
        this._showAutoinput(false)
    },

    onClickClearChip:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        cc.vv.gameData.addMyCoin(this._totalBet,true)
        this._totalBet = 0
        this._showTotalBet()
        this.showGuessTips(false)
    },

    onClickGuess:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        let chipVal = this._totalBet
        if(chipVal>0){
            //是否足够
            // let bEncough = cc.vv.gameData.isCoinEncough(chipVal) 
            // if(bEncough){
            //     cc.vv.gameData.addMyCoin(-chipVal,true)
                let nFlee = this._getCurFlee()
                cc.vv.gameData.sendBetReq(nFlee,chipVal)
                this.setCanSelectChips(false)
            // }
            // else{
            //     cc.vv.FloatTip.show("You don't have enough chips！")
            // }
        }
        else{
            cc.vv.FloatTip.show("chips should be set!")
        }
    },

    onClickCashout:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        //手动结算
        this._bClickSend = true
        this._showCashoutBtn(false)

        cc.vv.gameData.sendCashout()
    },

    onEventInputNum:function(data){
        let val = data.detail
        this._fleeCont(val)
    },

    _autoProfitCont:function(val){
        this._auto_profit_con = Number(val).toFixed(2)
        let nShow = parseInt(Number(val).toFixed(2)*100)
        Global.setLabelString("node_op/node_auto_c/btn_stop_profit/Background/val",this.node,nShow+"%")
    }, 

    _autoLossCont:function(val){
        this._auto_loss_con = Number(val).toFixed(2)
        let nShow = parseInt(Number(val).toFixed(2)*100)
        Global.setLabelString("node_op/node_auto_c/btn_stop_loss/Background/val",this.node,nShow+"%")
    },

    _fleeCont:function(val){
        if(val == 0){
            val = "--"
        }
        else{
            val = Number(val).toFixed(2)
        }
        Global.setLabelString("node_op/node_manul_c/btn_flee/Background/val",this.node,val)
    },

    _getCurFlee:function(){
        let val = cc.find("node_op/node_manul_c/btn_flee/Background/val",this.node).getComponent(cc.Label).string
        let nFlee = 0
        if(Number(val)){
            nFlee = Number(val)
        }
        return nFlee
    },

    _showFleeinput:function(bShow){
        let node_input = cc.find("node_input",this.node)
        node_input.active = bShow
        if(bShow){
            node_input.getComponent("Input_Nums").init()
        }
    },

    _showAutoinput:function(bShow){
        let node_input = cc.find("node_input_auto",this.node)
        node_input.active = bShow
    },


    _showTotalBet:function(){
        let node_chip = cc.find("node_op/node_manul_c/node_chip",this.node)
        Global.setLabelString("Background/val",node_chip,Global.FormatNumToComma(this._totalBet))
    },


    start () {
        this._super()
        this._initXYLine()

        this._showBetModel(this._bAuto)
    },


    _initXYLine:function(){
        let xNum = 33
        let yNum = 33*3

        let xLine = cc.find("node_result/mask_x/xline",this.node)
        let xItem = cc.find("time_num",xLine)
        let xLay = cc.find("lay_nums",xLine)
        for( let i = 0; i < xNum; i++){
            let item = cc.instantiate(xItem)
            item.active = true
            item.y = 0
            item.parent = xLay
            cc.find("val",item).getComponent(cc.Label).string = (i+1)*2 +"s"
        }

        let yLine = cc.find("node_result/mask_y/yline",this.node)
        let yItem = cc.find("time_num",yLine)
        let yLay = cc.find("lay_nums",yLine)
        for(let i = 0; i < yNum; i++){
            let item = cc.instantiate(yItem)
            item.active = true
            item.x = -13
            item.parent = yLay
            cc.find("val",item).getComponent(cc.Label).string = Number((1+(i+1)*0.2)).toFixed(2) + "x"
        }
    },

    //押注逻辑
    showBetStatu:function(){
        Global.TableSoundMgr.playEffect("round_start")
        this._bClickSend = null
        let self = this
        this.showStar(false)
        let endCall = function(){

        }
        let perCall = function(val){
            let pro = cc.find("node_retimer/pro",self.node)
            let nPer = val/STATUS_TIME.BET
            pro.getComponent(cc.ProgressBar).progress = nPer
        }

        this._showReTime(true,endCall,"%ss",perCall)

        //设置是否可以下注
        let bDoBet = false
        let roundInfo = cc.vv.gameData.getMyRoundBet()
        if(roundInfo && roundInfo.betcoin){
            bDoBet = true
        }
        this.setCanSelectChips(!bDoBet)

        //轴归位
        let yLine = cc.find("node_result/mask_y/yline",this.node)
        yLine.y = -450
        let xLine = cc.find("node_result/mask_x/xline",this.node)
        xLine.x = -450
        //火箭，线路隐藏
        let objRack = cc.find("node_result/huojian",this.node)
        objRack.active = false
        
        let rockLine = cc.find("node_result/rack_line",this.node)
        rockLine.width = 0

        
        if(this._auto_playing){
            
            let oldCoin = cc.vv.gameData.getAutoStartCoin()
            let curCoin = cc.vv.gameData.getMyCoin()
            let bNeedStopAuto = false
            if(curCoin > oldCoin){
                //赢
                let nWin = curCoin - oldCoin
            //    cc.log("1===="+Number(this._auto_profit_con))
            //    cc.log("2===="+(nWin/oldCoin))
                if(this._auto_profit_con && Number(this._auto_profit_con) <= (nWin/oldCoin)){
                    //到达结束自动条件
                    bNeedStopAuto = true
                }
            }
            else{
                //输
                let nLose = oldCoin - curCoin
                if(this._auto_loss_con && this._auto_loss_con <= (nLose/oldCoin)){
                    //到达结束自动条件
                    bNeedStopAuto = true
                }
            }
            
            let bEncough = cc.vv.gameData.isCoinEncough(this._totalBet) 
            if(!bEncough){
                //可以自动
                bNeedStopAuto = true
            }
            else{
                //
                cc.vv.gameData.addMyCoin(-this._totalBet,true)
                this._showTotalBet()
            }

            if(bNeedStopAuto){
                this._auto_playing = false
                this._showBetModel(this._bAuto)
            }
            else{
                //自动下注
                this.onClickGuess()
                cc.vv.FloatTip.show("Auto bet success!")
            }
            
        }
        else{
            this._totalBet = cc.vv.gameData.getMyRoundBet().betcoin
            this._showTotalBet()
        }

        //没下注才显示提示
        this.showFleeTips(!this._totalBet)
        cc.find("node_result/result_point",this.node).active = false
    },

    setCanSelectChips:function(val){
        this._super(val)
        let btn_guess = cc.find("node_bottom/btn_guess",this.node)
        btn_guess.getComponent(cc.Button).interactable = val
        if(!val){
            this.showGuessTips(false)
        }
        let btn_startauto = cc.find("node_bottom/btn_auto_start",this.node)
        btn_startauto.getComponent(cc.Button).interactable = val

        let btn_clear_chip = cc.find("node_op/node_manul_c/btn_chip_clear",this.node)
        btn_clear_chip.getComponent(cc.Button).interactable = val
    },

    //飞机开始起飞
    showStartFly:function(){
        this.showStar(true)
        this.setCanSelectChips(false)
        this._showReTime(false)
        this._showRocketFly()
        this.showFleeTips(false)
        if(!this._auto_playing){
            if( this._totalBet != cc.vv.gameData.getMyRoundBet().betcoin){
                cc.vv.gameData.addMyCoin(this._totalBet,true)
                this._totalBet = cc.vv.gameData.getMyRoundBet().betcoin
                this._showTotalBet()
                
            }
        }
        
        
    },

    //自动领取奖励
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
            let node_result = cc.find("node_result",this.node)
            let node_other = cc.instantiate(cc.find("lbl_others",node_result))
            node_other.active = true
            node_other.parent = node_result
            node_other.position = cc.find("huojian",node_result).position
            node_other.getComponent(cc.Label).string = playname + " " +"@ "+nMul
            cc.tween(node_other)
            .to(0.7,{x:node_other.position.x - 100,y:-240})
            .removeSelf()
            .start()

        }
        
    },

    

    //结果表现
    async showResultStatu(){
        this._showReTime(false)
        this.setCanSelectChips(false)
        let roundInfo = cc.vv.gameData.getMyRoundBet()
        if(roundInfo){
            this._totalBet = roundInfo.betcoin
            this._showTotalBet()
        }
        
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

    //飞机起飞
    _showRocketFly:function(){
        let roundInfo = cc.vv.gameData.getAreaInfo()

        let objRack = cc.find("node_result/huojian",this.node)
        objRack.getComponent(sp.Skeleton).setAnimation(0,"animation",true)

        let nMul
        if(roundInfo.crash){
            //已爆炸
            nMul = roundInfo.mult
            objRack.active = false
        }
        else{
            //没有爆炸
            if(!this._bFly){
                Global.TableSoundMgr.playEffect("rocket_fly")
            }
            
            this._bFly = true
            
            let datas =  this._getCurNul()
            nMul = datas[0]
        }

        //倍率
        let pointObj = cc.find("node_result/result_point",this.node)
        pointObj.active = true
        Global.setLabelString("val",pointObj,Number(nMul).toFixed(2)+"x")



    },

    //是否可以显示cashout按钮了
    _checktCanShowCashOutBtn:function(nMul){
        let nMyBet = cc.vv.gameData.getMyRoundBet()
        if(nMyBet){
            if(nMyBet.betcoin>0  && !nMyBet.cashout && !this._bClickSend){
                //有下注
                this._showCashoutBtn(true)
            }
        }
    },

    //更新飞机位置
    _updateRocketPos:function(){
        let datas = this._getCurNul()
        let nMul = datas[0]
        this._checktCanShowCashOutBtn(nMul)
        let t = datas[1]
        //倍率
        let pointObj = cc.find("node_result/result_point",this.node)
        pointObj.active = true
        Global.setLabelString("val",pointObj,Number(nMul).toFixed(2)+"x")

        let yLine = cc.find("node_result/mask_y/yline",this.node)
        let xLine = cc.find("node_result/mask_x/xline",this.node)
        let objRack = cc.find("node_result/huojian",this.node)
        objRack.active = true
        //x 2s对应150 
        //y 0.2倍对应180
        let y_dif =200
        let nFixTime = 11
        if(t > nFixTime){

            //x,y轴动
            let t10 = this._getCurNul(nFixTime)
            //飞机固定在10s的位置
            let x = t10[1] * (150/2)
            let y = (t10[0]-1) * (y_dif/0.2)
            objRack.position = cc.v2(x-400,y-440+15)
            let rockLine = cc.find("node_result/rack_line",this.node)
            rockLine.width = x

            yLine.y = -450 + (nMul - t10[0])*(-y_dif/0.2)
            xLine.x = -450 + (t-nFixTime)*(-150/2)
        }
        else{
            //飞机动
            let x = t * (150/2)
            let y = (nMul-1) * (y_dif/0.2)
            objRack.position = cc.v2(x-400,y-440+15)

            let rockLine = cc.find("node_result/rack_line",this.node)
            rockLine.width = x

            //飞机方向
            objRack.angle = this._getRackAngle(t)
        }

    },

    _getRackAngle:function(t){
        
        let quantCfg = cc.vv.gameData.getQuantParam()
        let a = quantCfg.a
        let b = quantCfg.b
        //对t求导
        let k = 2*a*t + b
        let ang = Math.atan(k * 1000 / 75) 
        
        return ang/Math.PI*180-90
    },

    //飞机爆炸
    _showRocketOver:function(nMul){
        this._bFly = null
        let objRack = cc.find("node_result/huojian",this.node)
        objRack.getComponent(sp.Skeleton).setAnimation(0,"animation2",false)
        //重置押注数据
        cc.vv.gameData.resetMyRoundBet()
        this._showCashoutBtn(false)
        //更新倍率
        let pointObj = cc.find("node_result/result_point",this.node)
        pointObj.active = true
        Global.setLabelString("val",pointObj,Number(nMul).toFixed(2)+"x")

        //更新趋势
        cc.find("node_records",this.node).getComponent("Crash_Record").showRecords(true)

        Global.TableSoundMgr.playEffect("boom")

        this.doShowResultFinish()
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

    //
    _showBetModel:function(bAuto){
        let auto_flag = cc.find("node_bottom/mode_change/auto",this.node)
        let munal_flag = cc.find("node_bottom/mode_change/munal",this.node)
        auto_flag.active = bAuto
        munal_flag.active = !bAuto

        let btn_start_auto = cc.find("node_bottom/btn_auto_start",this.node)
        let btn_guess = cc.find("node_bottom/btn_guess",this.node)
        btn_guess.active = !bAuto
        btn_start_auto.active = bAuto

        let node_auto = cc.find("node_op/node_auto_c",this.node)
        node_auto.active = bAuto
        // //自动profit
        // let btn_profit = cc.find("node_op/node_auto_c/btn_stop_profit",this.node)
        // let btn_profit_change = cc.find("node_op/node_auto_c/btn_profit_change",this.node)
        // //自动loss
        // let btn_lose = cc.find("node_op/node_auto_c/btn_stop_loss",this.node)
        // let btn_lose_change = cc.find("node_op/node_auto_c/btn_loss_change",this.node)
        // btn_profit.active = bAuto
        // btn_profit_change.active = bAuto
        // btn_lose.active = bAuto
        // btn_lose_change.active = bAuto
        
        let btn_startauto = cc.find("node_bottom/btn_auto_start",this.node)
        btn_startauto.active = bAuto && !this._auto_playing
        let btn_stopauto = cc.find("node_bottom/btn_auto_stop",this.node)
        btn_stopauto.active = bAuto && this._auto_playing

    },

    showCashoutWin:function(win){
        let objWin = cc.find("node_result/win",this.node)
        Global.setLabelString("val",objWin,Global.FormatNumToComma(win) )
        objWin.active = true
        objWin.y = 0
        cc.tween(objWin)
        .to(0.2,{y:30})
        .delay(1.5)
        .call(()=>{
            objWin.active = false
        })
        .start()

        let mynode = this.getMyNode()
        mynode.getComponent("Table_Player_Base").playFlyScroe(win)
        cc.vv.gameData.refushMyCoin()

        this._showCashoutBtn(false)

        Global.TableSoundMgr.playEffect("cash_out_win")
    },

    _showCashoutBtn:function(bShow){
        let btn = cc.find("node_result/btn_cashout",this.node)
        btn.active = bShow
    },

    onClickStartAuto:function(){
        if(this._totalBet>0){
            this._auto_playing = true
            let nCoin = cc.vv.gameData.getMyCoin()
            cc.vv.gameData.setAutoStartCoin(nCoin)
            this._showBetModel(true)

            //是否是下注阶段
            let nState = cc.vv.gameData.getGameStatus()
            if(nState == 2){
                //如果是下注节点，立马下注
                this.onClickGuess()
            }
            
        }
        else{
            cc.vv.FloatTip.show("Please first bet")
        }
        
    },

    onClickStopAuto:function(){
        this._auto_playing = false
        this._auto_playing = false
        this._showBetModel(true)
    },
    
    onSlidEvent:function(){
        // this._auto_profit_con = Number(val).toFixed(2)
        // let nShow = parseInt(Number(val).toFixed(2)*100)

        let pSlider = cc.find("node_input_auto/slider_bar",this.node)
        let val = pSlider.getComponent(cc.Slider).progress
        // this._sliderVal = val.toFixed(2)
        let front = cc.find("front",pSlider)
        front.width = pSlider.width*val
        Global.setLabelString("val",pSlider,parseInt((val.toFixed(2)*100))+"%")
    },

    showStar:function(bShow){
        let starNode = cc.find("node_result/stars",this.node)
        starNode.active = bShow
    },

    showFleeTips:function(bShow){
        let node = cc.find("node_op/node_manul_c/btn_flee/node_liuguang",this.node)
        if(bShow){
            if(!this._bShowFleeTips){
                
                node.active = bShow
                this._bShowFleeTips = true
            }
        }
        else{
            node.active = bShow
        }
        
        
    },

    showGuessTips:function(bShow){
        let node = cc.find("node_bottom/btn_guess/node_liuguang",this.node)
        node.active = bShow
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
