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
        this.bet_node = cc.find("bet",this.node)
        this.bet_node.getComponent("Number_Tuning").setValChangeCall((val)=>{
            Global.dispatchEvent("Bet_Change",val)
        })

        let btn_under = cc.find("btn_green",this.node)
        Global.btnClickEvent(btn_under,this.onClickUnder,this)
        let btn_over = cc.find("btn_blue",this.node)
        Global.btnClickEvent(btn_over,this.onClickOver,this)

        //auto
        let btn_auto = cc.find("btn_auto",this.node)
        Global.btnClickEvent(btn_auto,this.onClickAuto,this)

        let btn_stop = cc.find("btn_stop",this.node)
        Global.btnClickEvent(btn_stop,this.onClickStop,this)

        //自动选择
        let auto_over = cc.find("node_auto_sel/over",this.node) 
        Global.btnClickEvent(auto_over,this.onClickAutoOver,this)
        let auto_under = cc.find("node_auto_sel/under",this.node) 
        Global.btnClickEvent(auto_under,this.onClickAutoUnder,this)
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

    onClickUnder(){
        let betVal = this.getCurBet()
        let bEncough = cc.vv.gameData.isCoinEncough(betVal)
        if(bEncough){
            let payout = cc.vv.gameData.getScriptGame().getCurPayout()
            cc.vv.gameData.sendBetReq(betVal,payout,1)
            cc.vv.gameData.getScriptGame().setCanBet(false)
        }
        else{
            //金币不足
            cc.vv.gameData.showChargeTips()
        }
        Global.TableSoundMgr.playEffect("big_button")
    },

    onClickOver(){
        let betVal = this.getCurBet()
        let bEncough = cc.vv.gameData.isCoinEncough(betVal)
        if(bEncough){
            let payout = cc.vv.gameData.getScriptGame().getCurPayout()
            cc.vv.gameData.sendBetReq(betVal,payout,2)
            cc.vv.gameData.getScriptGame().setCanBet(false)
        }
        else{
            //金币不足
            cc.vv.gameData.showChargeTips()
        }
        Global.TableSoundMgr.playEffect("big_button")
    },

    getAutoModel(){
        return this._bAutoDir
    },

    onClickAuto(){
        this._showAutoSel(true)
        Global.TableSoundMgr.playCommonEff("com_click")
    },

    onClickStop(){
        this._bAutoDir = 0
        this._showAutoBtn(true)
        this._showAutoFlag(this._bAutoDir)

        Global.TableSoundMgr.playCommonEff("com_click")
    },

    onClickAutoOver(){
        this._bAutoDir = 2
        this._showAutoSel(false)
        this._showAutoBtn(false)
        this._showAutoFlag(this._bAutoDir)
        this.canNextRound()

        Global.TableSoundMgr.playCommonEff("com_click")
    },

    onClickAutoUnder(){
        this._bAutoDir = 1
        this._showAutoSel(false)
        this._showAutoBtn(false)
        this._showAutoFlag(this._bAutoDir)
        this.canNextRound()

        Global.TableSoundMgr.playCommonEff("com_click")
    },

    _showAutoSel(bShow){
        let auto_sel = cc.find("node_auto_sel",this.node)
        auto_sel.active = bShow

    },

    _showAutoBtn(bShow){
        let btn_auto = cc.find("btn_auto",this.node)
        btn_auto.active = bShow
        let btn_stop = cc.find("btn_stop",this.node)
        btn_stop.active = !bShow
    },

    _showAutoFlag(dir){
        let under_flag = cc.find("btn_green/auto_flag",this.node)
        under_flag.active = (dir == 1)
        let over_flag = cc.find("btn_blue/auto_flag",this.node)
        over_flag.active = (dir == 2)
    },

    canNextRound(bForse){
        let bCanbet = cc.vv.gameData.getScriptGame().isCanBet()
        if(bCanbet || bForse){
            if(this._bAutoDir == 1){
                this.onClickUnder()
            }
            else if(this._bAutoDir == 2){
                this.onClickOver()
            }
            else{
                cc.vv.gameData.getScriptGame().setCanBet(true)
            }
        }
    },




    // update (dt) {},
});
