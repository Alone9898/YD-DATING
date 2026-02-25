cc.Class({
    extends: require('LMSlots_Slots_Base'),

    properties: {},

    // LIFE-CYCLE CALLBACKS:

    //初始化
    Init: function () {
        this._topScript = cc.vv.gameData.GetTopScript()
        this._bottomScript = cc.vv.gameData.GetBottomScript()

        this._cfg = cc.vv.gameData.getGameCfg()
        this._col = 20
        this._row = 1

        this.createReels(this._col, this._row)

        this._bottomScript.ShowBtnsByState("idle")

        this.RegisterEvent()

        // //断线重连的显示
        // this.ReconnectShow()

        //初始化奖池
        // this.CheckJoopLock()

        this.node.active = false;
    },

    //创建卷轴
    createReels: function (col, row) {
        for (let i = 0; i < col; i++) {
            let node = cc.find("reels/reel" + (i + 1), this.node)
            let scp = node.addComponent('PowerOfTheKraken_BonusReel')
            scp.Init(i, row, this._topAniNode);
            this._reels.push(scp)
        }
    },

    //重写 每列停止时间间隔 = 每列的停止间隔 + 每列的回弹时间
    //reelIdx:0开始
    GetReelStopInter: function (reelIdx) {
        let nIter = this._cfg.reelStopInter || 0.6
        return reelIdx % 5 * nIter;
    },

    getSpecialData(idxs, items){
        let multList = [];
        let oceanList = [];
        let powerList = [];
        for (let i = 0; i < idxs.length; i++){
            if(items[i].c == 3){
                multList.push({idx:idxs[i], mult:items[i].times});
            } else if(items[i].c == 4){
                oceanList.push({idx:idxs[i], data:items[i]});
            } else if(items[i].c == 5){
                powerList.push({idx:idxs[i], data:items[i]});
            }
        }
        multList.sort((a,b)=>{
            return a.data.times < b.data.times
        });
        return {mult: multList, ocean:oceanList, power:powerList};
    },

    triMultSymbol(multList){
        return new Promise(async (success, failed) => {
            for (let i = 0; i < multList.length; i++) {
                Global.SlotsSoundMgr.playEffect("mul_trigger");
                let symbol = this.GetSymbolByIdx(multList[i].idx);
                symbol.playTriggerAnimation();

                await cc.vv.gameData.awaitTime(2.2);

                for (let col = 0; col < this._col; col++){
                    let i2 = this.bonusIdxs.indexOf(col+1);
                    if(i2 >= 0 && (this.bonusItems[i2].c == 2 || this.bonusItems[i2].c == 1)){
                        let symbol2 = this.GetSymbolByIdx(col+1);
                        Global.SlotsSoundMgr.playEffect("bonus_collect");
                        symbol2.playBonusSpecial();

                        if(this.bonusItems[i2].c == 2){
                            if(i == multList.length-1){
                                symbol2.setCoin(this.bonusItems[i2].coin);
                            } else {
                                symbol2.setCoin(this.bonusItems[i2].coin/multList[multList.length-1].mult * multList[i].mult);
                            }
                        } else {
                            symbol2.setJp(this.bonusItems[i2].id, multList[i].mult);
                        }

                        await cc.vv.gameData.awaitTime(0.3);
                    }
                }
            }
            success();
        })
    },

    triOceanSymbol(oceanList){
        return new Promise(async (success, failed) => {
            for (let i = 0; i < oceanList.length; i++) {
                Global.SlotsSoundMgr.playEffect("op_trigger");
                let symbol = this.GetSymbolByIdx(oceanList[i].idx);
                symbol.playTriggerAnimation();

                await cc.vv.gameData.awaitTime(2.2);

                krakenMgr.showTopBottomNode(false,false);
                let pos = symbol.node.convertToWorldSpaceAR(cc.v2(0,0));
                symbol.node.active = false;
                symbol.ClearState(false);
                await krakenMgr.oceanPickMgr.triOceanGame(oceanList[i].data, pos);

                krakenMgr.showTopBottomNode(true,true);
                let newData = {c:2, coin:oceanList[i].data.coin, times:1};
                symbol.node.active = true;
                symbol.ShowById(3, newData);
                symbol.setBonusToTop();
                symbol.playBonusSpecial();
                this.bonusItems[this.bonusIdxs.indexOf(oceanList[i].idx)] = newData;

                await cc.vv.gameData.awaitTime(0.3);
                krakenMgr.oceanPickMgr.node.active = false;
            }
            success();
        });
    },

    triPowerSymbol(powerList){
        return new Promise(async (success, failed) => {
            for (let i = 0; i < powerList.length; i++) {
                Global.SlotsSoundMgr.playEffect("kp_trigger");
                let symbol = this.GetSymbolByIdx(powerList[i].idx);
                symbol.playTriggerAnimation();

                await cc.vv.gameData.awaitTime(2.2);

                if(this.resultCoin > 0){
                } else {
                    krakenMgr.characterPlayResult();
                    await cc.vv.gameData.awaitTime(1)
                }

                for (let col = 0; col < this._col; col++){
                    let i2 = this.bonusIdxs.indexOf(col+1);
                    if(i2 >= 0 && (this.bonusItems[i2].c == 2 || this.bonusItems[i2].c == 1)){
                        let symbol2 = this.GetSymbolByIdx(col+1);
                        if(this.bonusItems[i2].c == 1){  // 奖池
                            Global.SlotsSoundMgr.playEffect("bell");
                            await krakenMgr.popupMgr.playJpWin(this.bonusItems[i2].id, this.bonusItems[i2].coin, this.bonusItems[i2].times);
                        }

                        Global.SlotsSoundMgr.playEffect("bonus_collect");
                        symbol2.playBonusSpecial();
                        let addCoin = this.bonusItems[i2].coin*this.bonusItems[i2].times;
                        this.resultCoin += addCoin;
                        krakenMgr.playXzAddCoin(this.resultCoin, addCoin);
                        await cc.vv.gameData.awaitTime(0.3);
                    }
                }
            }

            success();
        });
    },

    //重写spin end
    async OnSpinEnd() {
        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
        // this.setGameCnt(this._subGameData.totalSpinCnt-this._subGameData.spinCnt, this._subGameData.totalSpinCnt);
        await cc.vv.gameData.awaitTime(0.5);

        if(this._resultData.idxs.length > 0){
            let data_temp = this.getSpecialData(this._resultData.idxs, this._resultData.items);
            if(data_temp.mult.length > 0){
                await this.triMultSymbol(data_temp.mult);
            }
            if(data_temp.power.length > 0){
                await this.triPowerSymbol(data_temp.power);
            }
            if(data_temp.ocean.length > 0){
                await this.triOceanSymbol(data_temp.ocean);
            }
        }


        if(this._subGameData.isEnd){
            if(this.resultCoin > 0){  // 牌子已经举起

            } else {
                krakenMgr.characterPlayResult();
                await cc.vv.gameData.awaitTime(1);
            }
            cc.find("spin_bg", this.node).active = false;
            await this.playResultAnim();
            krakenMgr.characterHideResult();
            await cc.vv.gameData.awaitTime(0.5)
            krakenMgr.showTopBottomNode(false,false);
            Global.SlotsSoundMgr.stopBgm();
            await krakenMgr.popupMgr.endBonusGame(this._subGameData.winCoin);
            krakenMgr.playEndBonusAnim();
            await cc.vv.gameData.awaitTime(3.2);
            krakenMgr.playQiPaoQp();
            krakenMgr.showTopBottomNode(true,true);
            await cc.vv.gameData.awaitTime(0.5);
            this.node.active = false;
            krakenMgr.slotsMgr.node.active = true;
            await cc.vv.gameData.awaitTime(0.5);
            krakenMgr.playXzShowAnim();
            cc.vv.gameData.setIsBonus(false);

            let nWin = this._subGameData.winCoin;
            let nTotal = nWin;
            let updateAllCoin = true;
            if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()){
                nTotal = cc.vv.gameData.GetGameTotalFreeWin()
                updateAllCoin = false;
            } else {
                krakenMgr.collectMgr.setCollectState(true, true);
            }
            await new Promise((sucess, failed)=>{
                krakenMgr.slotsMgr.ShowBottomWin(nWin,nTotal,updateAllCoin,sucess)
            });

            if(this._callBack){
                this._callBack();
                this._callBack = null;
            }
        } else {
            this.reqSpine();
        }
    },

    playResultAnim(){
        return new Promise(async (success, failed) => {
            for (let col = 0; col < this._col; col++) {
                let i = this.bonusIdxs.indexOf(col + 1);
                if (i >= 0) {
                    let symbol = this.GetSymbolByIdx(this.bonusIdxs[i]);

                    if(this.bonusItems[i].c == 1){  // 奖池
                        Global.SlotsSoundMgr.playEffect("bell");
                        await krakenMgr.popupMgr.playJpWin(this.bonusItems[i].id, this.bonusItems[i].coin, this.bonusItems[i].times);
                    }
                    Global.SlotsSoundMgr.playEffect("bonus_collect");
                    symbol.playBonusWin(this.bonusItems[i]);

                    let addCoin = this.bonusItems[i].coin * this.bonusItems[i].times;
                    this.resultCoin += addCoin;
                    krakenMgr.playXzAddCoin(this.resultCoin, addCoin);
                    await cc.vv.gameData.awaitTime(0.3);
                }
            }
            success();
        });
    },


    //点击旋转按钮调用
    StartMove: function (bonusIdxs) {
        this._bStopRightnow = null
        this._gameInfo = null
        this._canStop = false;

        //每列转起来
        let reels = [];
        let reelIdxs = [];
        this._reels.forEach(reel => {
            if (!bonusIdxs.includes(reel.GetReelIdx() + 1)) {
                reels.push(reel)
                reelIdxs.push(reel.GetReelIdx())
            }
        })
        this.MoveReels(reels)
        this.setMoveLastIdx(reelIdxs);


        //设置停止时间
        //就是从开始旋转，如果多少秒会开始停止
        this._stopTime = this.GetStopTime()
    },

    //实际旋转起来的列，有时候需要1，2，4列转，
    //即最后停止下来的不是最后一列的序号，所以需要记录最后一列的序号
    //arry=[this._reels[0],this._reels[1],this._reels[4]]
    MoveReels: function (arry) {
        for (let i = 0; i < arry.length; i++) {
            let item = arry[i]
            item.StartMove()
        }
    },

    setMoveLastIdx(reelIdxs) {
        let max = reelIdxs[0];
        let reelMax = [];
        reelIdxs.forEach(idx => {
            if (idx % 5 > max % 5 || (idx % 5 == max % 5 && idx / 4 > max / 4)) {
                max = idx;
            }

            reelMax[idx % 5] = reelMax[idx % 5] ? Math.max(reelMax[idx % 5], idx) : idx;
        });
        this.moveReelLastIdx = max;
        // cc.log("StartMove：this.moveReelLastIdx:", this.moveReelLastIdx);
        this._reelMax = reelMax;
    },

    // 获取一竖排中最后的那个列
    getLastStopReel() {
        return this._reelMax
    },

    //设置旋转结果
    setSpinResult(bonusIdxs, bonusItems) {
        this._canStop = true;

        let cfg = cc.vv.gameData.getGameCfg()
        let cards = [];
        for (let i = 1; i <= 20; i++) {
            let randIdx = Global.random(1, cfg.randomSymbols.length)
            let randVal = cfg.randomSymbols[randIdx - 1]
            cards.push(randVal)
        }

        this.SetSlotsResult(cards, bonusIdxs, bonusItems);
    },


    SetSlotsResult: function (cards, bonusIdxs, bonusItems) {

        //把结果按卷轴结果整理
        let acRow = cards.length / this._col
        let reelResults = []

        for (let i = 0; i < cards.length; i++) {
            let row = Math.floor(i / acRow)
            let col = i % this._col
            //配置中有没有这个元素
            if (this._cfg.symbol[cards[i]]) {
                let res = {}
                res.sid = cards[i] //符号id
                res.data = {}

                if (bonusIdxs && bonusIdxs.includes(i + 1)) {
                    res.data = bonusItems[bonusIdxs.indexOf(i + 1)];
                    if(res.data.c == 3 || res.data.c  == 4 || res.data.c  == 5){
                        res.sid = 4;
                    } else {
                        res.sid = 3;
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

    CanStopSlot() {
        return this._canStop;
    },

    getSlotsIndex() {
        return this._slotsIndex;
    },

    backAllSymbol(idxs, items, resultCards){
        // cc.vv.gameData.setSymbolDark(true);
        for (let col = 0; col < this._col; col++) {
            let symbol = this.GetSymbolByIdx(col+1);
            symbol.ClearState();
            let i = idxs.indexOf(col+1)
            if(i>=0){
                if(items[i].c == 3 || items[i].c == 4 || items[i].c == 5){
                    symbol.ShowById(4, items[i]);
                } else {
                    symbol.ShowById(3, items[i]);
                }
                symbol.setBonusToTop();
            } else {
                if(resultCards && resultCards[col]){
                    symbol.ShowById(resultCards[col]);
                    symbol.playMaskVisible(true);
                } else {
                    symbol.ShowById(20);
                }
            }
        }
    },

    setGameCnt(curCnt, totalCnt) {
        this._curCnt = curCnt;
        this._totalCnt = totalCnt;
        let spin_bg = cc.find("spin_bg", this.node);
        if (totalCnt > 0) {
            spin_bg.active = true;
            cc.find("label_spins", spin_bg).active = curCnt != 1;
            cc.find("label_spin", spin_bg).active = curCnt == 1;
            cc.find("curCnt", spin_bg).x = curCnt == 1 ? -4 : 0;
            cc.find("totalCnt", spin_bg).x = curCnt == 1 ? 48 : 52;
            Global.setLabelString("curCnt", spin_bg, curCnt);
            Global.setLabelString("totalCnt", spin_bg, totalCnt)
            console.log("=====addcnt3", this._totalCnt, totalCnt);
        } else {
            spin_bg.active = false;
        }
    },

    addOneTotalCnt(){
        this._totalCnt += 1;
        console.log("=====addcnt", this._totalCnt)
        let boomSp = cc.find("spin_bg/314_respin_sz", this.node);
        boomSp.active = true;
        boomSp.getComponent(sp.Skeleton).setAnimation(0,"animation",false);
        Global.setLabelString("spin_bg/totalCnt", this.node, this._totalCnt);
    },

    showBgLines(bShow, bPlay) {
        let lines = cc.find("reels_bg/lines", this.node);
        if(bShow){
            lines.active = true;
            if (bPlay) {
                lines.opacity = 0;
                cc.tween(lines)
                    .to(0.5, {opacity: 255})
                    .start()
            } else {
                lines.opacity = 255;
                lines.stopAllActions();
            }
        } else {
            lines.active = false;
        }
    },

    // 请求旋转
    async reqSpine(){
        console.log("=====addcnt2", this._totalCnt)
        this.setGameCnt(this._curCnt+1, this._totalCnt);
        for (let i = 0; i < this.bonusItems.length; i++){
            if(this.bonusItems[i].c == 3 || this.bonusItems[i].c == 5){ // 倍数、power
                this.bonusItems.splice(i,1);
                this.bonusIdxs.splice(i,1);
            }
        }

        this.StartMove(this.bonusIdxs);

        let reqdata = {rtype:1};
        let result = await krakenMgr.reqSubGame(reqdata);
        if(result.code === 200 && !result.spcode) {
            this._subGameData = result.data.bonusGame;
            this._resultData = result.data.result;
            this.bonusIdxs = this._subGameData.slots.bonusIdxs;
            this.bonusItems = this._subGameData.slots.bonusItems;

            // cc.vv.gameData.setBonusGame(this._subGameData);
            this.setSpinResult(this._subGameData.slots.bonusIdxs, this._subGameData.slots.bonusItems);
        }
    },

    // 断线回到游戏
    showBonusGame(bonusGame){
        return new Promise(async (success, failed) => {
            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playBgm("respin_bgm");
            cc.vv.gameData.setIsBonus(true);
            this.node.active = true;
            krakenMgr.slotsMgr.node.active = false;

            this.bonusIdxs = bonusGame.slots.bonusIdxs;
            this.bonusItems = bonusGame.slots.bonusItems;
            this.resultCoin = bonusGame.winCoin || 0;
            krakenMgr.characterBackResult(this.resultCoin);

            this.backAllSymbol(this.bonusIdxs, this.bonusItems);
            this.setGameCnt(bonusGame.totalSpinCnt-bonusGame.spinCnt, bonusGame.totalSpinCnt);
            this.showBgLines(true, false);

            await cc.vv.gameData.awaitTime(1);
            this.reqSpine();

            this._callBack = success;
        })
    },

    triBonusGame(bonusGame, resultCards){
        return new Promise(async (success, failed) => {
            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playBgm("respin_bgm");

            cc.vv.gameData.setIsBonus(true);
            this.node.active = true;
            this.bonusIdxs = bonusGame.slots.bonusIdxs;
            this.bonusItems = bonusGame.slots.bonusItems;
            this.resultCoin = 0;

            this.backAllSymbol(this.bonusIdxs, this.bonusItems, resultCards);
            this.setGameCnt(bonusGame.totalSpinCnt-bonusGame.spinCnt, bonusGame.totalSpinCnt);
            this.showBgLines(true, true);

            krakenMgr.playTriBonusAnim();
            await cc.vv.gameData.awaitTime(3);
            krakenMgr.showTopBottomNode(true,true);

            if(this.bonusIdxs.length > 0){
                let data_temp = this.getSpecialData(this.bonusIdxs, this.bonusItems);
                if(data_temp.mult.length > 0){
                    await this.triMultSymbol(data_temp.mult);
                }
                if(data_temp.power.length > 0){
                    await this.triPowerSymbol(data_temp.power);
                }
                if(data_temp.ocean.length > 0){
                    await this.triOceanSymbol(data_temp.ocean);
                }
            }

            this.reqSpine();

            this._callBack = success;
        })
    },

    // async triOceanGame(idx){
    //
    //     let symbol = this.GetSymbolByIdx(idx);
    //     symbol.playTriggerAnimation();
    //
    //     await cc.vv.gameData.awaitTime(2);
    //
    //     await krakenMgr.oceanPickMgr.triOceanGame()
    // },

    // update (dt) {},
});
