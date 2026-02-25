/**
 * slots 控制部分
 */

cc.Class({
    extends: cc.Component,

    properties: {
        _topScript:null,    //上面的脚本
        _bottomScript:null, //下面的脚本
        _col:0,     //列
        _row:0,     //行
        _reels:[],   //卷轴脚本对象
        _cfg:null,
        _stopTime:null, //停止时间
        _gameInfo:null, //每一轮的游戏数据
        _bStopRightnow:null, //立即停止
        _topAniNode:null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._topAniNode = cc.find("top_ani",this.node)
    },

    start () {
        
    },


    

    //初始化
    Init:function(){
        this._topScript = cc.vv.gameData.GetTopScript()
        this._bottomScript = cc.vv.gameData.GetBottomScript()

        this._cfg = cc.vv.gameData.getGameCfg()
        this._col = this._cfg.col
        this._row = this._cfg.row

        this.createReels(this._col,this._row)

        this._bottomScript.ShowBtnsByState("idle")

        this.RegisterEvent()

        //断线重连的显示
        this.ReconnectShow()

        //初始化奖池
        // this.CheckJoopLock()
    },

    //根据需要注册消息
    RegisterEvent:function(){
        //注册奖池锁的状态变化监听
        // Global.registerEvent(cc.vv.gameData._EventId.SLOT_JACKPOOL_LOCK_CHANGE,this.OnEventJackPoolLockChange,this)
    },

    //创建卷轴
    createReels:function(col,row){
        let reelCmp = this._cfg.scripts.Reels
        for (let i = 0; i < col; i++) {
            let node = cc.find("reels/reel" + (i+1),this.node)
            let scp = node.addComponent(reelCmp)
            scp.Init(i,row,this._topAniNode)
            this._reels.push(scp)
            
        }
    },

    //断线重连的显示
    //可根据自己断线逻辑重写
    ReconnectShow:function(){
        //是否是免费游戏
        
        let rest = cc.vv.gameData.GetFreeTime()
        if(rest){
            this.ShowGameview(true)
            this.CanDoNextRound()
        }
        else{
            this.ShowGameview(false)
        }
        
    },

    // 断网重连
    ReconnectNet:function(){},

    //显示游戏界面：bFree true显示免费模式的界面，false 普通模式
    ShowGameview:function(bFree){
        if(bFree){
            let total = cc.vv.gameData.GetTotalFree()
            let rest = cc.vv.gameData.GetFreeTime()
        
            //显示免费次数
            this._bottomScript.ShowFreeModel(true,total-rest,total)
            let nTotal = cc.vv.gameData.GetTotalFreeWin()
            this._bottomScript.SetWin(nTotal)

            
            //this.CanDoNextRound()
            
        }
        else{
            this._bottomScript.ShowFreeModel(false)
        }

        //可能还需要显示免费背景图
        let normalBg = cc.find("Canvas/safe_node/spr_bg_normal")
        let normalFree = cc.find("Canvas/safe_node/spr_bg_free")
        if(normalFree){ //存在免费游戏背景才执行下面的逻辑
            if(normalBg){
                normalBg.active = !bFree
            }
            
            normalFree.active = bFree
            
        }
        
    },
    //点击旋转按钮调用
    StartMove:function(){
        this._bStopRightnow = null
        this._gameInfo = null
        
        //top状态更新
        this._topScript.StartMove()

        //清理数据
        cc.vv.gameData.ClearOneRoundData()

        //每列转起来
        this.MoveReels(this._reels)

        //设置停止时间
        //就是从开始旋转，如果多少秒会开始停止
        this._stopTime = this.GetStopTime()
    },

    //实际旋转起来的列，有时候需要1，2，4列转，
    //即最后停止下来的不是最后一列的序号，所以需要记录最后一列的序号
    //arry=[this._reels[0],this._reels[1],this._reels[4]]
    MoveReels:function(arry){
        this.moveReelLastIdx = -1
        for(let i = 0; i < arry.length; i++){
            let item = arry[i]
            item.StartMove()
            let idx = item.GetReelIdx()
            if(idx> this.moveReelLastIdx){
                this.moveReelLastIdx = idx
            }  
        }
    },


    //点击停止按钮调用
    StopMove:function(){
        this._bStopRightnow = true
        this._bottomScript.ShowBtnsByState("moveing_1")

        this._stopTime = -1
        for(let i = 0; i < this._reels.length; i++ ){
            let item = this._reels[i]
            let reelStopInterv = 0 //立即停止
            item.StopMove(reelStopInterv)
            item.StopMoveRightNow()
        }
    },

    //收到旋转结果
    //gameData模块收到数据后，转发到此处
    onMsgSpine:function(msg){
        this._gameInfo = msg
        let cards = msg.resultCards
        this.SetSlotsResult(cards)
        this.SetReelStateInfo(cards)

    },

    //处理结果给reel设置结果
    /**
     *    s:   1  2  3  4  5
     *         6  7  8  9  10
     *         11 12 13 14 15
     *    
     *    c:   3  3  3  3  3
     *         2  2  2  2  2
     *         1  1  1  1  1
     */ 
    SetSlotsResult:function(cards){
        //把结果按卷轴结果整理
        let acRow = cards.length / this._col
        let reelResults = []
        for(let i = 0;i < cards.length; i++){
            let row = Math.floor(i / acRow)
            let col = i % this._col
            //配置中有没有这个元素
            if(this._cfg.symbol[cards[i]]){
                let res = {}
                res.sid = cards[i] //符号id
                if(!reelResults[col]) reelResults[col] = []
                reelResults[col].unshift(res)
            }
            
        }
        
        for(let i = 0; i < this._reels.length; i++){
            let item = this._reels[i]
            let reelRes = reelResults[i]
            item.SetResult(reelRes)
        }
    },

    //设置reel旋转的状态； 
    //是否加速框；
    //是否加速旋转
    //是否停止音效；
    //是否播放背景特效
    SetReelStateInfo:function(cards){
        if (!this._cfg.reelStateInfo) {
            return;
        }
        let reelResults = []
        for(let i = 0;i < cards.length; i++){
            let id = cards[i]
            let col = i % this._col
            if(!reelResults[col]) reelResults[col] = []
            reelResults[col].push(id)
        }

        for (let info of this._cfg.reelStateInfo) {
            let stateInfo = Global.copy(info); 
            stateInfo.isStop = false
            stateInfo.isAnt = false

            let triggerCount = stateInfo.mini
            let countsConfig = Global.copy(stateInfo.counts);  
            let haveCount = 0
            let isContinuous = true
            for(let i = 0; i < reelResults.length; i++){
                let item = this._reels[i]
                let reelRes = reelResults[i]
                stateInfo.isStop = false
                stateInfo.isAnt = false
                if (haveCount >= triggerCount-1 && stateInfo.counts[i] > 0 && isContinuous) {  //满足条件 需要播放加速框
                    stateInfo.isAnt = true
                }
                let reelCountOfID = reelRes.reduce((a, v) => stateInfo.id.includes(v) ? a + 1 : a + 0, 0);  
                haveCount +=  reelCountOfID
                countsConfig.shift()
                let remainingCount = (countsConfig.length > 0 ? countsConfig.reduce((x,y)=>x+y):0) + haveCount
                if (reelCountOfID > 0 && remainingCount >= triggerCount && isContinuous) {  //满足条件 播放停止动画和停止音效
                    stateInfo.isStop = true
                }
                if (stateInfo.continuous && stateInfo.counts[i] > 0 && reelCountOfID == 0) {
                    isContinuous = false
                }
                item.AddReelStateInfo(Global.copy(stateInfo))
            }
        }
    },

    //获取一个格子的结果
    //cards 结果集
    //nRow nCol 本地行列号，从下往上数，0开始
    GetResutByRowCol:function(cards,nRow,nCol){
        let idx = this.ChangeRowColToIdx(cards,nRow,nCol)
        return cards[idx]
    },

    //将本地行列号，转成服务端结果的idx
    // nRow nCol 本地行列号，从下往上数，0开始
    ChangeRowColToIdx:function(cards,nRow,nCol){
        let acRow = cards.length / this._col //考虑到变行，所以行可能有变化
        let idx = this._col * (acRow - nRow - 1) + nCol
        return idx
    },

    //根据服务端序号获取本地的symbol
    GetSymbolByIdx:function(idx){
        let col = (idx - 1) % this._col //考虑到变行，所以行可能有变化
        let row = this._row - Math.floor((idx -1)/this._col) -1
        return this._reels[col].GetSymbolByRow(row)
    },

    //单列停止
    //colIdx:0开始
    //回弹动作执行之前的停止时机
    OnReelSpinEnd:function(colIdx){


    
    },

    //配置了加速节点才显示，如果点击了立即停止(_bStopRightnow)也不显示了。
    //每列停止后，会自动隐藏加速节点
    DoCheckReelAnti:function(colIdx){
        if(!this._bStopRightnow){
            let isPlayAnit = false
            for(let i = 0; i < this._reels.length; i++){
                let idx = this._reels[i].GetReelIdx()
                if(idx == colIdx+1){
                    isPlayAnit = this._reels[i].playAntiAnimation()
                }
                if(idx > colIdx && isPlayAnit){//加速显示的时候，多转1s
                    let nAddSpeedTime = cc.vv.gameData.getGameCfg().AddAntiTime || 1
                    this._reels[i].AddDelayTime(nAddSpeedTime)
                }
            }
        }
    },

    //列准备停止
    //已经开始给symbol设置结果了，但是还没进入回弹节奏
    OnReelReadyToStop:function(colIdx){
        
    },

    //回弹动作之后
    OnReelBounsActionEnd:function(colIdx){
        
    },

    //列回弹动作最低点
    OnReelBounsActionDeep:function(colIdx){
       
    },

    //回弹动作之前
    OnReelBounsActionBefore:function(colIdx){
         //检查免费加速
        this.DoCheckReelAnti(colIdx)
    },

    //全部列都停止了
    //处理停下后的中奖情况，这里多数情况需要根据自己的逻辑来处理
    OnSpinEnd:function(){
        let self = this

        //显示中奖路线
        this.ShowWinTrace()
        //显示底部赢钱
        let nWin = cc.vv.gameData.GetGameWin()
        let pEndCall = function(){
            //是否中奖,中奖了就不能开始下一局
            let bHit = self.CheckSpecialReward()
            if(bHit){
                //所有按钮状态显示成灰太
                self._bottomScript.ShowBtnsByState("moveing_1")
            }
            else{
                self.CanDoNextRound()
                //是否退出免费游戏
                self.CheckExitFreeGame()
            }
            
        }
        let nTotal = nWin
        if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()){
            nTotal = cc.vv.gameData.GetGameTotalFreeWin()
        }
        this.ShowBottomWin(nWin,nTotal,true,pEndCall)

    },

    //可以进入下一局
    //如果是自动模式/免费模式，调用此接口会开始自动旋转，
    //普通模式的话，调用此接口。按钮都会变成可点击状态
    CanDoNextRound:function(){
        cc.vv.gameData.CanDoNextRound()
        this._topScript.StopMove()
        this._bottomScript.CanDoNextRound()
    },

    //显示中奖路线
    //竞品中的显示线路是：先总，后单条循环。目前我们只显示总的
    ShowWinTrace:function(){
        let allWinIdx = []

        //中奖位置
        for(let i = 0; i < this._gameInfo.zjLuXian.length; i++){
            let item = this._gameInfo.zjLuXian[i]
            for(let idx = 0; idx < item.indexs.length; idx++){
                allWinIdx[item.indexs[idx]] = 1
            }
        }
        if(this._gameInfo.scatterZJLuXian && this._gameInfo.scatterZJLuXian.indexs){
            for(let i = 0; i < this._gameInfo.scatterZJLuXian.indexs.length; i++){
                let val = this._gameInfo.scatterZJLuXian.indexs[i]
                allWinIdx[val] = 1
            }
        }

        //总
        for (const key in allWinIdx) {
            let symbol = this.GetSymbolByIdx(Number(key))
            if(symbol){
                symbol.playWinAnimation()
                symbol.ShowKuang()
            }
        }
        

    },

    //底部赢钱的显示
    //nAddWin:增量
    //nTotalWin:总共的赢钱
    //bUpdateBalance:是否更新自己的总基本，有些需要到最后才更新到总金币中
    //nRollBegin :滚动开始的值(一般设置 >= 1)。默认是最终的值和开始的值一样就不滚动的，有时候需要强制让数字滚动设置次参数就可以了
    async ShowBottomWin(nAddWin,nTotalWin,bUpdateBalance,pEndCall,nRollBegin){
        
        let self = this
        let nTotalBet = (this._gameInfo && this._gameInfo.betcoin) || cc.vv.gameData.GetTotalBet()
        let nMul = nAddWin / nTotalBet
        if(nMul < 10 && nMul > 0){
            //直接底部加金币
            
            if(nMul >= 5){
                //带粒子的喷钱效果
                await this._bottomScript.ShowWin(nTotalWin,2,nRollBegin,null)
                if(bUpdateBalance){
                    self._topScript.ShowCoinByRoll()
                }
                if(pEndCall){
                    pEndCall()
                }
                
            }
            else{
                let roTime = null
                if(nMul < 1){ //如果倍数小于1 就把时间滚1s即可。加快节奏
                    roTime = 1
                }
                await this._bottomScript.ShowWin(nTotalWin,1,nRollBegin,null,roTime)
                if(bUpdateBalance){
                    self._topScript.ShowCoinByRoll()
                }
                if(pEndCall){
                    pEndCall()
                }
            }
        }
        else if(nMul >= 10){
            //需要显示bigwin
            let bigWinScript = cc.find('Canvas').getComponent('BigWin')
            if(bigWinScript){
                let bigType = 0
                if(nMul >= 80){
                    bigType = 5
                }
                else if(nMul >= 60){
                    bigType = 4
                }
                else if(nMul >= 40){
                    bigType = 3
                }
                else if(nMul > 20){
                    bigType = 2
                }
                else{
                    bigType = 1
                }
                
                if(bigType){
                    return new Promise((resolve,reject) => {
                        let endCall = function(){
                            //把值直接设置到win上显示
                            self._bottomScript.ShowWin(nTotalWin,3,nRollBegin,null,0.3)
                            if(bUpdateBalance){
                                self._topScript.ShowCoinByRoll()
                            }
                            if(pEndCall){
                                pEndCall()
                            }
                            resolve()
                        }
                        bigWinScript.ShowBigWin(bigType,nAddWin,endCall)
                    })
                }
                

            }
            else{
                console.log("未添加BigWin组件")
            }

        }
        else{
            //未赢
            if(pEndCall){
                pEndCall()
            }
        }
    },

    //结束后的特殊中奖逻辑，有的中奖，不能马上点spin,需要有过渡动画。
    //根据各自需求重写
    CheckSpecialReward:function(){
        let res = false
        // //1中免费 2中小游戏
        let res1 = this.CheckEnterFreeGame()
        let res2 = this.CheckTriggerSubGame() 
        res = res1 || res2
        return res
    },

    //检查退出免费
    CheckExitFreeGame:function(){

    },

    //检查进入免费
    CheckEnterFreeGame:function(){

    },

    //是否触发小游戏
    CheckTriggerSubGame:function(){
        return false
    },

    //自动停止时间
    //这里就不用配置了，框架直接统一。以免节奏不一样
    GetStopTime:function(){
        return 0.1 //this._cfg.auto_stop_time || 1
    },

    //设置旋转停止时间
    //如果需要列不停止，可以将时间设置的很大。
    SetStopTime:function(nVal){
        this._stopTime = nVal
    },

    //每列停止时间间隔 = 每列的停止间隔 + 每列的回弹时间
    //reelIdx:0开始
    GetReelStopInter:function(reelIdx){
        let nIter = this._cfg.reelStopInter || 0.6
        return reelIdx*nIter
    },

    //获取最后一个停下来的列序号
    GetLastStopReelIdx:function(){
        return this.moveReelLastIdx
    },

    //显示节点动画到top_ani节点
    //不受框体的限制，不受mask的显示。即显示在slots的最上层
    //nRow:行，从下往上数0开始， nCol:列，从0开始
    //return:该节点的控制脚本，自己获取后，可以控制动画的播放
    ShowSymbolTopAni:function(nRow,nCol){
        if(this._topAniNode){
            let cfg = cc.vv.gameData.getGameCfg()
            let symScp = cfg.scripts.Symbols
            let showNode = cc.find(cc.js.formatStr("top_symbol_%s_%s",nRow,nCol),this._topAniNode);
            if(showNode){ //如果已经存在就直接显示
                showNode.active = true
                
                return showNode.getComponent(symScp)
            }
            else{
                let reel = this._reels[nCol]
                let symbol = reel.GetSymbolByRow(nRow)
                if(symbol){
                    let wordPos = symbol.node.convertToWorldSpaceAR(cc.v2(0.0));
                    let newNode = cc.instantiate(symbol.node)
                    newNode.parent = this._topAniNode
                    newNode.name = cc.js.formatStr("top_symbol_%s_%s",nRow,nCol)
                    newNode.position = this._topAniNode.convertToNodeSpaceAR(wordPos)
                    return newNode.getComponent(symScp)
                }
            }
        }
    },

    //清理所有的top层动画节点
    ClearAllTopShow(){
        if(this._topAniNode){
            this._topAniNode.destroyAllChildren()
        }
    },



    //备份当前状态
    Backup() {
        this._bBackup = true
        for(let i = 0; i < this._reels.length; i++ ){
            this._reels[i].Backup();
        }
    },

    //恢复到保存的状态
    Resume() {
        if(!this._bBackup){
            return
        }
        this._bBackup = null
        this.ClearAllTopShow()
        for(let i = 0; i < this._reels.length; i++ ){
            this._reels[i].Resume();
        }
    },

    //设置速度播放倍率
    //自己在合适时机调用，设置后，下一把就会生效。不需要后，将倍率设置为1就好了
    // >1 加速    <1 减速
    SetTimeScale(val){
        this._timeScaleVal = val
    },
    //获取播放速度倍率
    GetTimeScale(){
        return this._timeScaleVal || 1
    },

    //如果收到结果不需要里面进入停止节奏，可通过重写此接口来实现自己控制
    //默认是收到结果就停止
    CanStopSlot(){
        return this._gameInfo != null
    },

    update (dt) {
        if(this._stopTime > 0){
            this._stopTime = this._stopTime - dt
            if(this._stopTime <= 0 ){ //空转时间到了
                if(this.CanStopSlot()){//满足开始停止的条件
                    this._roundSpineTime = 0
                    this._bottomScript.ShowBtnsByState("moveing_2")
                    //倒计时完，设置一次
                    for(let i = 0; i < this._reels.length; i++ ){
                        let item = this._reels[i]
                        let reelStopInterv = this.GetReelStopInter(i)
                        item.StopMove(reelStopInterv)
                    }
                }
                else{
                    //如果没有结果,则延迟一帧
                    this._stopTime = dt
                    
                    //记录一个超时时间.
                    this._roundSpineTime = this._roundSpineTime || 0
                    this._roundSpineTime += dt
                    if(this._roundSpineTime > 20 ){
                        // this._stopTime = -1 
                        this._topScript.SetBackLobby(true)
                        
                    }
                }
                
            }
        }
        

    },
});
