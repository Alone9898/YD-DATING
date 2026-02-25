
cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {
        _hasLoaded: false, //是否加载完成
    },

    onLoad () {
        this._super();
        this._soundCfg = cc.vv.gameData.getGameCfg().soundCfg;

        Global.registerEvent(cc.vv.gameData._EventId.SLOT_ENERGYGAME_OperationOVER,this.onEnergyGameOver,this);      //能量关卡操作结束(回到旋转界面)
    },

    //能量大关/小关游戏结束
    onEnergyGameOver:function(){
        this._bottomScript.ShowBtnsByState("idle");
        SlotsFacade.energyCollect.showEnergyProgress(0);
    },

    start () {
        this._super();
        //断线重连的显示

        this._hasLoaded = true;
        this.ReconnectShow()

        this.refreshGoldPen();
    },

    //重写，增加开关，防止在onLoad去重连，设计UI顺序问题
    async ReconnectShow () {
        if (this._hasLoaded) {
            //是否是免费游戏
            let rest = cc.vv.gameData.GetFreeTime()
            if(rest){
                this.ShowGameview(true)
            }
            else{
                this.ShowGameview(false)
            }

            //select处理
            this._gameInfo = cc.vv.gameData.getDeskInfo();
            if (this._gameInfo.select && this._gameInfo.select.state) {
                this._bottomScript.ShowBtnsByState("moveing_1")

                //转盘游戏
                if (this._gameInfo.select.rtype == 3) {
                    if (this._gameInfo.wheelInfo) {
                        await SlotsFacade.gameWheel.enterGame(this._gameInfo.wheelInfo.cfg, this._gameInfo.wheelInfo.mults);
                    }
                    else {
                        AppLog.err("轮盘数据不存在");
                    }
                }
                else if (this._gameInfo.select.rtype == 4) {
                    cc.vv.gameData.GetSlotsScript()._topScript.SetBackLobby(false);
                    await SlotsFacade.pickBonus.enterGame(this._gameInfo.pool, true);
                    //显示钱
                    this._topScript.ShowCoin();
                }
                else if (this._gameInfo.select.rtype == 2) { //地图大关
                    SlotsFacade.map.node.active = true;
                    SlotsFacade.map.enterMap(true);
                }
                else if (this._gameInfo.select.rtype == 1) { //地图小关
                    let engData = cc.vv.gameData.getCollectData();
                    if(!engData) return;

                    //中777
                    cc.vv.gameData.GetSlotsScript()._bottomScript.ShowBtnsByState("moveing_1")
                    let mapGame = cc.find('Canvas/safe_node/LMSlots_Subgame777');
                    mapGame.active = true
                    mapGame.getComponent('LMSlots_Subgame777').showEnter(engData.bet);
                }
                else {
                    //请求开始游戏
                    // await cc.vv.gameData.reqSubGame(this._gameInfo.select.rtype); //游戏类型
                    AppLog.warn("未知玩法...");
                }

                this._bottomScript.ShowBtnsByState("idle")
            }
            else if (this._gameInfo.collect && this._gameInfo.collect.open == 2) {
                //中免费
                let freeGame = cc.find('Canvas/safe_node/node_energy_free_game');
                freeGame.active = true;
                SlotsFacade.energyFreeGame.reconnect();
            }

            //再开始
            if(cc.vv.gameData.GetFreeTime()) {
                this.CanDoNextRound()
            }
        }
    },


    ReconnectNet(){
        let _gameInfo = cc.vv.gameData.getDeskInfo();
        if(this._stopTime > 0 && !this._gameInfo){  // 旋转中，未收到44返回
            this.ReconnectShow();
        }
        else if(_gameInfo.select && _gameInfo.select.state){ //select处理

            //转盘游戏
            if (_gameInfo.select.rtype == 3) {
                if (_gameInfo.wheelInfo) {
                    SlotsFacade.gameWheel.ReconnectNet(_gameInfo.wheelInfo.cfg, _gameInfo.wheelInfo.mults);
                }
            }
            else if (_gameInfo.select.rtype == 4) {
                SlotsFacade.pickBonus.ReconnectNet(_gameInfo.pool, true);
            }
            else if (_gameInfo.select.rtype == 2) { //地图大关
                SlotsFacade.map.ReconnectNet(true);
            }
            else if (_gameInfo.select.rtype == 1) { //地图小关
                let engData = cc.vv.gameData.getCollectData();
                if(!engData) return;

                // 777游戏中
                let mapGame = cc.find('Canvas/safe_node/LMSlots_Subgame777');
                mapGame.getComponent('LMSlots_Subgame777').ReconnectNet(engData.bet);
            }
        }
    },

    //重写
    RegisterEvent:function(){
        cc.vv.gameData._EventId.SLOT_REFUSH_COLLECT_WILD_PROGRESS = "EventId.SLOT_REFUSH_COLLECT_WILD_PROGRESS";
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_REFUSH_COLLECT_WILD_PROGRESS,this.OnEventRefreshCollectWildProgress,this);
    },

    OnEventRefreshCollectWildProgress () {
        this.refreshGoldPen();
    },

    //刷新Wild收集进度
    refreshGoldPen () {
        let collectWildData = cc.vv.gameData.getCollectWildData();
        if (!collectWildData) return;

        let targetNode = cc.find('Canvas/safe_node/slots/spine_collect_wild');
        let percent = collectWildData.num / collectWildData.total;
        let animPercentCfg = [0, 0.02, 0.5, 0.85];
        let animIdx = 0;
        for (let i in animPercentCfg) {
            if (percent >= animPercentCfg[i]) {
                animIdx = i;
            }
        }

        if (this._animIdxCollectWild != animIdx) {
            this._animIdxCollectWild = animIdx;
            targetNode.getComponent(sp.Skeleton).setAnimation(0, "animation" + (animIdx==0?"":animIdx), true);
        }
    },

    //重写
    StartMove: function () {
        // this.HideAllSymbolTopAni();

        this.ClearAllTopAni();
        this._super();

        if(!cc.vv.gameData.isFreeTime()){
            Global.SlotsSoundMgr.playNormalBgm()
        }

        //能量免费游戏-开始滚动
        SlotsFacade.energyFreeGame.onStartMove();
    },

    //清理一轮游戏的中奖动作
    ClearAllTopAni(){
        let reels = this._reels;
        for (let reel of reels) {
            for (let i=0; i<this._row; i++) {
                let symbol = reel.GetSymbolByRow(i);
                if (symbol) symbol.ShowNormal();
            }
        }

        // this._topAniNode.removeAllChildren();
        this.ClearAllTopShow();
    },


    //自己游戏Symbole的Extra数据
    GetSymboleExtraData:function(idx){
        //wild的倍数数据
        let wildMults = this._gameInfo.wildMults;
        for (let key in wildMults) {
            let tIdx = parseInt(key.substr(4, key.length - 4)) - 1; //服务端数从1开始
            if (idx == tIdx) {
                return {t:"mult", num:wildMults[key]};
            }
        }
    },

    SetSlotsResult:function(cards){
        //把结果按卷轴结果整理
        let acRow = cards.length / this._col
        let reelResults = []
        for(let i = 0;i < cards.length; i++){
            let col = i % this._col
            //配置中有没有这个元素
            if(this._cfg.symbol[cards[i]]){
                let res = {}
                res.sid = cards[i]
                res.data = this.GetSymboleExtraData(i)
                if(!reelResults[col]) reelResults[col] = []
                reelResults[col].unshift(res)
            }

        }
        for(let j = 0; j < this._reels.length; j++){
            let item = this._reels[j]
            let reelRes = reelResults[j]
            item.SetResult(reelRes)
        }
    },

    // 重写：列停止 增加其它处理
    OnReelSpinEnd: function (colIdx) {
        this._super(colIdx);

        let reel = this._reels[colIdx];
        for (let i = 0; i < this._row; i++) {
            let symbol = reel.GetSymbolByRow(i);
            if (symbol.GetShowId() == cc.vv.gameData.getGameCfg().wildId || symbol.GetShowId() == cc.vv.gameData.getGameCfg().scatterId) {
                symbol.playWildCollectAction();
            }
        }
    },

    //显示节点动画到top_ani节点
    //不受框体的限制，不受mask的显示。即显示在slots的最上层
    //nRow:行，从下往上数0开始， nCol:列，从0开始
    //return:该节点的控制脚本，自己获取后，可以控制动画的播放
    ShowSymbolTopAni:function(nRow,nCol){
        let parNode = cc.find("top_ani",this.node)
        if(parNode){
            let cfg = cc.vv.gameData.getGameCfg()
            let symScp = cfg.scripts.Symbols
            let showNode = cc.find(cc.js.formatStr("top_symbol_%s_%s",nRow,nCol),parNode);
            if(showNode){ //如果已经存在就直接显示
                // showNode.active = true
                //
                // return showNode.getComponent(symScp)
                showNode.removeFromParent(true);
            }
            // else{
            let reel = this._reels[nCol]
            let symbol = reel.GetSymbolByRow(nRow)
            if(symbol){
                let wordPos = symbol.node.convertToWorldSpaceAR(cc.v2(0.0));
                let newNode = cc.instantiate(symbol.node)
                newNode.parent = parNode
                newNode.name = cc.js.formatStr("top_symbol_%s_%s",nRow,nCol)
                newNode.position = parNode.convertToNodeSpaceAR(wordPos)
                return newNode.getComponent(symScp)
            }
            // }
        }
    },

    ShowScatterWinTrace () {
        let allWinIdx = []
        if(this._gameInfo.freeResult && this._gameInfo.freeResult.freeInfo){
            let freeInfo = this._gameInfo.freeResult.freeInfo;
            if (freeInfo.idxs) {
                for(let i = 0; i < freeInfo.idxs.length; i++){
                    let val = freeInfo.idxs[i];
                    allWinIdx[val] = 1
                }
            }
        }

        //总
        for (const key in allWinIdx) {
            let symbol = this.GetSymbolByIdx(Number(key))
            if(symbol){
                symbol.playWinAnimation()
                // symbol.ShowKuang()
            }
        }
    },

    //重写：显示bonus中奖
    async OnSpinEnd() {
        this._bottomScript.ShowBtnsByState("moveing_1")

        //能量免费游戏-停止滚动
        await SlotsFacade.energyFreeGame.onEndMove();

        //显示中奖路线
        this.ShowWinTrace();
        //显示底部赢钱
        await this.ShowWinCoin();

        //能量免费游戏结束，结算退出
        if (cc.vv.gameData.isFinishFreeTime()) {
            if (SlotsFacade.energyFreeGame.isFinish()) {
                await SlotsFacade.energyFreeGame.exitFreeGame();
                // this.ShowGameview(false);
            }
            else {
                await SlotsFacade.gameWheel.exitFreeGame(cc.vv.gameData.GetGameTotalFreeWin());
                this.ShowGameview(false);
            }

            await new Promise((success)=>{
                this.ShowBottomWin(cc.vv.gameData.GetGameTotalFreeWin(), cc.vv.gameData.GetGameTotalFreeWin(), true, ()=>{
                    success();
                });
            })
        }

        //收集能量,免费不收集
        if (this.isNeedCollecting() && !cc.vv.gameData.isFreeTime()) {
            this.CollectEnergy();

            let collectData = cc.vv.gameData.getCollectData();
            await this.awaitTime(collectData.num>=collectData.total?2.2:0);
        }

        //select处理
        if (this._gameInfo.select && this._gameInfo.select.state) {
            //转盘游戏
            if (this._gameInfo.select.rtype == 3) {
                this.ShowScatterWinTrace();
                Global.SlotsSoundMgr.playEffect("magic_move");
                await this.awaitTime(2.0);

                if (this._gameInfo.wheelInfo) {
                    await SlotsFacade.gameWheel.enterGame(this._gameInfo.wheelInfo.cfg, this._gameInfo.wheelInfo.mults);
                }
                else {
                    AppLog.err("轮盘数据不存在");
                }
            }
            else if (this._gameInfo.select.rtype == 4) {
                await SlotsFacade.pickBonus.enterGame(this._gameInfo.pool);
                //显示钱
                // this._topScript.ShowCoin();
            }
            else {
                //请求开始游戏
                // await cc.vv.gameData.reqSubGame(this._gameInfo.select.rtype); //游戏类型
                AppLog.warn("未知玩法...");
            }
        }

        //进入能量小游戏
        let collectData = cc.vv.gameData.getCollectData();
        if(collectData && collectData.open > 0 && cc.vv.gameData.IsSelectSubGame()){
            SlotsFacade.map.node.active = true;
            SlotsFacade.map.enterMap(true);
        }
        else {
            //下一局
            this.CanDoNextRound()
        }
     },

    ShowWinCoin () {
        return new Promise((success)=>{
            let nWin = cc.vv.gameData.GetGameWin();
            if (nWin > 0) {
                let updateRightnow = true;
                let nTotal = nWin;
                if (cc.vv.gameData.isFreeTime()) { //是否在免费中
                    nTotal = cc.vv.gameData.GetGameTotalFreeWin()
                    updateRightnow = false;
                    // if (cc.vv.gameData.isFinishFreeTime()) {
                    //     updateRightnow = true;
                    // }
                }
                this.ShowBottomWin(nWin, nTotal, updateRightnow, ()=>{
                    success ();
                });
            }
            else {
                success ();
            }
        });
    },

    isNeedCollecting () {
        let cards = this._gameInfo.resultCards;
        if (cc.vv.gameData.isOpenCollectProgress()) {
            let collectId = cc.vv.gameData.getGameCfg().collectId;
            for (let symboleId of cards) {
               if (symboleId == collectId) {
                   return true;
               }
            }
        }
        else {
            let wildId = cc.vv.gameData.getGameCfg().wildId;
            for (let symboleId of cards) {
                if (symboleId == wildId) {
                    return true;
                }
            }
        }
        return false;
    },

    //收集能量
    CollectEnergy(){
        if (!cc.vv.gameData.isOpenCollectProgress()) return;

        //显示中奖
        let count = 0;
       for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 3;j++){
                let bPlay = sys[j].PlayCollectAction();
                if (bPlay) count +=1;
            }
        }
        //移动播放音效
        if (count > 0) {
            Global.SlotsSoundMgr.playEffect(this._soundCfg.symbol_fly);
        }

         //移动结束 通知刷新能量
         this.scheduleOnce(()=>{

             Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_REFUSH_ENERGY);
         }, 1.0);
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

        let midList = []
        if(SlotsFacade.energyFreeGame.isEnable()){    // 免费大关中间一列不播放动画
            midList = [3,8,13];
        }

        //总
        for (const key in allWinIdx) {
            let symbol = this.GetSymbolByIdx(Number(key))
            if(symbol && !midList.includes(Number(key))){
                symbol.playWinAnimation()
                symbol.ShowKuang()
            }
        }


    },

    //显示游戏界面：bFree true显示免费模式的界面，false 普通模式
    ShowGameview:function(bFree){
        this._super(bFree);

        //隐藏/显示能量收集
        SlotsFacade.energyCollect.node.active = !bFree;

        // let pic = "";
        // if(bFree){
        //     pic = "reel_07";
        // } else {
        //     pic = "reel_06";
        // }
        // for (let i = 1; i <= 5; i++){
        //     cc.find("bg/item_bg"+i,this.node).getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.GetAtlasByName("base").getSpriteFrame(pic);
        // }
    },

    //等待时间
    awaitTime (time) {
        return new Promise((success)=>{
            this.scheduleOnce(()=>{
                success()
            },time);
        });
    },
});
