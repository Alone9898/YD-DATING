/**
 * slotpage 的item
 */


let GAME_ID = require("GameIdMgr");
let itemsListCfg = require("GameItemCfg");

cc.Class({
    extends: cc.Component,

    properties: {
        viewPrefab:cc.Prefab,
        _itemData:null,

        _jpList:[],

        _listLength:0, //列表长度
        _showTips:false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this.nodeDown = cc.find('mid_content/node_downing',this.node)
        let eventListener = this.node.addComponent("EventListenerCmp");
        // 更新用户信息成功
        eventListener.registerEvent("USER_INFO_CHANGE", this.updateInfo, this);
        Global.btnClickEvent(this.node,this.OnClickItem,this)
        // Global.registerEvent(EventId.ONCLICK_GAME,this.onEventClickGame,this)
        // Global.registerEvent(EventId.REFUSH_GAME_ITEM,this.onEventRefushGame,this)
    },

    start () {

    },

    OnClickItem:function(){
        
        
        // Global.playCashEff("hall/enter_click");
        if(!this._itemData) return
        if(this._itemData.status != 1) return
        // cc.vv.SubGameUpdateNode.getComponent('subGameMgr').setLoadingCheckModel(false,null)

        let gameId = this._itemData.id
        if(gameId >= GAME_ID.SLOT_COMESOON){
            return
        }
        // let bLock = cc.vv.UserManager.isGameLock(gameId)
        // if(bLock){
        //     Global.dispatchEvent(EventId.SHOW_LOCK_TIP,gameId)
        //
        //     //打点
        //     StatisticsMgr.reqReport(StatisticsMgr.REQ_SUBGAME_LOCKTIP,null,gameId)
        //
        //     return
        // }
        // let bOpen = cc.vv.UserManager.isOpen(Global.SYS_OPEN.HERO_PALACE)
        // let tempGuide = cc.vv.NewGuide.GetGuideTempData()
        // let lv = cc.vv.UserManager.getCurLv()
        // if(tempGuide == 1 || !bOpen || lv < Global.SYS_OPEN.GUIDE_CHANGEBET){//引导中直接进入游戏
        //     cc.vv.NewGuide.SetGuideTempData(null)
            this._enterFunc(gameId)
            
        // }
        // else{
            // this._loadBetSelect()
        // }
        
        
    },

    _loadBetSelect:function(){
        let self = this
        let gameId = this._itemData.id
        //定制项目直接进入游戏，不用分档押注了
        let bEnterDir = true
        if(bEnterDir){
            cc.vv.GameManager.EnterGame(gameId,null)
            return
        }
        
        cc.vv.PopupManager.addPopup(this.viewPrefab, {
            opacityIn: true,
            addBeforeCall:(node)=>{
                let cpt = node.getComponent("RoomListView")
                if(cpt){
                    cpt.setType(2,self._parentDelete._getUnlockSlots())
                }
            },
            onShowEnd: (node) => {
                let cpt = node.getComponent("RoomListView")
                if (cpt) {
                    cpt.onInit(gameId);
                }
            }
        });
    },

    //仅下载
    _loadGameFunc:function(){
        let gameId = this._itemData.id
        let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(gameId) //是否是内置游戏
        if (cc.sys.isNative && Global.openUpdate && !bInnerGame) { // 手机平台需要检测更新
            cc.vv.SubGameUpdateNode.emit("check_subgame", gameId);
        }
    },

    _enterFunc:function(gameId){
        
        //下载好了再弹分档押注
        
        let bInnerGame = cc.vv.UserManager.isNoNeedDownGame(gameId) //是否是内置游戏
        if (cc.sys.isNative && Global.openUpdate && !bInnerGame) { // 手机平台需要检测更新
            //是否已经是更新到最新了
            let bNew = cc.vv.SubGameUpdateNode.getComponent('subGameMgr')._isAreadyNew(gameId)
            if(bNew){
                this._loadBetSelect()
            }
            else{
                cc.vv.SubGameUpdateNode.emit("check_subgame", gameId);
            }
            
        } else {
            // Global.dispatchEvent("enter_game", gameId);
            this._loadBetSelect()
        }
    },

    //设置item的数据
    SetData:function(data,idx,listLength,bFav,bJackpot=true,bLong=false){
        this._itemData = data
        this._itemIdx = idx
        this._listLength = listLength
        this._bFavGame = bFav
        this._bJackpot = bJackpot
        this._bLong = bLong
        this.ShowItem()
    },

    setUnlockList:function(data){
        this._parentDelete = data
    },

    setLockVip:function(vip){
        this.openvip = vip
    },

    UpdateNodeAlign(node) {
        var widget = cc.Node.isNode(node) && node.getComponent(cc.Widget);
        if (widget) {
            if (widget.alignMode === cc.Widget.AlignMode.ON_WINDOW_RESIZE) {
                widget.enabled = true;
            }
        }
        var children = node._children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            this.UpdateNodeAlign(child);
        }
    },

    onEventRefushGame:function(data){
        let val = data.detail
        if(this._itemData){
            if(val == this._itemData.id){
                this.ShowItem()
            }
        }
        
    },

    //显示item
    ShowItem:function(){
        let self = this
        //分割线
        // this.ShowSplitLine()
        
        let gameId = this._itemData.id
        
        if(gameId >= GAME_ID.SLOT_COMESOON){
            this.ShowComeSoon()
            return
        }
        //是否首领
        let bLeader = this._bLong//cc.vv.HerocardManager.isLeader(gameId)

        let comingSoon = cc.find("comingSoon",this.node)
        if(comingSoon) comingSoon.active = false
        
        let comingSoonIcon = cc.find('mid_content/comingSoonIcon',this.node) 
        comingSoonIcon.active = false
        //初始化热更下载组件
        
        let nodeDown = cc.find('mid_content/node_downing',this.node);
        if(nodeDown){
            if(this._itemData.status == 2){
                nodeDown.active = false
            }
            else{
                nodeDown.active = true
                nodeDown.getComponent('node_downing').initGameId(gameId);
            }
            
        }

        let onShowCall = function(){
            //VIP lock
            self.showVipLock()
        }
        let gameCfg = itemsListCfg[this._itemData.id]
        //icon
        let iconNode = cc.find('mid_content/slot_icon',this.node)
        let iconscp = iconNode.getComponent("SlotIcon")
        // iconscp.setRecyIdx(this._itemIdx)
        if(gameCfg && bLeader){
            if (this._bFavGame || !this._bJackpot) {
                iconscp.setGameId(gameId,"animation3")
            }else {
                iconscp.setGameId(gameId,null)
            }
        }
        else{
            iconscp.setGameId(gameId,null,onShowCall)
        }

        
        
        // this.LoadIcon()
        // this.LoadIconAnimation();
        
        if(gameCfg && this._bJackpot){
            if (bLeader) {
                this.node.width = this._bFavGame?450:900
                
                if (nodeDown) nodeDown.y = -146
                let node_jp = cc.find('mid_content/jp_grand',this.node);
                if(node_jp){
                    node_jp.active = false;
                }
                
                let new_or_hot = cc.find('mid_content/new_or_hot',this.node)
                new_or_hot.active = false
            } else {
                this.node.width = 450
                if (nodeDown) nodeDown.y = -96
                //jp
                this._jpList = [];
                //奖池只显示Grand
                this.ShowGrandJackpot()
                // this.SetJackpot()
                //lock
                this.ShowGameStatus()
            }
            
            this.UpdateNodeAlign(this.node)
        }

        //是否参与排行榜
        let node_lp = cc.find("mid_content/node_lepord",this.node)
        if(node_lp){
            node_lp.getComponent("GameFlagShow").setData(gameId)
        }
        
    },

    showVipLock:function(){
        // let bLock = this.openvip >= cc.vv.UserManager.svip
        // let node_lock = cc.find("lock",this.node)
        // // let node_lock_l = cc.find("lock_long",this.node)
        // if(node_lock){
        //     node_lock.active = bLock && !this._bLong
        //     // node_lock_l.active = bLock && this._bLong
        // }
        // if(bLock){
        //    cc.vv.UserConfig.setVipFrame(cc.find("vip_icon",node_lock).getComponent(cc.Sprite),this.openvip+1)
        // //    cc.vv.UserConfig.setVipFrame(cc.find("vip_icon",node_lock_l).getComponent(cc.Sprite),this._itemIdx+6)
        // }
    },

    updateInfo:function(){
        this.showVipLock()
    },

    //comesoon的slot
    ShowComeSoon:function(){
        //隐藏下载
        let node_down = cc.find('mid_content/node_downing',this.node)
        node_down.active = false
        //设置icon
        let icon = cc.find('mid_content/slot_icon/icon',this.node)
        icon.active = false
        //cc.loader.loadRes("CashHero/slots/icon/"+itemsListCfg[this._itemData.id].title, cc.SpriteFrame, (err, spriteFrame) => {
        //    if(!err && cc.isValid(icon,true)){
        //        icon.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        //        icon.active = true
        //    }
        //})
        let comingSoonIcon = cc.find('mid_content/comingSoonIcon',this.node)
        comingSoonIcon.active = true
        //cc.loader.loadRes("CashHero/slots/icon/"+itemsListCfg[this._itemData.id].name+"/icon", cc.SpriteFrame, (err, spriteFrame) => {
        //    if(!err && cc.isValid(comingSoonIcon,true)){
        //        comingSoonIcon.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        //        comingSoonIcon.active = true
        //    }
        //})
        //隐藏动画节点
        let spine = cc.find('mid_content/slot_icon/spine',this.node)
        spine.active = false;

        let node_jp = cc.find('mid_content/jp_grand',this.node);
        if(node_jp){
            node_jp.active = false;
        }
        
        let new_or_hot = cc.find('mid_content/new_or_hot',this.node)
        new_or_hot.active = false

        let comingSoon = cc.find("comingSoon",this.node)
        if(comingSoon) comingSoon.active = true

        // let titleSpine = cc.find('mid_content/slot_icon/spine_title',this.node);
        // titleSpine.active = false

        // let frameSpr = cc.find('mid_content/slot_icon/icon_frame',this.node)
        // frameSpr.active = true
    },

    ShowGrandJackpot(){
        
        let nodeGrand = cc.find('mid_content/jp_grand',this.node)
        if(nodeGrand){
            let gameId = this._itemData.id
            let script = nodeGrand.getComponent('LMSlotMachine_PrizePool')
            if(script){
                script.init(gameId, cc.vv.AppData.getMaxBet());
            }
    
            //背景随机
            let grand_bg = cc.find('text',nodeGrand)
            let changeImg = grand_bg.getComponent("ImgSwitchCmp")
            if(changeImg){
                // let cardCfg = cc.vv.HerocardManager.getCardCfgByGame(gameId);
                // if(cardCfg){
                //     changeImg.setIndex(cardCfg.campid - 1001)
                // }
                changeImg.setIndex(gameId%3)
            }
        }
        
        
    },

    //收到点开某个游戏的消息
    onEventClickGame:function(data){
        let val = data.detail
        if(val && this._itemData){
            if(val == this._itemData.id){
                this.OnClickItem()
            }
        }
    },

    // SetJackpot(){
    //     let status = this._itemData.status
    //     let gameId = this._itemData.id
    //     let node_jp = cc.find('mid_content/jackpot',this.node);
    //     node_jp.active = status == 1;
    //     if(status == 1){
    //         let jpType = ['jp_grand','jp_major','jp_minor']
    //         for(let i = 0; i < jpType.length; i++){
    //             let spGrand = cc.find(jpType[i],node_jp)
    //             spGrand.stopAllActions()
    //             spGrand.cleanup()
    //             // spGrand.active = false
    //             let script = spGrand.getComponent('LMSlotMachine_PrizePool')
    //             if(script){
    //                 script.init(gameId, cc.vv.AppData.getMaxBet());
    //             }

    //             // this._jpList.push(spGrand);

    //             if(Math.random() > 0.5){
    //                 this._jpList.push(spGrand);
    //             } else {
    //                 this._jpList.unshift(spGrand)
    //             }
    //         }
            
    //     }

    //     this.DoJackAction()
        
    // },

    // DoJackAction(){
        
        
        


    //     // this.jpRoll();
    // },

    ShowGameStatus:function(){
        
        //最热、最新
        let hot = this._itemData.tag; //1hot 2new 3hot+new
        let new_or_hot = cc.find('mid_content/new_or_hot',this.node)
        if (new_or_hot) {
            new_or_hot.active = true
            new_or_hot.getChildByName('hot').active = hot == 1 || hot == 3;
            new_or_hot.getChildByName('new').active = hot == 2 || hot == 3;
        }
        
        let status = this._itemData.status; //0 close 1 open 2 coming
        // cc.log(gameId, " :", status);
        //coming
        let spComing = cc.find('mid_content/comingSoonIcon',this.node);
        spComing.active = status == 2;

        let node_jp = cc.find('mid_content/jp_grand',this.node);
        if(node_jp){
            node_jp.active = !spComing.active
        }
        

    },

    ShowSplitLine:function(){
    //     let topline = cc.find('top_line',this.node)
    //     if(topline){
    //         topline.active = this._itemIdx == 0
    //     }
    //     let bottomline = cc.find('bottom_line',this.node)
    //     if(bottomline){
    //         bottomline.active = ((this._itemIdx == 4 || ((this._itemIdx - 4) % 6 == 0)) && this._itemIdx > 0)

    //         if(!bottomline.active){
    //             if(this._listLength%2 === 0){
    //                 bottomline.active = this._itemIdx === this._listLength - 2
    //             }else{
    //                 bottomline.active = this._itemIdx === this._listLength - 1
    //             }
    //         }
    //     }
    //     let bottomTip = cc.find("bottom_tip",this.node)
    //     if(bottomTip){
    //         if(this._listLength%2 === 0){
    //             bottomTip.active = this._itemIdx === this._listLength - 2
    //         }else{
    //             bottomTip.active = this._itemIdx === this._listLength - 1
    //         }
    //         if(bottomTip.active){
    //             // cc.find("tips",bottomTip).opacity = 0
    //             this._showTips = false
    //         }
    //     }
    },

    // moveItem(){
    //     let tween = cc.tween().by(1.2, {position:cc.v2(0,-61)}, {easing:"backInOut"})

    //     for(let i = 0; i < this._jpList.length; i++){
    //         tween.clone(this._jpList[i]).start();
    //     }
    // },

    // jpRoll(){
    //     let posList = [cc.v2(0, -64), cc.v2(0, -3), cc.v2(0, 58), cc.v2(0, 119)]

    //     for(let i = 0; i < this._jpList.length; i++){
    //         this._jpList[i].active = true;
    //         this._jpList[i].position = posList[i]
    //     }

    //     let self = this;
    //     let node_jp = cc.find('mid_content/jackpot',this.node);
    //     node_jp.cleanup();
    //     cc.tween(node_jp).repeatForever(cc.tween()
    //         .delay(Math.random())
    //         .call(()=>{
    //             this._jpList[0].position = posList[3];
    //             this._jpList[1].position = posList[1];
    //             this._jpList[2].position = posList[2];
    //             this._jpList[0].active = false;
    //             this.moveItem();
    //         })
    //         .delay(1.2)
    //         .call(()=>{
    //             this._jpList[0].active = true;
    //             this._jpList.sort((a,b)=>{ return a.y - b.y})
    //         })
    //         .delay(4 + Math.random(0,3))
    //         )
    //         .start()
    // },

    update (dt) {
        let bottomTip = cc.find("bottom_tip",this.node)
        if(bottomTip){
            if(bottomTip.active){
                let pos = bottomTip.convertToWorldSpaceAR(cc.v2(0,0))
                if(pos.y > 300){
                    if(!this._showTips){
                        let tips = cc.find("tips",bottomTip)
                        tips.stopAllActions()
                        cc.tween(tips).to(0.2,{opacity:255}).start()
                        this._showTips = true
                    }
                }else if(pos.y < 250){
                    if(this._showTips){
                        let tips = cc.find("tips",bottomTip)
                        tips.stopAllActions()
                        cc.tween(tips).to(0.2,{opacity:0}).start()
                        this._showTips = false
                    }
                }
            }
        }
    },
});
