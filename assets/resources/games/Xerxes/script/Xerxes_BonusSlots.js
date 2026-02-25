
cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    //初始化
    Init:function(){
        this._node_bonus = cc.find("safe_node/node_bonus", this.node)
        this._node_bonus.active = false;
        this._topAniNode = cc.find("top_ani",this._node_bonus),

        this._topScript = cc.vv.gameData.GetTopScript()
        this._bottomScript = cc.vv.gameData.GetBottomScript()

        this._cfg = cc.vv.gameData.getGameCfg()
        this._col = this._cfg.bonusCol
        this._row = this._cfg.bonusRow

        this.createReels(this._col,this._row)

        // this._bottomScript.ShowBtnsByState("idle")

        // this.RegisterEvent()

        //断线重连的显示
        // this.ReconnectShow()

        //初始化奖池
        // this.CheckJoopLock()

        cc.find("huo_kuang", this._node_bonus).active = false;

        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.onRecvMsgSubAction, this);
    },

    onDestroy(){
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.onRecvMsgSubAction, false, this);
    },

    //创建卷轴
    createReels:function(col,row){
        let reelCmp = "Xerxes_BonusReels"
        for (let i = 0; i < col; i++) {
            let node = cc.find("slots/reels/reel" + (i+1),this._node_bonus)
            let scp = node.addComponent(reelCmp)
            scp.Init(i,row,this._topAniNode)
            this._reels.push(scp)

        }
    },

    initSymbols(){
        let items = this._bonusGame.items;

        let bonusList = []
        for (let i = 0; i < items.length; i++){
            let symbol = this.GetSymbolByIdx(items[i].idx)
            symbol.ShowById(3, items[i])
            bonusList[items[i].idx] = true;
        }

        for (let i = 0 ;i < this._col*this._row; i++){
            if(!bonusList[i+1]){
                let symbol = this.GetSymbolByIdx(i+1)
                symbol.ShowById(this.getBonusRandVal())
            }
        }
    },

    setSlotRow(bAdd){
        let slots = cc.find("slots",  this._node_bonus);
        let node_cnt = cc.find("node_cnt",  this._node_bonus);
        let singleH = 118;
        let initH = 357;

        if(bAdd){
            let newHeight = initH + (this._curRow-3)*singleH;
            cc.tween(slots).to(0.5, {height:newHeight}).start();
            cc.tween(node_cnt).to(0.5, {y:slots.position.y+newHeight+50}).start()
        } else {
            let row = this._bonusGame.row;
            slots.height = initH + (row-3)*singleH;
            node_cnt.y = slots.position.y+slots.height+50;
            this._curRow = row;
        }
    },

    async setRestCnt(curT, bInit){
        let node_cnt = cc.find("node_cnt", this._node_bonus);
        let ani_add = cc.find("item3/ani_add", node_cnt);
        ani_add.active = false;

        let nodeList = [];
        for (let i = 1; i <= 3; i++){
            nodeList[i] = cc.find(cc.js.formatStr("item%s/light", i), node_cnt);
        }

        if(!bInit){
            let curNode = null;
            let newNode = null;
            for (let i = 1; i <= 3; i++){
                curNode = nodeList[i].active?nodeList[i]:curNode;
                newNode = i===curT?nodeList[i]:newNode;
            }

            if(curNode){
                cc.tween(curNode).to(0.3, {scale:0}).start()
                await cc.vv.gameData.awaitTime(0.2);
                curNode.active = false;
            }

            if(curT === 3){  // 有了新的图标
                Global.SlotsSoundMgr.playEffect("Pomi_respinTime_rest");
                newNode.setScale(0);
                newNode.active = true;
                cc.tween(newNode).to(0.3, {scale:1}).start()

                ani_add.active = true;
                ani_add.getComponent(cc.Animation).play("bonus_add");
            } else {
                if(newNode){
                    newNode.active = true;
                    newNode.setScale(0);
                    cc.tween(newNode).to(0.3, {scale:1}).start()
                }
            }
        } else {
            for (let i = 1; i <= 3; i++){
                nodeList[i].active = i===curT;
                nodeList[i].setScale(1);
            }
        }
    },

    initAllNode(){
        this._bonusGame = cc.vv.gameData.getBonusGame();
        this.setSlotRow(false);
        this.setRestCnt(this._bonusGame.spinCnt, true);
        this.initSymbols();
    },

    async enterBonusGame(isTri){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playBgm('music_Pomi_Respin_Bg');

            cc.vv.gameData.setIsBonusGame(true);
            this._bottomScript.SetWin(0);

            this._bonusGame = cc.vv.gameData.getBonusGame();

            if(!isTri){
                this.initAllNode();
                cc.find("Canvas/safe_node/Xerxes").active = false;
                cc.find("Canvas/safe_node/slots").opacity = 0;
                // cc.find("Canvas/safe_node/LMSlots_PrizePool_1/prizePool_MINI").active = false;
                // cc.find("Canvas/safe_node/LMSlots_PrizePool_1/prizePool_MINOR").active = false;
            }

            this._node_bonus.active = true;

            await cc.vv.gameData.awaitTime(1);
            this.reqSpin();

            this._bonusSuccess = success;
        })
    },

    reqSpin(){
        this.StartMove(this._bonusGame);

        let req = {c: MsgId.SLOT_SUBGAME_DATA};
        req.data = {rtype : 1}
        req.gameid = cc.vv.gameData.getGameId()
        cc.vv.NetManager.send(req,true);
    },

    async onRecvMsgSubAction(msg){
        if (msg.code === 200) {
            this._bonusGame = msg.data.bonusGame;
            this._gameInfo = this._bonusGame;
            this._currResult = msg.data.currResult;
            cc.vv.gameData.setBonusGame(this._bonusGame);
            this.SetSlotsResult(this._bonusGame.items,this._currResult)
        }
    },

    StartMove(data){
        this.setRestCnt(data.spinCnt-1, false);
        // this.SetStopTime(1);

        // this._bStopRightnow = null
        this._gameInfo = null
        //top状态更新
        // this._topScript.StartMove()

        //清理数据
        // cc.vv.gameData.ClearOneRoundData()

        //每列转起来
        let reels = [];
        let list = []
        for (let i = 0; i < data.items.length; i++){
            list[data.items[i].idx] = true;
        }
        for (let i = (6-data.row)*5; i < this._reels.length; i++){
            if(!list[i+1]){
                reels.push(this._reels[i])
            }
        }
        this.MoveReels(reels)
        this.setMoveLastIdx(list);

        //设置停止时间
        //就是从开始旋转，如果多少秒会开始停止
        this._stopTime = this.GetStopTime()
    },

    setMoveLastIdx(list){
        let max = 0;
        for (let i =  (6-this._bonusGame.row)*5; i < this._col; i++){
            if(!list[i+1]){
                if(i%5 > max%5 || (i%5 == max%5 && i/6 > max/6)){
                    max = i;
                }
            }
        }
        this.moveReelLastIdx = max;
    },

    SetSlotsResult:function(items, result){
        let list = []
        for (let i = 0; i < items.length; i++){
            list[items[i].idx] = {};

            list[items[i].idx].data = items[i];
            list[items[i].idx].sid = 3;
        }
        for (let i = 0; i < result.length; i++){
            if(result[i].type == 2){
                list[result[i].idx].sid = 301;
            } else if(result[i].type == 3){
                list[result[i].idx].sid = 302;
            }
        }

        let reelResults = [];
        for (let col = 0; col < this._col; col++){
            let res = {}
            if(list[col+1]){
                res = Global.copy(list[col+1])
            } else {
                res.sid = this.getBonusRandVal()
            }

            if(!reelResults[col]) reelResults[col] = []
            reelResults[col].unshift(res)
        }

        for(let i = 0; i < this._reels.length; i++){
            let item = this._reels[i]
            let reelRes = reelResults[i]
            item.SetResult(reelRes)
        }
    },

    //每列停止时间间隔 = 每列的停止间隔 + 每列的回弹时间
    //reelIdx:0开始
    GetReelStopInter:function(reelIdx){
        let nIter = this._cfg.reelStopInter || 0.6
        return reelIdx%5*nIter
    },


    //列回弹动作最低点
    OnReelBounsActionDeep:function(colIdx){
        let symId = this._reels[colIdx].GetSymbolByRow(0).GetShowId();
        if(symId === 3){
            Global.SlotsSoundMgr.playEffect("music_Pomi_Bonus_down_base");
        } else if(symId === 301 || symId === 302){
            Global.SlotsSoundMgr.playEffect("music_Pomi_Bonus_down_Special");
        }
    },

    async OnSpinEnd(){
        if(this._gameInfo.isEnd){
            this.setRestCnt(0);
        } else if(this._bonusGame.spinCnt == 3){
            this.setRestCnt(this._bonusGame.spinCnt, false);
        }

        if(this._currResult){
            for (let i = 0; i < this._currResult.length; i++){
                if(this._currResult[i].type && this._currResult[i].type == 2){
                    await this.playUpAnim(this._currResult[i]);
                } else if(this._currResult[i].type && this._currResult[i].type == 3){
                    await this.playExtraAnim(this._currResult[i]);
                }
            }
        }

        await cc.vv.gameData.awaitTime(1);

        if(this._gameInfo.isEnd){   // 结束
            this.playGameResult();
        } else {
            this.reqSpin();
        }
    },

    async playGameResult(){
        Global.SlotsSoundMgr.playEffect("music_Pomi_respin_end");
        await cc.vv.gameData.awaitTime(0.5);

        let totalWin = this._bottomScript.getCurrentWin();

        let items = Global.copy(this._bonusGame.items);
        items.sort((a,b)=>{
            return a.idx/5 - b.idx/5
        }).sort((a,b)=>{
            return (a.idx - 1) % 5 - (b.idx - 1) % 5
        })

        for (let i = 0; i < items.length; i++){
            let symbol = this.GetSymbolByIdx(items[i].idx);
            if(symbol){
                Global.SlotsSoundMgr.playEffect("music_Pomi_Bonus_collect_coins");
                symbol.playBonusJiesuan();
                if(items[i].coin){  // 金币
                    totalWin += items[i].coin;
                } else if(items[i].jackpot){    // 奖池
                    totalWin += items[i].jackpot.value;
                    await cc.vv.gameData.getPopupScript().playWinJp(items[i].jackpot.value, items[i].jackpot.id);
                }
                this._bottomScript.SetWin(totalWin);
                await cc.vv.gameData.awaitTime(0.5);
            }
        }

        await cc.vv.gameData.getPopupScript().endBonusGame(totalWin);
        await cc.vv.gameData.GetSlotsScript().playBonusQp(false);
        cc.vv.gameData.setIsBonusGame(false);
        this._node_bonus.active = false;

        if(cc.vv.gameData.isFreeGame()){// 判断是否在免费中
            let nTotal = cc.vv.gameData.getFreeWinCoin() + totalWin;
            cc.vv.gameData.setFreeWinCoin(nTotal);
            await new Promise((success, failed)=> {
                cc.vv.gameData.GetSlotsScript().ShowBottomWin(totalWin, nTotal, false, success);
            })
        } else {
            await new Promise((sucess, failed)=>{
                cc.vv.gameData.AddCoin(totalWin);
                this.ShowBottomWin(totalWin,totalWin,true,sucess)
            });
        }

        if(this._bonusSuccess){
            this._bonusSuccess();
            this._bonusSuccess = null;
        }
    },

    getBonusRandVal(){
        let cfg = cc.vv.gameData.getGameCfg()
        let randIdx = Global.random(1,cfg.randomBonusSymbols.length)
        return cfg.randomBonusSymbols[randIdx-1]
    },

    // 赢上升图标
    async playUpAnim(info){
        return new Promise(async (success, failed)=> {
            let idx = info.idx;
            let symbol = this.GetSymbolByIdx(idx);
            symbol.playBonusTriAnim();
            Global.SlotsSoundMgr.playEffect("music_Pomi_reelsUP_Trigger");
            await cc.vv.gameData.awaitTime(0.5);
            Global.SlotsSoundMgr.playEffect("music_Pomi_ReelsUp_action");

            this._curRow += 1;
            this.setSlotRow(true);
            let curRow = this._curRow; // 上升后的当前行数

            let huo_kuang = cc.find("huo_kuang", this._node_bonus);
            huo_kuang.active = true;
            huo_kuang.scaleY = curRow;
            huo_kuang.getComponent(cc.Animation).play("bonus_huo_up");
            huo_kuang.getComponent(cc.Animation).off("stop");
            huo_kuang.getComponent(cc.Animation).on("stop", () => {
                huo_kuang.getComponent(cc.Animation).off("stop");
                huo_kuang.getComponent(cc.Animation).play("bonus_huo_up_loop");
            });

            await cc.vv.gameData.awaitTime(1);
            cc.vv.gameData.getPopupScript().showShake(1, 5, 5);
            await cc.vv.gameData.getPopupScript().playHuoshanAnim();

            huo_kuang.active = false;
            huo_kuang.getComponent(cc.Animation).stop();

            symbol.playBonusChangeAnim(info);
            Global.SlotsSoundMgr.playEffect("music_Pomi_DoubleBet_Trigger");
            await cc.vv.gameData.awaitTime(1);

            success();
        })
    },

    // 赢扩散图标
    async playExtraAnim(info){
        return new Promise(async (success, failed)=> {
            let idx = info.idx;
            let symbol = this.GetSymbolByIdx(idx);
            symbol.playBonusTriAnim();
            await cc.vv.gameData.awaitTime(0.5);

            let idxs = info.effectIdxs;
            if(idx.length > 0) {
                Global.SlotsSoundMgr.playEffect("music_Pomi_DoubleBet_Trigger");
                let fly_node = cc.find("fly_huoqiu", this._node_bonus);
                for (let i = 0; i < idxs.length; i++) {
                    let endSymbol = this.GetSymbolByIdx(idxs[i]);
                    if (endSymbol) {
                        let flyNode = cc.instantiate(fly_node);
                        flyNode.active = true;
                        flyNode.parent = this._node_bonus;
                        let startPos = this._node_bonus.convertToNodeSpaceAR(symbol.node.convertToWorldSpaceAR(cc.v2(0, 0)));
                        let endPos = this._node_bonus.convertToNodeSpaceAR(endSymbol.node.convertToWorldSpaceAR(cc.v2(0, 0)));
                        let v = cc.v2(endPos.x, endPos.y).sub(cc.v2(startPos.x, startPos.y));
                        let angle = v.signAngle(cc.v2(1, 0));
                        flyNode.angle = -angle * cc.macro.DEG - 90;
                        // cc.log(idxs[i],   flyNode.angle)

                        flyNode.position = startPos;
                        flyNode.scaleY = 0;
                        cc.tween(flyNode)
                            .parallel(
                                cc.tween().to(0.5, {position: cc.v2(endPos.x, endPos.y)}),
                                cc.tween().to(0.3, {scaleY: 1}).to(0.2, {scaleY: 0}),
                            )
                            // .to(1, {position:cc.v2(endPos.x, endPos.y), scaleY:0})
                            .call(() => {
                                flyNode.destroy();
                                endSymbol.playBonusExtraBoom();
                                endSymbol.playBonusKuangAnim(true);
                            })
                            .start()
                    }
                }
            }

            await cc.vv.gameData.awaitTime(0.5);
            cc.vv.gameData.getPopupScript().showShake(1, 5, 5);
            cc.vv.gameData.getPopupScript().playHuoshanAnim();
            cc.vv.gameData.getPopupScript().playHuoqiuEffect(true);
            await cc.vv.gameData.awaitTime(1);

            let  fly_big = cc.find("fly_huoqiu_big", this._node_bonus);
            for (let i = 0; i < idxs.length; i++){
                let endSymbol = this.GetSymbolByIdx(idxs[i]);
                if(endSymbol){
                    let flyNode = cc.instantiate(fly_big);
                    flyNode.active = true;
                    flyNode.parent = this._node_bonus;
                    // fly_node.position = this._node_bonus.;

                    let endPos = this._node_bonus.convertToNodeSpaceAR(endSymbol.node.convertToWorldSpaceAR(cc.v2(0,0)));
                    flyNode.position = cc.v2(endPos.x, this._node_bonus.y+ this._node_bonus.height/ 2 + 100);

                    cc.tween(flyNode)
                        .to(1, {position:endPos})
                        .call(()=>{
                            Global.SlotsSoundMgr.playEffect("music_Pomi_DoubleBet_action")
                            flyNode.destroy();
                            endSymbol.playBonusBoom();
                            endSymbol.setNum(endSymbol.getNum()*2);
                            endSymbol.playBonusKuangAnim(false);
                        })
                        .start()
                    await cc.vv.gameData.awaitTime(0.3);
                }
            }

            await cc.vv.gameData.awaitTime(2);
            symbol.playBonusChangeAnim(info);
            Global.SlotsSoundMgr.playEffect("music_Pomi_DoubleBet_Trigger");
            await cc.vv.gameData.awaitTime(1);

            success();
        })
    },

    // jiesuan

    // update (dt) {},
});
