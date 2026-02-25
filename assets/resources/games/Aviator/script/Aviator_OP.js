/**
 * 操作栏
 */
cc.Class({
    extends: require("Simple_OP"),

    properties: {
        redFrame:cc.SpriteFrame,
        yellowFrame:cc.SpriteFrame,
    },

    onLoad(){
        this._super()

        let bet_bg = cc.find("node_l/bet_bg",this.node)
        let tog_bet = cc.find("toggle_auto_bet",bet_bg)
        Global.btnClickEvent(tog_bet, this.onClickAutoBet, this)


        //auto bet
        let auto_bet_on = cc.find("node_l/collect_auto_on/btn_autoplay",this.node)
        Global.btnClickEvent(auto_bet_on, this.onClickAutoBetOn, this)

        let auto_bet_off = cc.find("node_l/collect_auto_on/btn_autoplay_stop",this.node)
        Global.btnClickEvent(auto_bet_off, this.onClickAutoBetOff, this)

        Global.btnClickEvent(cc.find("bg_input",bet_bg), this.onClickBetInput, this)

        //初始化累计押注方式
        let bet_add = cc.find("btn_add",bet_bg)
        bet_add.active  = false
        let bet_minus = cc.find("btn_minus",bet_bg)
        bet_minus.active = false
        this.initIncreaceBet()
    },

    start(){
        this._super()
        let tog = cc.find("node_l/collect_auto_on/btn_auto",this.node)
        if(tog){
            tog.getComponent(cc.Toggle).isChecked = false
        }
    },

    onClickAutoBet(){
        Global.TableSoundMgr.playEffect("Checkbox")
        
        let toggle = cc.find("node_l/bet_bg/toggle_auto_bet",this.node)
        let tg = toggle.getComponent(cc.Toggle)
        let showAutoModel = !tg.isChecked
        

        let lbl_bet = cc.find("Background/lbl_bet",toggle)
        lbl_bet.active = showAutoModel
        let bet_check = cc.find("Background/checkmark",toggle)
        bet_check.active = !showAutoModel

        this._showAutoCollect(showAutoModel)
        this._showAutoBtn(!this._bAutoBet)
    },

    resizeNode(bShow){
        let node_h = bShow?490:380
        this.node.height = node_h
        this.node.parent.getComponent(cc.Layout).updateLayout()
    },


    onClickCollectOff(){
        Global.TableSoundMgr.playEffect("Checkbox")
        let tog = cc.find("node_l/collect_auto_on/btn_auto",this.node)
        if(tog){
            let bCheck = tog.getComponent(cc.Toggle).isChecked
            this._bAutoCollect = !bCheck
        }
    },

    onClickAutoBetOn(){
        Global.TableSoundMgr.playCommonEff("com_click")
        this._bAutoBet = true
        this._showAutoBtn(!this._bAutoBet)
    },

    onClickAutoBetOff(){
        Global.TableSoundMgr.playCommonEff("com_click")
        this._bAutoBet = false
        this._showAutoBtn(!this._bAutoBet)
    },

    initIncreaceBet(){
        let self = this
        let quick_bet = cc.find("node_l/bet_bg/quick_bet",this.node)
        let cmp = quick_bet.getComponent("Simple_Quickbet")
        cmp.setUI((betval)=>{
            self.addBet(betval)
        })
    },

    _showAutoBtn(bShow){
        let auto_bet_on = cc.find("node_l/collect_auto_on/btn_autoplay",this.node)
        let auto_bet_off = cc.find("node_l/collect_auto_on/btn_autoplay_stop",this.node)
        auto_bet_on.active = bShow
        auto_bet_off.active = !bShow
    },

    _setBtn(btnname,bVisible,bEnable,txt,fontsize){
        this._super(btnname,bVisible,bEnable,txt,fontsize)

        let bshowCash = (btnname == "btn_cash") && bVisible
        let bshowCancel = ((btnname == "btn_cancel") && bVisible) || (btnname == "btn_bet" && bVisible && !bEnable)
        if(bshowCash){
            this._showFrameType(2)
            return
        }
        else if(bshowCancel){
            this._showFrameType(1)
            return
        }
        else{
            this._showFrameType(0)
            return
        }
        
    },

    //0不显示，1 红 2橙
    _showFrameType(nType){
        let frame_node = cc.find("frame",this.node)
        frame_node.active = !(nType == 0)
        if(frame_node.active){
            let sp = this.redFrame
            if(nType == 2){
                sp = this.yellowFrame
            }
            frame_node.getComponent(cc.Sprite).spriteFrame = sp
        }
    },




    

    // update (dt) {},
});
