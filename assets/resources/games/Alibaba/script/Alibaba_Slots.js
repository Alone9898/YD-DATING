/**
 * @author Cui Guoyang
 * @date 2021/9/24
 * @description
 */

cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {
        _enterFreeCallback: null,
    },

    Init() {
        this._super();

        // 解锁条
        let bonus_node = cc.find("collect_node/bonus_node", this.node);
        let deskInfo = cc.vv.gameData.getDeskInfo();
        bonus_node.on(cc.Node.EventType.TOUCH_END, () => {
            if (deskInfo.needBet > deskInfo.currmult && cc.vv.gameData.GetSlotState() === "idle") {
                this._bottomScript.SetBetIdx(deskInfo.needBet);
            }
        });

        let double_fortune = cc.find("LMSlots_PrizePool_1/double_fortune", this.node.parent).getComponent(sp.Skeleton);
        // let box = cc.find("collect_node/box", this.node).getComponent(sp.Skeleton);
        let gold = cc.find("collect_node/gold", this.node).getComponent(sp.Skeleton);

        let script = cc.find("lock", bonus_node).getComponent(sp.Skeleton);
        if (deskInfo.needBet <= deskInfo.currmult) {
            Global.SlotsSoundMgr.playEffect("mapunlock");
            script.setAnimation(0, "Bet1_unlock", false);
            double_fortune.setAnimation(0, "bet2_unlock", false);
            // box.setAnimation(0, "box_idle", true);
            gold.setAnimation(0, "collect_gold_idle", true);
        } else {
            Global.SlotsSoundMgr.playEffect("lock");
            script.setAnimation(0, "Bet1_lock", false);
            script.addAnimation(0, "Bet1_lock_idle", true);
            double_fortune.setAnimation(0, "bet2_lock", false);
            double_fortune.addAnimation(0, "bet2_lock_idle", true);
            // box.setAnimation(0, "box", true);
            gold.setAnimation(0, "collect_gold", true);
        }

        // 进度条
        this.updateCollectProgress(deskInfo.mapInfo, false);

        // 点开地图
        let touch_map = cc.find("collect_node/box/touch", this.node);
        touch_map.off(cc.Node.EventType.TOUCH_END);
        touch_map.on(cc.Node.EventType.TOUCH_END, ()=>{
            if (cc.vv.gameData.GetSlotState() !== "idle") {
                return;
            }
            if(cc.vv.gameData.GetAutoModelTime() > 0) {
                return;
            }
            this._bottomScript.ShowBtnsByState("moveing_1");
            Global.SlotsSoundMgr.playEffect("mapInOut");
            cc.find("map", this.node.parent).getComponent("Alibaba_Map")
                .initMap(deskInfo.mapInfo);
            cc.find("map", this.node.parent).getComponent("Alibaba_Map")
                .openMap(true);
        });
    },


    //点击旋转按钮调用
    StartMove: function () {
        if(cc.vv.gameData.isBonusGame()){
            return
        }

        this._super();

        cc.vv.gameData.scatterNum = 0;
        Global.SlotsSoundMgr.playNormalBgm();
    },

    async ReconnectShow() {
        // this._super();

        if (cc.vv.gameData.GetFreeTime() > 0) {
            this.ShowGameview(true);
        } else {
            this.ShowGameview(false);
        }
        let deskInfo = cc.vv.gameData.getDeskInfo();
        if (deskInfo.mapInfo.state === 1) {
            this._bottomScript.ShowBtnsByState("moveing_1");
            let script = cc.find("map", this.node.parent).getComponent("Alibaba_Map");
            await script.showMap(deskInfo.mapInfo);

            this.clearCollectProgress();
            let winCoin = cc.find("map/wheel", this.node.parent).getComponent("Alibaba_Wheel").getWinCoin();
            this.ShowBottomWin(winCoin, winCoin, true, () => {
                this.CanDoNextRound();
            });
        }
        else if (deskInfo.bonusGame) {
            this._bottomScript.ShowBtnsByState("moveing_1");
            await cc.vv.gameData.getBonusGameMgr().showBonusGame(deskInfo.bonusGame);

            await this.popBonusResultDialog();

            cc.vv.gameData.getBonusGameMgr()._mainNode.active = false;

            this.ShowBottomWin(cc.vv.gameData.getBonusGameMgr().getWinCoin(), cc.vv.gameData.getBonusGameMgr().getWinCoin(), true, ()=>{
                this.CanDoNextRound();
            });
        } else {
            this.CanDoNextRound();
        }
    },

    ReconnectNet(){
        let deskInfo = cc.vv.gameData.getDeskInfo();

        if(this._stopTime > 0 && !this._gameInfo){  // 旋转中，未收到44返回
            this.ReconnectShow();
        }
        else if(deskInfo.mapInfo.state === 1){
            let script = cc.find("map", this.node.parent).getComponent("Alibaba_Map");
            script.ReconnectNet(deskInfo.mapInfo);
        }
        else if (deskInfo.bonusGame) {
            cc.vv.gameData.getBonusGameMgr().ReconnectNet(deskInfo.bonusGame);
        }
    },

    StopMove:function(){
        if(cc.vv.gameData.isBonusGame()){
            cc.vv.gameData.getBonusGameMgr().StopMove();
            return;
        }

        this._super()
    },

    async onMsgSpine(msg) {
        this._super(msg);
        if (msg.mapInfo) {
            cc.vv.gameData.getDeskInfo().mapInfo = msg.mapInfo;
        }
    },

    SetSlotsResult: function (cards) {
        let acRow = cards.length / this._col
        let reelResults = []
        for (let i = 0; i < cards.length; i++) {
            let row = Math.floor(i / acRow)
            let col = i % this._col
            //配置中有没有这个元素
            if (this._cfg.symbol[cards[i]]) {
                let res = {}
                res.sid = cards[i] //符号id
                if (cards[i] === this._cfg.bonusId) {
                    for (let bonusItem of this._gameInfo.bonusItems) {
                        if (bonusItem.idx === (i + 1)) {
                            res.data = bonusItem;
                            break;
                        }
                    }
                }
                if (!reelResults[col]) reelResults[col] = []
                reelResults[col].unshift(res)
            }
        }

        for (let i = 0; i < this._reels.length; i++) {
            let item = this._reels[i]
            let reelRes = reelResults[i]
            item.SetResult(reelRes)
        }
    },

    //检查进入免费
    CheckEnterFreeGame: function () {
        return cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetFreeTime() === cc.vv.gameData.GetTotalFree();
    },

    CheckExitFreeGame() {
        return cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetFreeTime() === 0;
    },

    //显示中奖路线
    //竞品中的显示线路是：先总，后单条循环。目前我们只显示总的
    ShowWinTrace: function () {
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
                if (symbol.GetShowId() === this._cfg.wildId) {
                    let mult = 1;
                    for (let wildItem of this._gameInfo.wildItems) {
                        if (wildItem.idx === Number(key)) {
                            mult = wildItem.mult;
                            break;
                        }
                    }
                    symbol.playWildMulAnimation(mult);
                } else {
                    symbol.playWinAnimation()
                }

                symbol.ShowKuang()
            }
        }
    },

    // cutScene() {
    //     // cc.vv.AudioManager.playEff("games/WestCowboy/", "music_ChilliFiesta_respinChangeScene", true);
    //     let transition = cc.find("ChilliFiesta_guochang", this.node.parent);
    //     transition.active = true;
    //     let spine = transition.getComponent(sp.Skeleton);
    //     spine.setAnimation(0, "skill", false);
    //     spine.setCompleteListener(() => {
    //         spine.setCompleteListener(null);
    //         transition.active = false;
    //     });
    // },

    //重写：显示bonus中奖
    async OnSpinEnd() {
        await this.collectSymbol();

        this.ShowWinTrace();

        let winCoin = cc.vv.gameData.GetGameWin();
        let totalWinCoin = cc.vv.gameData.GetGameWin();
        if (cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() !== cc.vv.gameData.GetFreeTime()) {
            // 免费中
            totalWinCoin = cc.vv.gameData.GetGameTotalFreeWin();
        }

        this.ShowBottomWin(winCoin, totalWinCoin, true, async () => {
            if (this._gameInfo.mapInfo.state !== 0 && this._gameInfo.mapInfo.progressData.currCnt > 0) {
                this._bottomScript.ShowBtnsByState("moveing_1");
                // 收集完毕
                await cc.vv.gameData.awaitTime(0.5);

                // cc.vv.AudioManager.playEff("games/MinamotoNoYoshitsune/", "collect_full", true);
                // let box = cc.find("collect_node/box", this.node).getComponent(sp.Skeleton);
                // box.setAnimation(0, "box_open", false);
                // box.addAnimation(0, "box_open_idle", true);

                // 显示地图
                await cc.vv.gameData.awaitTime(1);

                let script = cc.find("map", this.node.parent).getComponent("Alibaba_Map");
                await script.showMap(this._gameInfo.mapInfo);

                if (!this._cfg.bigPoint.includes(this._gameInfo.mapInfo.currId)) {
                    this.clearCollectProgress();
                    let winCoin = cc.find("map/wheel", this.node.parent).getComponent("Alibaba_Wheel").getWinCoin();
                    this.ShowBottomWin(winCoin, winCoin, true, () => {
                        this.CanDoNextRound();
                    });
                } else{
                    this.clearCollectProgress();
                    this.ShowGameview(true);

                    await cc.vv.gameData.awaitTime(1);

                    Global.SlotsSoundMgr.stopBgm();
                    Global.SlotsSoundMgr.playBgm("fgbgm");
                    this.CanDoNextRound();
                }
            } else {
                if (this._gameInfo.bonusGame) {
                    this.triggerBonusGame();
                } else if (this.CheckEnterFreeGame()) {
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
            }


        });
    },

    CheckExtraFreeGame() {
        return !!(this._gameInfo.freeResult && this._gameInfo.freeResult.freeInfo && this._gameInfo.freeResult.freeInfo.freeCnt > 0);
    },

    async triggerBonusGame() {
        Global.SlotsSoundMgr.playEffect("triggering");
        await cc.vv.gameData.awaitTime(1);

        await this.popBonusEnterDialog();

        await cc.vv.gameData.getBonusGameMgr().showBonusGame(this._gameInfo.bonusGame);

        await this.popBonusResultDialog();

        cc.vv.gameData.getBonusGameMgr()._mainNode.active = false;
        let winCoin = cc.vv.gameData.getBonusGameMgr().getWinCoin();
        let totalCoin = winCoin;
        if(cc.vv.gameData.GetTotalFree() <= 0){ // 不是免费游戏，需要手动更新小游戏赢钱
            cc.vv.gameData.AddCoin(winCoin);
        } else {
            totalCoin += cc.vv.gameData.GetGameTotalFreeWin();
        }
        this.ShowBottomWin(winCoin, totalCoin, true, ()=>{
            this.CanDoNextRound();
        });
    },

    popBonusEnterDialog() {
        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect("bgbegin");
            let free_dialog = cc.find("free_dialog", this.node.parent);
            free_dialog.active = true;

            let guochang = cc.find("guochang", free_dialog);
            guochang.active = true;
            guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_in", false);

            let dialog = cc.find("bonus_enter_node", free_dialog);
            dialog.active = true;
            dialog.scale = 0;

            cc.tween(dialog)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            await cc.vv.gameData.awaitTime(2);

            guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_out", false);
            cc.tween(dialog)
                .to(0.5, {scale: 0}, {easing: "backIn"})
                .call(()=>{
                    free_dialog.active = false;
                    dialog.active = false;
                    guochang.active = false;
                    success();
                })
                .start();
        });
    },

    popBonusResultDialog() {
        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect("fgend");
            let free_dialog = cc.find("free_dialog", this.node.parent);
            free_dialog.active = true;

            let guochang = cc.find("guochang", free_dialog);
            guochang.active = true;
            guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_in", false);

            let dialog = cc.find("result_node", free_dialog);
            dialog.active = true;
            dialog.scale = 0;

            cc.tween(dialog)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let coin = cc.find("coin", dialog);
            coin.getComponent(cc.Label).string = Global.FormatNumToComma(cc.vv.gameData.getBonusGameMgr().getWinCoin());

            await cc.vv.gameData.awaitTime(2);

            guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_out", false);
            cc.tween(dialog)
                .to(0.5, {scale: 0}, {easing: "backIn"})
                .call(()=>{
                    free_dialog.active = false;
                    dialog.active = false;
                    guochang.active = false;
                    success();
                })
                .start();
        });
    },

    async triggerExtraFreeGame() {
        this._bottomScript.ShowBtnsByState("moveing_1");

        Global.SlotsSoundMgr.playEffect("scatrwin");
        for (let i = 0; i < this._gameInfo.resultCards.length; i++) {
            let card = this._gameInfo.resultCards[i];
            if (card === this._cfg.scatterId) {
                let symbol = this.GetSymbolByIdx(i + 1);
                symbol.playWinAnimation();
            }
        }

        // cc.vv.AudioManager.playEff("games/MammothGrand/", "fg_bell", true);

        await cc.vv.gameData.awaitTime(2);

        await this.popExtraFreeDialog();

        await cc.vv.gameData.awaitTime(0.5);

        this.CanDoNextRound();
    },

    async popExtraFreeDialog() {
        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect("fgbegin");
            let free_dialog = cc.find("free_dialog", this.node.parent);
            free_dialog.active = true;

            // let guochang = cc.find("guochang", free_dialog);
            // guochang.active = true;
            // guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_in", false);

            let dialog = cc.find("extra_node", free_dialog);
            dialog.active = true;
            dialog.scale = 0;

            cc.tween(dialog)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let times = cc.find("times", dialog);
            times.getComponent(cc.Label).string = this._gameInfo.freeResult.freeInfo.freeCnt;

            await cc.vv.gameData.awaitTime(2);

            // guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_out", false);
            cc.tween(dialog)
                .to(0.5, {scale: 0}, {easing: "backIn"})
                .call(()=>{
                    free_dialog.active = false;
                    dialog.active = false;
                    // guochang.active = false;
                    success();
                })
                .start();
        });
    },

    //显示游戏界面：bFree true显示免费模式的界面，false 普通模式
    ShowGameview: function (bFree) {
        this._super(bFree);

        cc.find("collect_node", this.node).active = !bFree;
    },

    async triggerFreeGame() {
        this._bottomScript.ShowBtnsByState("moveing_1");

        Global.SlotsSoundMgr.playEffect("scatrwin");
        for (let i = 0; i < this._gameInfo.resultCards.length; i++) {
            let card = this._gameInfo.resultCards[i];
            if (card === this._cfg.scatterId) {
                let symbol = this.GetSymbolByIdx(i + 1);
                if (symbol) {
                    symbol.playWinAnimation();
                }
            }
        }

        // cc.vv.AudioManager.playEff("games/StoneAgedTreasure/", "bell", true);

        await cc.vv.gameData.awaitTime(2);

        await this.popFreeDialog();

        this.ShowGameview(true);

        // 触发免费游戏
        await cc.vv.gameData.awaitTime(0.5);

        Global.SlotsSoundMgr.stopBgm();
        Global.SlotsSoundMgr.playBgm("fgbgm");
        this.CanDoNextRound();
    },

    async triggerExitFreeGame() {
        this._bottomScript.ShowBtnsByState("moveing_1");

        await cc.vv.gameData.awaitTime(1);

        await this.popFreeResultDialog(Global.FormatNumToComma(cc.vv.gameData.GetGameTotalFreeWin()));

        this.ShowGameview(false);

        await cc.vv.gameData.awaitTime(0.5);

        this.ShowBottomWin(cc.vv.gameData.GetGameTotalFreeWin(), cc.vv.gameData.GetGameTotalFreeWin(), true, () => {
            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playNormalBgm();
            this.CanDoNextRound();
        });
    },

    popFreeDialog() {
        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect("fgbegin");
            let free_dialog = cc.find("free_dialog", this.node.parent);
            free_dialog.active = true;

            let guochang = cc.find("guochang", free_dialog);
            guochang.active = true;
            guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_in", false);

            let dialog = cc.find("common_enter_node", free_dialog);
            dialog.active = true;
            dialog.scale = 0;

            cc.tween(dialog)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let times = cc.find("times", dialog);
            times.getComponent(cc.Label).string = cc.vv.gameData.GetTotalFree();

            await cc.vv.gameData.awaitTime(2);

            guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_out", false);
            cc.tween(dialog)
                .to(0.5, {scale: 0}, {easing: "backIn"})
                .call(()=>{
                    free_dialog.active = false;
                    dialog.active = false;
                    guochang.active = false;
                    success();
                })
                .start();
        });
    },

    popMapEnterDialog(mapInfo) {
        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect("fgbegin");
            let free_dialog = cc.find("free_dialog", this.node.parent);
            free_dialog.active = true;

            let guochang = cc.find("guochang", free_dialog);
            guochang.active = true;
            guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_in", false);

            let dialog = cc.find("map_enter_node", free_dialog);
            dialog.active = true;
            dialog.scale = 0;

            cc.tween(dialog)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let times = cc.find("times", dialog);
            times.getComponent(cc.Label).string = cc.vv.gameData.GetTotalFree();

            let detail = cc.find("detail", dialog);
            detail.getComponent("ImgSwitchCmp").setIndex(this._cfg.mapCfg[mapInfo.currId - 1].detail);

            await cc.vv.gameData.awaitTime(2);

            guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_out", false);
            cc.tween(dialog)
                .to(0.5, {scale: 0}, {easing: "backIn"})
                .call(()=>{
                    free_dialog.active = false;
                    dialog.active = false;
                    guochang.active = false;
                    success();
                })
                .start();
        });
    },

    popFreeResultDialog(winCoin) {
        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect("fgend");
            let free_dialog = cc.find("free_dialog", this.node.parent);
            free_dialog.active = true;

            let guochang = cc.find("guochang", free_dialog);
            guochang.active = true;
            guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_in", false);

            let dialog = cc.find("result_node", free_dialog);
            dialog.active = true;
            dialog.scale = 0;

            cc.tween(dialog)
                .to(0.5, {scale: 1}, {easing: "backOut"})
                .start();

            let coin = cc.find("coin", dialog);
            coin.getComponent(cc.Label).string = winCoin;

            await cc.vv.gameData.awaitTime(2);

            guochang.getComponent(sp.Skeleton).setAnimation(0, "guochang_out", false);
            cc.tween(dialog)
                .to(0.5, {scale: 0}, {easing: "backIn"})
                .call(()=>{
                    free_dialog.active = false;
                    dialog.active = false;
                    guochang.active = false;
                    success();
                })
                .start();
        });
    },

    async collectSymbol() {
        if (cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() !== cc.vv.gameData.GetFreeTime()) {
            return;
        }

        if (this._gameInfo.mapInfo.progressData.currCnt === 0) {
            return;
        }

        let icon_gold = cc.find("collect_node/gold", this.node);
        let haveCollect = false;
        for (let i = 0; i < this._gameInfo.resultCards.length; i++) {
            let card = this._gameInfo.resultCards[i];
            if (card === this._cfg.collectSymbolId) {
                let symbol = this.GetSymbolByIdx(i + 1);
                if (symbol) {
                    haveCollect = true;
                    let img = cc.instantiate(cc.find("img_gold", this.node.parent));
                    img.active = true;
                    img.parent = this.node.parent;
                    img.scale = 0;
                    let startPos = symbol.node.convertToWorldSpaceAR(cc.v2(0, 0));
                    startPos = this.node.parent.convertToNodeSpaceAR(startPos);
                    img.position = startPos;
                    let endPos = icon_gold.convertToWorldSpaceAR(cc.v2(0, 0));
                    endPos = this.node.parent.convertToNodeSpaceAR(endPos);
                    cc.tween(img)
                        .to(0.5, {scale: 1}, {easing: "backOut"})
                        .call(()=>{
                            let particle = cc.instantiate(cc.find("particle_fly", this.node.parent));
                            particle.active = true;
                            particle.parent = this.node.parent;
                            particle.position = startPos;
                            cc.tween(particle)
                                .to(0.5, {position: endPos})
                                .removeSelf()
                                .start();
                        })
                        .to(0.5, {position: endPos})
                        .removeSelf()
                        .start();

                    let spine = cc.instantiate(cc.find("chips", this.node.parent));
                    spine.active = true;
                    spine.parent = this.node.parent;
                    spine.position = startPos;
                    spine.getComponent(sp.Skeleton).setAnimation(0, "chips_chuxian", false);
                    cc.tween(spine)
                        .delay(0.5)
                        .removeSelf()
                        .start();
                }
            }
        }

        if (haveCollect) {
            Global.SlotsSoundMgr.playEffect("goldfly");
            cc.tween(icon_gold)
                .delay(1)
                .call(()=>{
                    // Global.SlotsSoundMgr.playEffect("nezhaCollect");
                    let spine = cc.find("chips", icon_gold).getComponent(sp.Skeleton);
                    spine.node.active = true;
                    spine.setAnimation(0, "chips_collect", false);
                    spine.setCompleteListener(()=>{
                        spine.setCompleteListener(null);
                        spine.node.active = false;
                    })
                })
                .start();

            await cc.vv.gameData.awaitTime(1);

            await this.updateCollectProgress(this._gameInfo.mapInfo, true);
        }
    },

    async updateCollectProgress(mapInfo, isAdd) {
        let progress = cc.find("collect_node/mask/node", this.node);
        if (isAdd) {
            let jindutiao = cc.find("jindutiao", progress);
            jindutiao.getComponent(sp.Skeleton).setAnimation(0, "bar_che_collect", false);
            jindutiao.getComponent(sp.Skeleton).addAnimation(0, "bar_che", true);
            cc.tween(progress)
                .to(0.3, {x: 560 * (mapInfo.progressData.totalCnt / mapInfo.progressData.needCnt > 1 ?
                        1 : mapInfo.progressData.totalCnt / mapInfo.progressData.needCnt)})
                .start();

        } else {
            progress.x = 560 * (mapInfo.progressData.totalCnt / mapInfo.progressData.needCnt > 1 ?
                1 : mapInfo.progressData.totalCnt / mapInfo.progressData.needCnt);
        }
    },

    clearCollectProgress() {
        let progress = cc.find("collect_node/mask/node", this.node);
        progress.x = 0;
        // let box = cc.find("collect_node/box", this.node);
        // box.getComponent(sp.Skeleton).setAnimation(0, "box_idle", true);
    },
});