/**
 * header部分
 */
 let eff_cfg = {path: 'slots_common/SlotRes/' , filename:'common_click', common: true}; 
cc.Class({
    extends:cc.Component, //require("LMSlotMachine_SceneTop"),

    properties: {
        _btn_back:null, //返回按钮
        _lbl_coin:null, //金币

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this._super()

        this._lbl_coin = cc.find("playerCoins/lbl_coinsNum",this.node)
        

        // this._btn_backLobby = cc.find("btn_backLobby", this.node);
        // Global.btnClickEvent(this._btn_backLobby, this.onBtnBackLobbyClicked, this);
        this._btn_purchase = cc.find("btn_purchase", this.node);
        Global.btnClickEvent(this._btn_purchase, this.onBtnPurchaseClicked, this);

        //购买钻石
        let buy_diamond = cc.find("btn_diamond",this.node)
        Global.btnClickEvent(buy_diamond, this.onBtnDiamond, this);
        //菜单按钮
        this._btn_menu = cc.find("btn_menu", this.node);
        Global.btnClickEvent(this._btn_menu, this.onBtnMenuClicked, this);

        // //屏蔽上下点击
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_SHOW_HEADFOOTER_MASK,this.OnEventShowMask,this);
        //设置了gamedata模块的金币，此消息刷新显示
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_UPDATE_BALANCE,this.OnEventRefushCoin,this);
        // Global.registerEvent(EventId.REFUSH_PIG_BANK,this.OnEventClearPigBank,this)
        // Global.registerEvent(EventId.SLIVERICON_SHOW,this.OnEventRefushShopIcon,this)
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,this.onBetChange,this)
        //获得限时任务数据
        // cc.vv.NetManager.registerMsg(MsgId.REQ_DOUBLE_XP, this.onRcvShowLevelUpParty, this)
        
        // Global.btnClickEvent(cc.find("btn_pigbank", this.node), this.onClickPigBank, this);
        // Global.registerEvent(EventId.SHOW_CASHBACK, this.showCashBack, this)      //显示现金返现钱袋

        Global.registerEvent("USER_INFO_CHANGE", this.showHeadInfo, this);
        Global.registerEvent("USER_VIP_EXP_CHANGE", this.showVip, this);
        // Global.registerEvent(EventId.UPATE_DIAMOND, this.showDiamond, this)
    },
    

    start () {
        // this.checkPiglock()
        // this.showShopTipIcon()

        // //有值才显示现金返现
        // this.showCashBack()
    },

    //初始化
    Init:function(){
        this.ShowCoin()
        // this.updateLvExp(true)
        
        this.showDiamond()
        this.showHeadInfo()
        this.showVip()
        this.showMetal()
    },

    showDiamond:function(){
        let lblDiamond = cc.find("playerDiamond/lbl_val",this.node)
        lblDiamond.getComponent(cc.Label).string = Global.FormatNumToComma(cc.vv.UserManager.dcoin)
    },

    onBtnDiamond:function(){
        cc.vv.AudioManager.playEff(eff_cfg.path, eff_cfg.filename, eff_cfg.common)
        cc.loader.loadRes("BalootClient/ShopV2/ShopViewMain", cc.Prefab, (err, prefab)=>{
            if(!err) {
                let node = cc.instantiate(prefab);
                node.parent = cc.find("Canvas");
                node.active = true;
                let shopcp = node.getComponent("ShopViewMain")
                shopcp.showTab("0")
                
            }
        })
    },

    showHeadInfo:function(){
        let uid = cc.vv.UserManager.uid
        let headIcon = cc.vv.UserManager.userIcon
        let avatarframe = cc.vv.UserManager.avatarframe || 0;
        let headNode = cc.find("head",this.node)
        headNode.getComponent("HeadCmp").setHead(uid, headIcon)
        headNode.getComponent("HeadCmp").setAvatarFrame(avatarframe)

        let lvlabel = cc.find("head/level",this.node)
        // lvlabel.getComponent(cc.Label).string = cc.vv.UserManager.level()
        let lv = cc.vv.UserManager.level();
        if (lvlabel) {
            lvlabel.getComponent("LevelCpt").setLevel(lv);
        }

        this.showVip();
    },
    
    showVip:function(){
        cc.find("playervip",this.node).getComponent("VipExpCpt").updateVipExp();
    },

    showMetal:function(){
        // let gameid = cc.vv.gameData.getGameId()
        // let exp = cc.vv.gameData.getDeskInfo().leagueexp
        // cc.find("playermetal",this.node).getComponent("LeagueExpCpt").setGameId(gameid,exp);

        let dcashbonus = cc.vv.UserManager.dcashbonus;    //  可提现到现金余额的金额
        let cashbonus = cc.vv.UserManager.cashbonus;    // 优惠钱包金额

        if(cashbonus == 0){
            cc.find("playermetal/progress", this.node).getComponent(cc.ProgressBar).progress = 0;
        } else {
            cc.find("playermetal/progress", this.node).getComponent(cc.ProgressBar).progress = dcashbonus/cashbonus;
        }

        cc.find("playermetal/value", this.node).getComponent(cc.Label).string = `${dcashbonus}/${cashbonus}`;
    },

    /**
     * 重写：表现是否收集到金猪
     */
    // updateLvExp:function(bInit){
    //     this._super(bInit)

    //     let bFull
    //     let saveData
    //     if(bInit){
    //         saveData = cc.vv.UserManager.getPigbankData()
    //     }
    //     else{
    //         saveData = cc.vv.gameData.getExpChangeData()
    //     }
    //     if(saveData){
    //         bFull = saveData.bagfull
    //     }
        
    //     if(bFull){
    //         this.showPigActionType(2)
    //     }
    //     else{
    //         let lvdata = cc.vv.gameData.getExpChangeData()
    //         //未收集满
    //         if(lvdata && lvdata.addbag > 0 ){
    //             //加了bank coin
    //             this.showPigActionType(1)
    //         }
    //         else{
    //             this.showPigActionType()
    //         }
    //     }
        
        
    // },

    isClickBackLobby:function(){
        return this._bSendExist
    },

    //返回大厅
    onBtnBackLobbyClicked:function(){
        cc.vv.AudioManager.playEff(eff_cfg.path, eff_cfg.filename, eff_cfg.common)
        if(cc.vv.gameData){
            if(this._bSendExist) return
            this._bSendExist = true
            let self = this
            let delayCal = function(){
                self._bSendExist = false
            }
            this.scheduleOnce(delayCal,2)
            cc.vv.gameData.ReqBackLobby()
        }
        
    },

    //显示金币
    ShowCoin:function(){
        let nVal = cc.vv.gameData.GetCoin()
        this._lbl_coin.getComponent(cc.Label).string = Global.FormatNumToComma(nVal)

        //检查一下是否缺金币
        this.onBetChange()
    },

    //获取当前lblcoin的金币
    GetShowCoin:function(){
        return Global.FormatCommaNumToNum(this._lbl_coin.getComponent(cc.Label).string)
    },

    //金币滚动显示
    //nBegin:如果没有设置就取当前lbl的值
    //nEnd:如果没有设置就取gameData中最新的值
    ShowCoinByRoll:function(nBegin,nEnd,nDur=1,endCall){
        let self = this

        if(!Number(nBegin)){
            nBegin = this.GetShowCoin()
        }
        if(!Number(nEnd)){
            nEnd = cc.vv.gameData.GetCoin()
        }
        if(!nDur){
            nDur = 1
        }
        let finishCall=function(){
            //最后刷一下进步
            self.ShowCoin()
            if(endCall){
                endCall()
            }
        }
        Global.doRoallNumEff(this._lbl_coin,nBegin,nEnd,nDur,finishCall,null,2,true)
    },

    //是否可以退出游戏
    SetBackLobby(bEnable){
        
        // this._btn_backLobby.getComponent(cc.Button).interactable = bEnable
        let menuScp = cc.find("Canvas").getComponentInChildren("LMSlotMachine_MenuNode")
        if(menuScp){
            menuScp.SetBackLobby(bEnable)
        }
    },

    //减去押注额
    MinusTotalBet:function(bAllin){
        let nTotal = cc.vv.gameData.GetTotalBet()
        if(bAllin){
            nTotal = cc.vv.gameData.GetCoin()
        }
        cc.vv.gameData.AddCoin(-nTotal)
        this.ShowCoin()
    },

    //开始旋转
    StartMove(){
        

        this.SetBackLobby(false)
    },

    //停止旋转
    StopMove(){
        let bCanExit = true
        let restFree = cc.vv.gameData.GetFreeTime()
        let reSpinTime = cc.vv.gameData.GetRespinTime()
        if(restFree > 0 || reSpinTime > 0){
            bCanExit = false
        }
        this.SetBackLobby(bCanExit)

        this.onBetChange()
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

    OnEventRefushCoin:function(){
        this.ShowCoin()
    },

    // onClickPigBank:function(){
        
    //     // //是否已经开放
    //     // let bopen = cc.vv.UserManager.isOpen(Global.SYS_OPEN.PIG_BANK)
    //     // if(!bopen){
    //     //     Global.playComEff("ch_notification");
    //     //     cc.vv.FloatTip.show(cc.js.formatStr('UNLOCK AT LEVEL %s',Global.SYS_OPEN.PIG_BANK));
    //     //     return
    //     // }
    //     // cc.loader.loadRes("hall_prefab/MoneyBankUI",cc.Prefab, (err, prefab) => {
    //     //     if(!err){
    //     //         let canvas = cc.find("Canvas");
    //     //             if(canvas.isValid && !cc.find('MoneyBankUI',canvas)){
    //     //                 let obj = cc.instantiate(prefab)
    //     //                 obj.parent = canvas
                        
    //     //             }
    //     //     }
    //     // })
    // },

    onBtnPurchaseClicked (event, customEventData) {
        cc.vv.AudioManager.playEff(eff_cfg.path, eff_cfg.filename, eff_cfg.common)

        // let canvas = cc.find('Canvas');
        // let _operateCmp = canvas.getComponent("SlotMachine_Operate");
        // if(_operateCmp && _operateCmp.isNotEnoughCoin(true)){
        //     cc.vv.Shop.show(Global.SHOP_POS_ID.NOENOUGHMONEY);
        // }else {
        //     cc.vv.Shop.show();
        // }
        if(Global.isIOSAndroidReview()){
            cc.vv.PopupManager.addPopup("YD_Pro/Review/yd_more_coins");
        } else {
            cc.vv.PopupManager.showTopWin("YD_Pro/prefab/yd_charge", {
                onShow: (node) => {
                    node.getComponent("yd_charge").setURL(cc.vv.UserManager.payurl);
                }
            })
        }

        // cc.loader.loadRes("BalootClient/ShopV2/ShopViewMain", cc.Prefab, (err, prefab)=>{
        //     if(!err) {
        //         let node = cc.instantiate(prefab);
        //         node.parent = cc.find("Canvas");
        //         node.active = true;
        //         let shopcp = node.getComponent("ShopViewMain")
        //         shopcp.showTab("1")
        //
        //     }
        // })

    },


    // showPigActionType:function(nType){
    //     let nodepig = cc.find('btn_pigbank/goldenpig',this.node)
    //     let fullicon = cc.find('btn_pigbank/full',this.node)
    //     let aniCmp = nodepig.getComponent(sp.Skeleton)
    //     let bOpen = cc.vv.UserManager.isOpen(Global.SYS_OPEN.PIG_BANK)
    //     if(nType == 1 && bOpen){
    //         //收集
    //         fullicon.active = false
    //         aniCmp.setAnimation(0,'animation_3',false)
    //     }
    //     else if(nType == 2 && bOpen){
    //         //满
    //         fullicon.active = true
    //         aniCmp.setAnimation(0,'animation_2',true)
    //     }
    //     else{
    //         //正常太
    //         fullicon.active = false
    //         aniCmp.setAnimation(0,'animation_1',true)
    //     }
    // },

    onBtnMenuClicked (event, customEventData) {
        let self = this
        cc.vv.AudioManager.playEff(eff_cfg.path, eff_cfg.filename, eff_cfg.common)
        this._showMenuAni(true)
        cc.loader.loadRes("slots_common/SlotRes/prefab/LMSlots_MenuNode",cc.Prefab, (err, prefab) => {
            if (!err && cc.isValid(self.node)) {
                let old = self.node.parent.getChildByName('LMSlots_MenuNode')
                if(!old){
                    let node = cc.instantiate(prefab)
                    Global.FixDesignScale(node)
                    node.name = 'LMSlots_MenuNode'
                    node.parent = self.node.parent //加到父节点
                    let oldScaleY = node.scaleY
                    let lvNode = event.target
                    if(lvNode){
                        let pos = lvNode.convertToWorldSpaceAR(cc.Vec2(0,0))
                        let tipPos = self.node.parent.convertToNodeSpaceAR(pos)
                        node.position = cc.v2(tipPos.x - 15, tipPos.y - (lvNode.height/2 - 5)*oldScaleY+10)
                        node.scaleY = 0
                        cc.tween(node)
                        .to(0.1,{scaleY:oldScaleY})
                        .start()
                    }
                    old = node
                    let endCall = function(){
                        self._showMenuAni(false)
                    }
                    node.getComponent("LMSlotMachine_MenuNode").setCloseCall(endCall)
                }
                
            }
        })
        
    },

    _showMenuAni:function(bshow){
        let menuAni = cc.find("btn_menu/ani",this.node)
        if(menuAni){
            let aniName = bshow?"animation_3":"animation_4"
            menuAni.getComponent(sp.Skeleton).setAnimation(0, aniName, false);
        }
    },

    onBetChange:function(){
        let nTotal = cc.vv.gameData.GetTotalBet()
        let nCoin = cc.vv.gameData.GetCoin()
        let node_less = cc.find('playerCoins/less_coin',this.node)
        node_less.active = nCoin < nTotal
    },

    onMsgSpine:function(msg){
        if(msg && msg.code == 200){
            
        }
    },

    onDestroy () {
        cc.vv.NetManager.unregisterMsg(MsgId.REQ_DOUBLE_XP, this.onRcvShowLevelUpParty, false, this);
    },
    // update (dt) {},
});
