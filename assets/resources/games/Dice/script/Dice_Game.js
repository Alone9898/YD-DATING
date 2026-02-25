/**
 * 单人玩法——Dice
 */
cc.Class({
    extends: require("Table_Game_Base"),

    properties: {
        _lastReult:50,
        _bCanBet:true,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this 
        this._super()

        let objslider = cc.find("node_game/node_mid/slider_change",this.node)
        objslider.on("slide",this.onSlidChange,this)

        Global.registerEvent("Bet_Change",this.onBetChange,this)

        //倍率
        let input_payout = cc.find("node_game/node_mid/pay_bg",this.node)
        input_payout.getComponent("Number_Tuning").setValChangeCall((val)=>{
           self.onPayoutValChange(val)
        })

    },

    // start () {

    // },

    // update (dt) {},

    //单人玩法就没有什么阶段，每次都显示成初始化的状态即可。
    //点击按钮就得一次结果
    showGameByStatus:function(st,doStatusChange){
        this.initShow()
    },

    initShow:function(){

        //结果数字
        this._lastReult = 50
        this.setResultVal(this._lastReult)

        //赔率
        this.nPayoutVal = 2
        this.nChanceVal = cc.vv.gameData.getUnder(this.nPayoutVal)

        this.setResultMul(this.nPayoutVal)
    },

    //设置结果显示
    setResultVal:function(val,bAni){
        let self = this
        let node_game_top = cc.find("node_game/node_top",this.node)
        let toX = (val/100)*1020
        let node_bar = cc.find("pt/bar",node_game_top)
        //结果数字
        let nNum =  Global.SavePoints(Global.FormatNumToComma((val))) 
        if(bAni){
            let begin = this._lastReult
            let nTime = 0.5
            let endCall = function(){
                let op_node = cc.find("node_game/node_op",self.node)
                if(cc.isValid(op_node)){
                    let bAuto = op_node.getComponent("Dice_OP").getAutoModel()
                    if(bAuto){
                        

                        self.scheduleOnce(()=>{
                            op_node.getComponent("Dice_OP").canNextRound(true)
                        },0.5)
                    }
                    else{
                        //可以进行下一轮下注
                        self.setCanBet(true)
                    }
                }
                
                
            }
            Global.doRoallNumEff(cc.find("lbl_result",node_game_top),begin,val,nTime,endCall,null,2)

            cc.tween(node_bar)
            .to(nTime,{x:toX})
            .start()
            
            Global.TableSoundMgr.playEffect("dice_ball_move")
        }
        else{
            Global.setLabelString("lbl_result",node_game_top,nNum)
            node_bar.x = toX
            
        }
        
        
    },

    //设置倍率显示
    //val payout
    setResultMul:function(val,bUpdatePayout=true){
        let node_game_mid = cc.find("node_game/node_mid",this.node)
        
        //倍率
        if(bUpdatePayout){
            cc.find("pay_bg",node_game_mid).getComponent("Number_Tuning").setValue(val)
        }
       
        //win
        let curBet = this.getCurBet()
        let willWin = Global.SavePoints(val*curBet)
        Global.setLabelString("lbl_potential/val",node_game_mid,willWin)
        //change
        let nChange = this.getCurChance()
        Global.setLabelString("lbl_chance/val",node_game_mid,Global.SavePoints(nChange)+"%")
        //slider
        let slider = cc.find("slider_change",node_game_mid)
        slider.getComponent(cc.Slider).progress = nChange/100

        let node_op = cc.find("node_game/node_op",this.node)
        //under
        let under_val = cc.vv.gameData.getUnder(val)
        Global.setLabelString("btn_green/Background/num/val",node_op,Global.SavePoints(under_val))

        //over
        let over_val = cc.vv.gameData.getOver(val)
        Global.setLabelString("btn_blue/Background/num/val",node_op,Global.SavePoints(over_val))

        let nTime = 0.5
        let proVal = under_val/100
        let node_game_top = cc.find("node_game/node_top",this.node)
        let s_blue = cc.find("s_blue/pro",node_game_top)
        let s_green = cc.find("s_green/pro",node_game_top)
        cc.tween(s_blue.getComponent(cc.ProgressBar))
        .to(nTime,{progress:proVal})
        .start()

        cc.tween(s_green.getComponent(cc.ProgressBar))
        .to(nTime,{progress:1-proVal})
        .start()

    },

    //当前押注额
    getCurBet:function(){
        let val = 0
        let node_bet = cc.find("node_game/node_op",this.node)
        val = node_bet.getComponent("Dice_OP").getCurBet()
        return val
    },

    getCurChance:function(){
        return this.nChanceVal
    },

    getCurPayout:function(){
        return this.nPayoutVal
    },

    onPayoutValChange:function(val){
        this.nPayoutVal = val
        this.nChanceVal = cc.vv.gameData.getUnder(this.nPayoutVal)
        this.setResultMul(this.nPayoutVal,false)

        
        // this.setChanceSlider(this.nChanceVal)
    },

    setChanceSlider:function(val){
        let objslider = cc.find("node_game/node_mid/slider_change",this.node)
        objslider.getComponent(cc.Slider).progress = val/100
    },

    onSlidChange:function(p){
        let objslider = cc.find("node_game/node_mid/slider_change",this.node)
        let val = objslider.getComponent(cc.Slider).progress
        let tempVal = Number(val)*100
        let minChange = cc.vv.gameData.getMinChange()
        let maxChange = cc.vv.gameData.getMaxChange()
        if(tempVal>maxChange){
            tempVal = maxChange
        }
        if(tempVal<minChange){
            tempVal = minChange
        }
        this.nChanceVal = (tempVal).toFixed(2)
        
        this.nPayoutVal = cc.vv.gameData.getPayout(this.nChanceVal)
        this.setResultMul(this.nPayoutVal)

        Global.TableSoundMgr.playEffect("dice_ball_drag")
    },

    onBetChange:function(data){
        let val = data.detail
        this.setResultMul(this.nPayoutVal)
    },

    showGameResult:function(msg){
        let res = msg.result
        //显示结果
        this.setResultVal(res.num,true)
        //更新历史记录
        let record = cc.find("node_game/node_records",this.node)
        record.getComponent("Dice_Records").showRecords(true)

        //显示赢钱
        if(res.res){
            let bottomscp =  cc.vv.gameData.getBottomScript()
            let fly_score = cc.find("fly_score",bottomscp.node)
            fly_score.active = true
            fly_score.getComponent("Table_FlyScore").setScore(msg.wincoin)

            Global.TableSoundMgr.playEffect("soft_win")
        }
    },

    setCanBet:function(val){
        this._bCanBet = val
        let opVal = val?255:155
        let node_game = cc.find("node_game",this.node)
        //payout
        let payout = cc.find("node_mid/pay_bg",node_game)
        payout.opacity = opVal
        payout.getComponent(cc.Button).interactable = val

        //slider change
        let slider = cc.find("node_mid/slider_change",node_game)
        slider.opacity = opVal
        slider.getComponent(cc.Slider).enabled = val

        //btn_under
        let btn_under = cc.find("node_op/btn_green",node_game)
        btn_under.opacity = opVal
        btn_under.getComponent(cc.Button).interactable = val

        //btn_over
        let btn_over = cc.find("node_op/btn_blue",node_game)
        btn_over.opacity = opVal
        btn_over.getComponent(cc.Button).interactable = val

        let node_bet = cc.find("node_op/bet",node_game)
        node_bet.getComponent(cc.Button).interactable = val

        let btn_add = cc.find("btn_add",node_bet)
        btn_add.opacity = opVal
        btn_add.getComponent(cc.Button).interactable = val
        let btn_max = cc.find("btn_max",node_bet)
        btn_max.opacity = opVal
        btn_max.getComponent(cc.Button).interactable = val
        let btn_minus = cc.find("btn_minus",node_bet)
        btn_minus.opacity = opVal
        btn_minus.getComponent(cc.Button).interactable = val
        let btn_min = cc.find("btn_min",node_bet)
        btn_min.opacity = opVal
        btn_min.getComponent(cc.Button).interactable = val


    },

    isCanBet:function(){
        return this._bCanBet
    },

    



});
