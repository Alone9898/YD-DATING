

cc.Class({
    extends:require('LMSlots_Slots_Base'),

    properties: {
       _midAniState:1,
    },

    onLoad () {
        this._super();
        this._midAni = cc.find("mid_ani",this.node);
    },
    
    //检查进入免费
    CheckEnterFreeGame:function(){
        return cc.vv.gameData.isTriggerNormalFree();
    },

    //重写
    StartMove:function(){
        this._super()
        this.hideNum();
        this.showMidAni(1);
        cc.vv.gameData.setReelMove(true);
        Global.SlotsSoundMgr.playNormalBgm();
        cc.vv.gameData.GetUIMgr().updateSpineTimes();
    },

    //重写停止移动
    StopMove:function(){
        this._super()
    },

    //重写开始旋转
    onMsgSpine:function(msg){
        this._super(msg);
    },

    //断线重连显示
    async ReconnectShow(){
        let isbonus = cc.vv.gameData.isBonusGame();
        if(isbonus){
            this._bottomScript.ShowBtnsByState("moveing_1")
            this.lockJackpot();
            if(cc.vv.gameData.GetBonusData().open){
                this.startBonusGame();
            }else{
                cc.vv.gameData.GetUIMgr().updateBonusFreeSpinsTimes();
                Global.SlotsSoundMgr.playBgm('bonus_bgm');
                this.reConnectShowCoinToTop();
            }
        }else{
            let rest = cc.vv.gameData.GetFreeTime()
            if(rest){
                this._bottomScript.ShowBtnsByState("moveing_1")
                if(cc.vv.gameData.isTriggerNormalFree()){
                    await cc.vv.gameData.GetUIMgr().showNormalFreeUI();
                    this.CanDoNextRound();
                }else{
                    this.ShowGameview(true)
                    this.CanDoNextRound()
                }
            }
        }
        if(cc.vv.gameData.isBigMapFree()){
            cc.find('node_energy',this.node.parent).active = false;
            this._midAni.active = true;
            cc.vv.gameData.GetBottomScript().DoEnergyFreeSpine(true);
        }
    },

    //重写断线重连免费信息显示
    ShowGameview(bFree){
        this._super(bFree);
        if(bFree){
            cc.vv.gameData.GetUIMgr().changeBg(2);
        }
    },

    //重写：显示bonus中奖
    async OnSpinEnd () {
        this.showMidAni(2)
        //是否中奖,中奖了就不能开始下一局
        let bHit = this.CheckSpecialReward()
        if(bHit){ //所有按钮状态显示成灰太
            this._bottomScript.ShowBtnsByState("moveing_1")
        }

        //显示中奖路线
        this.ShowWinTrace();
        //是否能收集能量
        if (cc.vv.gameData.isOpenCollectProgress()&&!cc.vv.gameData.isBonusGame()&&!cc.vv.gameData.isBigMaping()){
            await this.CollectEnergy();

            if(cc.vv.gameData.isTriggerMap())
                return;
        }

        //播放scatter动画
        this.playScatterAnimation(true);

        //检测是否免费游戏结束
        if(cc.vv.gameData.isBigMapFree()){
            let energydata = cc.vv.gameData.getEnergyData();
            if(energydata.freeGame.rest == 0){
                await this.awaitTime(1);
                await cc.vv.gameData.GetUIMgr().showEnergyFreeCollectUI();
            }
        }
        
        //触发免费游戏
        if(!cc.vv.gameData.isBigMapFree()&&!cc.vv.gameData.isBonusGame()&&cc.vv.gameData.isTriggerNormalFree()){
            Global.SlotsSoundMgr.playEffect('fg_bell');
            this.backupCards();
            await this.awaitTime(2);
            //播放触发时的wincoin
            await this.playBottomWin();
            await cc.vv.gameData.GetUIMgr().showNormalFreeUI();
        }
        
        //触发bonus游戏
        let bonusdata = cc.vv.gameData.GetBonusData();
        if(bonusdata){
            if(bonusdata.open){
                this._bottomScript.ShowBtnsByState("moveing_1")
                Global.SlotsSoundMgr.playEffect('fg_bell');
                this.startBonusGame();
                return;
            }else{
                if(bonusdata.idxs&&bonusdata.idxs.length > 0){
                    cc.vv.gameData.SetRespinTime(bonusdata.num);
                    cc.vv.gameData.GetUIMgr().updateBonusFreeSpinsTimes();
                    //移动停止
                    cc.vv.gameData.GetUIMgr().bonusSpinsEnd(bonusdata.num);
                    if(bonusdata.num <= 0){
                        Global.SlotsSoundMgr.playEffect('normal_respin_end');
                        await this.awaitTime(1);
                        await this.startCollectCoin();
                        if(cc.vv.gameData.isTriggerMap()){
                            return;
                        }
                        
                    }else{
                        await this.awaitTime(0.5);
                    }
                }else{
                    //显示底部赢钱
                    await this.playBottomWin();
                }
            }
        }
        await this.awaitTime(0.3);
        //下一局
        this.CanDoNextRound();

    },

    CanDoNextRound(){
        this._super()
        cc.vv.gameData.setReelMove(false);
    },

    //重写单列停止
    OnReelSpinEnd:function(colIdx){
        this._super(colIdx);
        //显示金币
        this.showReelCoinToTop(colIdx);
    },

    //开始收集金币
    async startCollectCoin(){
        Global.SlotsSoundMgr.playEffect('popup_in');
        cc.find('node_bonusover',this.node).active = true;
        if(this._showJackpot){
            this._showJackpot.active = false;
        }
        cc.vv.gameData.GetUIMgr().showBonusCollectUI();
        this.calculateCollectData();
        await this.startPlayCollectGold();
    },

    //整合收集金币的数据
    calculateCollectData(){
        this._coinData = {};
        let bonusdata = cc.vv.gameData.GetBonusData();
        bonusdata.idxs.forEach(idx => {
            let coindata = cc.vv.gameData.getCoinData(idx);
            this._coinData[idx] = coindata.num;

        });
    },

    //开始播放bonus结算收集金币的动画
    async startPlayCollectGold(){
        return new Promise((success)=>{
            let reeleffect = cc.find('collectreeleffect',this.node);
            let spineeff = cc.find('node_bonusover/spine',this.node);
            let collectnum = cc.find('node_bonusover/collecttotalnum',this.node);
            collectnum.getComponent(cc.Label).string = "";
            let playindex = [1,6,11,2,7,12,3,8,13,4,9,14,5,10,15];
    
            let index = 0;
            let curtotal = 0;
            let spin = reeleffect.getComponent(sp.Skeleton);
            let self = this;
    
            let flyAnimation = function(){
                let idx = playindex[index];
                if(self._coinData[idx]){
                    Global.SlotsSoundMgr.playEffect('coin_respin_fly');
                    reeleffect.active = true
                    spin.setAnimation(0,"animation_L"+idx,false);
                    let symbolnode = self.getCoinSymbol(idx);
                    let topShowNode = cc.find('coinburst',symbolnode)
                    topShowNode.active = true
                    cc.vv.gameData.playSpine(topShowNode,'animation',false,()=>{
                        topShowNode.active = false;
                    });
                    cc.find('coinloop',symbolnode).active = false;
    
                    curtotal +=  self._coinData[idx];
                    self.showJackpotIcon(idx);
                    self.scheduleOnce(() => {
                        spineeff.active = true;
                        spineeff.getComponent(sp.Skeleton).setAnimation(0,"animation",false);
                        //同时显示获取金币数
                        collectnum.getComponent(cc.Label).string = Global.FormatNumToComma(curtotal) ;
                        //同时刷新bottom金币的数量
                        cc.vv.gameData.GetBottomScript().SetWin(curtotal);
                    }, 0.5); //5秒
                    index++;
                    self.scheduleOnce(() => {
                        flyAnimation();
                    }, 1);
                }else{
                    if(index > playindex.length){
                        cc.log('收集结束');
                        self.bonuseEndShowUI(()=>{
                            success();
                        });
                    }else{
                        index++;
                        flyAnimation();
                    }
                }  
            }       
            flyAnimation();
        })
    },

    //控制jackpot中奖的显示
    async showJackpotIcon(idx){
        let coindata = cc.vv.gameData.getCoinData(idx);
        switch (coindata.rtype) {
            case "MINI":this._showJackpot = cc.find('node_bonusover/jackpot1',this.node);break;
            case "MINOR":this._showJackpot = cc.find('node_bonusover/jackpot2',this.node);break;
            case "MAJOR":this._showJackpot = cc.find('node_bonusover/jackpot3',this.node);break;
            default:{
                if(this._showJackpot){
                    this._showJackpot.active = false;
                    this._showJackpot = null;
                }break;
            }
        }
        if(this._showJackpot){
            this._showJackpot.active = true;
        }
    },

    //bonus结束 展示spine动画/显示界面
    async bonuseEndShowUI(callback){
        await this.playBottomWin();
        Global.SlotsSoundMgr.stopBgm();
        let bonusspnode = cc.find('Canvas/safe_node/screenani/startbonusspine');
        Global.SlotsSoundMgr.playEffect('transition2');
        cc.vv.gameData.playSpine(bonusspnode,'animation',false,()=>{
            bonusspnode.active = false;
            cc.find('node_bonusover',this.node).active = false;
            this.resetBonusCoin();
            this.setGraySymbol(false);
            this.resetJackpot();
            if (cc.vv.gameData.isOpenCollectProgress()) {
                this.CollectEnergy(true);
            }
            callback();
        })
        this.scheduleOnce(()=>{
            cc.vv.gameData.GetUIMgr().showBonusUI(false);
        },0.3);
    },

    //金币收集获取符号对象
    getCoinSymbol(idx){
        let col = (idx - 1) % this._col 
        let row = this._row - Math.floor((idx -1)/this._col) -1
        return cc.find(cc.js.formatStr("symbol_top_%s_%s",row,col),this._topAniNode);
    },

    //断线重连直接显示coin到top
    async reConnectShowCoinToTop(){
        await this.awaitTime(0.5);
        cc.vv.gameData.GetUIMgr().reConnectShowBonusUI();
        this.reConnectShowCoinSymbol();
        await this.awaitTime(1);
        cc.vv.gameData.GetBottomScript().CanDoNextRound();
    },

    //重连直接显示符号到top
    reConnectShowCoinSymbol(){
        for(let i = 0; i < 5; i++){
            this.showReelCoinToTop(i);
        }
    },

    //bonus游戏显示coin到top
    showReelCoinToTop(colidx){
        let bonusdata = cc.vv.gameData.GetBonusData();
        if(bonusdata.idxs&&bonusdata.idxs.length>0&&!bonusdata.open){
            let sys = this._reels[colidx]._symbols
            for(let j = 0; j < 3;j++){
                if(sys[j].GetShowId()==12){   
                    let aniNode = sys[j].setCoinToTop(true)
                    if(aniNode){
                        Global.SlotsSoundMgr.playEffect('bonus_coin_effect');
                        let topShowNode = cc.find('coinburst',aniNode)
                        topShowNode.active = true
                        cc.vv.gameData.playSpine(topShowNode,'animation',false,()=>{
                            topShowNode.active = false;
                        });
                        let loopnode = cc.find('coinloop',aniNode)
                        loopnode.active = true
                        cc.vv.gameData.playSpine(loopnode,'animation',true,null);
                    }
                }
            }
        }
    },

    //收集能量
    async CollectEnergy(bonusover=false){
        if(cc.vv.gameData.isBigMaping()&&!bonusover)
            return;
        //如果是收集游戏 返回
        let symbolArr = [];
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 4;j++){
                if(sys[j].GetShowId() == 12){
                    symbolArr.push(sys[j]);
                }
            }
        }

        if(symbolArr.length > 0){
            await this.PlaySymbolFly(symbolArr);
        }
    },

    async PlaySymbolFly(symbolArr){
        let promiseArr = [];
        let coinnode = this.node.getChildByName('flycoin');
        let parentNode = cc.find('Canvas/safe_node')
        let aimnode = cc.find('node_energy/spr_left',parentNode);
        let tarPos = parentNode.convertToNodeSpaceAR(aimnode.convertToWorldSpaceAR(cc.v2(0,0)))

        symbolArr.forEach(symbol => {
            let flyNode = cc.instantiate(coinnode);
            flyNode.parent = parentNode
            flyNode.active = true;
            let beiginPos = parentNode.convertToNodeSpaceAR(symbol.node.convertToWorldSpaceAR(cc.v2(0,0)))
            flyNode.position = beiginPos
            //开始移动
            promiseArr.push(new Promise((res)=>{
                cc.vv.gameData.playSpine(flyNode,'animation1',false,()=>{
                    cc.vv.gameData.playSpine(flyNode,'animation2',false,null);
                    cc.tween(flyNode).bezierTo(0.5,cc.v2(beiginPos.x,beiginPos.y),cc.v2(tarPos.x,beiginPos.y),tarPos)
                    .call(() => {
                        flyNode.destroy()
                        res();
                    }).start()
                });
                
            }));
        });
        Global.SlotsSoundMgr.playEffect('coin_collect');
        await Promise.all(promiseArr);
        if(promiseArr.length > 0){
            //播放收集spine动画/同时刷新能量
            cc.find('Canvas/safe_node/node_energy').getComponent('RegalTiger_Energy').onEventRefushEnergy();
        }
    },

     //开始bonus游戏
     async startBonusGame(){
        this.lockJackpot();
        await this.awaitTime(1);
        await cc.vv.gameData.GetUIMgr().showBonusStartUI();
        this.setAnimationToBottom();
        this.setGraySymbol(true);
        this.createBonusToTop();
        await this.awaitTime(2);
        await this.playBonusStartSp();
    },

    //设置动画停止
    setAnimationToBottom(){
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 3;j++){
                sys[j].setAnimationToTop(false);
            }
        } 
    },

    //置灰符号
    setGraySymbol(isgray){
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 3;j++){
                sys[j].setGraySymbol(isgray);
            }
        } 
    },

    //生成bonus图标到顶层
    createBonusToTop(){
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 3;j++){
                if(sys[j].GetShowId()==12){
                    let aniNode = sys[j].setCoinToTop(true)
                    if(aniNode){
                        aniNode.active = true
                        let topShowNode = cc.find('coinburst',aniNode)
                        topShowNode.active = true
                        cc.vv.gameData.playSpine(topShowNode,'animation',false,()=>{
                            topShowNode.active = false;
                        });
                        let loopnode = cc.find('coinloop',aniNode)
                        loopnode.active = true
                        cc.vv.gameData.playSpine(loopnode,'animation',true,null);
                    }
                }
            }
        }
    },

    //复位coinTop
    resetBonusCoin(){
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 3;j++){
                sys[j].setCoinToTop(false)
            }
        }
    },

    //播放bonus开始动画
    async playBonusStartSp(){
        return new Promise((success)=>{
            Global.SlotsSoundMgr.playEffect('transition2');
            let bonusspnode = cc.find('Canvas/safe_node/screenani/startbonusspine');
            cc.vv.gameData.playSpine(bonusspnode,'animation',false,()=>{
                Global.SlotsSoundMgr.playBgm('bonus_bgm');
                bonusspnode.active = false;
                success();
            })
            this.scheduleOnce(()=>{
                cc.vv.gameData.GetUIMgr().showBonusUI(true);
            },1);
        })
    },



    //播放scatter动画
    playScatterAnimation(isplay){
        if(cc.vv.gameData.isTriggerNormalFree()){
            Global.SlotsSoundMgr.playEffect('scatter_trigger');
            //进入免费
            for(let i = 0; i < 5; i++){
                let sys = this._reels[i]._symbols
                for(let j = 0; j < 3;j++){
                    sys[j].playTriggerAnimation();
                }
            }
        }
    },

     //隐藏number
     hideNum(){
        for(let i = 0; i < 5; i++){
            let sys = this._reels[i]._symbols
            for(let j = 0; j < 4;j++){
                let multinode = cc.find('num',sys[j].node);
                if(multinode.active){
                    multinode.active = false;
                }
                cc.find('s30',sys[j].node).active = false;
                cc.find('s34',sys[j].node).active = false;
                cc.find('s38',sys[j].node).active = false;
            }
        }
    },

    async playBottomWin () {
        return new Promise((success)=>{
            let nWin = cc.vv.gameData.GetGameWin()
            let nTotal = nWin
            let updateAllCoin = true;
            if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()){
                nTotal = cc.vv.gameData.GetGameTotalFreeWin()
                updateAllCoin = cc.vv.gameData.GetFreeTime() == 0;
            }
            if(cc.vv.gameData.isBigMapSettlement()){
                nWin = cc.vv.gameData.getBigMapTotalWinCoin();
                nTotal = nWin;
                updateAllCoin = true;
            }
            this.ShowBottomWin(nWin,nTotal,updateAllCoin,()=>{
                success();
            });

        });
    },

    awaitTime (time) {
        return new Promise((success)=>{
            this.scheduleOnce(()=>{
                success()
            },time);
        });
    },

    ////////////能量免费游戏/////////////////////
     setMultile:function(){
        let energydata = cc.vv.gameData.getEnergyData();
        let lbl = cc.find('lbl_mul',this._midAni)
        lbl.getComponent(cc.Label).string = energydata.freeGame.addMult+'X';
    },

    //state:1 关 2 开 3 竹子
    showMidAni:function(nType){
        //如果非能量收集大关卡游戏直接返回
        if(!cc.vv.gameData.isBigMapFree())
            return;
        if(cc.vv.gameData.isTriggerMap())
            return;
        if(this._midAniState == nType)
            return;
        this.setMultile();
        let node_zu = cc.find('node_zu',this._midAni)
        let node_wild = cc.find('node_wild',this._midAni)
        let node_mul = cc.find('lbl_mul',this._midAni) 
        node_zu.active = false
        node_wild.active = false
        node_mul.active = false
        this._midAniState = nType;
        if(nType == 2){
            node_mul.active = true
            if(cc.vv.gameData.GetGameWin() > 0){    // 有赢钱
                cc.vv.gameData.playSpine(node_wild,'animation',true)
            }
            cc.vv.gameData.playSpine(node_zu,'animation3',false,()=>{
                this._midAniState = 0;
            })
            Global.SlotsSoundMgr.playEffect('bamboo_open');
        }
        else if(nType == 1){
            node_wild.active = false
            cc.vv.gameData.playSpine(node_zu,'animation1',false,()=>{
                this._midAniState = 0;
            })
        }
        
    },

    //地图大关游戏打开midani
    openMidAni(isopen){
        this._midAni.active = isopen;
        if(isopen){
            cc.vv.gameData.playSpine(cc.find('node_zu',this._midAni),'animation2',false)
        }
        this._reels[2].node.active = !isopen;
    },

    //奖池锁定(停止滚动)
    lockJackpot(){
        let bonusdata = cc.vv.gameData.GetBonusData();
        let poollist = bonusdata.poolList;
        let prizepool = cc.find('LMSlots_PrizePool',this.node.parent).getComponent("LMSlots_PrizePool_Base");
        prizepool.PausePool([{prizeType:0,pauseNum:poollist[0]},{prizeType:1,pauseNum:poollist[1]},
            {prizeType:2,pauseNum:poollist[2]},{prizeType:3,pauseNum:poollist[3]}]);
    },

    //复位奖池(继续滚动)
    resetJackpot(){
        let prizepool = cc.find('LMSlots_PrizePool',this.node.parent).getComponent("LMSlots_PrizePool_Base");
        prizepool.ResumePausePool();
    },

    //触发免费时备份数据
    backupCards(){
        this.Backup();
        this._bonusCardInfo = cc.vv.gameData.getBonusCardInfo();
    },

    //完成免费时还原数据
    resumeCards(){
        // this.hideNum();
        cc.vv.gameData.resetBounsCardInfo(this._bonusCardInfo);
        this.Resume();
    },

});
