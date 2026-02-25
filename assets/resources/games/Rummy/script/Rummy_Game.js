/**
 * Rummy game
 */
 let Rummy_Tools = require("Rummy_Tools")

let DeskState = {
    Match : 1,          //匹配阶段
    Ready : 2,          //准备阶段
    Play : 3,           //玩牌阶段
    // Compare : 4,        //比牌阶段
    Settle : 4,         //结算阶段

    WaitStart : 11,  // 等待开始
    WaitSwitch : 12,  // 等待换桌
    WaitSettle : 13,  // 等待结算
}

let PlayerState = {
    Wait:1, //wait
    Ready:2,
    Draw : 3,   //摸牌状态
    Discard : 4,//出牌状态
    Confirm : 5,//定牌状态(该状态还未定牌，定完之后变成Show状态)
    Show : 6,   //亮牌状态(亮牌成功或Confirm后的状态)
    Fail : 7,   //亮牌失败
    Drop : 8,   //弃牌状态
    

}

cc.Class({
    extends: require("Table_Game_Base"),

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._super()

        let draw_btn = cc.find("node_table/node_poker/un_check_card",this.node)
        Global.btnClickEvent(draw_btn,this.onClickDraw1,this)
        let dis_btn = cc.find("node_table/node_poker/dirscard_check_card",this.node)
        Global.btnClickEvent(dis_btn,this.onClickDraw2,this)


        let btn_drop = cc.find("bottom/btn_drop",this.node)
        Global.btnClickEvent(btn_drop,this.onClickOPDrop,this)
        let btn_show = cc.find("bottom/btn_show",this.node)
        Global.btnClickEvent(btn_show,this.onClickOPShow,this)
        let btn_group = cc.find("bottom/btn_group",this.node)
        Global.btnClickEvent(btn_group,this.onClickOPGroup,this)
        let btn_discard = cc.find("bottom/btn_discard",this.node)
        Global.btnClickEvent(btn_discard,this.onClickOPDiscard,this)
        let btn_confirm = cc.find("bottom/btn_confirm",this.node)
        Global.btnClickEvent(btn_confirm,this.onClickOPConfirm,this)
        let btn_switch = cc.find("node_wait/btn_switch",this.node)
        Global.btnClickEvent(btn_switch,this.onClickSwitchTable,this)
        let btn_tableInfo = cc.find("tableinfo",this.node)
        Global.btnClickEvent(btn_tableInfo,this.onClickTableInfo,this)


        Global.registerEvent("poker_select_change",this.onEventSelectPokerChange,this)
        
    },

    start () {
        this._super()
    },

    //初始化游戏
    Init(){
        let node = cc.find("node_lay",this.node)
        
        this._handCtrl = node.getComponent("Rummy_HandCtrl")

        this._showTableInfo()
    },

    doStatusChange:function(){

    },

    _showTableInfo:function(){
        let perscoreNode = cc.find("node_table/mini_bet/val",this.node)
        let PerscoreVal = cc.vv.gameData.getDeskInfo().basecoin
        perscoreNode.getComponent(cc.Label).string = PerscoreVal
        
        this._showPoolCoin()
        this._showDropCoin()
    },


    /**
     * 开始游戏：由logicbase统一调用
     */
    StartGame(){
        this.playGameBGM()
        //刷新玩家
        let sp = this._getPlayerListScript()
        if(sp){
            sp._showTablePlayers()
        }
        //恢复桌子阶段
        let nStatus = cc.vv.gameData.getGameStatus()
        if(nStatus == DeskState.Match || nStatus == DeskState.WaitStart){
            this._showMathState()
        }
        else if(nStatus == DeskState.Ready){
            this._showReadyState()
        }
        else if(nStatus == DeskState.Play){
            this._showPlayState()
        }
        else if(nStatus == DeskState.Settle){
            this._showMathState()
        }

        this.checkMathModel()
    },

    //是否是比赛模式
    checkMathModel:function(){
        // 根据游戏类型 显示或者隐藏赛事
        let bMatch = cc.vv.gameData.isMatchRoom()
        let allMatchRanks = this.node.getComponentsInChildren("KnockoutRankCpt")
        if(!this.knockCpt){
            this.knockCpt = this.node.getComponentInChildren("KnockoutDeskInfoCpt")
        }
        if(bMatch){
            for(const cpt of allMatchRanks){
                cpt.node.active = true
            }
            
            this.knockCpt.init(cc.vv.gameData.getDeskInfo())
        }
        else{
            for(const cpt of allMatchRanks){
                cpt.node.active = false
            }
            if(this.knockCpt){
                this.knockCpt.close();
            }
            
        }
       
    },

    closeMathPanel:function(){
        if(this.knockCpt){
            this.knockCpt.closeAllPanel();
        }
        
    },

    //匹配阶段
    _showMathState:function(){
        //匹配动画
        this._showMathUIAni(true)
        
        this._showPokerOnTable(true)

        //隐藏底部操作面板
        this._showOPPannel(false)

        //清理手牌
        this._clearHandCards()

        //隐藏庄家标示
        this.showPlayerDealer(false)

        //未发牌隐藏我的点数
        this._showMyPoint(false)

        this.hideStatesTips()

        // this.showNextRetime(false)

        this.showAllPlayers(true)
        this.showDiscardDetail(false)

        this._showWaitNode(true)

        //是否好友房
        this._showFriendRoomOP(true)

        //关闭结算界面
        this._closeSettle()

        this.hidePoolCoin()
    },

    _showReadyState:function(){
        this._showPokerOnTable()
        //隐藏庄家标示
        this.showPlayerDealer(false)

        //关闭结算界面
        this._closeSettle()
    },

    _showPlayState:function(){
        this._showRecountUIAni(false)
        this._showMathUIAni(false)

        this._clearHandCards()
        //显示桌上牌
        this._showPokerOnTable()
        //操作面板可见
        this._showOPPannel(true)
        //显示手牌
        this._showHandCard()
        
        //庄家标示
        this.showPlayerDealer(true)

        // this.showNextRetime(false)

        this.showAllPlayers(true)
        //显示当前操作的玩家
        this._showActivePlayer()

        this.showDiscardDetail(true)

        this._showFriendRoomOP(false)

        //关闭结算界面
        this._closeSettle()
    },

    _clearHandCards:function(){
        this._handCtrl.clearHands()
        //
        let node_poker = cc.find("node_table/node_poker",this.node)
        if(node_poker){
            let pCard = node_poker.getChildByName("poker_temp")
            if(pCard){
                pCard.destroy()
            }
        }
    },


    _showActivePlayer:function(bWithMy=true){
        let roundInfo = cc.vv.gameData.getRoundInfo()
        let ac_seat = roundInfo.activeSeat
        let ac_delay = roundInfo.delayTime
        let play_list_scp = this._getPlayerListScript()
        play_list_scp.hideAllPlayerRetime(ac_seat)
        
        //confirm的时候，可能是一个数组
        let datas = []
        if(ac_seat instanceof Array){
            for(let i = 0; i < ac_seat.length ; i++){
                let info = cc.vv.gameData.getPlayByUid(ac_seat[i])
                if(info){
                    datas.push(info.seatid)
                }
            }
        }
        else{
            datas.push(ac_seat)
        }

        for(let i = 0; i < datas.length; i++){
            let item = datas[i]
            let ac_player = cc.vv.gameData.getPlayByServiceSeat(item)
            if(ac_player){
                let lastActive = cc.vv.gameData.getLastActiveSeat()
                if(lastActive != item){ //如果当前的活动玩家和上一个一样，就不刷新，以免合并了阶段后，时间卡顿
                    let node = play_list_scp.getPlayerNodeByShowSeat(ac_player.showSeat)
                    if(node){
                        node.getComponent("Rummy_Player")._doRetimer(ac_delay,null,datas.length==1)
                    }
                   
                }
                
    
                let bMy = (ac_player.showSeat == 0)
                if(bMy){
                    if(ac_player.state == PlayerState.Draw ){
                        this._showPlayerDraw()
                    }
                    else if(ac_player.state == PlayerState.Discard){
                        this._showPlayerDiscard()
                    }
                    else if(ac_player.state == PlayerState.Drop){
                        this._showPlayerDrop()
                    }
                }
                else{
                    //清理手指
                    this._showCanDrawLight(false)
                    //隐藏我的操作框
                    this.hideConfirmTip()
                }
            }
        }
        
        if(bWithMy){
            this._checkMyState()
        }
        
        if(cc.vv.gameData.isMyActive()){
            let myState = cc.vv.gameData.getMyState()
            if(myState == PlayerState.Draw){//摸牌
                Global.TableSoundMgr.playEffect("Current")
                cc.vv.PlatformApiMgr.deviceShock()
            }
            
        }


    },

    //检查我的操作状态
    _checkMyState:function(){
        let myInfo = cc.vv.gameData.getMyInfo()
        if(myInfo){
            let tips_text = ""
            this._setOpBtnByState(myInfo.state)
            if(myInfo.state == PlayerState.Fail){
                //亮牌失败
                tips_text = "You show failed! Waiting for next round."
            }
            else if(myInfo.state == PlayerState.Drop){
                //弃牌
                tips_text = "You have dropped. Waiting for the next round"
            }

            if(tips_text){
                this.showStatesTips(tips_text,0)
            }

            let bShow = (myInfo.state != PlayerState.Wait)
            this._showOPPannel(bShow)
            this._showMyPoint(bShow)
            this._showWaitNode(!bShow || myInfo.state == PlayerState.Drop || myInfo.state == PlayerState.Fail)
            this._showWatcherTips(!bShow)

            Global.dispatchEvent("Refush_default_head")
            
        }
    },

    _showPlayerDraw:function(){
        //可操作特效显示
        this._showCanDrawLight(true)
        //操作面板
        this._setOpBtnByState(PlayerState.Draw)
        //显示poolcoin
        this._showPoolCoin()
    },
    _showPlayerDiscard:function(){
        this._showCanDrawLight(false)
        this._setOpBtnByState(PlayerState.Discard)
    },
    _showPlayerDrop:function(){
        this._setOpBtnByState(PlayerState.Drop)
        this._showPoolCoin()
        this._showCanDrawLight(false)
        //手牌变成0显示牌背
        this._handCtrl._recircleNode()
        this._handCtrl.showHandCards()
    },

    _showWatcherTips:function(bShow){
        let node = cc.find("node_wait_tips",this.node)
        node.active = bShow
    },

    _setOpBtnByState:function(val,bop){
        let isActiveMy = cc.vv.gameData.isMyActive()
        if(bop){
            isActiveMy  = false
        }
        //是否显示Drop
        let bShowDrop = isActiveMy && (val == PlayerState.Draw) && (val != PlayerState.Drop) && (val != PlayerState.Confirm) && (val != PlayerState.Show) && (val != PlayerState.Fail) && (val != PlayerState.Wait)
        let btn_drop = cc.find("bottom/btn_drop",this.node)
        btn_drop.getComponent(cc.Button).interactable = bShowDrop
        // btn_drop.active = bShowDrop

        //选中的牌的张数
        let nTotal = 0
        if(this._handCtrl){
            let allSels = this._handCtrl.getAllSelectPokers()
            if(allSels){
                nTotal = allSels.length
            }
            
        }

        //是否显示Show
        let bShowShow = (nTotal == 1) && isActiveMy && (val == PlayerState.Discard) && (val != PlayerState.Drop) && (val != PlayerState.Confirm) && (val != PlayerState.Show) && (val != PlayerState.Fail) && (val != PlayerState.Wait)
        let btn_show = cc.find("bottom/btn_show",this.node)
        btn_show.getComponent(cc.Button).interactable = bShowShow
        btn_show.active = bShowShow

        //是否显示Group
        let bShowGroup = (nTotal >= 1) && (val != PlayerState.Drop) && (val != PlayerState.Show) && (val != PlayerState.Fail) && (val != PlayerState.Wait)
        let btn_group = cc.find("bottom/btn_group",this.node)
        btn_group.getComponent(cc.Button).interactable = bShowGroup
        btn_group.active = bShowGroup
        Global.breathNode(btn_group,1,0.95)

        
        //是否显示Driscard
        let bShowDiscard = (nTotal == 1) && isActiveMy && (val == PlayerState.Discard) && (val != PlayerState.Drop) && (val != PlayerState.Confirm) && (val != PlayerState.Show) && (val != PlayerState.Fail) && (val != PlayerState.Wait)
        let btn_discard = cc.find("bottom/btn_discard",this.node)
        btn_discard.getComponent(cc.Button).interactable = bShowDiscard
        btn_discard.active = bShowDiscard


        //是否显示confirm
        let bShowConfirm = (val == PlayerState.Confirm) && (val != PlayerState.Show) && (val != PlayerState.Fail)
        let btn_confirm = cc.find("bottom/btn_confirm",this.node)
        btn_confirm.active = bShowConfirm
        Global.breathNode(btn_confirm,1,0.95)
        
    },

    _showCanDrawLight:function(bShow){
        let nTotal = 10//默认牌堆是有牌的
        let roundInfo = cc.vv.gameData.getRoundInfo()
        if(roundInfo){
            nTotal = roundInfo.cardCnt
        }
        let bWild = false
        if(bShow){
            let curDis = cc.vv.gameData.getCurShowDiscard()
            bWild = Rummy_Tools.isWild(curDis,roundInfo.wildCard)
            if(bWild){
                //不能显示弃牌堆提示
                if(cc.vv.gameData.isRoundFirstCard()){
                    //首轮第一张wild可以抓
                    bWild = false
                }
            }
        }
        

        let draw_btn = cc.find("node_table/node_poker/un_check_card",this.node)
        draw_btn.getComponent(cc.Button).interactable = bShow
        let draw_light = cc.find("frame",draw_btn)
        draw_light.active = bShow && nTotal>1
        Global.blinkAction(draw_light,0.2,0.2)
        let dis_btn = cc.find("node_table/node_poker/dirscard_check_card",this.node)
        dis_btn.getComponent(cc.Button).interactable = bShow
        let dis_light = cc.find("frame",dis_btn)
        dis_light.active = bShow && !bWild
        Global.blinkAction(dis_light,0.2,0.2)


        //手指提示只显示前3轮
        if(!this._fingercont) this._fingercont = 1
        
        let spine_l = cc.find("spine",draw_btn)
        spine_l.active = bShow && nTotal>0 && (this._fingercont<4)
        let spine_r = cc.find("spine",dis_btn)
        spine_r.active = bShow && (this._fingercont<4) && !bWild
        if(bShow){
            this._fingercont++
        }
    },

    onClickDraw1:function(){
        // Global.TableSoundMgr.playEffect("drawcard")
        cc.vv.gameData.sendReqClickCard(1)
    },

    onClickDraw2:function(){
        //joke wild不能被摸
        let wild = cc.vv.gameData.getRoundWild()
        if(!wild){
            return
        }
        let curDiscard = cc.vv.gameData.getCurShowDiscard()
        
        if(Rummy_Tools.isWild(curDiscard,wild)){
            if(cc.vv.gameData.isRoundFirstCard()){
                //首轮第一张wild/joker可以抓
            }
            else{
                cc.vv.FloatTip.show("Joker or wild card can't be draw!")
                return
            }
            
        }

        // Global.TableSoundMgr.playEffect("drawcard")
        cc.vv.gameData.sendReqClickCard(2)
    },

    _showHandCard:function(){
        let node = cc.find("node_lay",this.node)
        node.active = true
        node.getComponent("Rummy_HandCtrl").showHandCards()
    },

    _getHandCtrl:function(){
        if(!this._handCtrl){
            let node = cc.find("node_lay",this.node)
            this._handCtrl = node.getComponent("Rummy_HandCtrl")
        }
        return this._handCtrl
    },

    //桌上的牌
    _showPokerOnTable:function(bmath,wildAni){
        //uncheck
        let node_uncheck = cc.find("node_table/node_poker/un_check_card",this.node)
        let poker_uncheck = cc.find("card",node_uncheck)
        let uncheck_deck = cc.find("deck",node_uncheck)
            
        //wild
        let poker_wild = cc.find("node_table/node_poker/un_check_card/card_wild",this.node)
        
        //check card
        let card_check = cc.find("node_table/node_poker/dirscard_check_card/card",this.node)

        //show card
        let show_node = cc.find("node_table/node_poker/show_card",this.node)
        let show_card = cc.find("card",show_node)
        let show_deck = cc.find("deck",show_node)

        
        if(bmath){
            poker_uncheck.active = false
            poker_wild.active = false
            card_check.active = false
            show_card.active = true
            uncheck_deck.active = false
            show_deck.active = true
            show_card.getComponent("Poker").showPokerBg(0)
        }
        else{
            let roundInfo = cc.vv.gameData.getRoundInfo()
            if(roundInfo){
                show_deck.active = false
                let nUnCkeckCard = roundInfo.cardCnt
                uncheck_deck.active = nUnCkeckCard>1
                poker_uncheck.getComponent("Poker").showPokerBg(0)
                poker_uncheck.active = nUnCkeckCard>1
                poker_wild.getComponent("Poker").show16Poker(roundInfo.wildCard,roundInfo.wildCard)
                poker_wild.active = nUnCkeckCard>0
                if(wildAni){
                    show_card.active = false
                    poker_wild.angle = 0
                    poker_wild.x = 0
                    poker_wild.y = 0
                    cc.tween(poker_wild)
                    .to(0.15,{angle:10,y:-7,x:-66.6})
                    .start()
                    Global.TableSoundMgr.playEffect("flop_card_2")
                }
                else{
                    poker_wild.angle = 10
                    poker_wild.y = -7
                    poker_wild.x = -66.6
                }
                let dis_cards = roundInfo.discardCards
                if(dis_cards && dis_cards.length>0){
                    let curDis = dis_cards[dis_cards.length -1]
                    card_check.getComponent("Poker").show16Poker(curDis,roundInfo.wildCard)
                    card_check.active =true

                    let gray_mask = cc.find("gray_mask",card_check)
                    if(gray_mask){
                        gray_mask.active = Rummy_Tools.isWild(curDis,roundInfo.wildCard)
                    }
                }
                else{
                    card_check.active =false
                }

                let winCard = roundInfo.winCard
                if(winCard){
                    show_card.active = true
                    show_card.getComponent("Poker").show16Poker(winCard,roundInfo.wildCard)
                }
                else{
                    show_card.active = false
                }
                
    
            }
        }
        
    },

    showWild:function(){
        this._showPokerOnTable(false,true)
    },

    _showDropCoin:function(){
        let val = cc.vv.gameData.getDropCoin()
        let node = cc.find("bottom/btn_drop/val",this.node)
        node.getComponent(cc.Label).string = "-" + Global.FormatNumToComma(val)
    },

    _showPoolCoin:function(){
        let val = cc.vv.gameData.getPoolCoin()
        let node = cc.find("node_table/node_drop_coin",this.node)
        node.active = val>0?true:false
        
        Global.setLabelString("val",node,val)
    },

    hidePoolCoin:function(){
        let node = cc.find("node_table/node_drop_coin",this.node)
        node.active = false
    },


    //nType:1 matching样式 2 倒计时样式
    _showMathUIAni:function(bShow,setTime,nType){
        let bFriendRoom = cc.vv.gameData.isFriendRoom()
        if(bFriendRoom){
            bShow = false
        }
        
        let node = cc.find("node_match",this.node)
        node.active = bShow
        if(!nType){ //默认显示matching
            nType = 1
        }
        let node_recount = cc.find("table_count_down",node)
        let node_matching = cc.find("node_matching",node)
        node_matching.active = (nType == 1)
        node_recount.active = (nType != 1)
        let show_node = node_matching
        let show_scp = "Table_Matching"
        if(nType != 1){
            show_node = node_recount
            show_scp = "Table_CountDown"
        }

        if(bShow){
            let nMathTime = cc.vv.gameData.getMatchRetime()
            if(setTime){
                nMathTime = setTime
            }
            let scp = show_node.getComponent(show_scp)
            if(scp){
                scp.show(nMathTime)
            }

            show_node.active = nMathTime>0

        }
    },

    _showOPPannel:function(bShow){
        let op = cc.find("bottom",this.node)
        op.active = bShow
    },

    _getShowCardNode:function(){
        return cc.find("node_table/node_poker/show_card/card",this.node)
    },

    _getDisCardNode:function(){
        return cc.find("node_table/node_poker/dirscard_check_card/card",this.node)
    },

    _getUncheckNode:function(){
        return cc.find("node_table/node_poker/un_check_card/card",this.node)
    },

    //丢牌
    onMsgDiscardCard:function(msg){
       
        //飞一张牌到丢弃的牌上
        let card_val = msg.card
        let ac_uid = msg.uid
        if(cc.vv.UserManager.isMySelf(ac_uid)){
            
            this._showActivePlayer(false)
            this._setOpBtnByState(PlayerState.Draw,true)
            let nTotal = cc.vv.gameData.getTotalHandCards()
            if(msg.is_auto && nTotal == 14){
                //最近draw的倒计时丢出去
                let val = card_val
                let drawCard = this._handCtrl.getCardByVal(val)
                if(drawCard){
                    let self = this
                    let outCall = function(){
                        self._showPokerOnTable()
                    }
                    //删除手牌，不需要同步给服务器
                    let selItem = drawCard
                    let dui_val = selItem.getComponent("Rummy_Poker").getPokerDui()
                    let card_val = selItem.getComponent("Rummy_Poker").getPokerIndex()
                    this._handCtrl.doDiscard({dui:dui_val,card:card_val,obj:selItem},false,outCall)
                    // this._lastDrawCard = null
                }
                
            }
            else{
                this._showPokerOnTable()
            }
        }
        else{
            let parNode = cc.find("node_table/node_poker",this.node)
            let card_obj = this._getHandCtrl()._createrPoker(card_val)
            if(card_obj){
                card_obj.parent = parNode
                
                let toPos = parNode.convertToNodeSpaceAR(cc.find("dirscard_check_card/card",parNode).convertToWorldSpaceAR(cc.v2(0,0)))
                let fromNode = this._getPlayerListScript().getPlayerNodeByUid(ac_uid)
                let fromPos = parNode.convertToNodeSpaceAR(fromNode.convertToWorldSpaceAR(cc.v2(0,0)))
                card_obj.position = fromPos
                let nDur = toPos.sub(fromPos).mag()/2000
                let org_scale = card_obj.scale
                card_obj.scale = 0.5
                cc.tween(card_obj)
                .to(nDur,{scale:org_scale,position:toPos})
                .call(()=>{
                    //更新丢弃牌
                    this._showPokerOnTable()
                    this._showActivePlayer(false)
                })
                .removeSelf()
                .start()
                Global.TableSoundMgr.playEffect("dealcard")
            }
        }
        

    },

    //开始游戏，并且发牌
    onMsgGameStart:function(msg){
        let self = this
        Global.TableSoundMgr.playEffect("gamestart")
        

        this.hideStatesTips()
        this._showRecountUIAni(false)
        this._showMathUIAni(false)
        this._closeSettle()
        this._clearHandCards()
        this._showTableInfo()
        this._showPokerOnTable(true)
        this.showPlayerDealer(true)
        this.showAllPlayers(true,true)
        this._showWaitNode(false)
        this._showWatcherTips(false)
        this._showFriendRoomOP(false)
        let bMatch = cc.vv.gameData.isMatchRoom()
        if(bMatch){
            this.knockCpt.updateView()
            this.knockCpt.closeAllPanel();
        }
        //发牌
        let hand_ctrl = this._getHandCtrl()
        let endCall = function(){
            //开始显示活动玩家
            self._showActivePlayer()
            self._showOPPannel(true)
            self._showPokerOnTable()
            self.showDiscardDetail(true)
        }
        hand_ctrl.showSendCard(msg.groupcards,endCall)

        Global.dispatchEvent("Refush_default_head")
    },

    //摸牌
    showDrawAni:function(msg){
        

        let nodeTable = cc.find("node_lay",this.node)
        let bMy = cc.vv.UserManager.isMySelf(msg.uid)
        let toPos
        let nDur = 0.2
        let scaleVal = 0.3
        if(bMy){
            scaleVal = 1.1
            nDur = 0.3
            
            let posinfo = this._handCtrl.getNextDuiPos()
            
            toPos = cc.v2(posinfo.x-50,posinfo.y)
            this._showDropCoin()
        }
        else{
            
            let toNode = this._getPlayerListScript().getPlayerNodeByUid(msg.uid)
            if(!toNode){
                let ac_seat
                let roundInfo = cc.vv.gameData.getRoundInfo()
                if(roundInfo){
                    ac_seat = activeSeat
                }
                
                let ac_player  = cc.vv.gameData.getPlayByServiceSeat(ac_seat)
                if(ac_player){
                    toNode = this._getPlayerListScript().getPlayerNodeByUid(ac_player.uid)
                }
            }
            toPos = nodeTable.convertToNodeSpaceAR(toNode.convertToWorldSpaceAR(cc.v2(0,0)))
        }
        let nType = msg.op 

        let fromNod
        
        if(nType == 1){
            fromNod = cc.find("node_table/node_poker/un_check_card/card",this.node)
        }
        else{
            fromNod = cc.find("node_table/node_poker/dirscard_check_card/card",this.node)
        }

        let newNode = cc.instantiate(fromNod)
        newNode.parent = nodeTable
        newNode.position = nodeTable.convertToNodeSpaceAR(fromNod.convertToWorldSpaceAR(cc.v2(0,0))) 
        cc.tween(newNode)
        .to(nDur,{position:toPos,scale:scaleVal})
        .call(()=>{
            if(bMy){
                this._handCtrl._recircleNode()
                this._handCtrl.showHandCards()
                this._showActivePlayer()

                // //需记录刚刚摸的那张牌，如果自动时间到了，就会自动把摸牌打出
                // let myHands = cc.vv.gameData.getMyHand()
                // let lastDui = myHands[myHands.length-1]
                // cc.vv.gameData.saveLastDraw({dui:myHands.length-1,idx:lastDui.length-1})

                // this._lastDrawCard = true
                // let lastDraw = this._handCtrl._getLastObj()
                // lastDraw.getComponent("Rummy_Poker").setLastDrawFlag(true)
            }
            else{
                this._showActivePlayer(false)
            }
            
            

            
            //是否需要洗牌
            this._showPokerOnTable()
            if(msg.shuffle){
                let self = this
                //设置新的牌的张数
                let roundInfo = cc.vv.gameData.getRoundInfo()
                roundInfo.cardCnt = msg.cardCnt
                let endCall = function(){
                    self._showPokerOnTable()
                }
                this._showXipaiAni(true,endCall)
            }
           
        })
        .removeSelf()
        .start()
        Global.TableSoundMgr.playEffect("drawcard")
        
    },

    //显示洗牌动画
    _showXipaiAni:function(bShow,endCall){
        let nodexipai = cc.find("node_xipai",this.node)
        nodexipai.active = true
        let spcmp = nodexipai.getComponent(sp.Skeleton)
        spcmp.setAnimation(0,"animation",false)
        spcmp.setCompleteListener(()=>{
            nodexipai.active = false
            if(endCall)endCall()
        })
    },

    showGameDrop:function(msg){
        let bMy = cc.vv.UserManager.isMySelf(msg.uid)
        if(bMy){
            this._showPlayerDrop()
            let tips_text = "You have dropped. Waiting for the next round"
            this.showStatesTips(tips_text,0)

            this._showWaitNode(true)
            
        }
        else{
            this._showPoolCoin()
            // let myNode = this._getPlayerListScript().getPlayerNodeByUid(msg.uid)
            // if(myNode){
            //     myNode.getComponent("Rummy_Player").refushCoin()
            // }
        }

        //更新player的金币
        let dropNode = this._getPlayerListScript().getPlayerNodeByUid(msg.uid)
        if(dropNode){
            dropNode.getComponent("Rummy_Player").refushCoin()
            let dropcoin = cc.vv.gameData.getDropCoin()
            if(dropcoin){
                dropNode.getComponent("Rummy_Player").playFlyScroe(dropcoin*-1)
            }
            
        }
        
        this._showActivePlayer()
        
    },

    doPlayerShow:function(msg){
        let card_val = msg.card
        let ac_uid = msg.uid
        let bSuccess = msg.success
         //给所有人挂定时
         if(bSuccess){
            let allPlayer = cc.vv.gameData.getTablePlayers()
            for(let i = 0; i < allPlayer.length; i++){
                let item = allPlayer[i]
                //等待以及show失败和drop的玩家都不挂定时器
                if(item.state == PlayerState.Wait || item.state == PlayerState.Fail || item.state == PlayerState.Drop){
                    continue
                }
                let playNode = this._getPlayerListScript().getPlayerNodeByUid(item.uid)
                if(playNode){
                    if(ac_uid == item.uid){
                        playNode.getComponent("Rummy_Player")._showRetimer(false)
                        playNode.getComponent("Rummy_Player").showWinner(true)
                    }
                    else{
                        
                        playNode.getComponent("Rummy_Player")._doRetimer(msg.delayTime,null,false)
                    }
                    
                }
            }
         }
         

        let eff_name = bSuccess?"event_level_win":"event_level_lose"
        Global.TableSoundMgr.playEffect(eff_name)
        if(cc.vv.UserManager.isMySelf(ac_uid)){
            //将自己的状态修改成show失败
            let tips_text = "You show failed! Waiting for next round."
            let nDur = 0
            let nStatus = PlayerState.Fail
            if(bSuccess){
                nStatus = PlayerState.show
                tips_text = "You show success!"
                nDur = 3.5
            }
            else{
                //失败，刷新金币,并飘分
                let node = this._getPlayerListScript().getPlayerNodeByUid(ac_uid)
                let playscp = node.getComponent("Rummy_Player")
                let myInfo = cc.vv.gameData.getMyInfo()
                playscp.showCoin(myInfo.coin)
                playscp.playFlyScroe(msg.failcoin*(-1))
                //同时出现换桌按钮
                this._showWaitNode(true)
            }

            //去掉自己的定时器
            let myNode = this._getPlayerListScript().getPlayerNodeByUid(ac_uid)
            if(myNode){
                myNode.getComponent("Rummy_Player")._showRetimer(false)
            }

            this.showStatesTips(tips_text,nDur)

            cc.vv.gameData._updatePlayerState(ac_uid,nStatus)
           
            //操作面板不可点击
            this._setOpBtnByState(PlayerState.Show)

            

            //更新poolcoin
            this._showPoolCoin()

            this._showPokerOnTable()
        }
        else{
            

            //显示桌面的show牌
            
            

            // cc.vv.FloatTip.show("Your should confirm you group!")

            let parNode = cc.find("node_table/node_poker",this.node)
            let card_obj = this._getHandCtrl()._createrPoker(card_val)
            card_obj.parent = parNode
            let showNode = cc.find("show_card/card",parNode)
            let disNode = cc.find("dirscard_check_card/card",parNode)
            let toPos = parNode.convertToNodeSpaceAR(showNode.convertToWorldSpaceAR(cc.v2(0,0)))
            let fromNode = this._getPlayerListScript().getPlayerNodeByUid(ac_uid)
            let fromPos = parNode.convertToNodeSpaceAR(fromNode.convertToWorldSpaceAR(cc.v2(0,0)))
            let disPos = parNode.convertToNodeSpaceAR(disNode.convertToWorldSpaceAR(cc.v2(0,0)))
            card_obj.position = fromPos
            let nDur = toPos.sub(fromPos).mag()/2000
            let org_scale = card_obj.scale
            card_obj.scale = 0.5
            card_obj.active = true

            if(bSuccess){
                //show成功了才提示
                let myInfo = cc.vv.gameData.getMyInfo()
                if(myInfo && myInfo.state != PlayerState.Wait && myInfo.state != PlayerState.Drop){
                    let tips_text = "%s has won the game!"
                    let winPlayInfo = cc.vv.gameData.getPlayByUid(ac_uid)
                    if(winPlayInfo){
                        tips_text = cc.js.formatStr(tips_text,winPlayInfo.playername)
                    }
                    else{
                        tips_text = cc.js.formatStr(tips_text,"unknow")
                    }
                    this.showStatesTips(tips_text,0)
                }

                cc.tween(card_obj)
                .to(nDur,{scale:org_scale,position:toPos})
                .call(()=>{
                    //更新丢弃牌
                    this._showPokerOnTable()
                    // this._showActivePlayer()
                    //操作面板显示canfirm
                    let myState = cc.vv.gameData.getMyState()
                    if(myState == PlayerState.Confirm){
                        this._setOpBtnByState(PlayerState.Confirm)
                    }
                    
                })
                .delay(1.5)
                .removeSelf()
                .start()
            }
            else{
                //失败，刷新金币,并飘分
                let node = this._getPlayerListScript().getPlayerNodeByUid(ac_uid)
                let playscp = node.getComponent("Rummy_Player")
                playscp.playFlyScroe(msg.failcoin*(-1))
                playscp.refushCoin()
                
                cc.tween(card_obj)
                .to(nDur,{scale:org_scale,position:toPos})
                .delay(1)
                .to(0.5,{position:disPos})
                .call(()=>{
                    //更新丢弃牌
                    this._showPokerOnTable()
                    this._showActivePlayer()
                    // //操作面板显示canfirm
                    // this._setOpBtnByState(PlayerState.Confirm)

                    this._showPoolCoin()
                })
                .removeSelf()
                .start()
            }
            

            
        }
        
    },


    //结算
    doRoundOver:function(msg){
        let self = this
        this._fingercont = null
        //状态切换成已亮牌
        this._setOpBtnByState(PlayerState.Show)
        //隐藏提示
        this.hideStatesTips()

        for(let i = 0; i < msg.settle.length; i++){
            let info = msg.settle[i]
            let node = this._getPlayerListScript().getPlayerNodeByUid(info.uid)
            if(node){
                if(info.wincoin>0){
                    cc.vv.gameData._updatePlayerState(info.uid,PlayerState.Show)
                }
                let playscp = node.getComponent("Rummy_Player")
                playscp._showRetimer(false)
                let bShowFly = true
                if(cc.vv.UserManager.isMySelf(info.uid)){
                    let myInfo = cc.vv.gameData.getMyInfo()
                    playscp.showCoin(myInfo.coin)
                    if(myInfo.state == PlayerState.Drop || myInfo.state == PlayerState.Fail){
                        bShowFly = false
                    }
                }
                if(bShowFly){
                    playscp.playFlyScroe(info.wincoin)
                    playscp.refushCoin()
                }
                
            }
            
        }
        let url = "games/Rummy/prefab/settle_ui"
        cc.loader.loadRes(url,cc.Prefab,(err,data)=>{
            let par = cc.find("Canvas")
            let old = par.getChildByName("settle_ui")
            if(!old){
                old = cc.instantiate(data)
                old.parent = par
                old.getComponent("Rummy_SettleUI").setInfo(msg.settle)

                let cp = old.addComponent("NodeLifeCallBack")
                cp.setDestroyCall(()=>{
                    if(cc.isValid(self.node,true)){
                        let nStatus = cc.vv.gameData.getGameStatus()
                        if(nStatus == DeskState.Settle){
                            //清理桌面
                            self.clearTable(false)
                            self._showWaitNode(true)
                            self._showWatcherTips(false)
                            
                            if(cc.vv.gameData.isFriendRoom()){
                                cc.vv.gameData.setGameStatus(DeskState.Match)
                                cc.vv.gameData._updatePlayerState(cc.vv.UserManager.uid,1)
                                this._showMathState()
                            }
                            else{
                                let val = 0
                                let roundInfo = cc.vv.gameData.getRoundInfo()
                                if(roundInfo){
                                    val = roundInfo.delayTime
                                }
                                self._showMathUIAni(true,val,2)
                            }
                            
    
                        }
                    }
                    
                })
            }
        })
    },

    doConfirmSuccess:function(msg){
        //取消玩家头上定时
        let uid = msg.uid
        let play = this._getPlayerListScript().getPlayerNodeByUid(uid)
        if(play){
            // play.getComponent("Rummy_Player").showConfirmedTips(true)
            play.getComponent("Rummy_Player")._showRetimer(false)
        }
    },

    _closeSettle:function(){
        let par = cc.find("Canvas")
        let old = par.getChildByName("settle_ui")
        if(old){
            old.destroy()
        }
    },

    onClickOPDiscard:function(){
        // Global.TableSoundMgr.playEffect("click")
        //出牌
        let bActive = cc.vv.gameData.isMyActive()
        if(cc.vv.gameData.getMyState() == PlayerState.Discard && bActive){
            let allSels = this._handCtrl.getAllSelectPokers()
            if(allSels.length == 1){
                let selItem = allSels[0]
                let dui_val = selItem.getComponent("Rummy_Poker").getPokerDui()
                let card_val = selItem.getComponent("Rummy_Poker").getPokerIndex()
                this._handCtrl.doDiscard({dui:dui_val,card:card_val,obj:selItem})
            }
        }
        
    },

    onClickOPGroup:function(){
        // Global.TableSoundMgr.playEffect("click")
        let allSels = this._handCtrl.getAllSelectPokers()
        let nTotal = allSels.length
        if(nTotal>0){
            let hands = cc.vv.gameData.getMyHand()
            // if(hands.length >= 6){
            //     //提示最多6组
            //     let tips = "Sorry, you can't have more than 6 groups!"
            //     cc.vv.FloatTip.show(tips)
            //     return
            // }
            let cardVals = []
            for(let i = 0; i < allSels.length; i++){
                let item = allSels[i]
                let duiIdx = item.getComponent("Rummy_Poker").getPokerDui()
                let idx = this._handCtrl._getObjIdx(duiIdx,item)
                this._handCtrl._delObjIdx(duiIdx,idx)
                let delVal = hands[duiIdx].splice(idx,1)
                cardVals.push(delVal[0])
            }

            // let myHand = cc.vv.gameData.getMyHand()
            if(hands.length>=6){
                //放到最后一组
                for(let i = 0; i < cardVals.length; i++){
                    hands[hands.length-1].push(cardVals[i])
                }
            }
            else{
                //形成新组
                hands[hands.length] = cardVals
            }

            for(let i = hands.length-1; i>=0; i--){
                if(hands[i].length == 0){
                    hands.splice(i,1)
                }
            }
            cc.vv.gameData.sendGroupCard(hands)
            //重新刷新手牌
            this._handCtrl._recircleNode()
            this._handCtrl.showHandCards()

        }
        
    },

    onClickOPShow:function(){
        Global.TableSoundMgr.playEffect("click")

        //出牌
        let allSels = this._handCtrl.getAllSelectPokers()
        if(allSels.length == 1){
            let bActive = cc.vv.gameData.isMyActive()
            if(cc.vv.gameData.getMyState() == PlayerState.Discard && bActive){
                let tips = "You will end the game by tapping Show"
                let self = this
                let sureCall = function(){
                    if(cc.vv.gameData.isMyActive()){
                        let selItem = allSels[0]
                        let dui_val = selItem.getComponent("Rummy_Poker").getPokerDui()
                        let card_val = selItem.getComponent("Rummy_Poker").getPokerIndex()
                        self._handCtrl.doShow({dui:dui_val,card:card_val,obj:selItem})
                    }
                    
                }
                let cancelCall = function(){
    
                }
                this.showConfirm(1,tips,sureCall,cancelCall)
            }
            
        }

        
    },

    onClickOPDrop:function(){
        Global.TableSoundMgr.playEffect("click")

        let nDropcoin = cc.vv.gameData.getDropCoin()
        let tips = cc.js.formatStr("You will lose %s by tapping Drop",nDropcoin)
        let self = this
        
        let sureCall = function(){
            if(cc.vv.gameData.getMyState() == PlayerState.Draw && cc.vv.gameData.isMyActive()){
                self._showCanDrawLight(false)
                cc.vv.gameData.sendReqDrop()
            }
            
        }
        let cancelCall = function(){

        }
        this.showConfirm(2,tips,sureCall,cancelCall)

        
    },

    onClickOPConfirm:function(){
        Global.TableSoundMgr.playEffect("click")
        let hand = cc.vv.gameData.getMyHand()
        cc.vv.gameData.sendConfirm(hand)

        //状态切换成已亮牌
        this._setOpBtnByState(PlayerState.Show)
    },

    onEventSelectPokerChange:function(){
        // let allSels = this._handCtrl.getAllSelectPokers()
        // let nTotal = allSels.length
        let val = cc.vv.gameData.getMyState()
        // let bActive = cc.vv.gameData.isMyActive()

        // let btn_drop = cc.find("bottom/btn_drop",this.node)
        // btn_drop.getComponent(cc.Button).interactable = bActive && (val == PlayerState.Draw) 
        // let btn_show = cc.find("bottom/btn_show",this.node)
        // btn_show.getComponent(cc.Button).interactable = bActive && (val == PlayerState.Discard) && (nTotal == 1)
        // let btn_group = cc.find("bottom/btn_group",this.node)
        // btn_group.getComponent(cc.Button).interactable = bShowGroup
        // btn_group.active = (nTotal >= 1)
        // let btn_discard = cc.find("bottom/btn_discard",this.node)
        // btn_discard.getComponent(cc.Button).interactable = bActive && (val == PlayerState.Discard) && (nTotal == 1)
        this._setOpBtnByState(val)
    },

    showConfirm:function(type,tips,sureCall,cancelCall){
        this._showConfirmtip = true
        let tit = null;
        let rightBtnTex = null
        if(type == 1){
            tit = "Show";
            rightBtnTex = "Show"
        } else {
            tit = "Drop";
            rightBtnTex = "Drop"
        }
        cc.vv.AlertView.show(tips, sureCall, cancelCall,false,null,tit,null,rightBtnTex);


        // let url = "games/Rummy/prefab/tips"
        // cc.loader.loadRes(url,cc.Prefab,(err,data)=>{
        //     let par = cc.find("Canvas")
        //     let old = par.getChildByName("settle_ui")
        //     if(!old){
        //         old = cc.instantiate(data)
        //         old.name = "settle_ui"
        //         old.parent = par
        //         old.getComponent("Rummy_Tips").setInfo(type,tips,sureCall,cancelCall)
        //
        //
        //     }
        // })
    },

    hideConfirmTip:function(){
        if(this._showConfirmtip){
            cc.vv.AlertView.hide();
            this._showConfirmtip = null
        }
        
        // let par = cc.find("Canvas")
        // let old = par.getChildByName("settle_ui")
        // if(old){
        //     old.destroy()
        // }
    },

    onAutoChange:function(val){
        let bShow = (val == 1?true:false)
        this._showAutoPanel(bShow)
    },

    _showAutoPanel:function(bShow){
        let auto_panel = cc.find("auto_host",this.node)
        auto_panel.active = bShow

        Global.dispatchEvent("show_auto",bShow)
    },

    refushHandCards:function(){
        if(this._handCtrl){
            
            this._handCtrl.clearHands()
            this._handCtrl.showHandCards()
        }
    },

    refuTablePlayers:function(){
        let player = cc.find("node_players",this.node)
        if(player){
            player.getComponent("Rummy_PlayerList")._showTablePlayers()
        }
    },


    showStatesTips:function(tips,nTime){
        let node_tips = cc.find("status_tips",this.node)
        node_tips.active = true
        node_tips.stopAllActions()
        Global.setLabelString("lbl",node_tips,tips)
        if(nTime){
            cc.tween(node_tips)
            .delay(nTime)
            .call(()=>{
                node_tips.active = false
            })
            .start()
        }
    },

    hideStatesTips:function(){
        let node_tips = cc.find("status_tips",this.node)
        node_tips.active = false
        node_tips.stopAllActions()
    },

    showPlayChat:function(uid,msg){
        let playnode = this._getPlayerListScript().getPlayerNodeByUid(uid)
        if(playnode){
            playnode.getComponent("Rummy_Player").showChat(msg)
        }
    },

    //显示庄家标示
    showPlayerDealer:function(bShow){
        let playlist = this._getPlayerListScript()
        if(playlist){
            playlist.hideAllPlayerDealer()
        }
        if(bShow){
            let roundinfo = cc.vv.gameData.getRoundInfo()
            if(roundinfo && roundinfo.dealseat){
                let val = roundinfo.dealseat
                let info = cc.vv.gameData.getPlayByServiceSeat(val)
                if(info && playlist){
                    let node = playlist.getPlayerNodeByUid(info.uid)
                    node.getComponent("Rummy_Player").showZhuangIcon(true)
                }
                
            }
        }
        
    },

    onClickTableInfo:function(){
        Global.TableSoundMgr.playEffect("click")
        cc.vv.PopupManager.addPopup("games/Rummy/prefab/table_info",{
            onShow: (node) => {
                // node.getComponent("BlackJack21_Tableinfo").init();
            }
        })
    },

    showRecountUI:function(){
        this.hideStatesTips()
        
       
        this._closeSettle()
        this._clearHandCards()
        this._showTableInfo()
        this._showMathUIAni(false)
        this._showRecountUIAni(true)
        this._showPokerOnTable(true)
        // this.showNextRetime(false)
        this.showAllPlayers(true)
        this._showWaitNode(false)
        this.showDiscardDetail(false)
        Global.dispatchEvent("Refush_default_head")
    },

    _showRecountUIAni:function(bShow){
        let node = cc.find("node_recount",this.node)
        if(node){
            let scp = node.getComponent("Table_Recount_3")
            
                scp.setShow(bShow)
            
        }
        
    },

    _showMyPoint:function(bShow){
        let node_mypoint = cc.find("node_table/node_point",this.node)
        node_mypoint.active = bShow
    },

    _showWaitNode:function(bShow){

        //好友房不显示换桌
        let isFriend = cc.vv.gameData.isFriendRoom()
        if(isFriend){
            bShow = false
        }
        let bMatch = cc.vv.gameData.isMatchRoom()
        if(bMatch){
            bShow = false
        }
        let node_wait = cc.find("node_wait",this.node)
        node_wait.active = bShow
    },

    onClickSwitchTable:function(){
        Global.TableSoundMgr.playEffect("click")
        this._showWaitNode(false)
        cc.vv.gameData.sendSwitchReq()
    },

    //换桌成功
    showSwitchTableSuccess:function(){
        // cc.vv.SceneMgr.enterScene("Rummy", null, "portrait");
        // cc.director.loadScene("Rummy")
        this.StartGame()
    },

    clearTable:function(bClearPlayer){
        this._showPokerOnTable(true)

        //隐藏底部操作面板
        this._showOPPannel(false)

        //清理手牌
        this._clearHandCards()

        //隐藏庄家标示
        this.showPlayerDealer(false)

        //未发牌隐藏我的点数
        this._showMyPoint(false)

        this.hideStatesTips()

        this._showCanDrawLight(false)

        if(bClearPlayer){
            this.showAllPlayers(false)
        }
        

        this.hidePoolCoin()

        this.showDiscardDetail(false)

        this.closeMathPanel()

        this._showMathUIAni(false)

        this._showWatcherTips(false)
    },

    showAllPlayers:function(bShow,bDelay){
        let playerlist = this._getPlayerListScript()
        if(playerlist){
            if(!bShow){
                playerlist.clearTablePlayers()
            }
            else{
                playerlist._showTablePlayers(bDelay)
            }
            
        }
    },

    showNextRetime:function(bShow){
        // let self = this
        // let node = cc.find("next_round_time",this.node)
        // node.active = bShow
        // if(bShow){
        //     let val = 0
        //     let roundInfo = cc.vv.gameData.getRoundInfo()
        //     if(roundInfo){
        //         val = roundInfo.delayTime
        //     }
        //     let endCall = function(){
        //         node.active = false
        //     }
        //     let lbl = cc.find("spr/val",node)
        //     lbl.getComponent("ReTimer").setReTimer(val,1,endCall,"%s")

            // this._showWaitNode(true)
        // }
        // let val = 0
        // if(bShow){
        //     let roundInfo = cc.vv.gameData.getRoundInfo()
        //     if(roundInfo){
        //         val = roundInfo.delayTime
        //     }
        // }
        
        // this._showMathUIAni(bShow,val)

        this._showWaitNode(bShow)
    },

    showDiscardDetail:function(bShow){
        let myState = cc.vv.gameData.getMyState()
        if(myState == PlayerState.Wait ){
            bShow = false
        }
        let node = cc.find("node_discard_detail",this.node)
        node.active = bShow
        if(bShow){
            node.getComponent("Rummy_Discard_Detail").showDetail()
        }
    },

    //状态修改
    showPlayerReayChange:function(msg){
        let ac_uid = msg.uid
        let play_node = this._getPlayerListScript().getPlayerNodeByUid(ac_uid)
        if(play_node){
            play_node.getComponent("Rummy_Player").showReadyState()
        }
    },


    //显示好友房操作按钮
    _showFriendRoomOP:function(bShow){
        let bFriendRoom = cc.vv.gameData.isFriendRoom()
        if(!bFriendRoom){
            bShow = false
        }
        let node_op = cc.find("operate",this.node)
        node_op.active = bShow
        if(bShow){
            let myState = cc.vv.gameData.getMyState()
            let cp = node_op.getComponent("PBOperate_ex")
            cp.showReady(!(myState == 2))
            cp.showInvite(true)
        }
    },

   
    


    

    // update (dt) {},
});
