/**
 * 能量触发的免费游戏
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this._mid_ani = cc.find('Canvas/safe_node/mid_ani')

        // Global.registerEvent(cc.vv.gameData._EventId.SHOW_ENG_FREE_GAME, this.onEventShowEngFreeGame.bind(this), this);
        // Global.registerEvent(cc.vv.gameData._EventId.SLOT_SPIN, this.onEventStartSpin.bind(this), this); //开始旋转
        // Global.registerEvent(cc.vv.gameData._EventId.SLOT_GAME_START, this.onEventStartMove.bind(this), this);//协议返回了
        // Global.registerEvent(cc.vv.gameData._EventId.SLOT_STOP_MOVE, this.onEventStopMove.bind(this), this);
        // Global.registerEvent(cc.vv.gameData._EventId.PLAY_WINCOIN_FINISH, this.onEventPlayFinish.bind(this), this);
        
        // this._soundCfg = require(cc.vv.SlotGameCfg[cc.vv.gameData._gameId].cfgCmp).soundCfg;
    },

    start () {
    },

    // //能量大关/小关游戏结束
    // onEnergyGameOver:function(){
    //     this.showMidAni(false,0)
    //     this.showEnergyUI(true);
    //     this.eType = 0;

    //     this.node.getComponent("RegalTiger_Logic").closeSpine(true);
    // },
    
    // //控制老虎位置
    // setTigerPos:function(isshow){
    //     let node_tiger = cc.find('safe_node/tiger',this.node);
    //     let posy = isshow?-155:-200; 
    //     node_tiger.setPosition(0,posy);
    // },

    // //控制能量界面的显示/隐藏
    // showEnergyUI:function(isshow){
    //     let node_energy = cc.find('safe_node/node_energy',this.node)
    //     node_energy.active = isshow
    //     this.setTigerPos(isshow);
    // },

    // //显示能量免费游戏
    // showEngnerFreeGame:function(bShow,etype){
    //     //显示免费次数节点
    //     AppLog.log("显示能量免费游戏:"+etype);
    //     if(bShow){
    //         let node_free_time = cc.find('safe_node/LMSlots_Bottom/free_time',this.node)
    //         node_free_time.active = false
        
    //         this.eType = etype;
    //         let copy_free = cc.instantiate(node_free_time)
    //         copy_free.parent = node_free_time.parent
    //         copy_free.position = node_free_time.position
    //         copy_free.active = true
    //         this._engfreeTimeNode = copy_free
    //     }
    //     else{
    //         if(this._engfreeTimeNode){
    //             this._engfreeTimeNode.destroy()
    //             this._engfreeTimeNode = null
    //         }
    //         this.onEnergyGameOver();
    //     }
        
    //     let totalBet = cc.find('safe_node/LMSlots_Bottom/totalBetBg',this.node)
    //     let pos_nor = cc.find('safe_node/LMSlots_Bottom/betnode_position_nor',this.node)
    //     let pos_free = cc.find('safe_node/LMSlots_Bottom/betnode_position_free',this.node)
    //     totalBet.getChildByName('btn_add').active = !bShow
    //     totalBet.getChildByName('btn_minus').active = !bShow
    //     if(bShow){
    //         totalBet.position = pos_free.position
    //     }
    //     else{
    //         totalBet.position = pos_nor.position
    //     }

    //     //免费游戏背景图
    //     this.showGameBg(bShow)

    //     //中间的动画显示
    //     this.showMidAni(bShow,3)

    //     this.refushFreeTime()

    //     // ///显示免费游戏时 控制自动旋转停止
    //     // if(bShow){
    //     //     Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_ENTER_SUBGAME);
    //     // }else{
    //     //      Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_EXIT_SUBGAME);
    //     // }
    // },

    // //显示结算
    // showWinReward:function(){
    //     let freeGame = cc.find('Canvas/safe_node/node_free_start')
    //     freeGame.active = true
    //     let scp = freeGame.getComponent('RegalTiger_free_start')
    //     let engData = cc.vv.gameData.getEnergyData()
    //     let nTime = engData.freeGame.totalWinCoin
    //     scp.showFreeWin(2,nTime)
    // },

    // //更新免费次数显示
    // refushFreeTime:function(){
    //     if(this._engfreeTimeNode){
    //         let leave_times = cc.find('lbl_free_time',this._engfreeTimeNode)
    //         if (leave_times) {
    //             let engData = cc.vv.gameData.getEnergyData()
    //             if(engData&&engData.freeGame){
    //                 let total = engData.freeGame.all
    //                 let rest = engData.freeGame.rest
    //                 let areadyUsed =  total - rest
    //                 if(areadyUsed > total){
    //                     areadyUsed = total
    //                 }else{
    //                     Global.playHSEffect(this._soundCfg.bonus_remaining);
    //                 }
    //                 leave_times.getComponent(cc.Label).string = cc.js.formatStr(cc.vv.Language.LS_free_time, areadyUsed,total);
    //                 this.setMultile(engData.freeGame.addMult)
    //             }
    //         }
    //     }
        
    // },

    // showGameBg:function(bShow){
        
    //     let fileName = 'theme115_base_bg'
    //     if(bShow){
    //         fileName = 'theme115_free_bg'
    //     }
    //     let gameDir = cc.vv.gameData.getGameCfg().gameDir
    //     cc.loader.loadRes(gameDir + 'img/'+fileName,cc.SpriteFrame,(err,data) => {
    //         if(!err){
    //             let bg = cc.find('Canvas/safe_node/bg')
    //             bg.getComponent(cc.Sprite).spriteFrame = data
    //         }
    //     })
    // },

    // setMultile:function(val){
    //     let lbl = cc.find('lbl_mul',this._mid_ani)
    //     lbl.getComponent(cc.Label).string = val
    // },

    // //state:1 关 2 开 3 竹子
    // showMidAni:function(bShow,nType){
    //     //如果非能量收集大关卡游戏直接返回
    //     if(!this.eType)
    //        return;

    //     let mid_ani = this._mid_ani
    //     mid_ani.active = bShow
    //     if(bShow){
    //         let node_zu = cc.find('node_zu',mid_ani)
    //         let node_wild = cc.find('node_wild',mid_ani)
    //         let node_mul = cc.find('lbl_mul',mid_ani) 
    //         node_zu.active = false
    //         node_wild.active = false
    //         node_mul.active = false
    //         if(nType == 3){
    //             cc.vv.gameData.playSpine(node_zu,'animation2',true)
    //         }
    //         else if(nType == 2){
                
    //             node_mul.active = true
    //             cc.vv.gameData.playSpine(node_wild,'animation',true)
                
    //             cc.vv.gameData.playSpine(node_zu,'animation3',false)
    //             Global.playHSEffect(this._soundCfg.bamboo_open);
    //         }
    //         else if(nType == 1){
    //             cc.vv.gameData.playSpine(node_zu,'animation1',false)
    //         }
    //     }
    // },

    // onEventShowEngFreeGame:function(data){
    //     let val = data.detail
    //     if(val.isshow == undefined)
    //         return;
    //     this.showEngnerFreeGame(val.isshow,val.etype)
    // },

    // onEventStartMove:function(){
    //     this.refushFreeTime()
        
    // },

    // onEventStopMove:function(){
    //     //Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_PAUSE_AUTO);
    //     this.showMidAni(true,2)
    // },

    // //开始能量免费游戏
    // onEventStartSpin:function(){
    //     if(this.eType == 2){
    //         this.showMidAni(true,3)
    //         this.showEnergyUI(false);
    //     }
    // },

    // onEventPlayFinish:function(){ 
    //     let engData = cc.vv.gameData.getEnergyData()
    //     if(engData&&engData.freeGame){
    //         //能量收集
    //         if(engData.freeGame.rest == 0 &&engData.freeGame.all > 0){
    //             this.eType = 9;
    //             this.showWinReward()
    //             return
    //         }
    //     }
    //     //播放完成继续旋转
    //     if(this.eType == 2){
    //         let delayCall = function(){
    //           Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_TOUCH_MOVE);
    //         }
    //         this.scheduleOnce(delayCall,1.5)
    //     }
    // },

    

    // update (dt) {},
});
