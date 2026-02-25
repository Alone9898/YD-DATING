/**底部控制
 * 
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _btn_spin:null, //spin按钮
        _btn_stop:null, //stop按钮
        _btn_stop_auto:null,    //停止自动
        _btn_add_bet:null,  //加注
        _btn_minus_bet:null,//减注
        _btn_max_bet:null,  //max
        _bAutoModel:false,  //是否是自动模式，免费游戏不算自动模式
        _bStartRound:false, //是否是开始了一局，发送了旋转设置成true,candonextround的时候设置成false.表示可以响应spin按钮
        _bFreeModel:false,  //是否是免费模式
        LONGTOUCHSPINE: 1, //长按时间
        _currBottomCoin:0,
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._btn_spin = cc.find("btn_spin",this.node)
        this._btn_stop = cc.find("btn_stop",this.node)
        this._btn_stop_auto = cc.find("btn_stopAuto",this.node)
        this._btn_add_bet = cc.find("totalBetBg/btn_add",this.node)
        this._btn_minus_bet = cc.find("totalBetBg/btn_minus",this.node)
        this._btn_max_bet = cc.find("btn_max",this.node)
        this._lbl_total_bet = cc.find("totalBetBg/lbl_betNum",this.node)
        this._btn_auto = cc.find("btn_auto",this.node)

        this._InitAutoPanl()
        Global.btnClickEvent(this._btn_spin,this.OnClickSpin,this)
        // this._btn_spin.on(cc.Node.EventType.TOUCH_START, this.OnTouchSpinBtnBegan, this);
        // this._btn_spin.on(cc.Node.EventType.TOUCH_END, this.OnTouchSpinBtnEnded, this);
        // this._btn_spin.on(cc.Node.EventType.TOUCH_CANCEL,this.OnTouchSpinCancle,this)
        
        this._btnSpinAni = cc.find('node_ani',this.node)

        Global.btnClickEvent(this._btn_stop,this.OnClickStop,this)
        Global.btnClickEvent(this._btn_stop_auto,this.OnClickStopAuto,this)
        Global.btnClickEvent(this._btn_add_bet,this.OnClickAddBet,this)
        Global.btnClickEvent(this._btn_minus_bet,this.OnClickMinusBet,this)
        Global.btnClickEvent(this._btn_max_bet,this.OnClickMaxBet,this)
        //按下不释放
        this._btn_max_bet.on(cc.Node.EventType.TOUCH_START, this.OnTouchMaxBtnBegan, this);
        
        this._btn_auto.on("click",this.onClickAuto,this)
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_SHOW_HEADFOOTER_MASK,this.OnEventShowMask,this);
        Global.registerEvent(EventId.NEWGUIDE_PRO_UI,this.OnEventCompleteGuide,this);
    },

    start () {
        
    },

    Init:function(){
        this.ShowBetCoin(false)
    },

    //显示押注额
    ShowBetCoin:function(bShowMaxEff=true,bAllin=false){
        if(!bAllin){
            this._setAllFlag(false)
        }
        let nVal = cc.vv.gameData.GetTotalBet()
        if(bAllin){
            
        }
        else{
            
            let bgTotalbet = cc.find("totalBetBg/bet_bg",this.node)
            bgTotalbet.active = true
            let bgAllin = cc.find("totalBetBg/allin_bg",this.node)
            bgAllin.active = false
        }
        this._lbl_total_bet.getComponent(cc.Label).string = Global.FormatNumToComma(nVal)
        
        let node_partile = cc.find("totalBetBg/max_bet_particle", this.node);
        if(cc.vv.gameData.IsMaxBet() && !bAllin){
            this._btn_max_bet.getComponent(cc.Button).interactable = false
            this._SetMaxBtnSpine(false)
            //是max
            if(bShowMaxEff){
                node_partile.active = true
                node_partile.getComponent(cc.ParticleSystem).resetSystem()
            }
            cc.find("totalBetBg/bet_bg/title_TOTALBET",this.node).active = false;
            cc.find("totalBetBg/bet_bg/title_MAXBET",this.node).active = true;
        }
        else{
            node_partile.active = false
            this._btn_max_bet.getComponent(cc.Button).interactable = !bAllin;
            this._SetMaxBtnSpine(!bAllin)
            cc.find("totalBetBg/bet_bg/title_TOTALBET",this.node).active = true;
            cc.find("totalBetBg/bet_bg/title_MAXBET",this.node).active = false;
        }

    },

    

    //是否有可以切换的押注档位
    _checkBetsChange:function(){
        //只有一个档位就没必要切换了
        let nLen = cc.vv.gameData.GetBetMults().length
        return nLen > 1
    },

    //点击开始
    OnTouchSpinBtnBegan:function(){
        this._btnSpinAni.active = false
        if (!this.isCanShowAutoSelect()) {
            this._touchSpinBtnTime = -1
        }
        else{
            this._touchSpinBtnTime = 0;
        }
        
    },

    //点击结束
    OnTouchSpinBtnEnded:function(){
        if (!this.isCanShowAutoSelect()) {
            this._touchSpinBtnTime = -1
           
        }
        else{
            //非免费下才有长按
            if(this._touchSpinBtnTime>0){
                if(this._touchSpinBtnTime > this.LONGTOUCHSPINE){
                    //长按
                    this.ShowAutoSelect(true)
                }
                else{
                    this.OnClickSpin()
                }
                this._touchSpinBtnTime = -1
            }
            
        }

       
    },

    //点击取消
    OnTouchSpinCancle:function(){
        this._touchSpinBtnTime = -1
    },

    //是否能显示自动选择
    isCanShowAutoSelect:function(){
        let btnEnable 
        if(this._btn_spin.getComponent(cc.Button)){
            btnEnable = this._btn_spin.getComponent(cc.Button).interactable
        }
        let bFree = this.GetIsFreeModel()
        if(btnEnable && !bFree){
            return true
        }
        return false
    },

    //显示选择自动面板
    ShowAutoSelect:function(bShow){
        // if(bShow){
        //     let bOpen = cc.vv.UserManager.isOpen(Global.SYS_OPEN.GUIDE_CHANGEBET)
        //     if(!bOpen){
        //         // if(!cc.find("Canvas/FloatTip")){
        //             cc.vv.FloatTip.show(cc.js.formatStr('UNLOCK AT LEVEL %s',Global.SYS_OPEN.GUIDE_CHANGEBET));
        //         // }
                
        //         return
        //     }
        // }
        let node = cc.find("PopSelectAutoTimes",this.node)
        if(node.active != bShow){
            node.active = bShow
            if(bShow){
                let fileName = "slot_show_autoselect"
                this._playAudio(fileName)
            }
        }
        
    },

    //点击自动次数
    OnClickSelectAutoTimes:function(btn, customEventData){
        this._playAudio("slot_openBetSelector")
        let AutoSpinTimsList = [20,50,100,500,10000]
        let btnIdx = 4 //这里偷巧引导传过来的数据是空，所以默认给一个引导的数值
        if(btn && btn.node){
            btnIdx = parseInt(btn.node.name.substr(-1,1))
        }
        this._touchSpinBtnTime = -1
        let autoSpinTimes = AutoSpinTimsList[btnIdx- 1];
        cc.vv.gameData.SetAutoModelTime(autoSpinTimes)
        this._autoTotal = autoSpinTimes
        this.ShowAutoSelect(false);
        this.ShowAutoModel(true)
        this.DoAutoSpine()
        
        // //记录引进执行过
        // if(!cc.vv.NewGuide._isDoneGuide(16)){
        //     Global.saveLocal("doAutoAction","1")
        // }
        
    },

    getAutoModel() {
        return this._bAutoModel;
    },

    //点击旋转
    OnClickSpin:function(){
        let bClickBack = cc.vv.gameData.GetTopScript().isClickBackLobby()
        if(bClickBack) {
            return
        }

        //已经开启了一轮
        let cfg = cc.vv.gameData.getGameCfg()
        let fileName = "slot_reel_click"
        let filePath
        if(cfg.commEffect && cfg.commEffect.clickSpin){
            fileName = cfg.commEffect.clickSpin
            filePath = cfg.commEffect.path
        }
        this._playAudio(fileName,filePath)

        this.unschedule(this.DoAutoSpine);
        this.unschedule(this.DoFreeSpine);
        this.unschedule(this.SendSpinReq);

        //免费游戏不需要隐藏
        if (!cc.vv.gameData.GetFreeTime()) {
            this.DoHideWinAction()
        }
        
        //是否需要押注
        let bNeedBet = this._CheckNeedBet()
        if(bNeedBet){
            //需要
            let res = this._CheckCoinEnough()
            if(res){
                //减注
                let topScp = cc.vv.gameData.GetTopScript()
                topScp.MinusTotalBet(this._bAllIn)
                //发送请求
                this.SendSpinReq()
            }
            else{
                //金币不足
                //停止自动模式
                this.OnClickStopAuto()

                // //buy moneybank
                // let btnMoneyBank = cc.find("Canvas").getComponentInChildren("PiggyBankBtn")
                // if(btnMoneyBank){
                //     btnMoneyBank.node.emit('click')
                // }

                // let url = "BalootClient/CoinCharge/CoinCharge"
                // cc.vv.PopupManager.addPopup(url, {
                //     opacityIn: true,
                //     delayCloseTime:1.5,
                // })

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
                }, false, () => { }, ___("提示"), ___("取消"), ___("Deposit"))
                

                // if(!cc.vv.gameData.GetBreakGrant()){ //没有破产
                //     cc.vv.EventManager.emit(EventId.NOT_ENOUGH_COIN_POP_UI,{isClick:true});
                // }
                
            }
        }
        else{
            //不需要花费的
            //发送请求
            this.SendSpinReq()
        }
        
        
    },

    //点击停止
    OnClickStop:function(){
        let slots = cc.vv.gameData.GetSlotsScript()
        slots.StopMove()
        
    },

    //btn auto
    onClickAuto:function(){
        
            let bAuto = this._btn_stop_auto.active
            if(bAuto){
                //cancel
                this.OnClickStopAuto()
                this._showAutoFlag(false)
            }
            else{
                if(this.isCanShowAutoSelect()){
                    //select
                    this.ShowAutoSelect(true)
                }
                else{
                    cc.vv.FloatTip.show("The Game is running!")
                }
            }
        
        
    },

    _showAutoFlag:function(bShow){
        cc.find("sel_flag",this._btn_auto).active = bShow
    },

    //点击停止自动
    OnClickStopAuto:function(){
        cc.vv.gameData.SetAutoModelTime(0)
        cc.vv.gameData.SetAutoGame(false);
        this.ShowAutoModel(false)
    },

    //点击加注
    OnClickAddBet:function(){

        let bMax = cc.vv.gameData.IsMaxBet()
        if(bMax){
            //是否满足显示allin
            if(this._showAllInView(true)){
                return
            }
            
        }

        cc.vv.gameData.ChangeBetIdx(true)
        this.ShowBetCoin()
        this._PlayBetAudio()

        //通知押注额修改
        let nTotal = cc.vv.gameData.GetTotalBet()
        Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,nTotal)
        this._ShowBetProTip()

        
    },

    //点击减注
    OnClickMinusBet:function(){

        let bMin = cc.vv.gameData.IsMinBet()
        if(bMin){
            //是否满足显示allin
            if(this._showAllInView(true)){
                return
            }
        }
        if(!this._bAllIn){ //如果是all的话，减挡位就直接显示当前档位
            cc.vv.gameData.ChangeBetIdx()
        }
        
        this.ShowBetCoin()
        this._PlayBetAudio()

        //通知押注额修改
        let nTotal = cc.vv.gameData.GetTotalBet()
        Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,nTotal)

        this._ShowBetProTip()

        
    },

    //点击max
    OnClickMaxBet:function(){
        
        let maxIdx = cc.vv.gameData.GetBetMaxIdx()
        cc.vv.gameData.SetBetIdx(maxIdx)
        cc.vv.gameData._serverRawMult = maxIdx;
        cc.vv.UserManager.setEnterSelectBet(null);
        this.ShowBetCoin()
        this._PlayBetAudio()

        //通知押注额修改
        let nTotal = cc.vv.gameData.GetTotalBet()
        Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,nTotal)

        this._ShowBetProTip()

        
    },

    //显示allin的功能
    _showAllInView(bShow){
        bShow = false   // 去掉allin
        if(bShow){
            //是否满足显示allin
            let myCoin = cc.vv.gameData.GetCoin()
            let nMaxBet = cc.vv.gameData.GetMaxBetVal()

            if(myCoin > nMaxBet && !this._bAllIn){
                //可以显示
                this._setAllFlag(true)
                let bgAllin = cc.find("totalBetBg/allin_bg",this.node)
                bgAllin.active = true
                let bgTotalbet = cc.find("totalBetBg/bet_bg",this.node)
                bgTotalbet.active = false
                this.ShowBetCoin(false,true)
                Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,nMaxBet)
                this._ShowBetProTip(true,true)

                this._playAudio("win1end")

                
                
                return this._bAllIn
            }
            
            this._setAllFlag(false)
            return this._bAllIn
        }
        else{
            
            let bgAllin = cc.find("totalBetBg/allin_bg",this.node)
            bgAllin.active = false
            let bgTotalbet = cc.find("totalBetBg/bet_bg",this.node)
            bgTotalbet.active = true
            this.ShowBetCoin(false)
        }
        
    },

    _isCanShowAllIn(){
        let myCoin = cc.vv.gameData.GetCoin()
        let nMaxBet = cc.vv.gameData.GetMaxBetVal()
        return myCoin > nMaxBet
    },
    //重制allin显示
    resetAllin(){
        this._setAllFlag(false)
        this._showAllInView(false)
    },

    //按下不释放 取消动画
    OnTouchMaxBtnBegan:function(){
        let _btn_max_btn_enable = this._btn_max_bet.getComponent(cc.Button).interactable
        if (!_btn_max_btn_enable) {
            return
        }
        this._SetMaxBtnSpine(false)
    },

    //设置当前押注档位，idx:1开始，和服务端同步
    SetBetIdx(idx) {
        cc.vv.gameData.SetBetIdx(idx);
        cc.vv.gameData._serverRawMult = idx;
        cc.vv.UserManager.setEnterSelectBet(null);
        this.ShowBetCoin(false,this._bAllIn);
        this._PlayBetAudio()

        //通知押注额修改
        let nTotal = cc.vv.gameData.GetTotalBet()
        Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,nTotal)
    },

    //发送旋转请求，并转轴转起来
    SendSpinReq:function(){
        this.ShowBtnsByState("moveing_1")
        let betIdx = cc.vv.gameData.GetBetIdx()
        let autoVal = null
        let autoTime = cc.vv.gameData.GetAutoModelTime()
        if(autoTime){
            autoVal = {}
            autoVal.all = this._autoTotal
            autoVal.rmd = autoTime
        }
        cc.vv.gameData.ReqSpin(betIdx,autoVal,this._bAllIn)
        
        if(this._needRefushFreeTime){
            //更新免费次数显示
            this._needRefushFreeTime = null
            // 更新免费次数
            let restFree = cc.vv.gameData.GetFreeTime()
            cc.vv.gameData.SetFreeTime(restFree-1)
            let total = cc.vv.gameData.GetTotalFree()
            let rest = cc.vv.gameData.GetFreeTime()
            this.ShowFreeModel(true,total-rest,total)
        }

        let slots = cc.vv.gameData.GetSlotsScript()
        slots.StartMove()
        this._ShowBetProTip(false)

        this.ShowAutoSelect(false)
    },

    //显示自动模式
    ShowAutoModel:function(bShow){
        this._btn_stop_auto.active = bShow
        this._showAutoFlag(bShow)
        if(!bShow){
            this._autoTotal = null
        }
        this._UpdateAutoTimeLabel()

        let copy_add = cc.find("copy_add",this._btn_stop_auto)
        let copy_minus = cc.find("copy_minus",this._btn_stop_auto)
        let copy_max = cc.find("copy_max",this._btn_stop_auto)
        if(bShow){
            let copyNode = function(fromNode,parentNode,copyName){
                let copy_node = cc.instantiate(fromNode)
                copy_node.parent = parentNode
                copy_node.name = copyName
                copy_node.getComponent(cc.Button).interactable = false
                copy_node.position = parentNode.convertToNodeSpaceAR(fromNode.convertToWorldSpaceAR(cc.v2(0,0)))
                let inputMask = copy_node.getComponent(cc.BlockInputEvents)
                if(!inputMask){
                    copy_node.addComponent(cc.BlockInputEvents)
                }
                return copy_node
            }
            if(!copy_add){
                copy_add = copyNode(this._btn_add_bet,this._btn_stop_auto,"copy_add")
            }
            if(!copy_minus){
                copy_minus = copyNode(this._btn_minus_bet,this._btn_stop_auto,"copy_minus")
            }
            if(!copy_max){
                copy_max = copyNode(this._btn_max_bet,this._btn_stop_auto,"copy_max")
                let maxBtnSpine = cc.find('Background/maxSpine',copy_max)
                maxBtnSpine.active = false
            }
            
        }
    },

    //可以进行下一轮
    CanDoNextRound:function(){
        this._bStartRound = false
        this.ShowBtnsByState("idle")
       
        //是否有强制弹窗
        this._checkForsePoptips()

        //是否有免费游戏
        let restFree = cc.vv.gameData.GetFreeTime()
        let cfg = cc.vv.gameData.getGameCfg()
        if(restFree > 0){
            if (cc.vv.gameData.GetTotalFree() === restFree) {
                this.ShowBtnsByState("moveing_1");
            }
            // 这里只是打标记，需要更新免费次数。在SendSpinReq才刷新
            this._needRefushFreeTime = true
            this.scheduleOnce(this.DoFreeSpine,cfg.autoModelDelay)
            return
        }

        //自定义旋转次数。不花费金币
        let respinTime = cc.vv.gameData.GetRespinTime()
        if (respinTime>0) {
            this.scheduleOnce(this.SendSpinReq,cfg.autoModelDelay)
            cc.vv.gameData.SetRespinTime(respinTime-1)
            return
        }

        let autoTime = cc.vv.gameData.GetAutoModelTime()
        if(autoTime>0){
            this.scheduleOnce(this.DoAutoSpine,cfg.autoModelDelay)
            return
        }

        this.resetAllin()


        // //引导增加筹码
        // if(cc.vv.gameData.GetGuideId() == 15){
        //     cc.vv.gameData.SetGuideId(null)
        //     cc.vv.gameData.PauseSlot()
        //     cc.vv.NewGuide.ShowGuide(15)
        // }

        //是否可以开始自动模式引导
        // let lv = cc.vv.UserManager.getCurLv()
        // if(lv == Global.SYS_OPEN.GUIDE_AUTOMODULE){
        //     let bHasDoAutoAction = Global.getLocal("doAutoAction","")
        //     if(!bHasDoAutoAction){
        //         cc.vv.NewGuide.ShowGuide(16)
        //     }
        // }

        // if (lv == Global.SYS_OPEN.GUIDE_HIGHER_BET && !cc.vv.NewGuide._isDoneGuide(104)) {
        //     let betIdx = cc.vv.gameData.GetBetIdx()
        //     let mults = cc.vv.gameData.GetBetMults()
        //     if (betIdx < mults.length-1) {
        //         cc.vv.gameData.PauseSlot()
        //         cc.vv.NewGuide.ShowGuide(104)
        //     }
        // }

    },

    //自动
    DoAutoSpine:function(){
        let autoTime = cc.vv.gameData.GetAutoModelTime()
        cc.vv.gameData.SetAutoGame(autoTime>0);
        if(autoTime>0){
            cc.vv.gameData.SetAutoModelTime(autoTime-1>500?10000:autoTime-1)
            if(autoTime-1 == 0){
                this.ShowAutoModel(false)
            }
            this._UpdateAutoTimeLabel()
            this.OnClickSpin()
        }
    },

    //免费模式请求
    DoFreeSpine:function(){
        let total = cc.vv.gameData.GetTotalFree()
        let rest = cc.vv.gameData.GetFreeTime()
        if(rest > 0){
            this.ShowFreeModel(true,total-rest,total)
            //发起旋转请求
            this.SendSpinReq()
        }
        
        
    },

    //显示免费模式
    //bShow:true的时候，需要设置used,total, false的时候不需要
    //used:已经使用的免费次数，服务端就是记录已经使用过的
    //total:总的免费次数
    ShowFreeModel:function(bShow,used,total){
        //设置免费模式状态
        this._bFreeModel = bShow
        if(!bShow){
            cc.vv.gameData.SetIsPuzzleModel(bShow)
        }
        

        let freeTime = cc.find("free_time",this.node)
        freeTime.active = bShow

        if(bShow){ //显示免费的时候才需要
            let old = freeTime.getChildByName("copy_max")
            if(old){
                old.getComponent(cc.Button).interactable = false
                
                
            }
            
            let showTimesStr = cc.js.formatStr("%s / %s",used,total)
            freeTime.getChildByName("lbl_free_time").getComponent(cc.Label).string = showTimesStr
        }
        
        //是否包含puzzle游戏，免费模式不显示puzzle collect
        let puzzleCollect = cc.find('Canvas/safe_node/LMSlots_Collect_Puzzle')
        if(puzzleCollect){
            puzzleCollect.active = !bShow

            let bPuzzle = cc.vv.gameData.GetIsPuzzleModel()
            this.SetBetNodeVisible(!bPuzzle)
        }
        
    },

    UpdateFreeTime:function (total,used) {
        
        let showTimesStr = cc.js.formatStr("%s / %s",used,total)
        let freeTime = cc.find("free_time",this.node)
        freeTime.getChildByName("lbl_free_time").getComponent(cc.Label).string = showTimesStr
    },

    //是否是免费模式
    GetIsFreeModel:function(){
        return this._bFreeModel
    },

    //spin按钮是否可用状态
    GetSpinBtnState() {
        return (this._btn_spin.active && this._btn_spin.getComponent(cc.Button).interactable);
    },

    //设置bet节点是否显示
    SetBetNodeVisible(bShow){
        let betNode = cc.find('totalBetBg',this.node)
        betNode.active = bShow
    },


    //显示按钮状态strState
    //"idle":空闲。 (所有按钮可以点击)
    //"moveing_1":旋转，结果还未返回。(所有按钮不可点击,spin按钮灰态)
    //"moveing_2":旋转，结果已经返回。(其它按钮不可点击,stop按钮可以点击)
    //"stoped":停止，但是还在播放加钱。(此时spin亮起来，其他按钮是灰态)
    //”unstoped“: 不能停止的操作。（stop按钮是灰态，其他按钮是灰态）
    ShowBtnsByState:function(strState){
        cc.vv.gameData.SetSlotState(strState)
        if(strState == "idle"){


            //====添加旋转引导
            // let doId
            // if(!cc.vv.NewGuide._isDoneGuide(5)){
            //     cc.vv.gameData.SetGuideSpinTime(1) //控制旋转一次就可以出去
            //     cc.vv.NewGuide.ShowGuide(5)
            // }
            // let newGuideSpine = cc.vv.gameData.GetGuideSpinTime()
            // if(newGuideSpine){
            //     doId = true
            //     cc.vv.gameData.SetGuideSpinTime(newGuideSpine-1)
            // }
            // if(!cc.vv.NewGuide._isDoneGuide(5)){
            //     cc.vv.gameData.clearServerInitpop()
            //     cc.vv.NewGuide.ShowGuide(5)
            // }
            // else{
            //     cc.vv.gameData.checkServerInitpopUI()
            // }
            
            //====end
            
            

            this._btn_spin.active = true
            this._btnSpinAni.active = true
            this._SetBtnEnable(this._btn_spin,true)
            this._btn_stop.active = false
            let bHasChange = this._checkBetsChange()
            this._SetBtnEnable(this._btn_add_bet,true && bHasChange)
            this._SetBtnEnable(this._btn_minus_bet,true && bHasChange)
            let maxBet = true
            if(cc.vv.gameData.IsMaxBet()){
                maxBet = false
            }
            this._SetBtnEnable(this._btn_max_bet,maxBet)
            this._SetMaxBtnSpine(maxBet)
        }
        else if(strState == "moveing_1"){
            this._btn_spin.active = true
            this._btnSpinAni.active = false
            this._SetBtnEnable(this._btn_spin,false)
            this._SetMaxBtnSpine(false)
            this._btn_stop.active = false

            this._SetBtnEnable(this._btn_add_bet,false)
            this._SetBtnEnable(this._btn_minus_bet,false)
            this._SetBtnEnable(this._btn_max_bet,false)
            this._SetMaxBtnSpine(false)
        }
        else if(strState == "moveing_2"){
            this._btn_spin.active = false
            this._btnSpinAni.active = false
            this._btn_stop.active = true
            this._SetBtnEnable(this._btn_stop,true)

            this._SetBtnEnable(this._btn_add_bet,false)
            this._SetBtnEnable(this._btn_minus_bet,false)
            this._SetBtnEnable(this._btn_max_bet,false)
            this._SetMaxBtnSpine(false)
        }
        else if(strState == "stoped"){
            this._btn_spin.active = true
            this._btnSpinAni.active = false
            this._btn_stop.active = false
            this._SetBtnEnable(this._btn_spin,true)

            this._SetBtnEnable(this._btn_add_bet,false)
            this._SetBtnEnable(this._btn_minus_bet,false)
            this._SetBtnEnable(this._btn_max_bet,false)
            this._SetMaxBtnSpine(false)
        }
        else if(strState == "unstoped"){
            this._btn_spin.active = false
            this._btnSpinAni.active = false
            this._btn_stop.active = true
            this._SetBtnEnable(this._btn_stop,false)

            this._SetBtnEnable(this._btn_add_bet,false)
            this._SetBtnEnable(this._btn_minus_bet,false)
            this._SetBtnEnable(this._btn_max_bet,false)
            this._SetMaxBtnSpine(false)
        }
    },

    //显示赢钱
    //nWin:加钱
    //nType:1 正常滚动加  2 喷出粒子特效形式的加 3 自定义时间滚动（滚动不带加金币音效，一般用于boune游戏中加金币）
    //begin:不设置就从当前值滚动
    //pRollEndCall: 滚动完成的回调
    //rollTime:滚动时间，如果有设置，就优先使用设置的时间，没设置就是音效时长。自动模式下可能需要缩短滚金币时间
    ShowWin:function(nWin,nType,begin,pRollEndCall,rollTime){
        return new Promise((resolve,reject) => {
            let node_out_coin = cc.find('winBg/node_pen_coin',this.node)
            let particle_win = cc.find('winBg/particle_bigwin',this.node)
            let lbl_win_nor = cc.find('winBg/lbl_winNum_nor',this.node)
            let lbl_win_out = cc.find('winBg/lbl_winNum_up',this.node)
            if(!begin){
                begin = 0
                //从当前的值开始滚动
                //每局开始的时候lbl_win_nor这个值需要设置成0
                let numStr = lbl_win_nor.getComponent(cc.Label).string
                let tempBegin = parseFloat(numStr.replace(/,/g, ""));
                if(tempBegin){
                    begin = tempBegin
                }
            }
            this._currBottomCoin = nWin
            if(begin == nWin){
                cc.warn("Bottom底部增长金币：begin==end")
                if(pRollEndCall){
                    pRollEndCall()
                }
                resolve()
                return
            }
            //跳过金币增长过程
            let addCoinBgmVol = 0.3
            let skipParObj = cc.find("node_skip_win",this.node)
            let skipBtn = cc.find("skipWin",skipParObj)
            if(!skipBtn){
                skipBtn = cc.instantiate(this._btn_spin)
                // skipBtn.off(cc.Node.EventType.TOUCH_START, this.OnTouchSpinBtnBegan, this);
                // skipBtn.off(cc.Node.EventType.TOUCH_END, this.OnTouchSpinBtnEnded, this);
                // skipBtn.off(cc.Node.EventType.TOUCH_CANCEL,this.OnTouchSpinCancle,this)
                skipBtn.name = "skipWin"
                skipBtn.position = skipParObj.convertToNodeSpaceAR(this._btn_spin.convertToWorldSpaceAR(cc.v2(0,0))) 
                skipBtn.parent = skipParObj
                skipBtn.active = false
                
            }
            //正在播放的加钱的音效。跳过的时候需要停止这个音效
            this._playWinAudioHandle = null
            
            if(nType == 2){//中赢
                if(skipBtn){
                    skipBtn.height = cc.winSize.height
                    skipBtn.width = cc.winSize.width
                }
                

                let script = node_out_coin.getComponent('DropCoins')
                script.setPlay(10,50,300,cc.winSize.height)
                particle_win.active = true
                particle_win.getComponent(cc.ParticleSystem).resetSystem()
                lbl_win_nor.active = false
                lbl_win_out.active = true
                lbl_win_out.scale = 1
                
                let cfg = cc.vv.gameData.getGameCfg()
                let fileName = 'win2'
                let fileEnd = 'win2end'
                let filePath = null
                if(cfg.commEffect && cfg.commEffect.win2){
                    fileName = cfg.commEffect.win2[0]
                    fileEnd = cfg.commEffect.win2[1]
                    filePath = cfg.commEffect.path
                }
                let self = this
                let endCall = function(){
                    
                    //停止音效
                    cc.vv.AudioManager.stopAudio(self._playWinAudioHandle)
                    if(skipBtn){
                        skipBtn.active = false
                    }
                    
                    self._SetBgmVol(1)
                    script.stopPlay()
                    particle_win.active = false
                    
                    
                    
                    cc.tween(lbl_win_out)
                    .to(0.1,{scale:0.5})
                    .call(() => {
                        if(cc.isValid(lbl_win_nor)){
                            lbl_win_nor.active = true
                        }
                        if(cc.isValid(lbl_win_out)){
                            lbl_win_out.active = false
                        }
                        
                    })
                    .start()
                    
                    lbl_win_nor.getComponent(cc.Label).string = Global.FormatNumToComma(nWin)
                    if(pRollEndCall){
                        pRollEndCall()
                    }
                    self._playAudio(fileEnd,filePath)
                    resolve()
                }
                let loadFinishCall=function(audioId){
                    //获取时长
                    //外部有设置时间就优先用外部时间
                    self._playWinAudioHandle = audioId
                    let time = rollTime?rollTime:cc.audioEngine.getDuration(audioId);
                    if(!rollTime){
                        if(time > 5 || time <= 1){ //中赢最多5s
                            time = 5
                        }
                    }
                    
                    Global.doRoallNumEff(lbl_win_out,begin,nWin,time,endCall,null,2,true)
                    //显示跳过按钮
                    if(skipBtn){
                        skipBtn.active = true
                        skipBtn.getComponent(cc.Button).interactable = true
                        skipBtn.targetOff(this)
                        skipBtn.once("click",endCall)
                    }
                    
                    self._SetBgmVol(addCoinBgmVol)
                }
                //先加载音效
                this._playAudio(fileName,filePath,null,loadFinishCall)
                
            }
            else if(nType == 1){ //小赢
                if(skipBtn){
                    skipBtn.height = this._btn_spin.height
                    skipBtn.width = this._btn_spin.width
                }
                

                particle_win.active = false
                lbl_win_out.active = false
                lbl_win_nor.active = true
                
                let cfg = cc.vv.gameData.getGameCfg()
                let fileName = 'win1'
                let fileEnd = 'win1end'
                let filePath = null
                if(cfg.commEffect && cfg.commEffect.win1){
                    fileName = cfg.commEffect.win1[0]
                    fileEnd = cfg.commEffect.win1[1]
                    filePath = cfg.commEffect.path
                }
                let self = this
                let endCall = function(){
                    if(skipBtn){
                        skipBtn.off("click",endCall)
                        skipBtn.active = false
                    }
                    
                    cc.vv.AudioManager.stopAudio(self._playWinAudioHandle)
                    
                    self._SetBgmVol(1)
                    lbl_win_nor.cleanup()
                    lbl_win_nor.getComponent(cc.Label).string = Global.FormatNumToComma(nWin)
                    if(pRollEndCall){
                        pRollEndCall()
                    }
                    self._playAudio(fileEnd,filePath)
                    resolve()
                    
                }
                let loadFinishCall=function(audioId){
                    //设置时间
                    self._playWinAudioHandle = audioId
                    let time = rollTime;
                    if(!rollTime){
                        if(time>2 || time <= 0){ //小赢默认播放2s
                            time = 2
                        }
                    }
                    if(skipBtn){
                        skipBtn.active = true
                        skipBtn.getComponent(cc.Button).interactable = true
                        // Global.btnClickEvent(skipBtn,endCall)
                        skipBtn.on("click",endCall)
                    }
                    
                    self._SetBgmVol(addCoinBgmVol)
                    Global.doRoallNumEff(lbl_win_nor,begin,nWin,time,endCall,null,2,true)
                }
                this._playAudio(fileName,filePath,null,loadFinishCall)
                
            }
            else{
                //暂时应该没用到吧
                particle_win.active = false
                lbl_win_out.active = false
                lbl_win_nor.active = true
                let endCall = function(){
                    if(pRollEndCall){
                        pRollEndCall()
                    }
                    resolve()
                }
                Global.doRoallNumEff(lbl_win_nor,begin,nWin,rollTime,endCall,null,2,true)
            }
        })
        
    },

    //获取当前赢得的金币
    getCurrentWin:function(){
        return this._currBottomCoin
    },

    //获取stop按钮的实例
    getStopBtnObj:function(){
        return this._btn_stop
    },

    //直接设置赢钱的值
    SetWin:function(nWin){
        let lbl_win_nor = cc.find('winBg/lbl_winNum_nor',this.node)
        if(nWin > 0){
            lbl_win_nor.active = true
            lbl_win_nor.getComponent(cc.Label).string = Global.FormatNumToComma(nWin)
            this._currBottomCoin = nWin
        }else{
            lbl_win_nor.active = false
            this._currBottomCoin = 0
        }
    },

    //新的一局清理win显示
    DoHideWinAction:function(){
        let lbl_win_nor = cc.find('winBg/lbl_winNum_nor',this.node)
        cc.tween(lbl_win_nor)
        .to(0.2,{opacity:0})
        .call(() => {
            lbl_win_nor.opacity = 255
            lbl_win_nor.active = false
            lbl_win_nor.getComponent(cc.Label).string = 0
            this._currBottomCoin = 0
        })
        .start()
    },

    //显示自动模式
    ShowAuto:function(bShow){
        this._bAutoModel = bShow
        this._btn_stop_auto.active = bShow
        if(bShow){
            this.ShowBtnsByState("moveing_1")
        }
    },

    //屏蔽整个下部的点击
    ShowInputMask:function(bShow){
        let node = cc.find("mask_input",this.node)
        if(node){
            node.active = bShow
        }
        
    },

    OnEventShowMask:function(data){
        let val = data.detail
        this.ShowInputMask(val)
    },

    //收到引导完成消息
    OnEventCompleteGuide:function(data){
        let val = data.detail
        if(val == 161){
            this.ShowAutoSelect(true)
        }
    },


    _SetBtnEnable:function(node,bEnable){
        let btn = node.getComponent(cc.Button)
        if(btn){
            btn.interactable = bEnable
        }
    },

    _SetMaxBtnSpine:function(flag){
        let maxBtnSpine = cc.find('Background/maxSpine',this._btn_max_bet)
        maxBtnSpine.active = flag
        if (flag) {
            maxBtnSpine.getComponent(sp.Skeleton).setAnimation(0, "animation2", true)
        }
    },

    //是否需要扣押注
    //1 免费游戏也是不需要花费的
    //2 自定义的旋转模式也是不花费的
    _CheckNeedBet:function(){
        let bNeed = true
        //是否是自定义旋转模式
        let respinTime = cc.vv.gameData.GetRespinTime()
        if(respinTime){
            bNeed = false
        }
        //是否是免费模式
        if(this.GetIsFreeModel()){
            bNeed = false
        }

        return bNeed
    },

    //检查押注额是否足够
    _CheckCoinEnough:function(){
        
        let nTotalCoin = cc.vv.gameData.GetCoin()
        let nTotalBet = cc.vv.gameData.GetTotalBet()
        if(nTotalBet <= nTotalCoin ){
            return true //足够
        } 
        else{
            return false //不够
        }
    },

    //更新自动模式的次数
    _UpdateAutoTimeLabel:function(){
        let nVal = cc.vv.gameData.GetAutoModelTime()
        let lbl_time = this._btn_stop_auto.getChildByName('lbl_auto_times')
        let lbl_nMax = this._btn_stop_auto.getChildByName('nMaxA')
        let bShowInfinity = nVal>500?true:false
        lbl_time.active = !bShowInfinity
        lbl_nMax.active = bShowInfinity
        lbl_time.getComponent(cc.Label).string = nVal
    },

    //计算长按时间
    _UpdateTouchSpine:function(dt){
        if (!this.isCanShowAutoSelect()) {
            this._touchSpinBtnTime = -1
            this.ShowAutoSelect(false)
            return;
        }
        if(this._touchSpinBtnTime >= 0){
            this._touchSpinBtnTime += dt
            if(this._touchSpinBtnTime >= this.LONGTOUCHSPINE){
                this._touchSpinBtnTime = -1
                this.ShowAutoSelect(true)
            }
        }
    },

    _InitAutoPanl:function(){
        let nodeSelectAutoTimes = cc.find("PopSelectAutoTimes", this.node);
        if(nodeSelectAutoTimes){
            nodeSelectAutoTimes.active = false;
            cc.find("grayMask", nodeSelectAutoTimes).on("click", ()=>{
                this._touchSpinBtnTime = -1;
                nodeSelectAutoTimes.active = false;
            });
            for (let i=1; i<=5; i++) Global.btnClickEvent(nodeSelectAutoTimes.getChildByName("btn_" + i), this.OnClickSelectAutoTimes, this);
        }

        this._showAutoFlag(false)
    },

    //播放押注变化的音效
    _PlayBetAudio:function(){
        let idx = cc.vv.gameData.GetBetIdx()
        let maxLen = cc.vv.gameData.GetBetMults().length
        let filename = "bet"+idx
        if(idx == maxLen){
            filename = "global_max_bet"
        }
        this._playAudio('bet/'+filename)
    },

    /**
     * 
     * @param {*} fileName 
     * @param {*} path 音效路径
     * @param {*} endCall 播放结束回调
     * @param {*} loadFinishCall 加载完回调，会带audioid出来
     */
    _playAudio:function(fileName,path,endCall,loadFinishCall){
        if(!path){
            path = "slots_common/SlotRes/";
        }
        
        cc.vv.AudioManager.playEff(path,fileName,true,false,endCall,null,loadFinishCall)
    },

    /**
     * 
     * @param {*} val 音量.
     * 降低背景音，需要背景音乐是开启的状态
     */
    _SetBgmVol:function(val){
        cc.vv.gameData.SetBgmVol(val)
    },

    _ShowBetProTip:function(bShow=true,bAllin=false){
        let node_bettips = cc.find('node_bettips',this.node)
        if(node_bettips){
            
            
            let scp = node_bettips.getComponent('LMSlots_Bottom_BetTips')
            if(scp){
                if(bShow){
                    node_bettips.active = true
                    let bCanShowAllIn = false; //this._isCanShowAllIn()
                    let text_allin = cc.find("pro_bet/txt_allin",node_bettips)
                    text_allin.active = bCanShowAllIn
                    let text_more = cc.find("pro_bet/txt_more",node_bettips)
                    text_more.active = !bCanShowAllIn

                    let nMinIdx = cc.vv.gameData.GetBetMinIdx()
                    let nMaxIdx = cc.vv.gameData.GetBetMaxIdx()
                    let curIdx = cc.vv.gameData.GetBetIdx()
                    if(bAllin){
                        curIdx = nMaxIdx
                    }
                    let nPer = (curIdx-nMinIdx)/(nMaxIdx-nMinIdx)
                    scp.setBetPercent(nPer)
                }
                else{
                    scp.HideTips()
                }
                
            }
        }
    },

    _checkForsePoptips:function(){
        let serverData = cc.vv.UserManager.getNotEncoughCoinPoplist()
        if(serverData && serverData.bforse){
            //强制弹出
            cc.vv.EventManager.emit(EventId.NOT_ENOUGH_COIN_POP_UI);
            cc.vv.UserManager.setNotEncoughPopForceFlag(0)
        }
    },

    _setAllFlag:function(val){
        this._bAllIn = val
        let coin = cc.vv.gameData.GetCoin()
        if(!val){
            coin = 0
        }
        cc.vv.gameData.setAllInVal(val,coin)
    },

    update (dt) {
        this._UpdateTouchSpine(dt)
    },
});
