
cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {
        _canStop : true,
        _leftTaList : [],
        _rightTaList : [],
        _triBonusSymbol : [],
        _triFreeSymbol : [],
    },

    Init(){
        this._spr_coins = cc.find("node_top/spr_coins", this.node);

        this._fly_coin = cc.find("fly_coin", this.node);
        this._fly_coin.active = false;

        this._spr_mask = cc.find("spr_mask", this.node);
        this._spr_mask.active = false;
        this._spine_jl2 = cc.find("Canvas/safe_node/base_jl2");
        this._spine_fanbei = cc.find("spine_fanbei", this.node);
        this._spine_jl1 = cc.find("spine_jl1", this.node);
        this._spine_jl2.active = false;
        this._spine_fanbei.active = false;
        this._spine_jl1.active = false;

        this._spr_ta_left = cc.find("node_top/spr_ta_left", this.node);
        this._spr_ta_right = cc.find("node_top/spr_ta_right", this.node);
        this._top_fly = cc.find("top_fly", this.node);

        this._super();
    },

    async ReconnectShow(){
        this._topScript.SetBackLobby(false);
        this._bottomScript.ShowBtnsByState("moveing_1");

        let bonusTrail = cc.vv.gameData.getBonusTrail();
        if(cc.vv.gameData.GetTotalFree() > 0){
            this.ShowGameview(true, bonusTrail.state === 2);
        } else {
            this.ShowGameview(false, false);
        }


        if(cc.vv.gameData.getJackpotGame()){
            await this.gainPickGame(false);
        }

        // 结束免费
        if (cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetFreeTime() == 0){
            await this.exitFreeGame();
        }


        this._topScript.StopMove();
        this._bottomScript.CanDoNextRound();
    },

    ReconnectNet(){
        if(this._stopTime > 0 && !this._gameInfo){  // 旋转中，未收到44返回
            this.ReconnectShow();
        }
        else if(cc.vv.gameData.getJackpotGame()){  // 小游戏中
            cc.vv.gameData.getPickScript().ReconnectNet();
        }
    },

    StartMove(){
        this._super();

        this._triBonusSymbol.splice(0,this._triBonusSymbol.length);
        this._triFreeSymbol.splice(0,this._triFreeSymbol.length);

        Global.SlotsSoundMgr.playNormalBgm();
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
            stateInfo.stopIdx = 0;
            stateInfo.antIdx = 0;
            let stopCnt = 0;
            let antCnt = 0;

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
                    stateInfo.antIdx = antCnt
                    antCnt += 1;
                }
                let reelCountOfID = reelRes.reduce((a, v) => stateInfo.id.includes(v) ? a + 1 : a + 0, 0);
                haveCount +=  reelCountOfID
                countsConfig.shift()
                let remainingCount = (countsConfig.length > 0 ? countsConfig.reduce((x,y)=>x+y):0) + haveCount
                if (reelCountOfID > 0 && remainingCount >= triggerCount && isContinuous) {  //满足条件 播放停止动画和停止音效
                    stateInfo.isStop = true
                    stateInfo.stopIdx = stopCnt
                    stopCnt += 1;
                }
                if (stateInfo.continuous && stateInfo.counts[i] > 0 && reelCountOfID == 0) {
                    isContinuous = false
                }
                item.AddReelStateInfo(Global.copy(stateInfo))
            }
        }
    },

    OnReelSpinEnd(colIdx){
        for (let row = 0; row < this._row; row++){
            let symbol = this._reels[colIdx].GetSymbolByRow(row);

            if(symbol){
                if(symbol.GetShowId() == 3){
                    symbol.playBonusBgGuangAnim(true, "bonus");
                } else if(symbol.GetShowId() == 301){
                    symbol.playBonusBgGuangAnim(true, "special");
                }
            }
        }
    },

    OnSpinEnd(){
        this.onSpinEndAction();
    },

    async onSpinEndAction(){

        if(this._gameInfo.bonusInfo){
            await this.playBonusItemAnim();
        }

        // 显示中奖路线
        this.ShowWinTrace()
        // 显示底部赢钱
        let nWin = cc.vv.gameData.GetGameWin()
        let nTotal = nWin
        if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()){
            nTotal = cc.vv.gameData.getFreeWinCoin()
        }
        await new Promise((success, failed)=>{
            this.ShowBottomWin(nWin,nTotal,true,function () {
                success();
            })
        });

        // 赢得pick游戏
        if(this._gameInfo.jackpotGame){
            await this.gainPickGame(true);
        }

        // 获得免费
        if(this._gameInfo.freeResult && this._gameInfo.freeResult.freeInfo && this._gameInfo.freeResult.freeInfo.freeCnt > 0){
            await this.gainFreeGame(this._gameInfo.bonusTrail.state === 2);
        }

        // 结束免费
        if(this._gameInfo.allFreeCnt>0 && this._gameInfo.freeCnt==0){
            await this.exitFreeGame();
        }

        this.CanDoNextRound();
    },


    // 获得pick游戏
    gainPickGame(isTri){
        return new Promise(async(success, failed)=> {
            if(isTri){
                if(this._triBonusSymbol.length > 0){
                    let idxs = this._gameInfo.bonusInfo.idxs;
                    if (idxs){
                        for (let i = 0; i < idxs.length; i++){
                            this.GetSymbolByIdx(idxs[i]).playBonusBgGuangAnim(false);
                        }
                    }
                    for (let i = 0; i < this._triBonusSymbol.length; i++){
                        this._triBonusSymbol[i].symbol.playBonusTriAnim(this._triBonusSymbol[i].type);
                    }
                    Global.SlotsSoundMgr.playEffect("pick_trigger");
                    await cc.vv.gameData.awaitTime(2);
                }

                await cc.vv.gameData.getPopupScript().playTriPickAnim();
                cc.vv.gameData.getPopupScript().playQPMen();
                await cc.vv.gameData.awaitTime(2);
            }

            await cc.vv.gameData.getPickScript().gainPickGame(isTri);

            success();
        });
    },

    // 获得免费游戏
    gainFreeGame(bSuper){
        return new Promise(async(success, failed)=>{
            Global.SlotsSoundMgr.playEffect("bell");
            let isFirstTri = this._gameInfo.freeCnt === this._gameInfo.allFreeCnt;

            let result = this._gameInfo.freeResult
            if(result && result.freeInfo && result.freeInfo.scatterIdx){        // 三个scatter触发
                let idxs = result.freeInfo.scatterIdx;
                let list = []
                for (let i = 0; i < idxs.length; i++) {
                    let symbol = this.GetSymbolByIdx(idxs[i]);
                    if(symbol){
                        symbol.playTriggerAnimation()
                        list.push(symbol);
                    }
                }
                if(isFirstTri) {
                    await cc.vv.gameData.getCollectScript().playGainItemAnim(list);
                }

                await cc.vv.gameData.awaitTime(2);
                await cc.vv.gameData.getPopupScript().playTriFreeAnim(result.freeInfo.freeCnt, bSuper, isFirstTri);
            }

            let powerUpCnt;
            if(this._triFreeSymbol.length > 0){
                let idxs = this._gameInfo.bonusInfo.idxs;
                if (idxs){
                    for (let i = 0; i < idxs.length; i++){
                        this.GetSymbolByIdx(idxs[i]).playBonusBgGuangAnim(false);
                    }
                }

                let list = [];
                for (let i = 0; i < this._triFreeSymbol.length; i++){
                    if(this._triFreeSymbol[i].type == "free"){
                        list.push(this._triFreeSymbol[i].symbol);
                        this._triFreeSymbol[i].symbol.playBonusTriAnim(this._triFreeSymbol[i].type, result.freeInfo.freeCnt);
                    }else {
                        this._triFreeSymbol[i].symbol.playBonusTriAnim(this._triFreeSymbol[i].type);
                    }
                }

                if(isFirstTri){
                    await cc.vv.gameData.getCollectScript().playGainItemAnim(list);
                }

                await cc.vv.gameData.awaitTime(2);
                let freeInfo = this._gameInfo.bonusInfo.freeInfo;
                powerUpCnt = freeInfo.powerUpCnt;
                await cc.vv.gameData.getPopupScript().playTriFreeAnim(freeInfo.freeCnt, bSuper, isFirstTri, freeInfo.powerUpCnt);
            }

            if(isFirstTri){
                this.Backup();
                // if(bSuper){
                //     cc.vv.gameData.getPopupScript().playQPFalao();
                // }else {
                    cc.vv.gameData.getPopupScript().playQPJzt();
                // }
            }

            this.removeAllFlyNode(false);
            this.ShowGameview(true, bSuper);
            await cc.vv.gameData.awaitTime(2);

            let idxs = this._gameInfo.removeSymbols;
            if(isFirstTri){
                await cc.vv.gameData.getPopupScript().playDelSymFree(idxs, powerUpCnt?powerUpCnt:0);

                this._canStop = false;
                success();

                await cc.vv.gameData.awaitTime(0.5)
                Global.SlotsSoundMgr.playEffect("coin_fg");
                this._spine_jl1.active = true;
                this._spine_jl1.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
                this._spr_mask.active = true;

                await cc.vv.gameData.awaitTime(2);
                this._spine_jl1.active = false;
                this._spr_mask.active = false;
                Global.SlotsSoundMgr.playEffect("free_open");
                await cc.vv.gameData.awaitTime(2);
                this._canStop = true;
            }else {
                success();
            }
        });
    },

    // 结束免费
    exitFreeGame(){
        return new Promise(async(success, failed)=> {

            let winCoin = cc.vv.gameData.getFreeWinCoin();
            await cc.vv.gameData.getPopupScript().playEndFreeAnim(winCoin);
            cc.vv.gameData.getPopupScript().playQPJzt();
            this.Resume();
            this.ShowGameview(false, false);

            if(this._gameInfo.bonusTrail.state === 2){
                cc.vv.gameData.getCollectScript().initItems();
            }

            Global.SlotsSoundMgr.stopBgm();
            await cc.vv.gameData.awaitTime(2);
            await new Promise((success, failed)=>{
                this.ShowBottomWin(winCoin,winCoin,true,function () {
                    success();
                })
            });

            success()
        });
    },



    // bonus图标动画
    playBonusItemAnim(){
        return new Promise(async(success, failed)=>{
            let bonusIdxs = this._gameInfo.bonusInfo.idxs;
            let bonusItems = this._gameInfo.bonusInfo.items;

            let specailIdxs = this._gameInfo.bonusInfo.specailIdxs;
            let specailItems = this._gameInfo.bonusInfo.specailItems;

            let idxs = bonusIdxs.concat(specailIdxs);
            idxs.sort(function (a, b) {
                return (a-1)%5 - (b-1)%5
            }).sort(function (a, b) {
                return (a/5+(a-1)%5) - (b/5+(b-1)%5)
            });

            let remainIdxs = []
            let superCoinIdx = []
            for (let i = 0; i < idxs.length; i++){
                let idx = idxs[i];
                let data;
                if(bonusIdxs.includes(idx)){
                    data = bonusItems[bonusIdxs.indexOf(idx)];
                }else {
                    data = specailItems[specailIdxs.indexOf(idx)];
                }

                let symbol = this.GetSymbolByIdx(idx);
                if (data.coin){ // 金币   -- 直接显示
                    Global.SlotsSoundMgr.playEffect("coin_turn1");

                    let newData = Global.copy(data)
                    if(cc.vv.gameData.isSuperGame()){
                        newData.coin = data.coin/5;
                        superCoinIdx.push(idx)
                    }

                    symbol.playAddCoinAnim(newData)
                    await cc.vv.gameData.awaitTime(0.5);
                    await this.flyBonusSymbol(symbol.node);
                }else {
                    if(i === idx.length-1 && remainIdxs.length === 0){
                        await this.playSpecialBonus(data, symbol);
                    } else {
                        Global.SlotsSoundMgr.playEffect("coin_active");
                        symbol.playBonusAwaitAnim();
                        if(data.jackpotBonus || data.freeCnt){
                            remainIdxs.unshift(idx);
                        }else {
                            remainIdxs.push(idx);
                        }
                        await cc.vv.gameData.awaitTime(0.5);
                    }
                }
            }

            for (let i = 0; i < remainIdxs.length; i++){
                let idx = remainIdxs[i];
                let data;
                if(bonusIdxs.includes(idx)){
                    data = bonusItems[bonusIdxs.indexOf(idx)];
                }else {
                    data = specailItems[specailIdxs.indexOf(idx)];
                }
                let symbol = this.GetSymbolByIdx(idx);
                await this.playSpecialBonus(data, symbol);
            }


            if(cc.vv.gameData.isSuperGame() && superCoinIdx.length > 0){
                Global.SlotsSoundMgr.playEffect("coin_increase");

                this.playBoostJlAnim(2);
                await cc.vv.gameData.awaitTime(1);

                for (let i = 0; i < superCoinIdx.length; i++){
                    let idx = superCoinIdx[i];
                    let data;
                    if(bonusIdxs.includes(idx)){
                        data = bonusItems[bonusIdxs.indexOf(idx)];
                    }else {
                        data = specailItems[specailIdxs.indexOf(idx)];
                    }

                    let symbol = this.GetSymbolByIdx(idx);
                    if (data.coin){ // 金币

                        symbol.playAddCoinAnim(data)
                    }
                }
                await cc.vv.gameData.awaitTime(1);
            }

            success();
        });
    },

    // 非金币图标
    playSpecialBonus(data, symbol){
        return new Promise(async(success, failed)=>{
            Global.SlotsSoundMgr.playEffect("coin_turn2");

            if(data.jackpotBonus){
                this._triBonusSymbol.push({symbol:symbol, type:"jackpot"});
                symbol.playBonusWin("jackpot");
                await cc.vv.gameData.awaitTime(0.6);
                await this.flyBonusToTa(symbol, false, "animation_1");
            }
            else if(data.freeCnt){
                this._triFreeSymbol.push({symbol:symbol, type:"free"});
                symbol.playBonusWin("free",data.freeCnt);
                await cc.vv.gameData.awaitTime(1);
                let animName = cc.js.formatStr("animation%s_1", data.freeCnt);
                await this.flyBonusToTa(symbol, true, animName);
            }
            else if(data.type){
                if(data.type === 1){ // coinBoost,  -- 金币增加1x
                    symbol.playBonusWin("coin");
                    await cc.vv.gameData.awaitTime(1);
                    this.playBoostJlAnim(1);
                    await cc.vv.gameData.awaitTime(1);

                    await this.bonusAddCoin(data.mult);
                    await cc.vv.gameData.awaitTime(1);
                } else if(data.type === 2){ // megaCoinBoost,  -- 金币增加2x
                    symbol.playBonusWin("megaCoin");
                    await cc.vv.gameData.awaitTime(1);
                    this.playBoostJlAnim(1);
                    await cc.vv.gameData.awaitTime(1);
                    await this.bonusAddCoin(data.mult);
                    await cc.vv.gameData.awaitTime(1);
                } else if(data.type === 3){ // superCoinBoost,  -- 金币增加3x
                    symbol.playBonusWin("superCoin");
                    await cc.vv.gameData.awaitTime(1);
                    this.playBoostJlAnim(1);
                    await cc.vv.gameData.awaitTime(1);
                    await this.bonusAddCoin(data.mult);
                    await cc.vv.gameData.awaitTime(1);
                } else if(data.type === 4){ // powerUp
                    this._triBonusSymbol.push({symbol:symbol, type:"powerUp"});
                    this._triFreeSymbol.push({symbol:symbol, type:"powerUp"});
                    symbol.playBonusWin("powerUp");
                    await cc.vv.gameData.awaitTime(1);
                    this.flyBonusToTa(symbol, !this._gameInfo.jackpotGame, "animation_1");
                }

                await cc.vv.gameData.awaitTime(1);
            }

            success();
        })
    },

    playBoostJlAnim(type){
        let eff = "boost_man";
        let fanbeiAnim = "animation2"
        if(type == 2){
            eff = "super_man";
            fanbeiAnim = "animation1"
        }

        Global.SlotsSoundMgr.playEffect(eff);
        this._spine_jl2.active = true;
        this._spine_fanbei.active = true;
        let self  = this;
        this._spine_jl2.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
        this._spine_fanbei.getComponent(sp.Skeleton).setAnimation(0, fanbeiAnim, false);
        this._spine_fanbei.getComponent(sp.Skeleton).setCompleteListener(()=>{
            self._spine_fanbei.active = false;
        })
    },

    // bonus金币飞到金币对堆
    flyBonusSymbol(s_node){
        return new Promise((success, failed)=>{
            let flyNode = cc.instantiate(this._fly_coin);
            flyNode.parent = this._top_fly;
            flyNode.active = true;

            let startPos =  this._top_fly.convertToNodeSpaceAR(s_node.convertToWorldSpaceAR(cc.v2(0,0)));
            let endPos =  this._top_fly.convertToNodeSpaceAR(this._spr_coins.convertToWorldSpaceAR(cc.v2(0,0)));

            flyNode.position = startPos;
            flyNode.getComponent(sp.Skeleton).setAnimation(0, "animation_1", false);
            cc.tween(flyNode)
                .to(0.6, {position:endPos})
                .delay(0.4)
                .call(()=>{
                    flyNode.destroy();
                    success();
                })
                .start()
        })
    },

    // 图标飞到塔上  isLeft-左边那个
    flyBonusToTa(symbol, isLeft, animName){
        return new Promise((success, failed)=> {
            Global.SlotsSoundMgr.playEffect("feature_fly");

            let flyNode = cc.instantiate(symbol.getShowNode());

            flyNode.active = true;
            flyNode.parent = this._top_fly;

            let endNode;
            if(isLeft){
                endNode = cc.find(cc.js.formatStr("spr_%s", (this._leftTaList.length+1)), this._spr_ta_left);
            } else {
                endNode = cc.find(cc.js.formatStr("spr_%s", (this._rightTaList.length+1)), this._spr_ta_right);
            }

            let startPos = this._top_fly.convertToNodeSpaceAR(symbol.node.convertToWorldSpaceAR(cc.v2(0, 0)));
            let endPos = this._top_fly.convertToNodeSpaceAR(endNode.convertToWorldSpaceAR(cc.v2(0, 0)));

            flyNode.position = startPos;
            flyNode.getComponent(sp.Skeleton).setAnimation(0, animName, false);
            cc.tween(flyNode)
                .to(0.6, {position: endPos})
                .delay(0.4)
                .call(() => {
                    // flyNode.destroy();
                    if(isLeft){
                        this._leftTaList.push(flyNode)
                    } else {
                        this._rightTaList.push(flyNode)
                    }
                    success();
                })
                .start()
        })
    },

    async bonusAddCoin(mult){
        Global.SlotsSoundMgr.playEffect("coin_increase");

        let idxs = this._gameInfo.bonusInfo.idxs;
        let items = this._gameInfo.bonusInfo.items;

        for (let i = 0; i < idxs.length; i++){
            let idx = idxs[i];
            let data = items[idxs.indexOf(idx)];
            if(data.coin){
                let symbol = this.GetSymbolByIdx(idx);
                symbol.playAddCoinAnim(data, mult);

            }
        }
    },

    showTaSpr(bShow){
        for (let i = 0; i < this._spr_ta_left.childrenCount; i++){
            this._spr_ta_left.children[i].active = bShow;
        }
        for (let i = 0; i < this._spr_ta_right.childrenCount; i++){
            this._spr_ta_right.children[i].active = bShow;
        }
    },

    removeAllFlyNode(){
        this._top_fly.removeAllChildren();
        this._leftTaList.splice(0, this._leftTaList.length);
        this._rightTaList.splice(0, this._rightTaList.length);
    },


    //显示游戏界面：bFree true显示免费模式的界面，false 普通模式
    ShowGameview:function(bFree, bSuper){
        cc.vv.gameData.setIsSuper(bSuper);
        if(!bSuper){
            cc.vv.gameData.setIsFree(bFree);
        }

        cc.find("node_free_tit", this.node).active = bFree;

        if(bFree){
            let total = cc.vv.gameData.GetTotalFree()
            let rest = cc.vv.gameData.GetFreeTime()

            //显示免费次数
            this._bottomScript.ShowFreeModel(true,total-rest,total)
            let nTotal = cc.vv.gameData.GetTotalFreeWin()
            this._bottomScript.SetWin(nTotal)

            let bgm = bSuper ? "sb_bgm" : "fg_bgm";
            Global.SlotsSoundMgr.playBgm(bgm);
            cc.find("node_free_tit/spr_free", this.node).active = !bSuper;
            cc.find("node_free_tit/spr_super", this.node).active = bSuper;
        }
        else{
            this._bottomScript.ShowFreeModel(false)
        }

        //可能还需要显示免费背景图
        let normalBg = cc.find("Canvas/safe_node/spr_bg_normal")
        let normalFree = cc.find("Canvas/safe_node/spr_bg_free")
        let superFree = cc.find("Canvas/safe_node/spr_bg_super")
        if(normalFree){ //存在免费游戏背景才执行下面的逻辑
            if(normalBg){
                normalBg.active = !bFree
            }
            superFree.active = bSuper;
            if(!bSuper){
                normalFree.active = bFree
            }
        }
    },


    //如果收到结果不需要里面进入停止节奏，可通过重写此接口来实现自己控制
    //默认是收到结果就停止
    CanStopSlot(){
        return this._gameInfo != null && this._canStop;
    },

    // update (dt) {},
});
