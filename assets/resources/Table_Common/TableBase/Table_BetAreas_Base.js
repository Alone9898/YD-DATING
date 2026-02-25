/**
 * 下注方位-base
 */
let Table_Area = require("Table_Area")
cc.Class({
    extends: cc.Component,

    properties: {
       AreaList:{
        default:[],
        type:[Table_Area],
       },
       prefab_chip:cc.Prefab,
       _chip_pool:null,
       _active_chips:[], //存放显示的桌面筹码
       _my_bet_vals:[],     //我的下注
       _bet_record:[],  //记录我一轮的押注总详情，可用于下一把的自动押注
       chips_show_node:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.resetMyBets()

        if(!cc.vv.ChipPool){ //没有全局的节点池
            this._chip_pool = new cc.NodePool()
        }
        
        Global.registerEvent("bet_area",this.onEventBetArea,this)
    },

    start () {
        this.init()
    },

    //初始化方位
    init:function(){

        let init_area_chip_max = 20
        let gameCfg = cc.vv.gameData.getGameCfg()
        if(gameCfg && gameCfg.init_area_chips){
            init_area_chip_max = gameCfg.init_area_chips
        }
        let chipList = cc.vv.gameData.getBetChipList()
        for(let i = 0; i < this.AreaList.length; i++){
            let itemData = this.AreaList[i]
            let dataIdx = itemData.idx-1
            let areaNode = itemData.node

            let totalBet = cc.vv.gameData.getAreaTotalBet(itemData.idx)
            let betChips = cc.vv.gameData.getAreaChipsDetail(itemData.idx)
            
            //总
            this.setAreaTotalBet(areaNode, totalBet)
            //我的
            let mybet = cc.vv.gameData.getMyBetByAreanIdx(dataIdx)
            this.setAreaMyBet(areaNode, mybet)
            //筹码
            let chip_container = cc.find("chip_container",areaNode)
            
            //进入游戏，如果桌上已经有筹码了。如果筹码太多不用全部显示，不然会卡
            let chipcnt = 0
            for(let i = 0; i < chipList.length; i++ ){
                let val = chipList[i] //筹码面值
                let num = betChips[i] //筹码数量
                for(let j = 0; j < num; j++){
                    
                    let chip = this._create_chip(val,chip_container,itemData.idx)
                    chipcnt += 1
                    if(chipcnt > init_area_chip_max){//单个区域多余配置个数就不用再显示了
                        break
                    }
                }
                
            }
        }

        this.resetMyBets()
    },

    //设置总筹码
    setAreaTotalBet:function(areaNode, val) {
        let node_totalbet = cc.find("totalbet", areaNode)
        if (node_totalbet) {
            if (node_totalbet.getComponent(cc.Label)) {
                Global.setLabelString("totalbet", areaNode, Global.FormatNumToComma(val))
            } else {
                Global.setLabelString("lbl", node_totalbet, Global.FormatNumToComma(val))
            }
            node_totalbet.active = val>0?true:false
        }
    },

    setAreaMyBet(areaNode, val) {
        let node_mybet = cc.find("mybet", areaNode)
        if(node_mybet){
            node_mybet.active = val>0?true:false
            Global.setLabelString("lbl", node_mybet, Global.FormatNumToComma(val))
        }
    },

    /**
     * 获取押注方位节点
     * @param {*} idx 
     * @returns 
     */
    getBetAreaNode:function(idx){
        for(let i = 0; i < this.AreaList.length; i++){
            let itemData = this.AreaList[i]
            let dataIdx = itemData.idx
            let areaNode = itemData.node
            if(idx == dataIdx){
                return areaNode
            }
        }
    },

    //生成一个筹码
    _create_chip:function(val,parentNode,areaIdx){
        // TODO TEST
        // if(!this._isAvailAreaIdx(areaIdx)){
        //     cc.log("无效的押注区域")
        // }
        let node
        if(cc.vv.ChipPool){
            node = cc.vv.ChipPool.get()
        }
        else{
            if(this._chip_pool.size() > 0){
                node = this._chip_pool.get()
            }
            else{
                node = cc.instantiate(this.prefab_chip)
                this._newCont = this._newCont || 1
                cc.log("创建Chips:"+this._newCont++)
            }
        }
        
        node.active = true
        node.getComponent("Table_BetChip_Base").init(val)
        node.getComponent("Table_BetChip_Base").setClickEnable(false)
        
        //如果有配置，就用配置的
        let cfg = cc.vv.gameData.getGameCfg()
        node.scale = cfg.chipscale || 0.42

        node.parent = this.getChipShowNode()
        
        if(parentNode){//设置了父节点就设置位置，否则不设置位置，外面自己控制
            node.position = this._randomAreanPostion(parentNode)
        }
        let item = {}
        item.areaIdx = areaIdx
        item.chipNode = node
        this._active_chips.push(item)

        

        return node
    },

    //是否有可以回收的筹码
    //轮盘可以回收
    _checkCanRecycleChip:function(areaIdx){
        
    },

    //清理桌面筹码
    clearTableBet:function(bOnlyRecycle){
        
        for(let i = 0; i < this._active_chips.length; i++){
            let node = this._active_chips[i].chipNode
            this._recycleChip(node)
            
            
        }
        this._active_chips = []

        if(bOnlyRecycle) return
        
        //清理筹码总数，我的下注
        this.updateBetTotalNum()
        this.clearMaxRateIcon()
    },

    //清理神算子标志
    clearMaxRateIcon:function(){
        for(let i = 0; i < this.AreaList.length; i++){
            let par = this.AreaList[i]
            let node = cc.find("max_rate",par.node)
            if(node){
                node.destroy()
            }
        }
        
    },



    onEventBetArea:function(data){
        let toAreaIdx = data.detail //押注方位的序号
        
        //本场首次下注
        let bFirstbet = cc.vv.gameData.getIsFirstBet()
        if(bFirstbet){
            cc.vv.gameData.clearLastBet()
            cc.vv.gameData.setIsFirstBet(false)
            let bottom = cc.vv.gameData.getBottomScript()
            bottom.checkShowRebet()
        }
        //TODO
        //筹码飞到该区域，并减去对应金币。把消息发给服务器
        let bet_list = cc.vv.gameData.getScriptGame()._getBetListScript()
        let betVal = bet_list.getSelectChipVal()
        //金币是否足够
        let bEncough = cc.vv.gameData.isCoinEncough(betVal)
        if(bEncough){
            // let formNode = bet_list.getSelectChipNode()

            // this._nodeDobetAni(formNode)
            // this.flyChip(formNode,betVal,toAreaIdx)
    
            // this.updateMyBets(toAreaIdx,betVal)
            // this.playClickAnim(toAreaIdx);

            this._actionBet(betVal,toAreaIdx)
        }
        else{
            //金币不足
            cc.vv.gameData.showChargeTips()
            
        }
    },

    //表现下注行为
    _actionBet:function(betVal,toAreaIdx,bNotFlyChip){
        let bet_list = cc.vv.gameData.getScriptGame()._getBetListScript()
        let formNode = bet_list.getChipNodeByVal(betVal)

        this._nodeDobetAni(formNode)
        if(!bNotFlyChip){
            this.flyChip(formNode,betVal,toAreaIdx)
        }
        

        this.updateMyBets(toAreaIdx,betVal)
        this.playClickAnim(toAreaIdx);
    },

    // 播放点击动画
    playClickAnim(toAreaIdx){

    },

    //神算子下注
    playRaterDoBet:function(formNode,chips,toAreaIdx){
        let self = this
        this._nodeDobetAni(formNode)
        //直接更新押注总额
        let areaTotal = cc.vv.gameData.countChipsTotalVal(chips)
        for(let i = 0; i < areaTotal.length; i++){
            let betVal = areaTotal[i]
            cc.vv.gameData.updateAreanBetData(toAreaIdx,betVal)
        } 

        //如果有正在飞行的就不飞
        if(this._bFlyrater) return
        this._bFlyrater = true

        //飞神算子标志
        let toPos
        
        let arenNode = this.getBetAreaNode(toAreaIdx)
        let formPos =  arenNode.convertToNodeSpaceAR(formNode.convertToWorldSpaceAR(cc.v2(0,0)))
        if(arenNode){
            if(cc.find("rater",arenNode)){
                toPos = arenNode.convertToNodeSpaceAR(cc.find("rater",arenNode).convertToWorldSpaceAR(cc.v2(0,0)))
            } else {
                toPos = arenNode.convertToNodeSpaceAR(cc.find("totalbet",arenNode).convertToWorldSpaceAR(cc.v2(-100,0)))
            }

        }
        let url = "Table_Common/TableRes/prefab/fly_rater"
        cc.loader.loadRes(url,cc.Prefab,(err,data)=>{
            if(!err && cc.isValid(arenNode)){

                let old = cc.find("max_rate",arenNode)
                
                let node = cc.instantiate(data)
                node.position = formPos
                node.parent = arenNode
                node.name = "max_rate"
                let c1 = formPos
                let c2 = cc.v2(toPos.x,formPos.y)
                if(toPos.y > formPos.y){
                    c2 = cc.v2(formPos.x,toPos.y)
                }
                let c3 = toPos

                let icon = cc.find("icon",node);
                let par = cc.find("par",node);
                let cfg = cc.vv.gameData.getGameCfg();
                icon.scale = cfg.ratescale || 0.6
                par.scale = cfg.ratescale || 0.6
                par.active = true;
                par.getComponent(cc.ParticleSystem).resetSystem();

                let nDur = 0.8
                let tween = cc.tween().bezierTo(nDur,cc.v2(0,0),cc.v2(c2.x-c1.x, c2.y-c1.y),cc.v2(c3.x-c1.x, c3.y-c1.y))
                tween.clone(icon).start()
                tween.clone(par).call(()=>{par.active = false; self._bFlyrater = null}).start()

                if(!old){
                    cc.tween(node)
                    .delay(nDur)
                    .start()
                }
                else{
                    cc.tween(node)
                    .delay(nDur)
                    .removeSelf()
                    .start()

                }
                
            }
        })
    },

    //播放下注表现
    //bNotFlyChip 不播放投注飞金币动画，直接更新押注数值
    playDoBetAni:function(formNode,betVal,toAreaIdx,bNotFlyChip){
        
        if(!bNotFlyChip){
            this._nodeDobetAni(formNode)
            this.flyChip(formNode,betVal,toAreaIdx)
        }
        
        //更新方位总的押注
        cc.vv.gameData.updateAreanBetData(toAreaIdx,betVal)


        //更新各个方位上的押注总额
        this.updateBetTotalNum()
    },

    //投注动作
    _nodeDobetAni:function(node){
        Global.TableSoundMgr.playCommonEff("com_dobet")
        
        if(node.getNumberOfRunningActions() == 0){
            let formPos =  this.node.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(0,0)))
            let bMySelf = node.getComponent("Table_BetChip_Base")?true:false
            let offset = null
            if(formPos.y < 0){
                //在押注区域下方
                if(bMySelf){
                    offset = cc.v2(0,20)
                }

            }
            if(!offset){
                if(formPos.x < 0){
                    // 押注区域左边
                    if(!bMySelf){
                        offset = cc.v2(20,0)
                    }
                }
                else if(formPos.x > 0){
                    // 押注区域右边
                    if(!bMySelf){
                        offset = cc.v2(-20,0)
                    }
                }
            }
            node.stopAllActions()
            cc.tween(node)
            .to(0.1,{x:node.x+offset.x,y:node.y+offset.y},{easing:"quadIn"})
            .to(0.1,{x:node.x,y:node.y})
            .start()
        }
        
       
    },

    //生成筹码飞到指定区域
    flyChip:function(formNode,betVal,areanIdx){
        if(formNode && betVal){
            let arenNode = this.getBetAreaNode(areanIdx)
            if(arenNode){
                
                let toPos = this._randomAreanPostion(cc.find("chip_container",arenNode))
                let formPos =  this.node.convertToNodeSpaceAR(formNode.convertToWorldSpaceAR(cc.v2(0,0)))
                let chip = this._create_chip(betVal,null,areanIdx)
                chip.position = formPos
                let nSpeed = 1800
                let pDis = Math.abs((formPos.sub(toPos)).mag())
                let nDur = pDis/nSpeed
                cc.tween(chip)
                .to(nDur,{position:toPos},{easing:"quadOut"})
                .delay(1/60)
                .call(()=>{
                    //检查是否有可以回收的筹码
                    this._checkCanRecycleChip(areanIdx)
                })
                .start()
            }
            else{
                cc.log("未找到押注方位:"+areanIdx)
            }
            
        }
        
    },

    //移动已经有了的筹码：
    moveChip:function(chip,formNode,toNode,endCall,bRemoveChip,toOffSet,parentNode){
        if(parentNode){
            chip.parent = parentNode
        } else {
            parentNode = this.node;
        }
        let formPos = parentNode.convertToNodeSpaceAR(formNode.convertToWorldSpaceAR(cc.v2(0,0)))
        let toPoint = cc.v2(0,0)
        if(toOffSet){
            toPoint.x += toOffSet.x
            toPoint.y += toOffSet.y
        }
        let toPos = parentNode.convertToNodeSpaceAR(toNode.convertToWorldSpaceAR(toPoint))
        let nSpeed = 1700
        let pDis = Math.abs((formPos.sub(toPos)).mag())
        let nDur = pDis/nSpeed
        cc.tween(chip)
        .to(nDur,{position:toPos})
        .call(()=>{
            if(bRemoveChip){
                this.removeOneChip(chip)
            }
            if(endCall) endCall(chip)
        })
        .start()

        

        return nDur
    },

    //删除某个chip
    removeOneChip:function(obj){
        if(cc.isValid(this._active_chips)){
            for(let i = 0; i < this._active_chips.length;i++){
                let item = this._active_chips[i]
                if(item.chipNode == obj){
                    this._active_chips.splice(i,1)
                    this._recycleChip(item.chipNode)
                    
                    break
                }
                
            }
        }
        
    },

    //获取方位的筹码
    getAreaChips:function(idx){
        let datas = []
        for(let i = 0; i < this._active_chips.length; i++){
            let item = this._active_chips[i]
            
            if(item.areaIdx == idx){
                datas.push(item)
            }
            
            
        }
        return datas
    },

    //是否是有效的区域id
    _isAvailAreaIdx:function(idx){
        let res = false
        for(let i = 0; i < this.AreaList.length;i++){
            if(idx == this.AreaList[i].idx){
                res = true
                break
            }
        }
        return res
    },

    //获取所有可见筹码
    getAllChips:function(){
        return this._active_chips
    },

    //回收某个方位的筹码
    clearAreaBets:function(idx){
        for(let i = 0; i < this._active_chips.length;){
            let item = this._active_chips[i]
            if(item.areaIdx == idx){
                this._active_chips.splice(i,1)
                
                this._recycleChip(item.chipNode)
                continue
            }
            i++
        }
    },


    //生成一个押注区域的随机位置
    _randomAreanPostion(areanNode){
        let parNode = this.getChipShowNode()
        //较大概率是向中间聚拢的
        let random_w = 2
        let nWight = Global.random(1,10)
        if(nWight>4){
            random_w = 4
        }
        let xPos = Global.random(-areanNode.width/random_w,areanNode.width/random_w)
        let yPos = Global.random(-areanNode.height/random_w,areanNode.height/random_w)
        return parNode.convertToNodeSpaceAR(areanNode.convertToWorldSpaceAR(cc.v2(xPos,yPos)))
    },

    //获取桌面筹码显示的父节点
    //不设置的话，就是显示在betarea节点上
    getChipShowNode:function(){
        let node = this.chips_show_node || this.node
        return node
    },


    //设置下注区域是否可以点击
    setCanSelectChips:function(val){
        for(let i = 0; i < this.AreaList.length; i++){
            let item = this.AreaList[i]
            item.setAeranEnable(val)
        }
    },

    //重置我的押注数据:一局结束后
    resetMyBets:function(){
        let chiplist = cc.vv.gameData.getBetChipList()
        for(let i = 0; i < this.AreaList.length; i++){
            this._my_bet_vals[i] = []
            for(let j = 0; j < chiplist.length; j++){
                this._my_bet_vals[i].push(0)
            }
        }
    },

    //更新我的押注数据
    updateMyBets:function(areadIdx,betVal){
        let aread_bet = this._my_bet_vals[areadIdx-1]
        if(aread_bet){
            let betIdx = cc.vv.gameData.getChipIdxByVal(betVal)
            aread_bet[betIdx] += 1
    
            //更新我的方位押注
            cc.vv.gameData.addMyCoin(-betVal,true)
            cc.vv.gameData.addMyBet(areadIdx,betVal)
            
            //更新方位总的押注
            cc.vv.gameData.updateAreanBetData(areadIdx,betVal)
    
    
            //更新各个方位上的押注总额
            this.updateBetTotalNum()
    
            //发送押注协议
            this.sendBetReq()
        }
        

    },

    //更新各个方位上的押注总额
    updateBetTotalNum:function(){
        
        for(let i = 0; i < this.AreaList.length; i++){
            let itemData = this.AreaList[i]
            let dataIdx = itemData.idx-1
            let areaNode = itemData.node

            //总
            let totalBet = cc.vv.gameData.getAreaTotalBet(itemData.idx)
            this.setAreaTotalBet(areaNode,totalBet)
            //我的
            let mybet = cc.vv.gameData.getMyBetByAreanIdx(dataIdx)
            this.setAreaMyBet(areaNode, mybet)
        }
    },

    sendBetReq:function(){
        

        cc.vv.gameData.sendBetReq(this._my_bet_vals)

        //将我的押注信息保存起来
        for(let i = 0; i < this._my_bet_vals.length; i++){
            this._bet_record[i] = this._bet_record[i] || []
            for(let j = 0; j < this._my_bet_vals[i].length; j++){
                if(!this._bet_record[i][j]) this._bet_record[i][j] = 0
                this._bet_record[i][j] += this._my_bet_vals[i][j]
            }
        }

        this.resetMyBets()
    },

    _recycleChip(node){
        if(cc.vv.ChipPool){
            node.stopAllActions()
            cc.vv.ChipPool.put(node)
        }
        else{
            this._chip_pool.put(node)
        }
    }

    

    // update (dt) {},
});
