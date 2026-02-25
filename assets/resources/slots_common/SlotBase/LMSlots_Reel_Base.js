/**
 * 卷轴控制单元
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _reelIdx:null,
        _nCount:0,  //卷轴的symbol个数
        _symbols:[],    //符号脚本对象。需要获得节点对象则：this._symbols[i].node
        _symbolTemplete:null,   //符号节点
        _holderNode:null,   //symbol挂载点
        _bMoving:false,     //是否正在旋转
        _bStoping:false,    //是否正在停止
        _holderOrigPosY:null,//holder最初的位置
        _curY:0,            //holder当前的偏移
        _stopTime:0,        //停止间隔时间
        _bResizing:false,   //是否在扩展列
        _result:null,       //结果，会一个个设置到symbol中去然后移除
        _originResult:null, //结果的原始数据
        totalAddHeight:0,   //总共需要移动
        deltaHeight:0,      //每帧增加的高度
        curAddHeight:0,     //已经移动了多少高度
        _reelState:[],     //列停止的状态配置；用于控制是否播放 停止动画，音效，加速框，背景框等
        _topAniNode:null,
        _backupDatas:null,
        _cfg:null
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._holderNode = cc.find("mask/holder",this.node)
        
        this._holderOrigPosY = this._holderNode.position.y
    },

    start () {

    },

    //初始化卷轴
    //idx:卷轴序号(列序号)，0开始
    //nCount:符号个数
    Init:function(idx,nCount,node){
        this._reelIdx = idx
        this._nCount = nCount
        this._symbols = []
        this._topAniNode = node
        this._cfg = cc.vv.gameData.getGameCfg()
        this.LoadSymbols()
        this.ShowAntiEffect(false)
        
    },

    //获取当前的reelIdx
    GetReelIdx:function(){
        return this._reelIdx
    },

    //创建整列的symbols
    LoadSymbols:function(){
        let url = this._cfg.symbolPrefab

        if(!this._symbolTemplete){
            this._symbolTemplete = cc.vv.gameData.GetPrefabByName(url)
            if(this._symbolTemplete){
                this._symbolTemplete.optimizationPolicy = cc.Prefab.OptimizationPolicy.MULTI_INSTANCE
            }
        }
        for(let i = 0; i < this._nCount+1; i++){
            this.CreateOneSymbol()
        }
        this.ReLayOut()
        
    },

    //创建一个符号元素
    CreateOneSymbol:function(){
        let node = cc.instantiate(this._symbolTemplete)
        node.parent = this._holderNode
        let scp = node.addComponent(this._cfg.scripts.Symbols)
        let idx = this._symbols.length; //行号
        scp.SetSymbolReelIdx(this._reelIdx)
        scp.Init(idx,this._topAniNode)
        
        this._symbols.push(scp)

        
    },

    //符号重排设置位置
    ReLayOut:function(){
        for (let i = 0; i < this._symbols.length; i++) {
            let element = this._symbols[i];
            element.node.position = this.GetSymbolPosByRow(i)
            element.SetSymbolIdx(i);
        }
    },

    //按行获取symbol
    //row 0开始
    GetSymbolByRow:function(row){
        return this._symbols[row]
    },

    //获取symbol的位置
    GetSymbolPosByRow:function(row){
        return cc.v2(0,(row+0.5)*this._cfg.symbolSize.height)
    },

    //增加卷轴
    //count 变化的个数
    //deltaTime 变化的时间
    //offsetY y方向偏移（0～1）个格子高度. 专门用于那种默认就显示3个半的那种情况
    AddCount:function(count,deltaTime=0.5,offsetY=0){
        if(this._bResizing) return

        this._bResizing = true
        this._nCount += count
        this._offsetY = offsetY
        let nOffCount = this._offsetY
        if(count < 0){
            nOffCount = (this._offsetY*-1)
        }
        if(this._symbols.length < this._nCount+1){
            let cnt = this._nCount+1 - this._symbols.length
            for(let i = 0; i < cnt; i++){
                this.CreateOneSymbol()
            }
        }
        this.ReLayOut()
        this.totalAddHeight = (count-nOffCount) * (this._cfg.symbolSize.height)
        this.deltaHeight = this.totalAddHeight / deltaTime
        this.curAddHeight = 0
    },

    //在列中追加格子
    //应用场景：列停止后，需要整列上/下移动。
    //symbolArray:[id,id]
    //dir:1 底部追加 2 顶部追加
    AppendSymbol:function(symbolArray,dir){
        this._appendArray = symbolArray
        this._appedDir = dir
        for(let i = 0; i < symbolArray.length; i++){
            let node = cc.instantiate(this._symbolTemplete)
            node.parent = this._holderNode
            let scp = node.addComponent(this._cfg.scripts.Symbols)
            scp.SetSymbolReelIdx(this._reelIdx)
            if(dir == 1){
                
                let idx = -1 - i; //行号
                node.position = this.GetSymbolPosByRow(idx)
                
                scp.Init(idx,this._topAniNode)
                
                this._symbols.unshift(scp)
            }
            else if(dir == 2){
                let idx = this._symbols.length-1; //插到倒数第二个，让最后一个一直往后拍
                scp.Init(idx,this._topAniNode)
                this._symbols.splice(idx,0,scp)
            }

            scp.ShowById(symbolArray[i]);
        }
        if(dir == 2){ // 顶部添加，中间会有一个默认格子
            this.ReLayOut()
        }
        
    },

    //删除追加的symbol
    DelAppendSymbol:function(){
        if(this._appendArray){
            for(let i = 0; i < this._appendArray.length; i++){
                if(this._appedDir == 1){
                    //底部追加的，从后面删
                    let item = this._symbols.pop()
                    this._destroySymbol(item)
                }
                else if(this._appedDir == 2){
                    //头部追加的，从前面删
                    let item = this._symbols.shift()
                    this._destroySymbol(item)
                }
            }
            this._appendArray = null
        }
    },


    //旋转
    StartMove:function(){
        this._result = null
        this._stopRightNow = null
        this._bNotifyReadyStop = null
        this._originResult = null
        this._addSpeed = 0

        //fix:自己增加的卷轴，自己来回收，原来是统一调用，现在改为自己按需调用
        //回收增加的卷轴，独立为函数。
        //this.StartRecycleSymbol()
        
        this._curY = 0
        this._bMoving = true
        this._bStoping = false
        this._offsetY = 0
        
        //所有symbols进入旋转状态
        for(let i = 0; i < this._symbols.length; i++){
            let symbol = this._symbols[i]
            symbol.StartMove()
        }
        //考虑到倍率问题
        this._speed = this._cfg.speed * this.GetTimeScale()
        this._offset = this._cfg.symbolSize.height

    },

    //开始的旋转，回收卷轴
    //nTime 滚动时间
    StartRecycleSymbol:function(nTime){
        let cfg = cc.vv.gameData.getGameCfg()
        if(this._symbols.length > (cfg.row+1)){
            let nCount = -(this._symbols.length -(cfg.row+1))
            this.AddCount(nCount,nTime)
        }
    },

    //停止
    StopMove:function(delayTime){
        
        if(this._bResizing) {
            
            return //在扩展列也不能停止
        }
        if(!this._bMoving) {
            
            return   //不在转动了也不停止
        }

        this._bStoping = true
        this._stopTime = delayTime
    },

    updataSymbol(){
        let symbol = this._symbols.shift()
        let symbolData = null
        if(this._stopTime <= 0 && this._bStoping && this._result && !this._bResizing) {
            if(this._result instanceof Array){
                    //开始设置结果
                    this.ReadyToStop()
                    symbolData = this._result.shift()
                    if(!symbolData){
                        this._bMoving = false
                    }
            }
            else{
                cc.error('LMSlots_Reel_Base.updataSymbol设置的结果不是数组!')
            }
            
        }
        if (symbolData) {
            symbol.ShowById(symbolData.sid,symbolData.data)
        }else{
            symbol.ShowRandomSymbol()
        }
        
        this._symbols.push(symbol)
        this.ReLayOut()
        this._curY = 0
        this._holderNode.y = this._holderOrigPosY
        if(!this._bMoving){
            this.OnReelBounsAction()
        }
    },

    //立即停止
    StopMoveRightNow:function(){
        this._stopRightNow = true

        if(this._bMoving && this._originResult) {
            this._result = Global.copy(this._originResult) 
            for(let i = 0; i < this._symbols.length; i++){
                this.updataSymbol()
            }
        }
       
    },
    

    //增加停止间隔时间
    //scatter加速的时候需要
    AddDelayTime:function(nVal){
        if(this._bMoving){ //只要还没停止就可以加速
            this._stopTime += nVal
            //设置了加速后，不管前面是否设置了结果，到停止的时候，重新来设置一轮
            this._result = Global.copy(this._originResult) 
        }
        else{
            cc.log(this._reelIdx + '列已经停止了还加速！！！')
        }
        
    },

    //设置旋转速度
    SetSpeed:function(speed){
        this._speed = speed
    },

    //列停止
    OnReelSpinEnd:function(){
        this._reelState = []
        let slots = cc.vv.gameData.GetSlotsScript()
        slots.OnReelSpinEnd(this._reelIdx)

        //不能判断，停下来的列等于总共的列，因为有时候只旋转了3列
        //停下来的列以及等于最后一列旋转的列，
        //说明整个列已经停止
        let lastReelStopIdx = slots.GetLastStopReelIdx()
        if(this._reelIdx == lastReelStopIdx){
            //所有列都停止了
            slots.OnSpinEnd()
        }
    },

    //已经准备开始停止了
    //即：开始设置结果，已经进入了停止周期，stoptime变负的那一刻
    //执行在回弹之前
    ReadyToStop:function(){
        if(!this._bNotifyReadyStop){
            this._bNotifyReadyStop = true
            let slots = cc.vv.gameData.GetSlotsScript()
            slots.OnReelReadyToStop(this._reelIdx)
        }
    },

    //列回弹动作之前
    OnReelBounsActionBefore:function(){
        let slots = cc.vv.gameData.GetSlotsScript()
        slots.OnReelBounsActionBefore(this._reelIdx)
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveBefore();
            }
        }
        
    },

    //回弹动作最低点
    OnReelBounsActionDeep:function(){
        this.ShowAntiEffect(false)
        this.playReelStop()
        let slots = cc.vv.gameData.GetSlotsScript()
        slots.OnReelBounsActionDeep(this._reelIdx)
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveDeep();
            }
        }
        
    },

    //列回弹动作完成之后
    OnReelBounsActionEnd:function(){
        let slots = cc.vv.gameData.GetSlotsScript()
        slots.OnReelBounsActionEnd(this._reelIdx)
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveEnd();
            }
        }
        else{
            cc.log('回弹结束，数据已经被清空了')
        }
        
        this.OnReelSpinEnd()
    },

    //列回弹动作
    OnReelBounsAction:function(isStop = false){
        let distance = this._cfg.bounceInfo ? this._cfg.bounceInfo.distance : 30
        let time = this._cfg.bounceInfo ? this._cfg.bounceInfo.time : 0.3
        let deepTime = isStop ? 0 : distance/this._speed
        //考虑到倍率问题
        time = time/this.GetTimeScale()

        cc.tween(this._holderNode)
        .call(this.OnReelBounsActionBefore.bind(this))
        .to(deepTime,{position:cc.v2(this._holderNode.x,this._holderOrigPosY - distance)})
        .call(this.OnReelBounsActionDeep.bind(this))
        .to(time,{position:cc.v2(this._holderNode.x,this._holderOrigPosY)})
        .call(this.OnReelBounsActionEnd.bind(this))
        .start()
    },

    //设置结果
    //[{sid:*,data:*}...]
    SetResult:function(val){
        this._originResult = Global.copy(val)
        this._result = val
    },

    AddReelStateInfo(info){
        this._reelState.push(info)
    },

    playReelStop(){
        //判断 是否播放停止动画
        //TODO 停止动画，其实不应该和加速的配置有关系。再次最好写成一个接口
        if (this._originResult) {
            for(let i = 0; i < this._originResult.length; i++){
                let item = this._symbols[i]
                for (let info of this._reelState) {
                    if (info.isStop && info.id.includes(item.GetShowId())) {
                        item.playStopAnimation()    
                    }
                } 
            }
        }

        //判断播放音效
        if (this._cfg.reelStateInfo && this._cfg.reelStateInfo[0]) {
            let reelStopEffect = ''
            let symbolEffect = ''
            let hasSymbol = false
            for (let info of this._reelState) {
                if (info.isStop) {
                    symbolEffect = info.symbolStopSound ? info.symbolStopSound : ''  
                    hasSymbol = true
                }else{
                    reelStopEffect = info.reelStopSound ? info.reelStopSound : ''  
                }
            } 
            if (hasSymbol) {
                reelStopEffect = symbolEffect
            }

            //有配置的话用配置的音效路径，没有的话，用默认的
            let soundPath = this._cfg.reelStateInfo[0].path
            if(!soundPath){
                soundPath = cc.vv.gameData.getGameDir()
            }
            cc.vv.AudioManager.playEff(soundPath, reelStopEffect, true);
        }
    },

    //播放加速动画
    playAntiAnimation(){
        let isPlayAniti = false
        if (this._cfg.reelStateInfo && this._cfg.reelStateInfo[0]) {
            for (let info of this._reelState) {
                if (info.isAnt && info.antiNode) {
                    this.ShowAntiEffect(true,info.antiNode)
                    let soundPath = info.path
                    if(!soundPath){
                        soundPath = cc.vv.gameData.getGameDir()
                    }
                    cc.vv.AudioManager.playEff(soundPath, info.antSound, true);
                    
                    //考虑到加速倍率
                    let cfgAntSpeed = info.antSpeed
                    if(cfgAntSpeed){
                        cfgAntSpeed = cfgAntSpeed * this.GetTimeScale()
                    }
                    this._speed = cfgAntSpeed ? cfgAntSpeed : this._speed
                    isPlayAniti = true
                }
            } 
        }
        return isPlayAniti
    },


    //显示免费游戏加速效果
    //加速框的显示
    ShowAntiEffect:function(bShow,name){
        if (bShow == false) {
            if (this._cfg.reelStateInfo) {
                for (let info of this._cfg.reelStateInfo) {
                    let node = cc.find("mask/" + info.antiNode,this.node)
                    if(node && node.active){
                        node.active = false
                        // 既然不是循环的播放，就不需要主动停止
                        // 点立即停止的时候需要停止加速音效
                        if(this._stopRightNow){
                            cc.vv.AudioManager.stopEffectByName(info.antSound);
                        }
                        
                    }
                }
            }
        }else{
            let node = cc.find("mask/" + name,this.node)
            if(node){
                node.active = bShow
            }
            else{
                cc.log("未找到加速节点：mask/node_anti");
            }
        }
    },

    //高度变化通知
    //如果自己还有需要根据卷轴变化来处理逻辑
    OnReelHeigtChange:function(nAddHeight){

    },

    //高度变化结束
    //bUp:是否正向
    OnReelHeightChangeEnd:function(bUp){

    },

    //更新位置
    UpdatePosition:function(dt){
        this._stopTime = this._stopTime - dt
        this._curY += dt*this._speed
        if(this._curY > this._offset){
            this.updataSymbol()
        }else{
            this._holderNode.y = this._holderOrigPosY - this._curY
        }
    },

    //更新卷轴尺寸
    UpdateSize:function(dt){
        let height = this.deltaHeight * dt
        this.curAddHeight += height
        if((this.totalAddHeight > 0 && this.curAddHeight >= this.totalAddHeight) 
        || (this.totalAddHeight < 0 && this.curAddHeight <= this.totalAddHeight)){
            this.curAddHeight -= height
            height = this.totalAddHeight - this.curAddHeight
            this._bResizing = false

            this.OnReelHeightChangeEnd(height > 0)
        }

        
        //变尺寸
        let reHeight = this.GetResizeHeightObjs()
        for(let i = 0; i < reHeight.length; i++){
            let item = reHeight[i]
            item.height += height
        }
        //变位置
        let movingObjs = this.GetResizeMoveingObjs()
        for(let i = 0; i < movingObjs.length; i++){
            let item = movingObjs[i]
            item.y += height 
        }

        //reel高度变化
        this.OnReelHeigtChange(height)

        if(!this._bResizing){
            //不在变高度后，如果symbols个数比(行数+1)多了就删除
            if(this._symbols.length > this._nCount+1){
                let delCnt = this._symbols.length - (this._nCount+1)
                for(let i = 0; i < delCnt; i++){
                    //尾部删除
                    let item = this._symbols.pop()
                    this._destroySymbol(item)
                }
            }
        }

    },

    //reel变化尺寸的时候，需要设置高度的节点(y锚点都是0，这样设置长度都是y方向)
    //reel/mask , 
    //reels_bg/bg*,
    GetResizeHeightObjs:function(){
        let objs = []
        let mask = cc.find("mask",this.node)
        if(mask){
            objs.push(mask)
        }

        let bg = cc.find("reels_bg/reel_bg"+(this._reelIdx+1),this.node.parent.parent)
        if(bg){
            objs.push(bg)
        }
        return objs
    },

    //reel变化尺寸的时候，需要移动的节点
    //reels_frame/reel*/frame 
    GetResizeMoveingObjs:function(){
        let objs = []
        

        let frameTop = cc.find(cc.js.formatStr("reels_frame/reel%s/frame1",this._reelIdx+1),this.node.parent.parent)
        if(frameTop){
            objs.push(frameTop)
        }
        return objs
    },

    //备份当前状态
    Backup() {
        this._backupDatas = []
        for(let i = 0; i < this._symbols.length; i++ ){
            let tData = this._symbols[i].Backup();
            this._backupDatas.push(tData)
        }
    },

    //恢复到保存的状态
    Resume() {
        if (!this._backupDatas) return;

        //恢复图标
        for(let i = 0; i < this._symbols.length; i++){
            let tData = this._backupDatas[i]
            this._symbols[i].Resume(tData);
        }
       
        this._backupDatas = null;
    },

    //播放倍数
    GetTimeScale(){
        let slots = cc.vv.gameData.GetSlotsScript()
        return slots.GetTimeScale()
    },

    _destroySymbol(item){
        item.setAnimationToTop(false)
        item.ShowKuang(false)
        item.node.destroy()
    },


    update (dt) {
        if(this._bMoving){
            this.UpdatePosition(dt)
        }

        if(this._bResizing){
            this.UpdateSize(dt)
        }
    },
});
