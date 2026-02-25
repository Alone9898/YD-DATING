/**
 * slot外的系统功能入口
 */
cc.Class({
    extends: cc.Component,

    properties: {
       _sys_node:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
        this._sys_node = cc.find('safe_node/node_sys_1',this.node)
        
        // Global.registerEvent(EventId.GET_JACKPOT_OTHER,this.onEventJackpotNotice,this)
        
        // //有成长之路，就不需要这个解锁提示了
        // Global.registerEvent(EventId.CLOSE_BIG_LV_UP,this.onEventCloseBigLevelup,this)

        // Global.registerEvent(EventId.SYS_ROAD_REFUSH,this.onEventRefushRoad,this)
        
        // //队列弹窗结束
        // Global.registerEvent(EventId.END_QUEUE_POP,this.onEventEndQueuePop,this)

        
    },

    

    start () {
        // this.startQuest()
        // this.startSysFloat()
        // this.startGuideTask()
        // this.startMoneybank()
        // this.startRP()
        
    },
    
    startMoneybank:function(){
        let self = this
        let url = "BalootClient/PiggyBank/prefabs/PiggyBankBtn"
        let callbacks = function(prefab){
            let node = cc.instantiate(prefab)
            node.y = -20
            
            let wcp = node.addComponent(cc.Widget)
            // wcp.isAlignTop = true
            // wcp.isAbsoluteTop = false
            // wcp.top = 0.08
            wcp.isAlignLeft = true
            wcp.left = 0
            node.parent = cc.vv.gameData.GetBottomScript().node
        }
        this._loadPrefab(url,callbacks)
    },

    startRP:function(){
        let self = this
        let url = "slots_common/SlotRes/prefab/sys_playerRP"
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg && cfg.sys_playerRP){
            url = cfg.sys_playerRP
        }
        let callbacks = function(prefab){
            let node = cc.instantiate(prefab)
            
            node.parent =  self._sys_node
            let wcp = node.getComponent(cc.Widget)
            // wcp.isAlignTop = true
            // wcp.top = 171
            wcp.updateAlignment()
        }
        this._loadPrefab(url,callbacks)
    },

    // //检查Quest的表现
    // startQuest:function(){
    //     let self = this
    //     let bQuestModel = cc.vv.gameData.GetIsQuestModel()
    //     if(bQuestModel){
    //         //加载questingame的提示框
    //         let parNode = cc.find('safe_node/node_sys_1',this.node)
    //         if(cc.find('quest_ingame',parNode)){
    //             return
    //         }
    //         let url = "CashHero/prefab/quest_ingame"
    //         let callbacks = function(prefab){
    //             let node = cc.instantiate(prefab)
    //             node.name = 'quest_ingame'
    //             node.parent = parNode
    //         }
    //         this._loadPrefab(url,callbacks)
    //     }
    // },

    // startSysFloat:function(){
    //     // //50级后才显示侧边栏
    //     // let bOpen = cc.vv.UserManager.isOpen(Global.SYS_OPEN.HERO_CARD)
    //     // if(bOpen){
    //     //     let parNode = cc.find('safe_node/node_sys_1',this.node)
    //     //     if(parNode){
    //     //         //如果有发现成长之路，隐藏
    //     //         let node_sysroad = cc.find('LMSlotsSys_road',parNode)
    //     //         if(node_sysroad){
    //     //             node_sysroad.destroy()
    //     //         }
    //     //         let node_other = cc.find('LMSlotsSys_float',parNode)
    //     //         if(node_other){
    //     //             return
    //     //         }
    //     //         let url = "slots_common/SlotRes/prefab/LMSlotsSys_float"
    //     //         this._loadPrefab(url,(prefab)=>{
    //     //             let node = cc.instantiate(prefab)
    //     //             node.parent = parNode
    //     //             let top = parNode.getChildByName("LMSlots_Top")
    //     //             if (top) { //如果与Top节点处于同一层级，放到top节点的下一层
    //     //                 node.setSiblingIndex(top.getSiblingIndex()+1)
    //     //             }
    //     //         })
    //     //     }
    //     // }
    //     // else{
    //     //     let parNode = cc.find('safe_node/node_sys_1',this.node)
    //     //     if(parNode){
    //     //         //如果有发现成长之路，隐藏
    //     //         let node_sysroad = cc.find('LMSlotsSys_road',parNode)
    //     //         if(node_sysroad){
    //     //             return
    //     //         }

    //     //         let url = "CashHero/prefab/sys_road/LMSlotsSys_road"
    //     //         this._loadPrefab(url,(prefab)=>{
    //     //             let node = cc.instantiate(prefab)
    //     //             node.parent = parNode
    //     //             let top = parNode.getChildByName("LMSlots_Top")
    //     //             if (top) { //如果与Top节点处于同一层级，放到top节点的下一层
    //     //                 node.setSiblingIndex(top.getSiblingIndex()+1)
    //     //             }
    //     //         })
    //     //     }
            
    //     // }
        
    //     //成长之路也放到侧边栏啦
    //     let parNode = cc.find('safe_node/node_sys_1',this.node)
    //     let node_other = cc.find('LMSlotsSys_float',parNode)
    //     if(node_other){
    //         return
    //     }
    //     let url = "slots_common/SlotRes/prefab/LMSlotsSys_float"
    //     this._loadPrefab(url,(prefab)=>{
    //         let node = cc.instantiate(prefab)
    //         node.parent = parNode
    //         let top = parNode.getChildByName("LMSlots_Top")
    //         if (top) { //如果与Top节点处于同一层级，放到top节点的下一层
    //             node.setSiblingIndex(top.getSiblingIndex()+1)
    //         }
    //     })
        

        
    // },


    // startGuideTask:function(){
    //     let info = cc.vv.gameData.GetGuideTask()
    //     if(info){
    //         //加载GuideTask的提示框
    //         let parNode = cc.find('safe_node/node_sys_1',this.node)
    //         if(cc.find('GuideTask',parNode)){
    //             return
    //         }
    //         let url = "CashHero/NewGuide/GuideTask"
    //         let callbacks = function(prefab){
    //             let node = cc.instantiate(prefab)
    //             node.name = 'GuideTask'
    //             node.parent = parNode
    //         }
    //         this._loadPrefab(url,callbacks)
    //     }
    // },

    // //其他人中了大奖通知
    // onEventJackpotNotice:function(mag){
    //     let self = this;
    //     let data = mag.detail;
    //     let old = cc.find('notice_jackpot',self.node);
    //     if(old) return

    //     let url = "common/prefab/notice_jackpot"
    //     let callbacks = function(prefab){
    //         if(cc.isValid(self.node,true)){
    //             let node = cc.instantiate(prefab);
    //             node.name = 'notice_jackpot';
    //             node.parent = self.node;
    //             let script = node.getComponent('notice_jackpot');
    //             script.setUIData(data);
    //         }
            
    //     }
    //     this._loadPrefab(url,callbacks)
        
    // },

    

    

    // //每5级的大弹窗关闭消息
    // //前20级也是用这个大的弹窗
    // onEventCloseBigLevelup:function(){
        
    //     this._bLeveluping = true
    //     this._showSysUnlock()
    //     cc.vv.QueueWinMrg.startPop()

        


        
    // },

    // onEventEndQueuePop:function(){
    //     if(this._bLeveluping){
    //         let curLv = cc.vv.UserManager.getCurLv()
    //         // if(curLv == Global.SYS_OPEN.POP_ONETIMEONLY){ //onetimeonly弹窗
    //         //     Global.dispatchEvent(EventId.SHOW_LEVEL_UP_GIFT);
    //         // }
    //         // else 
    //         if(curLv == Global.SYS_OPEN.QUEST_TASK || curLv == Global.SYS_OPEN.CASH_BACK
    //             || curLv == Global.SYS_OPEN.DAILYTASK || curLv == Global.SYS_OPEN.DAILYSIGN || curLv == Global.SYS_OPEN.DAILYFRIENZY
    //             || curLv == Global.SYS_OPEN.PIG_BANK || curLv == Global.SYS_OPEN.FB_BIND_PARTY
    //             || curLv == Global.SYS_OPEN.HALL_RANK || curLv == Global.SYS_OPEN.HERO_CARD){
                
    //             //礼包1
    //             //成长之路先表现完成的动画效果
    //             let parNode = cc.find('safe_node/node_sys_1/LMSlotsSys_float',this.node)
    //             if(parNode){
    //                 let targetNode =  cc.find('content/LMSlotsSys_road',parNode)
    //                 if(targetNode){
    //                     let scp = targetNode.getComponent('LMSlots_SysRoad')
    //                     scp.playCompEff(curLv)
    //                 }
    //             }
    //         }
    //         else if (curLv == Global.SYS_OPEN.POP_GOODGRATE) {  //好评弹窗
    //             cc.vv.PopUIMgr.popGoodGrade()
    //         }else {
                
    //         }
    //         this._bLeveluping = null
    //     }
    // },

    // onEventRefushRoad:function(){
    //     this.startSysFloat()
    // },


    // /**
    //  * 系统解锁
    //  */
    // _showSysUnlock:function(){
        
    //     let self = this
    //     let curLv = cc.vv.UserManager.getCurLv()
    //     let unlock_sys//要开放的系统功能
    //     if(curLv == Global.SYS_OPEN.BINGO){
    //         //bingo
    //         let openType = cc.vv.UserManager.getOpenActiveType()
    //         if(openType == 1){
    //             unlock_sys = 'bingo'
    //         }
    //         else if(openType == 2){
    //             unlock_sys = 'knight'
    //         }
            
            
    //     }
        
        
    //     if(unlock_sys){//如果不是通用的系统解锁，就不设置unlock_sys
    //         let url = "CashHero/prefab/node_sys_unlock"
    //         let callbacks = function(node,data){
    //             let scp = node.getComponent('CH_Sys_unlock')
    //             scp.showUnlockSys(data)
    //         }
            

    //         cc.vv.QueueWinMrg.addPop(unlock_sys,unlock_sys,{type:1,prefabUrl:url,initDataCall:callbacks})
    //     }
        
    // },

    _loadPrefab:function(url,callbacks){
        cc.loader.loadRes(url,cc.Prefab, (err, prefab) => {
            if (!err) {
                callbacks(prefab)
            }
            else{
                AppLog.err('未找到资源:'+url)
            }
        });
    },
    // update (dt) {},
});
