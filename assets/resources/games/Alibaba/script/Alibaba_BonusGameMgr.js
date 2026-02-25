
cc.Class({
    extends: cc.Component,

    properties: {
        _bonusId:3,
        _canTouchAddSpin: false,
    },

    Init () {
        this._bonusId = 3;

        this._mainNode = cc.find('mainnode',this.node);
        this._mainNode.active = false;

        this._topSlotsScript = cc.find('slots_top',this._mainNode).addComponent('Alibaba_BonusSlots');
        this._bottomSlotsScript = cc.find('slots',this._mainNode).addComponent('Alibaba_BonusSlots');
        this._topType = 1;
        this._bottomType = 2;
        this._topSlotsScript.Init(this._topType);
        this._bottomSlotsScript.Init(this._bottomType);

        this._slots_top = cc.find("slots_top", this._mainNode);
        this._slots_bottom = cc.find("slots", this._mainNode);

        if(!this._symbolTemplete){
            this._symbolTemplete = cc.vv.gameData.GetPrefabByName("symbol");
            if(this._symbolTemplete){
                this._symbolTemplete.optimizationPolicy = cc.Prefab.OptimizationPolicy.MULTI_INSTANCE
            }
        }
    },

    getWinCoin() {
        return this._winCoin;
    },

    // 断网重连
    ReconnectNet(bonusGame){
        if(!this._bRecevMsg){   // 开始旋转/选择额外次数，发送了消息但没收到消息，则重连
            this.showBonusGame(bonusGame,true);
        }
        // if(this._subGameData && this._subGameData.spinCnt <= 0){    // 结算
        //
        // } else {
        //     this.showBonusGame(bonusGame,true);
        // }
    },

    // 断线回到bonus游戏
    async showBonusGame(bonusGame, bReconnect=false){
        return new Promise(async (success, failed) => {

            this._bReconnect = bReconnect;
            cc.vv.gameData.setIsBonusGame(true);

            this._subGameData = bonusGame;
            this._bRecevMsg = true;
            // let state = bonusdata.state;
            if (this._subGameData.state === 1) { //2: spin完之后，选择额外spin次数
                await this.showBonusGameUI();

                await this.addSpins();
                // this._subGameData = cc.vv.gameData.getBonusGame();

                this._curCnt = this._subGameData.totalSpinCnt - this._subGameData.spinCnt;
                this._totalCnt = this._subGameData.totalSpinCnt;

            } else if (this._subGameData.state === 0) { //0: 正常bonus游戏,
                await this.showBonusGameUI();
            }

            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playBgm("respinbgm");
            // 开始旋转
            this.reqSpine();

            if(!bReconnect){
                this._callBack = success;
            } else {
                success();
            }
        })
    },

    // 结束bonus游戏
    async endBonusGame(){
        AppLog.log('###bonus游戏结束');
        cc.find("spin", this._mainNode).active = false;
        await cc.vv.gameData.awaitTime(1);
        cc.find("repeater_feature_prize", this._mainNode).active = false;

        let result_node = cc.find("result_node", this._mainNode);
        result_node.active = true;
        let winCoin = cc.find("winCoin", result_node);
        winCoin.getComponent(cc.Label).string = "0";

        await this.collectSlotsCoin();

        if(this._callBack){
            Global.SlotsSoundMgr.stopBgm();
            cc.vv.gameData.setIsBonusGame(false);
            this._winCoin = this._subGameData.winCoin;
            this._callBack();
            this._callBack = null;
            this._subGameData = null;
        }
    },

    // 显示bonus游戏
    async showBonusGameUI( ){
        return new Promise(async(success, failed)=>{
            this._mainNode.active = true;
            let result_node = cc.find("result_node", this._mainNode);
            result_node.active = false;
            // this.lockJackpot(this._subGameData.jackpotValues);

            this._totalCnt = this._subGameData.totalSpinCnt;
            this._curCnt = this._subGameData.totalSpinCnt - this._subGameData.spinCnt;
            cc.find("spin/curTimes", this._mainNode).getComponent(cc.Label).string = this._curCnt;
            cc.find("spin/allTimes", this._mainNode).getComponent(cc.Label).string = this._totalCnt;

            await this.showBonusSlotsUI();

            success();
        })
    },

    // 初始显示slots
    async showBonusSlotsUI(){
        return new Promise(async(success, failed) => {
            this._bottomSlotsScript.initAllSymbol();
            this._topSlotsScript.initAllSymbol();

            let repeater_feature_prize = cc.find("repeater_feature_prize", this._mainNode);
            let spin = cc.find("spin", this._mainNode);

            if (this._curCnt === 0 && !this._bReconnect) {
                cc.find("spin/curTimes", this._mainNode).getComponent(cc.Label).string = "1";
                repeater_feature_prize.active = true;
                repeater_feature_prize.y = -150;
                this._topSlotsScript.node.y = -416;
                spin.active = false;

                cc.find("repeater_feature_prize/coin", this._mainNode).getComponent(cc.Label).string = "";
                let bonusIdxs = this._subGameData.slots[1].bonusIdxs;
                let bonusItems = this._subGameData.slots[1].bonusItems;
                for (let i = 0; i < bonusIdxs.length; i++) {
                    let symbol = this._bottomSlotsScript.GetSymbolByIdx(bonusIdxs[i]);
                    let data = bonusItems[i];
                    symbol.ShowById(cc.vv.gameData.getGameCfg().bonusId, data);
                }

                await cc.vv.gameData.awaitTime(2);

                let coin = 0;
                for (let i = 0; i < bonusIdxs.length; i++) {
                    let symbol = this._bottomSlotsScript.GetSymbolByIdx(bonusIdxs[i]);
                    let data = bonusItems[i];
                    if (data.coin) {
                        coin += data.coin;
                    } else if (data.jackpot) {
                        coin += data.jackpot.value;
                    }

                    let startPos = symbol.node.convertToWorldSpaceAR(cc.v2(0, 0));
                    startPos = this.node.parent.convertToNodeSpaceAR(startPos);
                    let endPos = cc.find("repeater_feature_prize/coin", this._mainNode).convertToWorldSpaceAR(cc.v2(0, 0));
                    endPos = this.node.parent.convertToNodeSpaceAR(endPos);
                    Global.SlotsSoundMgr.playEffect("bgrepeater");
                    let particle = cc.instantiate(cc.find("particle_fly", this.node.parent));
                    particle.parent = this.node.parent;
                    particle.position = startPos;
                    particle.active = true;
                    cc.tween(particle)
                        .to(0.5, {position: endPos})
                        .call(()=>{
                            cc.find("repeater_feature_prize/coin", this._mainNode).getComponent(cc.Label).string =
                                Global.FormatNumToComma(coin);

                            // cc.vv.AudioManager.playEff("games/Alibaba/", "music_ChilliFiesta_bonusCollectBuling", true);
                            let effect = cc.find("repeater_feature_prize/baozha", this._mainNode);
                            effect.active = true;
                            effect.getComponent(sp.Skeleton).setAnimation(0, "baozha", false);
                            effect.getComponent(sp.Skeleton).setCompleteListener(()=>{
                                effect.getComponent(sp.Skeleton).setCompleteListener(null);
                                effect.active = false;
                            })
                        })
                        .removeSelf()
                        .start();

                    await cc.vv.gameData.awaitTime(0.5);
                }

                Global.SlotsSoundMgr.playEffect("bgup");
                cc.tween(this._topSlotsScript.node)
                    .by(1, {y: 380})
                    .start();
                cc.tween(repeater_feature_prize)
                    .by(1, {y: 380})
                    .start();

                await cc.vv.gameData.awaitTime(1.5);

                for (let i = 0; i < bonusIdxs.length; i++) {
                    let symbol = this._bottomSlotsScript.GetSymbolByIdx(bonusIdxs[i]);
                    let data = bonusItems[i];
                    let startPos = symbol.node.convertToWorldSpaceAR(cc.v2(0, 0));
                    startPos = this.node.parent.convertToNodeSpaceAR(startPos);

                    let endSymbol = this._topSlotsScript.GetSymbolByIdx(bonusIdxs[i]);

                    Global.SlotsSoundMgr.playEffect("BGGoldUp");
                    let spine = cc.instantiate(cc.find("Gold_fly", this.node.parent));
                    spine.parent = this.node.parent;
                    spine.position = startPos;
                    spine.active = true;
                    spine.getComponent(sp.Skeleton).setAnimation(0, "Gold_fly", false);
                    spine.getComponent(sp.Skeleton).setCompleteListener(()=>{
                        spine.removeFromParent();
                    });

                    await cc.vv.gameData.awaitTime(1);
                    endSymbol.ShowById(cc.vv.gameData.getGameCfg().bonusId, data);
                }

                spin.active = true;
                await cc.vv.gameData.awaitTime(0.5);
                success();
            } else {
                repeater_feature_prize.active = true;
                repeater_feature_prize.y = 230;
                this._topSlotsScript.node.y = -36;
                spin.active = true;

                let bonusIdxs = this._subGameData.slots[0].bonusIdxs;
                let bonusItems = this._subGameData.slots[0].bonusItems;
                for (let i = 0; i < 15; i++) {
                    let symbol = this._topSlotsScript.GetSymbolByIdx(i + 1);
                    if (bonusIdxs.indexOf(i + 1) !== -1) {
                        let data = bonusItems[bonusIdxs.indexOf(i + 1)];
                        symbol.ShowById(cc.vv.gameData.getGameCfg().bonusId, data);
                    } else {
                        symbol.ShowRandomSymbol();
                    }
                }

                bonusIdxs = this._subGameData.slots[1].bonusIdxs;
                bonusItems = this._subGameData.slots[1].bonusItems;
                for (let i = 0; i < 15; i++) {
                    let symbol = this._bottomSlotsScript.GetSymbolByIdx(i + 1);
                    if (bonusIdxs.indexOf(i + 1) !== -1) {
                        let data = bonusItems[bonusIdxs.indexOf(i + 1)];
                        symbol.ShowById(cc.vv.gameData.getGameCfg().bonusId, data);
                    } else {
                        symbol.ShowRandomSymbol();
                    }
                }

                cc.find("repeater_feature_prize/coin", this._mainNode).getComponent(cc.Label).string =
                    Global.FormatNumToComma(this._subGameData.baseCoin);

                success();
            }
        });
    },

    //收集按slots从上到下收集
    async collectSlotsCoin(){
        return new Promise(async(success)=>{
            let coin = 0;
            for (let i = 0; i < this._subGameData.slots.length; i++) {
                // let slot = this._subGameData.slots[i];
                let script = i === 0 ? this._topSlotsScript : this._bottomSlotsScript;
                let endPos = cc.find("result_node/winCoin", this._mainNode).convertToWorldSpaceAR(cc.v2(0, 0));
                endPos = this.node.parent.convertToNodeSpaceAR(endPos);
                for (let j = 0; j < 15; j++) {
                    let symbol = script.GetSymbolByIdx(j + 1);
                    if (symbol.GetShowId() !== cc.vv.gameData.getGameCfg().bonusId) {
                        continue;
                    }
                    if (symbol.GetData().jackpot) {
                        Global.SlotsSoundMgr.playEffect("JPcount");
                    } else {
                        Global.SlotsSoundMgr.playEffect("respinnumber");
                    }


                    let startPos = symbol.node.convertToWorldSpaceAR(cc.v2(0, 0));
                    startPos = this.node.parent.convertToNodeSpaceAR(startPos);

                    let particle = cc.instantiate(cc.find("particle_fly", this.node.parent));
                    particle.parent = this.node.parent;
                    particle.position = startPos;
                    particle.active = true;
                    cc.tween(particle)
                        .to(0.5, {position: endPos})
                        .call(()=>{
                            if (symbol.GetData().isGold) {
                                coin += symbol.GetData().coin;
                            } else if (symbol.GetData().jackpot) {
                                coin += symbol.GetData().jackpot.value;
                            } else {
                                coin += symbol.GetData().coin;
                            }

                            cc.find("result_node/winCoin", this._mainNode).getComponent(cc.Label).string =
                                Global.FormatNumToComma(coin);

                            let effect = cc.find("result_node/baozha", this._mainNode);
                            this.playAnimationOnce(effect, "baozha");
                        })
                        .removeSelf()
                        .start();

                    await cc.vv.gameData.awaitTime(0.5);
                }
            }
            success();
        })
    },

    //奖池锁定(停止滚动)
    lockJackpot(jackpotvalus){
        let prizepool = cc.find('LMSlots_PrizePool2',this._mainNode).getComponent("LMSlots_PrizePool_Base");
        prizepool.PausePool([{prizeType:0,pauseNum:jackpotvalus[0]},{prizeType:1,pauseNum:jackpotvalus[1]},
            {prizeType:2,pauseNum:jackpotvalus[2]},{prizeType:3,pauseNum:jackpotvalus[3]},{prizeType:4,pauseNum:jackpotvalus[4]}]);
    },


    //点击开始移动
    startSpin(){

    },

    //显示结果
    showSpinResult(){

    },

    //返回51请求结果
    getSubGameData(){
        return this._subGameData;
    },

    //旋转停止
    spinEnd(){
        
    },

    // OnReelSpinEnd(colIdx){
        // this._bottomSlotsScript.OnSlotsSpinEnd(colIdx);
        // this._topSlotsScript.OnSlotsSpinEnd(colIdx);
    // },

    //bonus游戏旋转结果请求
    async reqSpine(){
        cc.log(cc.js.formatStr("startMove:%s, %s", this._curCnt, this._totalCnt));

        this._curCnt += 1
        cc.find("spin/curTimes", this._mainNode).getComponent(cc.Label).string = this._curCnt;
        cc.find("spin/allTimes", this._mainNode).getComponent(cc.Label).string = this._totalCnt;
        this._topSlotsScript.StartMove(this._subGameData.slots[0].bonusIdxs);
        this._bottomSlotsScript.StartMove(this._subGameData.slots[1].bonusIdxs);
        this._bRecevMsg = false;

        await cc.vv.gameData.awaitTime(1);
        let reqdata = {rtype:3};
        let result = await cc.vv.gameData.reqSubGame(reqdata);
        if(result.code === 200 && !result.spcode){
            this._bRecevMsg = true;
            this._subGameData = result.data.bonusGame;
            // cc.vv.gameData.setBonusGame(this._subGameData);

            this._bottomSlotsScript.setSpinResult(this._subGameData.slots[1].bonusIdxs, this._subGameData.slots[1].bonusItems);
            this._topSlotsScript.setSpinResult(this._subGameData.slots[0].bonusIdxs, this._subGameData.slots[0].bonusItems);
        }
    },

    //点击停止按钮调用
    StopMove:function(){
        this._topSlotsScript.StopMove();
        this._bottomSlotsScript.StopMove();
    },

    async OnSpinEnd(){
        cc.log("OnSpinEnd")

        // let bonusdata = cc.vv.gameData.getBonusGame();
        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
        // this.bonusGameHandle(bonusdata);

        await this.triggerGetDiamond();

        if(this._subGameData.state === 1){
            //state未表示需要添加spin界面
            await this.addSpins();

            this._curCnt = this._subGameData.totalSpinCnt - this._subGameData.spinCnt;
            this._totalCnt = this._subGameData.totalSpinCnt;
            this.reqSpine();
        }else{
            //此处进入bonus游戏后 不会调用
            if(this._subGameData.spinCnt > 0){
                await cc.vv.gameData.awaitTime(1);
                this.reqSpine();
            }else{
                Global.SlotsSoundMgr.stopBgm();
                Global.SlotsSoundMgr.playEffect("bgend");
               this.endBonusGame();
            }
        }
    },

    async addSpins() {
        return new Promise((success)=>{
            Global.SlotsSoundMgr.playEffect("bgadd");

            let add_spin_node = cc.find("add_spin_node", this._mainNode);
            add_spin_node.active = true;

            // let guochang = cc.find("guochang", add_spin_node);
            // guochang.active = true;
            // guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_in", false);

            let mainnode = cc.find("mainnode", add_spin_node);
            mainnode.scale = 0;
            mainnode.active = true;
            cc.tween(mainnode)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .call(()=>{
                    this._canTouchAddSpin = true;
                })
                .start();

            let func = async (i)=> {
                if (!this._canTouchAddSpin) {
                    return;
                }

                Global.SlotsSoundMgr.playEffect("bgaddselect");
                this._canTouchAddSpin = false;

                this._bRecevMsg = false;
                let reqdata = {rtype:2,choiceId:i};
                let result = await cc.vv.gameData.reqSubGame(reqdata);
                let resultData = result.data;
                if (result.code === 200 && result.data.rtype === 2) {
                    this._bRecevMsg = true;
                    this._subGameData = resultData.bonusGame;
                    let selectNumber = cc.find("number" + resultData.choiceId, mainnode);
                    let zhadan = cc.find("zhadan", selectNumber);
                    zhadan.getComponent(sp.Skeleton).setAnimation(0, "click", false);

                    await cc.vv.gameData.awaitTime(1.5);

                    let resultNode = cc.find("result", selectNumber);
                    resultNode.active = true;
                    resultNode.getComponent("ImgSwitchCmp").setIndex((resultData.extraSpins[resultData.choiceId - 1] - 1) * 2);

                    await cc.vv.gameData.awaitTime(0.5);

                    for (let j = 1; j < 4; j++) {
                        if (j !== resultData.choiceId) {
                            let unselectNumber = cc.find("number" + j, mainnode);
                            let unzhadan = cc.find("zhadan", unselectNumber);
                            let unresult = cc.find("result", unselectNumber);
                            unzhadan.active = false;
                            unresult.active = true;
                            unresult.getComponent("ImgSwitchCmp").setIndex((resultData.extraSpins[j - 1] - 1) * 2 + 1);
                        }
                    }

                    await cc.vv.gameData.awaitTime(1);

                    add_spin_node.active = false;
                    success();
                }
            }
            let randomIdx = Global.random(1,3)
            cc.vv.gameData.checkAutoPlay(cc.find("number" + randomIdx, mainnode),  function (){func(randomIdx)});

            for (let i = 1; i < 4; i++) {
                let number = cc.find("number" + i, mainnode);
                cc.find("zhadan", number).active = true;
                cc.find("zhadan", number).getComponent(sp.Skeleton).setAnimation(0, "idle", true);
                cc.find("result", number).active = false;

                number.off(cc.Node.EventType.TOUCH_END);
                number.on(cc.Node.EventType.TOUCH_END, async ()=>{
                    cc.find("number" + randomIdx, mainnode).stopAllActions();
                    func(i);

                });
            }
        });
    },

    playAnimationOnce(node, animationName, callback) {
        node.active = true;

            node.getComponent(sp.Skeleton).setAnimation(0, animationName, false);
            node.getComponent(sp.Skeleton).setCompleteListener(()=>{
                node.getComponent(sp.Skeleton).setCompleteListener(null);
                node.active = false;
                if (callback) {
                    callback();
                }
            })
    },

    async triggerGetDiamond() {
        return new Promise(async (success)=>{
            let topSlot = this._subGameData.slots[0];
            for (let bonusItem of topSlot.bonusItems) {
                let idx = topSlot.bonusIdxs[topSlot.bonusItems.indexOf(bonusItem)];
                let symbol = this._topSlotsScript.GetSymbolByIdx(idx);

                if (bonusItem.isGold && !symbol.isCheck()) {
                    symbol.check();
                    let startPos = cc.find("repeater_feature_prize/coin", this._mainNode).convertToWorldSpaceAR(cc.v2(0, 0));
                    startPos = this.node.parent.convertToNodeSpaceAR(startPos);
                    let endPos = symbol.node.convertToWorldSpaceAR(cc.v2(0, 0));
                    endPos = this.node.parent.convertToNodeSpaceAR(endPos);

                    let particle = cc.instantiate(cc.find("particle_fly", this.node.parent));
                    particle.parent = this.node.parent;
                    particle.position = startPos;
                    particle.active = true;
                    cc.tween(particle)
                        .to(0.5, {position: endPos})
                        .call(()=>{
                            symbol.showDiamondCoin(bonusItem.coin);
                            particle.removeFromParent();
                        })
                        .start();

                    await cc.vv.gameData.awaitTime(0.5);
                }
            }

            let bottomSlot = this._subGameData.slots[1];
            for (let bonusItem of bottomSlot.bonusItems) {
                let idx = bottomSlot.bonusIdxs[bottomSlot.bonusItems.indexOf(bonusItem)];
                let symbol = this._bottomSlotsScript.GetSymbolByIdx(idx);
                if (bonusItem.isGold && !symbol.isCheck()) {
                    symbol.check();
                    let startPos = cc.find("repeater_feature_prize/coin", this._mainNode).convertToWorldSpaceAR(cc.v2(0, 0));
                    startPos = this.node.parent.convertToNodeSpaceAR(startPos);
                    let endPos = symbol.node.convertToWorldSpaceAR(cc.v2(0, 0));
                    endPos = this.node.parent.convertToNodeSpaceAR(endPos);

                    let particle = cc.instantiate(cc.find("particle_fly", this.node.parent));
                    particle.parent = this.node.parent;
                    particle.position = startPos;
                    particle.active = true;
                    cc.tween(particle)
                        .to(0.5, {position: endPos})
                        .call(()=>{
                            symbol.showDiamondCoin(bonusItem.coin);
                            particle.removeFromParent();
                        })
                        .start();

                    await cc.vv.gameData.awaitTime(0.5);
                }
            }

            success();
        });
    },

    // 获取最后停止的列和卷轴
    GetLastStopSlotReel(){
        let topEndIdx = this._topSlotsScript.GetLastStopReelIdx();
        let bottomEndIdx = this._bottomSlotsScript.GetLastStopReelIdx();

        let lastIdx = bottomEndIdx ? bottomEndIdx : topEndIdx;
        let stopType = bottomEndIdx ? this._bottomType : this._topType;

        return {slotType:stopType, reelIdx:lastIdx};
    },

    getMaxReelIdx(type, col){
        let reelList = type === this._topType ? this._topSlotsScript.getLastStopReel() : this._bottomSlotsScript.getLastStopReel();
        return reelList[col];
    },
});
