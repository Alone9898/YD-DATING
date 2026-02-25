/**
 * 底部操作栏
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this
        // this.bet_node = cc.find("bet",this.node)
        // this.bet_node.getComponent("Number_Tuning").setValChangeCall((val)=>{
        //     Global.dispatchEvent("Bet_Change",val)
        // })

        let btn_bet = cc.find("btn_bet",this.node)
        Global.btnClickEvent(btn_bet,this.onClickBet,this)
        

        //auto
        let btn_auto = cc.find("btn_auto",this.node)
        Global.btnClickEvent(btn_auto,this.onClickAuto,this)

        let btn_stop = cc.find("btn_stop",this.node)
        Global.btnClickEvent(btn_stop,this.onClickStop,this)

        
    },

    start () {

    },

    setCurBet(val){
        let cmp = cc.find("bet",this.node).getComponent("Number_Tuning")
        cmp.setValue(val)
    },


    getCurBet(){
        let cmp = cc.find("bet",this.node).getComponent("Number_Tuning")
        return cmp.getValue()
    },

    onClickBet(){
        let betVal = this.getCurBet()
        let bEncough = cc.vv.gameData.isCoinEncough(betVal)
        if(bEncough){
            let nums = cc.vv.gameData.getScriptGame().getMySelects()
            if(nums && nums.length>1){
                cc.vv.gameData.getScriptGame()._clearLasResult()
                cc.vv.gameData.sendBetReq(betVal,nums)
                cc.vv.gameData.getScriptGame().setCanBet(false)
            }
            else{
                cc.vv.FloatTip.show("PICK NUMBERS FOR START")
            }
            
        }
        else{
            //金币不足
            cc.vv.gameData.showChargeTips()
            this._bAutoDir = 0
            this._showAutoBtn(true)
        }
        Global.TableSoundMgr.playEffect("big_button")
    },

    

    getAutoModel(){
        return this._bAutoDir
    },

    onClickAuto(){
        let nums = cc.vv.gameData.getScriptGame().getMySelects()
        if(nums && nums.length>1){
            this._bAutoDir = 1
            this._showAutoBtn(false)
            this.canNextRound()
            Global.TableSoundMgr.playCommonEff("com_click")
        }
        else{
            cc.vv.FloatTip.show("PICK NUMBERS FOR START")
        }
        
    },

    onClickStop(){
        this._bAutoDir = 0
        this._showAutoBtn(true)
        

        Global.TableSoundMgr.playCommonEff("com_click")
    },


    _showAutoBtn(bShow){
        let btn_auto = cc.find("btn_auto",this.node)
        btn_auto.active = bShow
        let btn_stop = cc.find("btn_stop",this.node)
        btn_stop.active = !bShow
    },

    

    canNextRound(bForse){
        let bCanbet = cc.vv.gameData.getScriptGame().isCanBet()
        if(bCanbet || bForse){
            if(this._bAutoDir == 1){
                this.onClickBet()
            }
            else{
                cc.vv.gameData.getScriptGame().setCanBet(true)
            }
        }
    },




    // update (dt) {},
});
