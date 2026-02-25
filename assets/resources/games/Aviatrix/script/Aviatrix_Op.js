/**
 * 下注操作
 */
cc.Class({
    extends: cc.Component,

    properties: {
        betOptId:1,
        _curBetIdx:0,
        _bAutoBet:false,
        _bAutoCollect:false,
        _curBet:1,
        _collectVal:1.25,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //投注
        let bet_bg = cc.find("node_l/bet_bg",this.node)
        Global.btnClickEvent(bet_bg, this.onClickBetInput, this)
        let bet_add = cc.find("btn_add",bet_bg)
        Global.btnClickEvent(bet_add, this.onClickBetAdd, this)
        let bet_minus = cc.find("btn_minus",bet_bg)
        Global.btnClickEvent(bet_minus, this.onClickBetMinus, this)
        let tog_bet = cc.find("toggle_auto_bet",bet_bg)
        Global.btnClickEvent(tog_bet, this.onClickAutoBet, this)

        //collect
        let collect_auto_on = cc.find("node_l/collect_auto_on",this.node)
        Global.btnClickEvent(collect_auto_on, this.onClickCollectInput, this)
        let collect_add = cc.find("btn_add",collect_auto_on)
        Global.btnClickEvent(collect_add, this.onClickCollectAdd, this)
        let collect_minus = cc.find("btn_minus",collect_auto_on)
        Global.btnClickEvent(collect_minus, this.onClickCollectMinus, this) 
        Global.btnClickEvent(cc.find("btn_auto",collect_auto_on), this.onClickCollectOff, this) 

        let collect_auto_off = cc.find("node_l/collect_auto_off",this.node)
        // Global.btnClickEvent(collect_auto_off, this.onClickCollectInput, this) 
        Global.btnClickEvent(cc.find("btn_auto",collect_auto_off), this.onClickCollectOn, this) 

        //确认下注
        let bet_confirm = cc.find("node_r/btn_bet",this.node)
        Global.btnClickEvent(bet_confirm, this.onClickConfirmbet, this)
        //手动collect
        let collect_confirm = cc.find("node_r/btn_cash",this.node)
        Global.btnClickEvent(collect_confirm, this.onClickConfirmCollect, this)
        //取消下注
        let bet_cancel = cc.find("node_r/btn_cancel",this.node)
        Global.btnClickEvent(bet_cancel, this.onClickBetCancel, this)

        //加注按钮
        for (let i=1; i<4; i++) {
            let bet_btn = cc.find("node_l/bet_btns/btn_bet_"+i, this.node)
            Global.btnClickEvent(bet_btn, this.onClickBetBtn, this)
        }
    },

    start () {
        this._showAutoCollect(false)
        this._showAutoBet(false)
        this._showCollectVal(this._collectVal)
        this._showCurBet(this._curBet)
    },


    //按游戏状态显示操作按钮状态
    //state状态
    showOPUI(state){
        this._gamestatus = state
        if(state == 2){
            //下注
            
            //本轮是否下注了
            let bBet = cc.vv.gameData.isBetOPId(this.betOptId)
            if(bBet){
                this._setBtn("btn_bet",true,false,"Bet Accepted",54)
            }
            else{
                let bHasNext = cc.vv.gameData.isHasNextBet(this.betOptId)
                if(!bHasNext){
                    //是否开启了自动下注
                    if(this._bAutoBet){
                        let bSucc = this.onClickConfirmbet()
                        if(!bSucc){
                            this._setBtn("btn_bet",true,true,"Place bet",56)
                        }
                    }else{
                        this._setBtn("btn_bet",true,true,"Place bet",56)
                    }
                }
                
                
            }
            
        }
        else if(state == 3){
            //结果
            //本轮是否下注了
            let bBet = cc.vv.gameData.isBetOPId(this.betOptId)
            if(bBet){
                //是否cashout了
                let bCashout = cc.vv.gameData.isCollectOPId(this.betOptId)
                if(bCashout){
                    //为下一轮下注
                    // this._setBtn("btn_cash",false,true)
                    this._setBtn("btn_bet",true,true,"Place bet \nfor next round",48)
                }
                else{
                    //显示可以cashout
                    this._setBtn("btn_cash",true,true)
                    // this._setBtn("btn_bet",false,true)
                }

            }
            else{
                //为下一轮下注
                //是否已经为下一轮下注
                let bHasNext = cc.vv.gameData.isHasNextBet(this.betOptId)
                if(bHasNext){
                    // this._setBtn("btn_cash",false,true)
                    this._setBtn("btn_cancel",true,true)
                }
                else{
                    // this._setBtn("btn_cash",false,true)
                    this._setBtn("btn_bet",true,true,"Place bet \nfor next round",48)
                }
                
            }
        }
    },

    //更新cashout 金币
    updateCoin:function(nMul){
        let nNum = Global.FormatNumToComma((nMul*this._curBet).toFixed(2))
        Global.setLabelString("node_r/btn_cash/Background/Label_val",this.node,nNum)
    },

    onClickBetAdd(){
        if(!this._isCanChangeBetVal()){
            return
        }
        this._curBetIdx++
        
        let bets = cc.vv.gameData.getBetChipList()
        if(this._curBetIdx>=bets.length){
            this._curBetIdx = bets.length-1
        }
        
        let val = bets[this._curBetIdx]
        this._curBet = val
        this._showCurBet(val)

        Global.TableSoundMgr.playEffect("Plus")
    },

    onClickBetMinus(){
        if(!this._isCanChangeBetVal()){
            return
        }
        this._curBetIdx--
        if(this._curBetIdx<=0){
            this._curBetIdx=0
        }
        let bets = cc.vv.gameData.getBetChipList()
        let val = bets[this._curBetIdx]
        this._curBet = val
        this._showCurBet(val)

        Global.TableSoundMgr.playEffect("Minus")
    },

    onClickBetBtn(event) {
        let val = cc.find("Background/Label", event.node).getComponent(cc.Label).string
        this._curBet += parseInt(val)
        this._showCurBet(this._curBet)
        Global.TableSoundMgr.playCommonEff("com_click")
    },

    onClickBetInput(){
        let self = this

        Global.TableSoundMgr.playCommonEff("com_click")
        if(!this._isCanChangeBetVal()){
            return
        }

        
        let gameNode = cc.vv.gameData.getScriptGame().node
        let node_input = cc.find("node_input",gameNode)
        if(node_input){
            node_input.active = true
            node_input.getComponent("Input_Nums").init(1,1000000,(val)=>{
                //点击确认，把数字传出来
                self._curBet = val
                self._showCurBet(self._curBet)
            })
        }
        else{
            //
            cc.loader.loadRes("Table_Common/TableRes/prefab/node_input", cc.Prefab,function(err, res){
                if(!err){
                    let node_input = cc.find("node_input",gameNode)
                    if(!node_input){
                        let node = cc.instantiate(res)
                        node.parent = gameNode
                        node.active = true
                        node.getComponent("Input_Nums").init(1,1000000,(val)=>{
                            //点击确认，把数字传出来
                            self._curBet = val
                            self._showCurBet(self._curBet)
                        })
                    }
                    

                }

            })
        }
        

    },

    onClickCollectInput(){
        let self = this
        
        Global.TableSoundMgr.playCommonEff("com_click")
        if(!this._isCanChangeBetVal()){
            return
        }
        
        let gameNode = cc.vv.gameData.getScriptGame().node
        let node_input = cc.find("node_input",gameNode)
        if(node_input){
            node_input.active = true
            node_input.getComponent("Input_Nums").init(1,100,(val)=>{
                //点击确认，把数字传出来
                self._collectVal = val
                self._showCollectVal(this._collectVal)
            })
        }
        else{
            //
            cc.loader.loadRes("Table_Common/TableRes/prefab/node_input", cc.Prefab,function(err, res){
                if(!err){
                    let node_input = cc.find("node_input",gameNode)
                    if(!node_input){
                        let node = cc.instantiate(res)
                        node.parent = gameNode
                        node.active = true
                        node.getComponent("Input_Nums").init(1,100,(val)=>{
                            //点击确认，把数字传出来
                            self._collectVal = val
                            self._showCollectVal(this._collectVal)
                        })
                    }
                    

                }

            })
        }
    },

    onClickCollectAdd(){
        if(!this._isCanChangeBetVal()){
            return
        }
        this._collectVal = this._collectVal || 1.25
        this._collectVal++
        if(this._collectVal>=100){
            this._collectVal = 100
        }
        this._showCollectVal(this._collectVal)

        Global.TableSoundMgr.playEffect("Plus")
    },

    onClickCollectMinus(){
        if(!this._isCanChangeBetVal()){
            return
        }
        this._collectVal = this._collectVal || 1.25
        this._collectVal--
        if(this._collectVal<=1){
            this._collectVal = 1.01
        }
        this._showCollectVal(this._collectVal)

        Global.TableSoundMgr.playEffect("Minus")
    },

    onClickCollectOff(){
        Global.TableSoundMgr.playEffect("Checkbox")
        this._showAutoCollect(false)
    },
    onClickCollectOn(){
        Global.TableSoundMgr.playEffect("Checkbox")
        this._showAutoCollect(true)

    },

    //自动投注开关
    onClickAutoBet(){
        Global.TableSoundMgr.playEffect("Checkbox")
        let toggle = cc.find("node_l/bet_bg/toggle_auto_bet",this.node)
        if(toggle){
            let tg = toggle.getComponent(cc.Toggle)
            if(tg.isChecked){
                this._bAutoBet = false
            }
            else{
                this._bAutoBet = true
            }
        }
    },

    onClickConfirmbet(){
        Global.TableSoundMgr.playEffect("Accept")
        //确认下注
        if(this._curBet>0){
            //金币是否足够
            let bEncough = cc.vv.gameData.isCoinEncough(this._curBet)
            if(!bEncough){
                cc.vv.gameData.showChargeTips()
                return
            }
            else{
                //金币先本地扣除
                cc.vv.gameData.addMyCoin(-this._curBet,true)
            }
            
            let nFlee = 0
            if(this._bAutoCollect){
                nFlee = this._collectVal
            }

            if(this._gamestatus == 2){
                cc.vv.gameData.sendBetReq(nFlee,this._curBet,this.betOptId)
                this._setBtn("btn_bet",true,false)
            }
            else if(this._gamestatus == 3){
                //下一轮
                cc.vv.gameData.saveNextBet(nFlee,this._curBet,this.betOptId)
                this._setBtn("btn_cancel",true,true)
            }
            return true
        }
        
    },

    //
    onClickConfirmCollect(){
        Global.TableSoundMgr.playEffect("PlaceBet")
        cc.vv.gameData.sendCashout(this.betOptId)
        // this._setBtn("btn_cash",false,true)
        this._setBtn("btn_bet",true,true,"Place bet \nfor next round",48)
    },


    onClickBetCancel(){
        Global.TableSoundMgr.playCommonEff("com_click")
        cc.vv.gameData.delNextBet(this.betOptId)
    },

    


    //显示当前押注
    _showCurBet(val){
        let lbl = cc.find("node_l/bet_bg/bet_val",this.node)
        lbl.getComponent(cc.Label).string = Global.FormatNumToComma(val.toFixed(2)) 
    },

    //显示自动领取的值
    _showCollectVal(val){
        let lbl = cc.find("node_l/collect_auto_on/bet_val",this.node)
        lbl.getComponent(cc.Label).string = Number(val).toFixed(2) + "x"
    },

    _showAutoCollect(bShow){
        this._bAutoCollect = bShow
        this._bAutoBet = bShow

        let collect_auto_on = cc.find("node_l/collect_auto_on",this.node)
        let collect_auto_off = cc.find("node_l/collect_auto_off",this.node)
        collect_auto_on.active = bShow
        collect_auto_off.active = !bShow
    },

    _showAutoBet(bShow){
        let toggle = cc.find("node_l/bet_bg/toggle_auto_bet",this.node)
        if(toggle){
            let tg = toggle.getComponent(cc.Toggle)
            tg.isChecked = bShow
        }
    },

    _setBtn(btnname,bVisible,bEnable,txt,fontsize){
        let allbtns = ['btn_bet','btn_cash','btn_cancel']
        for(let i = 0; i < allbtns.length; i++){
            let btn = cc.find("node_r/"+allbtns[i],this.node)
            btn.active = false
        }
        let btn = cc.find("node_r/"+btnname,this.node)
        btn.active = bVisible
        btn.getComponent(cc.Button).interactable = bEnable
        let lbl = cc.find("Background/Label",btn)
        if(lbl ){
            if(txt){
                lbl.getComponent(cc.Label).string = txt
            }
            if(fontsize){
                lbl.getComponent(cc.Label).fontSize = fontsize
            }
            
        }

    },

    //是否可以修改下注额
    //如果已经下注了，就不能修改下注。自动提取条件
    _isCanChangeBetVal(){
        let bBet = cc.vv.gameData.isBetOPId(this.betOptId)
        if(bBet){
            //没有提取
            let bCashOut = cc.vv.gameData.isCollectOPId(this.betOptId)
            if(!bCashOut){
                return false
            }
        }
        return true

    },

    // update (dt) {},
});
