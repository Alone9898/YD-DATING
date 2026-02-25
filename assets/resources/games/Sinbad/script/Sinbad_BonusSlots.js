
let pickItemType={
    hide:1,
    idle:2,
    click:3,
    gray:4,
};

cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {
        _pickItemList:[],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    Init:function(){
        this._node_slots = cc.find("safe_node/slots", this.node);
        this._node_bonus = cc.find("safe_node/node_bonus", this.node);
        this._bonus_bg = cc.find("safe_node/spr_bg_bonus",this.node);
        this._node_bonus.active = false;
        this._bonus_bg.active = false;

        this._topAniNode = cc.find("top_ani",this._node_bonus);

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

        this._node_items = cc.find("node_items", this._node_bonus);
        for (let i = 1; i <= 15; i++){
            this._pickItemList[i] = cc.find("item"+i, this._node_items);
        }
        this._count_board = cc.find("count_board", this._node_bonus);

        this._par_addPick = cc.find("safe_node/Pick_LiZi", this.node);
        this._par_addPick.active = false;
        this._spine_JpSd = cc.find("safe_node/JP_ShanDian", this.node);
        this._spine_JpSd.active = false;

    },

    //创建卷轴
    createReels:function(col,row){
        let reelCmp = "Sinbad_BonusReels"
        for (let i = 0; i < col; i++) {
            let node = cc.find("slots/reels/reel" + (i+1),this._node_bonus)
            let scp = node.addComponent(reelCmp)
            scp.Init(i,row,this._topAniNode)
            this._reels.push(scp)
        }
    },

    setSpinCnt(curCnt){
        cc.find("pick_remain_0_EN", this._count_board).active = false;
        let spr = cc.find("spin_remain_0_EN", this._count_board);
        spr.active = true;
        spr.getComponent("ImgSwitchCmp").setIndex(curCnt);
    },

    setPickCnt(curCnt){
        cc.find("spin_remain_0_EN", this._count_board).active = false;
        let spr =  cc.find("pick_remain_0_EN", this._count_board);
        spr.active = true;
        spr.getComponent("ImgSwitchCmp").setIndex(curCnt);
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

    clickItemFunc(node, i){
        if(!this._canPick){
            return
        }
        node.stopAllActions();
        this._canPick = false;
        node.getComponent(cc.Button).interactable = false;
        Global.SlotsSoundMgr.playEffect("pick");

        this.pickItem(i);
    },

    setAutoPlay(){
        let list = [];
        for ( let i= 1;i<this._pickItemList.length;i++){
            let node = this._pickItemList[i];
            if(node.getComponent(cc.Button).interactable){
                list.push({node:node, idx:i});
            }
        }
        let randomIdx = Global.random(0,list.length-1)
        let self = this;
        cc.vv.gameData.checkAutoPlay(list[randomIdx].node,  function (){self.clickItemFunc(list[randomIdx].node,list[randomIdx].idx)});
    },

    initPickItemsNode(){
        let self = this;
        for (let i = 1;i < this._pickItemList.length; i++){
            if(this._bonusGame.state == 3){
                this.showPickItem(i,pickItemType.idle);
            } else {
                this.showPickItem(i,pickItemType.hide);
            }

            let node = this._pickItemList[i];
            node.off("click");
            node.on("click", ()=>{
                self.clickItemFunc(node, i)
            })
        }
    },

    getPickItemData(idx){
        let items = this._bonusGame.items;
        if(items){
            for (let i = 0; i < items.length; i++){
                if(items[i].idx == idx){
                    return items[i];
                }
            }
        }
        return null;
    },

    showPickItem(idx, type){
        return new Promise(async (success, failed)=> {
            let item = this._pickItemList[idx];
            let lbl = cc.find("lbl", item);
            let mask = cc.find("mask", item);
            let pickOne = cc.find("PickOne", item);

            if (type === pickItemType.hide) { // 隐藏
                item.active = false;
                lbl.active = false;
                mask.active = false;
                pickOne.active = false;
            } else if (type === pickItemType.idle) {   // 待机
                let data = this.getPickItemData(idx);
                if (data) {
                    item.active = true;
                    lbl.active = data.isOpen;
                    mask.active = false;
                    pickOne.active = !data.isOpen;

                    if (data.isOpen) {
                        item.getComponent(cc.Button).interactable = false;
                        lbl.getComponent(cc.Label).string = Global.formatNumShort(data.coin, 0);
                    } else {
                        item.getComponent(cc.Button).interactable = true;
                        pickOne.getComponent(sp.Skeleton).setAnimation(0, "PickOne_Loop_EN", true);
                    }
                } else {
                    item.active = false;
                }
            } else if (type === pickItemType.click) { // 点击
                let data = this.getPickItemData(idx);
                if (data) {
                    if (data.moveUp) {
                        await new Promise(async (success1, failed)=> {
                            Global.SlotsSoundMgr.playEffect("popup");
                            pickOne.getComponent(sp.Skeleton).setAnimation(0, "PickOne_Intro_Move_EN", false);
                            await cc.vv.gameData.awaitTime(0.8);
                            this.jpShowKuang(this._bonusGame.jackpotId-1);
                            success1();
                        });
                    }

                    if (data.pickCnt > 0) {
                        await new Promise(async (success2, failed)=> {
                            pickOne.getComponent(sp.Skeleton).setAnimation(0, cc.js.formatStr("PickOne_Intro_x%s_EN", data.pickCnt), false);
                            await cc.vv.gameData.awaitTime(0.8);
                            this._par_addPick.active = true;
                            this._par_addPick.getComponent(cc.ParticleSystem).resetSystem();
                            this._par_addPick.position = this._par_addPick.parent.convertToNodeSpaceAR(item.convertToWorldSpaceAR(cc.v2(0, 0)));
                            cc.tween(this._par_addPick).to(0.5, {position: this._par_addPick.parent.convertToNodeSpaceAR(this._count_board.convertToWorldSpaceAR(cc.v2(0, 0)))}).start()
                            await cc.vv.gameData.awaitTime(0.5);
                            this._par_addPick.active = false;
                            Global.SlotsSoundMgr.playEffect("addPick");
                            this.setPickCnt(this._bonusGame.pickCnt);
                            success2();
                        })
                    }

                    pickOne.active = false;
                    lbl.active = true;
                    lbl.getComponent(cc.Label).string = Global.formatNumShort(data.coin, 0);
                }
            } else if (type === pickItemType.gray) {  // 置灰
                let data = this.getPickItemData(idx);
                if (data) {
                    item.active = true;
                    lbl.active = true;
                    mask.active = true;
                    pickOne.active = false;

                    lbl.getComponent(cc.Label).string = Global.formatNumShort(data.coin, 0);
                }
            }

            success();
        })
    },

    // 选择一个图标后
    async pickItem(idx){
        this.setPickCnt(this._bonusGame.pickCnt-1)
        let reqdata = {rtype:2, choiceId:idx};
        let msg = await cc.vv.gameData.reqSubGame(reqdata);
        // cc.log(msg)
        if(msg.code === 200 && !msg.spcode && msg.data.rtype == 2){
            this._bonusGame = msg.data.bonusGame;
            cc.vv.gameData.setBonusGame(this._bonusGame);
            await this.showPickItem(idx, pickItemType.click);

            if(this._bonusGame.isEnd){
                await cc.vv.gameData.awaitTime(0.5);
                this.playGameResult();
            } else {
                this._canPick = true;
                this.setAutoPlay();
            }
        }
    },

    async enterBonusGame(isTri){
        return new Promise(async (success, failed)=> {

            Global.SlotsSoundMgr.playBgm("bgbgm");
            cc.vv.gameData.setIsBonusGame(true);

            this._bonusGame = cc.vv.gameData.getBonusGame();

            this.lockJackpot(this._bonusGame.jackpotValues);
            this.jpShowKuang(this._bonusGame.jackpotId ? this._bonusGame.jackpotId-1 : this._bonusGame.items.length-5);
            this.initSymbols();
            this.initPickItemsNode();
            if(this._bonusGame.spinCnt > 0){
                this.setSpinCnt(this._bonusGame.spinCnt);
            } else {
                this.setPickCnt(this._bonusGame.pickCnt);
            }

            this._node_slots.active = false;
            this._node_bonus.active = true;
            this._bonus_bg.active = true;

            await cc.vv.gameData.awaitTime(1);
            if(this._bonusGame.state == 1 || this._bonusGame.state == 2){ // 1=等待开始，2=spin状态，3=选择金币状态
                this.reqSpin();
            } else if(this._bonusGame.state == 3){
                this.startPickGame();
            }

            this._bonusSuccess = success;
        })
    },

    async playGameResult(){
        let items = Global.copy(this._bonusGame.items);
        items.sort((a,b)=>{
            return a.idx/5 - b.idx/5
        }).sort((a,b)=>{
            return (a.idx - 1) % 5 - (b.idx - 1) % 5
        })

        for (let i = 0; i < items.length; i++){
            if(!items[i].isOpen){
                this.showPickItem(items[i].idx, pickItemType.gray);
            }
        }

        let totalWin = this._bottomScript.getCurrentWin();
        for (let i = 0; i < items.length; i++){
            if(items[i].isOpen){
                Global.SlotsSoundMgr.playEffect("bgcount");
                this._par_addPick.active = true;
                this._par_addPick.getComponent(cc.ParticleSystem).resetSystem();
                this._par_addPick.position = this._par_addPick.parent.convertToNodeSpaceAR(this._pickItemList[items[i].idx].convertToWorldSpaceAR(cc.v2(0,0)));
                cc.tween(this._par_addPick)
                    .to(0.5, {position:this._par_addPick.parent.convertToNodeSpaceAR(cc.find("Canvas/safe_node/LMSlots_Bottom/winBg").convertToWorldSpaceAR(cc.v2(0,0)))})
                    .call(()=>{
                        this._par_addPick.active = false;
                    })
                    .start();

                await cc.vv.gameData.awaitTime(0.5);
                totalWin += items[i].coin;
                this._bottomScript.SetWin(totalWin);
                await cc.vv.gameData.awaitTime(0.2);
            }
        }

        this.jpWinAnim(this._bonusGame.jackpotId)
        // Global.SlotsSoundMgr.playEffect("JPcount");
        // this._spine_JpSd.active = true;
        // this._spine_JpSd.getComponent(sp.Skeleton).setAnimation(0,"JP_ShanDian", false);
        // this._spine_JpSd.getComponent(sp.Skeleton).setCompleteListener(()=>{
        //     this._spine_JpSd.getComponent(sp.Skeleton).setCompleteListener();
        //     this._spine_JpSd.active = false;
        // });

        await cc.vv.gameData.awaitTime(1.5);
        totalWin += this._bonusGame.jackpot.value;
        this._bottomScript.SetWin(totalWin);

        Global.SlotsSoundMgr.playEffect("bgend");
        await cc.vv.gameData.getPopupScript().playWinPanel(totalWin);
        cc.vv.gameData.getPopupScript().playYinBibQpAnim();
        await cc.vv.gameData.awaitTime(1.5);

        Global.SlotsSoundMgr.stopBgm();
        cc.vv.gameData.setIsBonusGame(false);
        this._node_slots.active = true;
        this._node_bonus.active = false;
        this._bonus_bg.active = false;
        this.unlockJackpot();
        this.jpShowKuang();

        if(cc.vv.gameData.isFreeGame()){// 判断是否在免费中
            let nTotal = cc.vv.gameData.getFreeWinCoin() + totalWin;
            cc.vv.gameData.setFreeWinCoin(nTotal);
            await new Promise((success, failed)=> {
                cc.vv.gameData.GetSlotsScript().ShowBottomWin(totalWin, nTotal, false, success);
            })
        } else {
            await new Promise((success, failed)=>{
                cc.vv.gameData.AddCoin(totalWin);
                this.ShowBottomWin(totalWin,totalWin,true,success)
            });
        }

        if(this._bonusSuccess){
            this._bonusSuccess();
            this._bonusSuccess = null;
        }

    },

    startPickGame(){

        this._node_items.active = true;
        let items = this._bonusGame.items;
        let list = [];
        for (let i = 0; i < items.length; i++){
            list[items[i].idx] = 1;
        }

        this._canPick = true;

        this.setAutoPlay();
    },

    async reqSpin(){
        this.StartMove(this._bonusGame);

        let reqdata = {rtype:1};
        let msg = await cc.vv.gameData.reqSubGame(reqdata);
        // cc.log(msg)
        if(msg.code === 200 && !msg.spcode && msg.data.rtype == 1){
            this._bonusGame = msg.data.bonusGame;
            this._gameInfo = this._bonusGame;
            this._currResult = msg.data.currResult;
            cc.vv.gameData.setBonusGame(this._bonusGame);
            this.SetSlotsResult(this._bonusGame.items,this._currResult)
        }
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

    //点击旋转按钮调用
    StartMove:function(data){
        this.setSpinCnt(data.spinCnt-1);

        this._bStopRightnow = null
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
        for (let i = 0; i < this._reels.length; i++){
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
        for (let i = 0; i < this._col; i++){
            if(!list[i+1]){
                if(i%5 > max%5 || (i%5 == max%5 && i/5 > max/5)){
                    max = i;
                }
            }
        }
        this.moveReelLastIdx = max;
    },

    //每列停止时间间隔 = 每列的停止间隔 + 每列的回弹时间
    //reelIdx:0开始
    GetReelStopInter:function(reelIdx){
        let nIter = this._cfg.reelStopInter || 0.6
        return reelIdx%5*nIter
    },

    async OnSpinEnd(){
        this.setSpinCnt(this._bonusGame.spinCnt);
        this.jpShowKuang(this._bonusGame.items.length-5);

        await cc.vv.gameData.awaitTime(0.5);
        if (this._bonusGame.state == 3){
            Global.SlotsSoundMgr.playEffect("50x");

            this.initPickItemsNode();
            this.setPickCnt(this._bonusGame.pickCnt);
            this.startPickGame();
        } else {
            this.reqSpin();
        }
    },

    getBonusRandVal(){
        let cfg = cc.vv.gameData.getGameCfg()
        let randIdx = Global.random(1,cfg.randomBonusSymbols.length)
        return cfg.randomBonusSymbols[randIdx-1]
    },

    jpWinAnim(idx){
        Global.SlotsSoundMgr.playEffect("JPcount");

        let pool = cc.find(cc.js.formatStr("Canvas/safe_node/LMSlots_PrizePool_1/prizePool_%s/lbl_num",(idx+4)));
        let sPos = this._spine_JpSd.parent.convertToNodeSpaceAR(pool.convertToWorldSpaceAR(cc.v2(0,0)));
        let ePos = this._spine_JpSd.parent.convertToNodeSpaceAR(cc.find("Canvas/safe_node/LMSlots_Bottom/winBg").convertToWorldSpaceAR(cc.v2(0,0)));

        let jpX = sPos.x + (ePos.x-sPos.x)/2;
        let jpY = sPos.y + (ePos.y-sPos.y)/2;
        let temp = cc.v2(sPos.x, sPos.y).sub(cc.v2(ePos.x, ePos.y));
        let length = temp.mag();
        let angle = temp.signAngle(cc.v2(1, 0));

        this._spine_JpSd.position = cc.v2(jpX+20,jpY);
        this._spine_JpSd.scaleY = length/750;
        this._spine_JpSd.angle = -angle * cc.macro.DEG - 90;

        this._spine_JpSd.active = true;
        this._spine_JpSd.getComponent(sp.Skeleton).setAnimation(0,"JP_ShanDian", false);
        this._spine_JpSd.getComponent(sp.Skeleton).setCompleteListener(()=>{
            this._spine_JpSd.getComponent(sp.Skeleton).setCompleteListener();
            this._spine_JpSd.active = false;
        });
    },


    jpShowKuang(idx){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");
        prizepool.showJPKuang(idx);
    },

    //奖池锁定(停止滚动)
    lockJackpot(jackpotvalus){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");

        let data = [];
        for (let i = 0; i < jackpotvalus.length; i++){
            data[i] = {
                prizeType:i,
                pauseNum:jackpotvalus[i]
            }
        }

        prizepool.PausePool(data);
    },

    //恢复奖池
    unlockJackpot(){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");
        prizepool.ResumePausePool();
    },


    // update (dt) {},
});
