/**
 * @author Cui Guoyang
 * @date 2021/8/30
 * @description
 */

cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {
        _jackpotNums: [],
    },

    Init() {
        this._jackpotNums = [0, 0, 0, 0];
        this._super();

        // 解锁条
        let bonus_node = cc.find("collect_node/bonus_node", this.node);
        let deskInfo = cc.vv.gameData.getDeskInfo();
        bonus_node.on(cc.Node.EventType.TOUCH_END, () => {
            if (deskInfo.needBet > deskInfo.currmult && cc.vv.gameData.GetSlotState() === "idle") {
                this._bottomScript.SetBetIdx(deskInfo.needBet);
            }
        });

        let script = cc.find("lock", bonus_node).getComponent(sp.Skeleton);
        if (deskInfo.needBet <= deskInfo.currmult) {
            Global.SlotsSoundMgr.playEffect("unlock");
            script.setAnimation(0, "BetUp_Intro", false);
        } else {
            Global.SlotsSoundMgr.playEffect("lock");
            script.setAnimation(0, "BetUp_End", false);
            script.addAnimation(0, "BetUp_Loop", true);
        }

        // 进度条
        this.updateCollectProgress(deskInfo.bonusTrail);
    },

    //点击旋转按钮调用
    StartMove: function () {
        this._super();

        Global.SlotsSoundMgr.playNormalBgm();
    },

    async ReconnectShow() {
        let deskInfo = cc.vv.gameData.getDeskInfo();
        let rest = cc.vv.gameData.GetFreeTime()
        if (rest) {
            this.ShowGameview(true);
            this._jackpotNums = deskInfo.freeGameInfo.bonusCnt;
            let prizePool = cc.find("spr_bg_free/prize_pool", this.node.parent);
            for (let i = 0; i < 4; i++) {
                let pool = cc.find("prizePool_" + (i + 1), prizePool);
                for (let j = 0; j < 6; j++) {
                    let node = cc.find("collect/node_" + (j + 1), pool);
                    if (node) {
                        cc.find("ball", node).active = j < this._jackpotNums[i];
                        cc.find("light", node).active = true;
                    }
                }
            }
            prizePool.getComponent("LMSlots_PrizePool_Base").PausePool([
                {prizeType: 0, pauseNum: deskInfo.freeGameInfo.jackpotValues[0]},
                {prizeType: 1, pauseNum: deskInfo.freeGameInfo.jackpotValues[1]},
                {prizeType: 2, pauseNum: deskInfo.freeGameInfo.jackpotValues[2]},
                {prizeType: 3, pauseNum: deskInfo.freeGameInfo.jackpotValues[3]},
            ]);

            if (deskInfo.bonusTrail.state === 2) {
                cc.find("super_node", this.node).active = true;
                for (let i = 0; i < 6; i++) {
                    let item = cc.find("super_node/item_" + (i + 1), this.node);
                    cc.find("blue", item).active = false;
                    cc.find("spine", item).active = false;
                    cc.find("light", item).active = false;
                }
                this.clearCollectProgress();
            }
            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playBgm("fgbgm");
            this.CanDoNextRound()
        } else {
            this.ShowGameview(false);
            this.CanDoNextRound()
        }
    },

    ReconnectNet(){
        this.ReconnectShow()
    },

    async onMsgSpine(msg) {
        this._super(msg);
    },

    SetSlotsResult: function (cards) {
        this._super(cards);
    },

    OnReelSpinEnd:function(colIdx){
        let reel = this._reels[colIdx];
        for (let i = 0; i < this._cfg.row; i++) {
            let symbol = reel.GetSymbolByRow(i);
            if (symbol && this._cfg.bonusIds.includes(symbol.GetShowId())) {
                symbol.playWinAnimation();
            }
        }
    },

    //检查进入免费
    CheckEnterFreeGame: function () {
        return cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetFreeTime() === cc.vv.gameData.GetTotalFree();
    },

    CheckExtraFreeGame() {
        return !!(this._gameInfo.freeResult && this._gameInfo.freeResult.freeInfo && this._gameInfo.freeResult.freeInfo.freeCnt > 0);
    },

    CheckExitFreeGame() {
        return cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetFreeTime() === 0;
    },

    //显示中奖路线
    //竞品中的显示线路是：先总，后单条循环。目前我们只显示总的
    async ShowWinTrace() {
        let winCoin = 0;
        if (cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() !== cc.vv.gameData.GetFreeTime()) {
            // 免费中
            winCoin = cc.vv.gameData.GetGameTotalFreeWin() - cc.vv.gameData.GetGameWin();
        }

        let winTimes = 0;
        for (let i = 0; i < this._gameInfo.winResults.length - 1; i++) {
            let result = this._gameInfo.winResults[i];
            let needAddSymbolArray = [0, 0, 0, 0, 0];

            winCoin += result.winCoin;

            await new Promise(async (success)=>{
                for (let j = 0; j < result.cards.length; j++) {
                    let card = result.cards[j];
                    let symbol = this.GetSymbolByIdx(j + 1);
                    if (this._cfg.bonusIds.includes(card) && !symbol.getHasChangeBall()) {
                        symbol.playBallAnimation();
                        this._jackpotNums[card - 201]++;

                        await cc.vv.gameData.awaitTime(0.5);

                        let particle = cc.instantiate(cc.find("particle_" + card, this.node.parent));
                        particle.active = true;
                        particle.parent = this.node.parent;
                        let startPos = symbol.node.convertToWorldSpaceAR(cc.v2(0, 0));
                        startPos = this.node.parent.convertToNodeSpaceAR(startPos);
                        particle.position = startPos;
                        let collect_node = cc.find("spr_bg_free/prize_pool/prizePool_"
                            + (card - 200) + "/collect/node_" + (this._jackpotNums[card - 201]), this.node.parent);
                        let endPos = collect_node.convertToWorldSpaceAR(cc.v2(0, 0));
                        endPos = this.node.parent.convertToNodeSpaceAR(endPos);
                        cc.tween(particle)
                            .to(0.5, {position: endPos})
                            .call(()=>{
                                let ball = cc.find("ball", collect_node);
                                ball.active = true;
                                let light = cc.find("light", collect_node);
                                let animations = ["Mini", "Minor", "Major", "Grand"];
                                light.getComponent(sp.Skeleton).setAnimation(0, "Qiu_X_" + animations[card - 201], false);

                                symbol.playBallClearAnimation();
                            })
                            .removeSelf()
                            .start();

                        await cc.vv.gameData.awaitTime(0.7);

                        if (this._gameInfo.jackpot && this.collectFullJackpot()) {
                            await this.popJackpotDialog();
                        }
                    }
                }
                success();
            });

            for (let idx of result.idxs) {
                let symbol = this.GetSymbolByIdx(idx);
                if (symbol) {
                    let reelIndex = (idx - 1) % 5;
                    needAddSymbolArray[reelIndex]++;
                    symbol.playWinAnimation();
                    symbol.ShowKuang();
                }
            }


            await new Promise((success) => {
                this.ShowBottomWin(result.winCoin, winCoin, (i === this._gameInfo.winResults.length - 2), async () => {
                    winTimes++;
                    if (this._gameInfo.bonusTrail.state === 2 && cc.vv.gameData.GetTotalFree() !== cc.vv.gameData.GetFreeTime()) {
                        for (let j = 0; j < winTimes - 1; j++) {
                            let item = cc.find("super_node/item_" + (j + 1), this.node);
                            cc.find("blue", item).active = true;
                            cc.find("spine", item).active = false;
                            cc.find("light", item).active = false;
                        }
                        Global.SlotsSoundMgr.playEffect("multiplier");

                        let item = cc.find("super_node/item_" + winTimes, this.node);
                        cc.find("spine", item).active = true;
                        let light = cc.find("light", item);
                        light.active = true;
                        light.getComponent(sp.Skeleton).setAnimation(0, "FG_ChengBei_Intro", false);
                    }

                    // 消卡
                    Global.SlotsSoundMgr.playEffect("magicbreak");
                    for (let idx of result.idxs) {
                        let symbol = this.GetSymbolByIdx(idx);
                        if (symbol) {
                            symbol.playClearAnimation();
                            symbol.ShowKuang(false);
                            let clear = cc.instantiate(cc.find("symbol_clean", this.node.parent));
                            clear.active = true;
                            clear.parent = this.node.parent;
                            let position = symbol.node.convertToWorldSpaceAR(cc.v2(0, 0));
                            position = this.node.parent.convertToNodeSpaceAR(position);
                            clear.position = position;
                            clear.getComponent(sp.Skeleton).setAnimation(0, "symbol_clean", false);
                            clear.getComponent(sp.Skeleton).setCompleteListener(() => {
                                clear.removeFromParent();
                            });
                        }
                    }

                    await cc.vv.gameData.awaitTime(1);

                    Global.SlotsSoundMgr.playEffect("symboldown");
                    for (let j = 0; j < needAddSymbolArray.length; j++) {
                        let addNum = needAddSymbolArray[j];
                        let symbolArray = [];
                        let reel = this._reels[j];
                        let nextCards = this._gameInfo.winResults[i + 1].cards;
                        if (addNum > 0) {
                            for (let k = 0; k < addNum; k++) {
                                let card = nextCards[this._cfg.col * k + j];
                                let data = null;
                                // if (card === this._cfg.bonusId) {
                                //     let index = this._gameInfo.bonusResultCards[i + 1].bonusIdxs.indexOf(this._cfg.col * k + j + 1);
                                //     if (index !== -1) {
                                //         data = this._gameInfo.bonusResultCards[i + 1].bonusItems[index];
                                //     }
                                // }
                                symbolArray.push({id: card, data: data});
                            }
                            result.idxs.sort((a, b) => {
                                return a - b;
                            });
                            symbolArray.reverse();
                            reel.AppendSymbol(symbolArray, 2);
                            for (const idx of result.idxs) {
                                let reelIndex = (idx - 1) % 5;
                                if (reelIndex === j) {
                                    // 播放金币消失动画
                                    let symbol = this.GetSymbolByIdx(idx);
                                    if (symbol) {
                                        let s = Math.floor(result.cards.length / this._cfg.col) - (Math.floor((idx - 1) / 5) + 1);
                                        reel.deleteSymbol(s);
                                    }
                                }
                            }
                            for (let k = 0; k < nextCards.length / this._cfg.col; k++) {
                                let symbol = reel.GetSymbolByRow(k);
                                cc.tween(symbol.node)
                                    .to(0.3, {y: (k + 0.5) * this._cfg.symbolSize.height})
                                    .start();
                            }
                            cc.tween(reel.node)
                                .delay(0.3)
                                .call(() => {
                                    reel.ReLayOut();
                                    for (let i = 0; i < this._cfg.row; i++) {
                                        let symbol = reel.GetSymbolByRow(i);
                                        if (symbol && this._cfg.bonusIds.includes(symbol.GetShowId()) && !symbol.getHasChangeBall()) {
                                            symbol.playWinAnimation();
                                        }
                                    }
                                })
                                .start();
                        }
                    }

                    await cc.vv.gameData.awaitTime(1);

                    success();
                })
            });
        }
    },

    collectFullJackpot() {
        for (let i = 0; i < this._jackpotNums.length; i++) {
            if (this._jackpotNums[i] >= 3 + i) {
                return true;
            }
        }
        return false;
    },

    //重写：显示bonus中奖
    async OnSpinEnd() {
        await this.ShowWinTrace();

        await new Promise(async (success)=>{
            let cards = this._gameInfo.winResults.length > 0 ? this._gameInfo.winResults[this._gameInfo.winResults.length - 1].cards : this._gameInfo.resultCards;
            for (let j = 0; j < cards.length; j++) {
                let card = cards[j];
                let symbol = this.GetSymbolByIdx(j + 1);
                if (this._cfg.bonusIds.includes(card) && !symbol.getHasChangeBall()) {
                    symbol.playBallAnimation();
                    this._jackpotNums[card - 201]++;

                    await cc.vv.gameData.awaitTime(0.5);

                    let particle = cc.instantiate(cc.find("particle_" + card, this.node.parent));
                    particle.active = true;
                    particle.parent = this.node.parent;
                    let startPos = symbol.node.convertToWorldSpaceAR(cc.v2(0, 0));
                    startPos = this.node.parent.convertToNodeSpaceAR(startPos);
                    particle.position = startPos;
                    let collect_node = cc.find("spr_bg_free/prize_pool/prizePool_"
                        + (card - 200) + "/collect/node_" + (this._jackpotNums[card - 201]), this.node.parent);
                    let endPos = collect_node.convertToWorldSpaceAR(cc.v2(0, 0));
                    endPos = this.node.parent.convertToNodeSpaceAR(endPos);
                    Global.SlotsSoundMgr.playEffect("JPfly");
                    cc.tween(particle)
                        .to(0.5, {position: endPos})
                        .call(()=>{
                            let ball = cc.find("ball", collect_node);
                            ball.active = true;
                            let light = cc.find("light", collect_node);
                            let animations = ["Mini", "Minor", "Major", "Grand"];
                            light.getComponent(sp.Skeleton).setAnimation(0, "Qiu_X_" + animations[card - 201], false);

                            symbol.playBallClearAnimation();
                        })
                        .removeSelf()
                        .start();

                    await cc.vv.gameData.awaitTime(0.5);

                    if (this._gameInfo.jackpot && this.collectFullJackpot()) {
                        let reward = cc.find("spr_bg_free/prize_pool/prizePool_" + this._gameInfo.jackpot.id + "/reward", this.node.parent);
                        reward.active = true;
                        let animations = ["JPTiShi_V", "JPTiShi_L", "JPTiShi_Z", "JPTiShi_H"];
                        reward.getComponent(sp.Skeleton).setAnimation(0, animations[this._gameInfo.jackpot.id - 1], false);
                        reward.getComponent(sp.Skeleton).setCompleteListener(()=>{
                            reward.getComponent(sp.Skeleton).setCompleteListener(null);
                            reward.active = false;
                        });
                        Global.SlotsSoundMgr.playEffect("JPcollect");
                        await cc.vv.gameData.awaitTime(0.5);
                        await this.popJackpotDialog();
                    }
                }
            }
            success();
        });

        for (let i = 0; i < 6; i++) {
            let item = cc.find("super_node/item_" + (i + 1), this.node);
            cc.find("blue", item).active = false;
            cc.find("spine", item).active = false;
            cc.find("light", item).active = false;
        }

        if (this.CheckEnterFreeGame()) {
            this.triggerFreeGame();
        } else if (this.CheckExtraFreeGame()) {
            this.triggerExtraFreeGame();
        } else {
            if (this.CheckExitFreeGame()) {
                this.triggerExitFreeGame();
            } else {
                this.CanDoNextRound();
            }
        }
    },

    //显示游戏界面：bFree true显示免费模式的界面，false 普通模式
    ShowGameview: function (bFree) {
        this._super(bFree);
        cc.find("LMSlots_PrizePool_1", this.node.parent).active = !bFree;
        cc.find("collect_node", this.node).active = !bFree;
        cc.find("super_node", this.node).active = this._gameInfo && this._gameInfo.bonusTrail.state === 2 && bFree;
        // cc.find("Canvas/safe_node/logo").active = !bFree;
    },

    async triggerFreeGame() {
        this._bottomScript.ShowBtnsByState("moveing_1");
        Global.SlotsSoundMgr.playEffect("triggering");

        let cards = this._gameInfo.winResults[this._gameInfo.winResults.length - 1].cards;
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            if (card === this._cfg.scatterId) {
                let symbol = this.GetSymbolByIdx(i + 1);
                symbol.playWinAnimation();
            }
        }

        if (cc.vv.gameData.getDeskInfo().currmult >= cc.vv.gameData.getDeskInfo().needBet) {
            let item = cc.find("collect_node/item_" + this._gameInfo.bonusTrail.count, this.node);
            let finish = cc.find("finish", item);
            let spine = cc.find("spine", item);
            Global.SlotsSoundMgr.playEffect("collect");
            finish.active = true;
            spine.active = true;
            if (this._gameInfo.bonusTrail.state === 2) {
                // super bonus
                spine.getComponent(sp.Skeleton).setAnimation(0, "JinDuTiao_ChengBao_Intro", false);
                spine.getComponent(sp.Skeleton).addAnimation(0, "JinDuTiao_ChengBao_End", true);
            } else {
                spine.getComponent(sp.Skeleton).setAnimation(0, "JinDuTiao_Hua", false);
            }
        }

        // 触发免费游戏
        await cc.vv.gameData.awaitTime(2);

        if (this._gameInfo.bonusTrail.state === 2) {
            await this.popFreeDialog(true);
        } else {
            await this.popFreeDialog(false);
        }

        this.cutScene();

        await cc.vv.gameData.awaitTime(2);

        this._jackpotNums = [0, 0, 0, 0];
        this.ShowGameview(true);
        let prizePool = cc.find("spr_bg_free/prize_pool", this.node.parent);
        for (let i = 0; i < 4; i++) {
            let pool = cc.find("prizePool_" + (i + 1), prizePool);
            for (let j = 0; j < 6; j++) {
                let node = cc.find("collect/node_" + (j + 1), pool);
                if (node) {
                    cc.find("ball", node).active = false;
                    cc.find("light", node).active = false;
                }
            }
        }
        prizePool.getComponent("LMSlots_PrizePool_Base").PausePool([
            {prizeType: 0, pauseNum: this._gameInfo.freeGameInfo.jackpotValues[0]},
            {prizeType: 1, pauseNum: this._gameInfo.freeGameInfo.jackpotValues[1]},
            {prizeType: 2, pauseNum: this._gameInfo.freeGameInfo.jackpotValues[2]},
            {prizeType: 3, pauseNum: this._gameInfo.freeGameInfo.jackpotValues[3]},
        ]);

        if (this._gameInfo.bonusTrail.state === 2) {
            for (let i = 0; i < 6; i++) {
                let item = cc.find("super_node/item_" + (i + 1), this.node);
                cc.find("blue", item).active = false;
                cc.find("spine", item).active = false;
                cc.find("light", item).active = false;
            }

            this.clearCollectProgress();
        }

        Global.SlotsSoundMgr.stopBgm();
        Global.SlotsSoundMgr.playBgm("fgbgm");
        this.CanDoNextRound();
    },

    cutScene() {
        Global.SlotsSoundMgr.playEffect("fgtransition");
        let transition = cc.find("transition", this.node.parent);
        transition.active = true;
        let spine = transition.getComponent(sp.Skeleton);
        spine.setAnimation(0, "FG_GuoChang", false);
        spine.setCompleteListener(() => {
            spine.setCompleteListener(null);
            transition.active = false;
        });
    },

    async triggerExtraFreeGame() {
        this._bottomScript.ShowBtnsByState("moveing_1");

        let cards = this._gameInfo.winResults[this._gameInfo.winResults.length - 1].cards;
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            if (card === this._cfg.scatterId) {
                let symbol = this.GetSymbolByIdx(i + 1);
                symbol.playWinAnimation();
            }
        }

        cc.vv.AudioManager.playEff("games/VampireCount/", "bell", true);

        await cc.vv.gameData.awaitTime(2);

        await this.popExtraFreeDialog();

        this.CanDoNextRound();
    },

    async triggerExitFreeGame() {
        this._bottomScript.ShowBtnsByState("moveing_1");

        await cc.vv.gameData.awaitTime(1);

        await this.popFreeResultDialog();

        this.cutScene();

        await cc.vv.gameData.awaitTime(2);

        this.ShowGameview(false);

        this.ShowBottomWin(cc.vv.gameData.GetGameTotalFreeWin(), cc.vv.gameData.GetGameTotalFreeWin(), true, () => {
            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playNormalBgm();
            this.CanDoNextRound();
        });
    },

    popFreeDialog(isSuper) {
        return new Promise(async (success) => {
            Global.SlotsSoundMgr.playEffect("fgbegin");
            let free_dialog = cc.find("dialog_node", this.node.parent);
            free_dialog.active = true;

            let dialog = cc.find("common_enter_node", free_dialog);
            if (isSuper) {
                dialog = cc.find("super_enter_node", free_dialog);
            }
            dialog.active = true;
            dialog.scale = 1;

            let freetanchuang = cc.find("freetanchuang", dialog);
            freetanchuang.scale = 0;
            let rose = cc.find("rose", freetanchuang);
            rose.active = false;
            cc.tween(freetanchuang)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .call(() => {
                    rose.active = true;
                    if (isSuper) {
                        rose.getComponent(sp.Skeleton).setAnimation(0, "FG_STC_Hua_Intro", false);
                        rose.getComponent(sp.Skeleton).addAnimation(0, "FG_STC_Hua_Loop", true);
                    } else {
                        rose.getComponent(sp.Skeleton).setAnimation(0, "FG_TCHua_Intro", false);
                        rose.getComponent(sp.Skeleton).addAnimation(0, "FG_TCHua_Loop", true);
                    }
                })
                .start();

            let congratulation = cc.find("congratulations", dialog);
            congratulation.scale = 0;
            cc.tween(congratulation)
                .delay(0.1)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let you_won_EN = cc.find("you_won_EN", dialog);
            you_won_EN.scale = 0;
            cc.tween(you_won_EN)
                .delay(0.2)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let times = cc.find("times", dialog);
            times.scale = 0;
            times.getComponent(cc.Label).string = cc.vv.gameData.GetTotalFree();
            cc.tween(times)
                .delay(0.3)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let free_games_EN = cc.find("free_games_EN", dialog);
            free_games_EN.scale = 0;
            cc.tween(free_games_EN)
                .delay(0.4)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let btn_start = cc.find("btn_start", dialog);
            btn_start.scale = 0;
            cc.tween(btn_start)
                .delay(0.5)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            await cc.vv.gameData.awaitTime(1);

            let func = async () => {
                Global.SlotsSoundMgr.playEffect("button");
                btn_start.off("click");

                cc.tween(dialog)
                    .to(0.5, {scale: 0}, {easing: "backIn"})
                    .call(() => {
                        free_dialog.active = false;
                        dialog.active = false;
                        success();
                    })
                    .start();
            }
            cc.vv.gameData.checkAutoPlay(btn_start, func);
            btn_start.off("click");
            btn_start.on("click", async () => {
                btn_start.stopAllActions();
                func();
            });
        });
    },

    popExtraFreeDialog() {
        return new Promise(async (success) => {
            Global.SlotsSoundMgr.playEffect("fgretrigger");

            let free_dialog = cc.find("dialog_node", this.node.parent);
            free_dialog.active = true;

            let dialog = cc.find("extra_node", free_dialog);
            dialog.active = true;
            dialog.scale = 1;

            let freetanchuang = cc.find("freetanchuang", dialog);
            freetanchuang.scale = 0;
            let rose = cc.find("rose", freetanchuang);
            rose.active = false;
            cc.tween(freetanchuang)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .call(() => {
                    rose.active = true;
                    rose.getComponent(sp.Skeleton).setAnimation(0, "FG_TCHua_Intro", false);
                    rose.getComponent(sp.Skeleton).addAnimation(0, "FG_TCHua_Loop", true);
                })
                .start();

            let congratulation = cc.find("congratulations", dialog);
            congratulation.scale = 0;
            cc.tween(congratulation)
                .delay(0.1)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let you_won_EN = cc.find("you_won_EN", dialog);
            you_won_EN.scale = 0;
            cc.tween(you_won_EN)
                .delay(0.2)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let times = cc.find("times", dialog);
            times.scale = 0;
            times.getComponent(cc.Label).string = this._gameInfo.freeResult.freeInfo.freeCnt;
            cc.tween(times)
                .delay(0.3)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let free_games_EN = cc.find("free_games_EN", dialog);
            free_games_EN.scale = 0;
            cc.tween(free_games_EN)
                .delay(0.4)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            await cc.vv.gameData.awaitTime(2);

            cc.tween(dialog)
                .to(0.5, {scale: 0}, {easing: "backIn"})
                .call(() => {
                    free_dialog.active = false;
                    dialog.active = false;
                    success();
                })
                .start();
        });
    },

    popFreeResultDialog() {
        return new Promise(async (success) => {
            Global.SlotsSoundMgr.playEffect("fgend");

            let free_dialog = cc.find("dialog_node", this.node.parent);
            free_dialog.active = true;

            let dialog = cc.find("result_node", free_dialog);
            dialog.active = true;
            dialog.scale = 1;

            let freetanchuang = cc.find("freetanchuang", dialog);
            freetanchuang.scale = 0;
            let rose = cc.find("rose", freetanchuang);
            rose.active = false;
            cc.tween(freetanchuang)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .call(() => {
                    rose.active = true;
                    rose.getComponent(sp.Skeleton).setAnimation(0, "FG_TCHua_Intro", false);
                    rose.getComponent(sp.Skeleton).addAnimation(0, "FG_TCHua_Loop", true);
                })
                .start();

            let congratulation = cc.find("congratulations", dialog);
            congratulation.scale = 0;
            cc.tween(congratulation)
                .delay(0.1)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let total_won_EN = cc.find("you_won_EN", dialog);
            total_won_EN.scale = 0;
            cc.tween(total_won_EN)
                .delay(0.2)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let yifenkuang = cc.find("yifenkuang", dialog);
            yifenkuang.scale = 0;
            cc.tween(yifenkuang)
                .delay(0.3)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();
            cc.find("coin", yifenkuang).getComponent(cc.Label).string =
                Global.FormatNumToComma(cc.vv.gameData.GetGameTotalFreeWin());

            let in_free_games_EN = cc.find("free_games_EN", dialog);
            in_free_games_EN.scale = 0;
            cc.tween(in_free_games_EN)
                .delay(0.4)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();
            let times = cc.find("times", in_free_games_EN);
            times.getComponent(cc.Label).string = cc.vv.gameData.GetTotalFree();

            let btn_collect = cc.find("btn_collect", dialog);
            btn_collect.scale = 0;
            cc.tween(btn_collect)
                .delay(0.5)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            await cc.vv.gameData.awaitTime(1);

            let func = async () => {
                btn_collect.off("click");
                Global.SlotsSoundMgr.playEffect("button");

                cc.tween(dialog)
                    .to(0.5, {scale: 0}, {easing: "backIn"})
                    .call(()=>{
                        free_dialog.active = false;
                        dialog.active = false;
                        success();
                    })
                    .start();
            }
            cc.vv.gameData.checkAutoPlay(btn_collect, func);
            btn_collect.off("click");
            btn_collect.on("click", async () => {
                btn_collect.stopAllActions();
                func();
            });
        })
    },

    popJackpotDialog() {
        return new Promise(async (success) => {
            Global.SlotsSoundMgr.playEffect("jpPop");
            let animations = ["Mini", "Minor", "Major", "Grand"];

            let free_dialog = cc.find("dialog_node", this.node.parent);
            free_dialog.active = true;

            let dialog = cc.find("jackpot_node", free_dialog);
            dialog.active = true;
            dialog.scale = 1;

            let fireworks = cc.find("fireworks", dialog);
            fireworks.active = false;

            let freetanchuang = cc.find("freetanchuang", dialog);
            freetanchuang.scale = 0;
            freetanchuang.getComponent("ImgSwitchCmp").setIndex(this._gameInfo.jackpot.id - 1);
            cc.tween(freetanchuang)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .call(()=>{
                    fireworks.active = true;
                })
                .start();

            let title = cc.find("title", dialog);
            title.scale = 0;
            title.getComponent(sp.Skeleton).setAnimation(0, "JPTC_" + animations[this._gameInfo.jackpot.id - 1], true);
            cc.tween(title)
                .delay(0.1)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let jackpot = cc.find("jackpot", dialog);
            jackpot.scale = 0;
            cc.tween(jackpot)
                .delay(0.2)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let yifenkuang = cc.find("yifenkuang", dialog);
            yifenkuang.scale = 0;
            cc.tween(yifenkuang)
                .delay(0.3)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();
            cc.find("coin", yifenkuang).getComponent(cc.Label).string =
                Global.FormatNumToComma(this._gameInfo.jackpot.value);

            let btn_collect = cc.find("btn_collect", dialog);
            btn_collect.scale = 0;
            cc.tween(btn_collect)
                .delay(0.4)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            await cc.vv.gameData.awaitTime(1);

            let func = async () => {
                btn_collect.off("click");
                Global.SlotsSoundMgr.playEffect("button");

                cc.tween(dialog)
                    .to(0.5, {scale: 0}, {easing: "backIn"})
                    .call(()=>{
                        this._jackpotNums[this._gameInfo.jackpot.id - 1] = 0;
                        let pool = cc.find("spr_bg_free/prize_pool/prizePool_" + this._gameInfo.jackpot.id, this.node.parent);
                        for (let j = 0; j < 6; j++) {
                            let node = cc.find("collect/node_" + (j + 1), pool);
                            if (node) {
                                cc.find("ball", node).active = false;
                            }
                        }
                        free_dialog.active = false;
                        dialog.active = false;
                        success();
                    })
                    .start();
            }
            cc.vv.gameData.checkAutoPlay(btn_collect, func);
            btn_collect.off("click");
            btn_collect.on("click", async () => {
                btn_collect.stopAllActions();
                func()
            });
        })
    },


    // //根据服务端序号获取本地的symbol
    // GetSymbolByIdx: function (idx) {
    //     this._super(idx);
    // },


    async updateCollectProgress(bonusTrail) {
        for (let i = 0; i < 10; i++) {
            let item = cc.find("collect_node/item_" + (i + 1), this.node);
            let finish = cc.find("finish", item);
            let spine = cc.find("spine", item);
            finish.active = i < bonusTrail.count;

            if (i !== 9) {
                spine.active = false;
            } else {
                spine.active = true;
                spine.getComponent(sp.Skeleton).setAnimation(0, "JinDuTiao_ChengBao_Loop", true);
            }
        }
    },


    clearCollectProgress() {
        for (let i = 0; i < 10; i++) {
            let item = cc.find("collect_node/item_" + (i + 1), this.node);
            let finish = cc.find("finish", item);
            let spine = cc.find("spine", item);
            finish.active = false;

            if (i !== 9) {
                spine.active = false;
            } else {
                spine.active = true;
                spine.getComponent(sp.Skeleton).setAnimation(0, "JinDuTiao_ChengBao_Loop", true);
            }
        }
    },


});