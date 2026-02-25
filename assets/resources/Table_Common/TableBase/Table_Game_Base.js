
/**
 * 游戏逻辑，加到safe_node节点
 */

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {
        
    },

    start () {
    },

    /**
     * 初始化游戏
     */

    Init:function(){
        
    },

    /**
     * 开始游戏：由logicbase统一调用
     */
    StartGame:function(){

        let status = cc.vv.gameData.getGameStatus()
        this.showGameByStatus(status)
        
        Global.TableSoundMgr.stopBgm()
        let cfg = cc.vv.gameData.getGameCfg()
        if(cfg.enterRoomEffect){
            Global.TableSoundMgr.playEffect(cfg.enterRoomEffect)
            this.scheduleOnce(()=>{
                Global.TableSoundMgr.playNormalBgm()
            }, 0.4)
        } else {
            Global.TableSoundMgr.playNormalBgm()
        }
    },

    /**
     * 游戏状态切换了：由gamedata统一调用
     * doStatusChange:进入一瞬间的，由协议直接驱动。想请下注动画，就是需要在这一瞬间的播放。其它时间进来都不用播放。不然会重复播放
     */
    doStatusChange:function(doStatusChange){
        let status = cc.vv.gameData.getGameStatus()
        this.showGameByStatus(status,doStatusChange)
    },

    //按阶段显示游戏
    showGameByStatus:function(st,doStatusChange){
        if(st == 1){
            //空闲
            this.showIdleStatu()
        }
        else if(st == 2){
            //押注
            this.showBetStatu(doStatusChange)
        }
        else if(st == 3) {
            //结算
            this.showResultStatu()
        }
    },

    /**
     * 空闲阶段
     * 根据游戏逻辑重写 重写需要调用this._super()
     */
    showIdleStatu:function(){
        //更新桌上玩家
        this.updateTablePlayer()
        

        //清理桌面筹码
        this.clearAllBetChips()

        //设置是否可以下注
        this.setCanSelectChips(false)

        //隐藏结算等待
        this._showWaitResult(false)


        let timeEndCall = function(){
            
        }
        //显示倒计时
        this._showReTime(true,timeEndCall,"%s")

        

    },

    /**
     * 下注阶段
     * 根据游戏逻辑重写 重写需要调用this._super()
     */
    showBetStatu:function(doStatusChange){
        let self = this 
        //设置是否可以下注
        this.setCanSelectChips(true)
        
        //隐藏结算等待
        this._showWaitResult(false)

        let timeEndCall = function(){
            if(cc.isValid(self,true) && cc.isValid(self.node,true))
            self._showTextTipAni(true, 2)
            self.setCanSelectChips(false)
        }
        //显示倒计时
        this._showReTime(true,timeEndCall,"%s")

        if(doStatusChange){
            //显示开始下注动画,中途进来的不现实此动画
            
            this._showTextTipAni(true, 1)
        }

    },

    /**
     * 结算阶段
     * 根据游戏逻辑重写 重写需要调用this._super()
     */
    showResultStatu:function(){
        //设置是否可以下注
        this.setCanSelectChips(false)

        this._showReTime(false)
    },

    //空闲阶段更新桌面上玩家
    updateTablePlayer:function(){
        let scp = this._getPlayerListScript()
        if(scp){
            scp._showTablePlayers()
        }
    },

    //倒计时
    //bShow:是否显示
    //endCall:倒计时结束回掉
    //showFormat：特殊的显示方式
    //userPerCall:每秒的回掉
    _showReTime:function(bShow,endCall,showFormat,userPerCall){
        let self = this
        let nTime = cc.vv.gameData.getStatusTime()
        let node_retimer = this.getRetimerNode()
        node_retimer.active = bShow
        let perCall = function(nTime){
            
            if(cc.vv.gameData.getGameStatus() == 2){
                if(nTime <=3 && nTime > 0){
                    //押注阶段才倒计时
                    Global.TableSoundMgr.playCommonEff("com_timeAlarm")
                }

                if(nTime == 3){
                    self.playRecount3Ani(true)
                    
                }
            }

            if(userPerCall){
                userPerCall(nTime)
            }
        }
        if(bShow){
            cc.find("val",node_retimer).getComponent("ReTimer").setReTimer(nTime,1,endCall,showFormat,perCall)
        }
    },

    //有可能需要修改时间的节点位置
    getRetimerNode:function(){
        return cc.find("node_retimer",this.node)
    },

    /**
     * 清理桌面筹码
     */
    clearAllBetChips:function(){
        let betAreas = this._getBetAreaScript()
        if(betAreas){
            betAreas.clearTableBet()
        }
    },

    /**
     * 是否可以押注
     */
    setCanSelectChips:function(val){
        //押注方位是否押注
        let betAreas = this._getBetAreaScript()
        if(betAreas){
            betAreas.setCanSelectChips(val)
        }

        //筹码切换区域是否可以操作
        let betList = this._getBetListScript()
        if(betList){
            betList.setCanSelectChips(val)
        }

        //底部脚本
        let bottom = cc.vv.gameData.getBottomScript()
        if(bottom){
            bottom.checkShowRebet()
        }
    },

    //获取押注方位的脚本
    _getBetAreaScript(){
        if(!this._betAreaScp){
            this._betAreaScp = this.node.getComponentInChildren("Table_BetAreas_Base")
        }
        return this._betAreaScp
    },

    //获取下注列表的脚本
    _getBetListScript(){
        if(!this._betListScp){
            this._betListScp = this.node.getComponentInChildren("Table_BetList_Base_Ex")
        }
        return this._betListScp
    },

    //获取玩家列表的脚本
    _getPlayerListScript(){
        if(!this._playerListScp){
            this._playerListScp = this.node.getComponentInChildren("Table_Player_List_Base")
        }
        return this._playerListScp
    },

    //播放其它玩家的下注
    playOtherBet:function(msg){
        let bet_area_scp = this._getBetAreaScript()
        let player = this._getPlayerNode(msg.uid)
        if(msg.uid == 0 || !player){ //在桌上的玩家也找不到就也算观众
            //观众的：分段飞
            let watcher = this._getObserverNode()
            this._playWatcherQueue = this._playWatcherQueue || []
            //分三段
            
            let split_num = 2

            for(let i = 0; i < split_num; i++){
                let bAvaild = false
                let msg_temp = []
                for(let aIdx = 0; aIdx < msg.chips.length; aIdx++){
                    msg_temp[aIdx] = msg_temp[aIdx] || []
                    for(let cIdx = 0; cIdx < msg.chips[aIdx].length; cIdx++){
                        msg_temp[aIdx][cIdx] = msg_temp[aIdx][cIdx] || 0
                        let chip_num = msg.chips[aIdx][cIdx]
                        //分三份，最后一份包含余下的
                        let val 
                        if(i == split_num-1){
                            val = (chip_num - (split_num-1)*Math.floor(chip_num/split_num))
                            msg_temp[aIdx][cIdx] += val
                        }
                        else{
                            val = Math.floor(chip_num/split_num)
                            msg_temp[aIdx][cIdx] += val
                        }
                        if(val){
                            bAvaild = true
                        }
                        
                    }
                }
                if(bAvaild){
                    msg_temp.fromNode = watcher
                    this._playWatcherQueue.push(msg_temp)
                }
            }
            
            this.playWatherBetQueue()
        }
        else{
            //桌上的:直接飞
            //是否是神算子
            let bRate_Max = player.getComponent("Table_Player_Base").isRater()
            if(bRate_Max && cc.vv.gameData.showRaterBetAni()){
                let areaIdx = cc.vv.gameData.getFirstBetArea(msg.chips)
                bet_area_scp.playRaterDoBet(player,msg.chips,areaIdx)
            }
            else{
                let bRuning = (player.getNumberOfRunningActions() > 0)
                for(let i=0; i < msg.chips.length; i++){
                    let areaIdx = i+1
                    for(let j = 0; j < msg.chips[i].length; j++){
                        let chip_val = cc.vv.gameData.getChipValByIdx(j)
                        let chip_num = msg.chips[i][j]
                        for(let iNum=0; iNum < chip_num; iNum++){
                            bet_area_scp.playDoBetAni(player,chip_val,areaIdx,bRuning)
                        }
                        
                    }
                }
            }
            
        }
    },


    //获取观众的节点
    _getObserverNode:function(){
        return cc.find("node_observers",this.node)
    },

    //获取玩家节点
    _getPlayerNode:function(uid){
        let playlist = this._getPlayerListScript()
        if(playlist){
            return playlist.getPlayerNode(uid)
        }
    },

    //播放观众的下注队列
    playWatherBetQueue(){
        if(!this._bPlayingQueue){
            this._bPlayingQueue = true
            let nLen = this._playWatcherQueue.length
            if(nLen >0){

                let nDelay = Global.random(2,4)/10
                if(nLen>6 && nLen < 10){
                    nDelay = Global.random(1,2)/10
                }
                else if(nLen > 10){
                    nDelay = Global.random(1,2)/20
                }
                else if(nLen > 20){
                    nDelay = (nLen%2==0)?0:0.05
                }
                let bet_area_scp = this._getBetAreaScript()
                //如果已经到了开奖阶段，立马不延迟
                let nStatus = cc.vv.gameData.getGameStatus()
                if(nStatus == 3){
                    //立马播放
                    for(let i = 0; i < this._playWatcherQueue.length; i++){
                        let chips = this._playWatcherQueue[i]
                        if(chips){
                            for(let i=0; i < chips.length; i++){
                                let areaIdx = i+1
                                for(let j = 0; j < chips[i].length; j++){
                                    let chip_val = cc.vv.gameData.getChipValByIdx(j)
                                    let chip_num = chips[i][j]
                                    for(let iNum=0; iNum < chip_num; iNum++){
                                        bet_area_scp.playDoBetAni(chips.fromNode,chip_val,areaIdx,true)
                                    }
                                }
                            }
                        }
                    }
                    this._playWatcherQueue = []
                    nDelay = 0
                }

                //延迟
                this.scheduleOnce(()=>{
                    this._bPlayingQueue = false
                    this.playWatherBetQueue()
                },nDelay)

                let bNotShowFlyAni = false
                if(nLen>20){
                    bNotShowFlyAni = (nLen%2==0)
                }
                let chips = this._playWatcherQueue.shift()
                if(chips){
                    for(let i=0; i < chips.length; i++){
                        let areaIdx = i+1
                        for(let j = 0; j < chips[i].length; j++){
                            let chip_val = cc.vv.gameData.getChipValByIdx(j)
                            let chip_num = chips[i][j]
                            for(let iNum=0; iNum < chip_num; iNum++){
                                bet_area_scp.playDoBetAni(chips.fromNode,chip_val,areaIdx,bNotShowFlyAni)
                            }
                        }
                    }
                    
                    
                }
            }
            else{
                this._bPlayingQueue = false
            }
            
        }
    },

    //结算等待提示
    _showWaitResult:function(bShow){
        if(!Global.isYDApp() && cc.vv.i18nManager.getLanguage() == cc.vv.i18nLangEnum.AR){
            let node_ar = cc.find("node_result_wait_ar",this.node);
            if(node_ar){node_ar.active = bShow;}
        }else {
            let node_en = cc.find("node_result_wait",this.node);
            node_en.active = bShow;
        }      
    },

    //获取我自己的节点
    getMyNode:function(){
        let bottom = cc.vv.gameData.getBottomScript()
        return bottom.getMyNode()
    },
    //获取我自己的节点
    getMyNodeHead:function(){
        let bottom = cc.vv.gameData.getBottomScript()
        return bottom.getMyNodeHead()
    },

    //飘分
    flyScroe:function(playerNode,val){
        if(playerNode){
            let playerScp = playerNode.getComponent("Table_Player_Base")
            playerScp.playFlyScroe(val)
        }
        
    },

    playGameBGM:function(){
        Global.TableSoundMgr.stopBgm()
        Global.TableSoundMgr.playNormalBgm()
    },

    //nType:1 开始下注 2结束下注
    _showTextTipAni:function(bShow,nType){
        let node = cc.find("node_change_status",this.node)
        node.active = bShow
        
        let start_node = cc.find("start_bet",node)
        let stop_node = cc.find("stop_bet",node)
        start_node.active = (nType == 1)
        stop_node.active = (nType == 2)
        let show_node
        if(nType ==1){
            show_node = start_node
            Global.TableSoundMgr.playCommonEff("startbet")
        }
        else{
            show_node = stop_node
            Global.TableSoundMgr.playCommonEff("com_stopbet")
            cc.vv.gameData.setGameStatus(3,false)
        }

        let spcmp = show_node.getComponent(sp.Skeleton)
        spcmp.setAnimation(0,"animation",false)
        spcmp.setCompleteListener((tck) => {
            show_node.active = false
            node.active = false
        })
    },

    //将桌上的筹码分到赢家:
    //赢的方位的金币飞往各自赢家，剩余的飞往观众
    _flyTableChips:function(resultMsg){
        
        let winPlayer = 1 //默认一份给观众
        let nMyWin = resultMsg.user.wincoin
        if(nMyWin>0) winPlayer += 1
        for(let i = 0; i < resultMsg.users.length; i++){
            let item = resultMsg.users[i]
            if(item.wincoin>0){
                winPlayer += 1
            }
        }
        let area_scp = this._getBetAreaScript()
        //将赢的区域的筹码数，平均分给赢的玩家
        let winAreaChips = area_scp.getAllChips()
        let perNum = Math.ceil(winAreaChips.length/winPlayer)
        let obserNum = winAreaChips.length - (winPlayer-1) * perNum
        let toNode = this.getMyNode()
        let toMyHead = this.getMyNodeHead();
        if(nMyWin>0){
            for(let i = 0; i <perNum; i++){
                //先飞自己
                
                let item = winAreaChips[i]
                let endCall = function(){
                    item.chipNode.active = false
                    
                }
                area_scp.moveChip(item.chipNode,item.chipNode,toMyHead,endCall,true)

                
                
            }
            //然后飘分
            this.flyScroe(toNode,nMyWin)
            cc.vv.gameData.refushMyCoin()
        }
        else{
            this.flyScroe(toNode,nMyWin)
            //刷新金币
            cc.vv.gameData.refushMyCoin()
        }
        

        //在飞桌上的
        let tableWinIdx = -1
        let starIdx = nMyWin>0?perNum:0
        for(let i = 0; i < resultMsg.users.length; i++){
            let item = resultMsg.users[i]
            let itemWin = item.wincoin
            let itemNode = this._getPlayerNode(item.uid)
            if(!itemNode){ //没找到的玩家
                continue
            }
            if(itemWin>0){
                //winer
                tableWinIdx += 1
                for(let j = 0; j < perNum; j++){
                    
                    let chip = winAreaChips[j+starIdx+tableWinIdx*perNum]
                    let endCall = function(){
                        chip.chipNode.active = false
                        
                    }
                    area_scp.moveChip(chip.chipNode,chip.chipNode,itemNode,endCall,true)
                }

            
            }
            else{
                //loseer
                
            }

            //然后飘分
            this.flyScroe(itemNode,itemWin)
        }

        //余下飞观众
        for(let i= winAreaChips.length-obserNum; i < winAreaChips.length; i++){
            let chip = winAreaChips[i]
            let endCall = function(){
                chip.chipNode.active = false
                
            }
            let toNode = this._getObserverNode()
            area_scp.moveChip(chip.chipNode,chip.chipNode,toNode,endCall,true)
        }
        Global.TableSoundMgr.playCommonEff("com_flywin")
    },

    playRecount3Ani:function(bShow){
        let recount3 = cc.find("node_recount3time",this.node)
        if(recount3){
            recount3.active = bShow
            if(bShow){
                let spcmp = cc.find("spine",recount3).getComponent(sp.Skeleton)
                spcmp.setAnimation(0,"animation",false)
                spcmp.setCompleteListener((tck) => {
                    recount3.active = false
                })
            }
        }
        
        
    },

    //通知结果已经展示完成
    doShowResultFinish:function(){
        cc.vv.gameData.setShowResultFinish(true)
    }

    


   


   

    

});
