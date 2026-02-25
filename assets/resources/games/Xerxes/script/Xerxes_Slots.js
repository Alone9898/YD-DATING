
cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    async ReconnectShow(){
        this._topScript.SetBackLobby(false);
        this._bottomScript.ShowBtnsByState("moveing_1");

        Global.SlotsSoundMgr.playEffect("music_Pomi_enter")

        if (cc.vv.gameData.GetTotalFree() > 0){
            this.ShowGameview(true);
        } else {
            this.ShowGameview(false);
        }

        let bonusGame = cc.vv.gameData.getBonusGame();
        if(bonusGame){
            await cc.vv.gameData.getBonusSlots().enterBonusGame(false)
        }

        if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetFreeTime() == 0){
            await this.CheckExitFreeGame();
        }

        this._topScript.StopMove()
        this._bottomScript.CanDoNextRound();
    },

    ReconnectNet(){
        this.ReconnectShow()
    },

    StartMove(){
        if(cc.vv.gameData.isBonusGame()){
            cc.vv.gameData.getBonusSlots().StartMove();
        } else {
            this._super();
            Global.SlotsSoundMgr.playNormalBgm();
        }
    },

    StopMove(){
        if(cc.vv.gameData.isBonusGame()){
            cc.vv.gameData.getBonusSlots().StopMove();
        } else {
            this._super();
        }
    },

    SetSlotsResult:function(cards){
        let dataList = [];
        if(this._gameInfo.bonusInfo && this._gameInfo.bonusInfo.length > 0){
            for (let i = 0; i < this._gameInfo.bonusInfo.length; i++){
                let info = this._gameInfo.bonusInfo[i];
                dataList[info.idx-1] = info;
            }
        }

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
                res.data = dataList[i];
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

    OnSpinEnd(){
        this.onSpinEndAction();
    },

    async onSpinEndAction(){

        //显示中奖路线
        this.ShowWinTrace();
        //显示底部赢钱
        let nWin = cc.vv.gameData.GetGameWin()
        let nTotal = nWin
        let updateBalance = true;
        if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()){
            nTotal = cc.vv.gameData.getFreeWinCoin();
            updateBalance = false;
        }
        await new Promise((sucess, failed)=>{
            this.ShowBottomWin(nWin,nTotal,updateBalance,sucess)
        });

        // 触发小游戏
        if(this._gameInfo.bonusGame){
            await this.triBonusGame();
        }

        // 触发免费
        let freeInfo = this._gameInfo.freeResult.freeInfo;
        if(freeInfo && freeInfo.freeCnt > 0){
            await this.triFreeGame();
        }

        // 结束免费
        if(this._gameInfo.allFreeCnt > 0 && this._gameInfo.freeCnt == 0){
            await this.endFreeGame();
        }

        this.CanDoNextRound()
    },

    triFreeGame(){
        return new Promise(async (success, failed)=> {
            let freeInfo = this._gameInfo.freeResult.freeInfo
            let idxs = freeInfo.scatterIdx;
            for (let i = 0; i < idxs.length; i++){
                let symbol = this.GetSymbolByIdx(idxs[i]);
                if(symbol){
                    symbol.playTriggerAnimation();
                }
            }
            Global.SlotsSoundMgr.playEffect("music_Pomi_Trigger_Freespin");
            await cc.vv.gameData.awaitTime(1.5);

            let isFirst = this._gameInfo.freeCnt === this._gameInfo.allFreeCnt;
            await cc.vv.gameData.getPopupScript().triFreeGame(isFirst, freeInfo.freeCnt);
            if(isFirst){
                await this.playFreeQp(true);
            }

            success();
        });
    },

    endFreeGame(){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("music_Pomi_freespin_end");
            await cc.vv.gameData.awaitTime(0.5)

            let nWin = cc.vv.gameData.getFreeWinCoin();

            await cc.vv.gameData.getPopupScript().endFreeGame(nWin, this._gameInfo.allFreeCnt);
            await this.playFreeQp(false);

            await new Promise((success2, failed)=>{
                this.ShowBottomWin(nWin,nWin,true,success2)
            });

            success();
        });
    },

    triBonusGame(){
        return new Promise(async (success, failed)=> {

            let items = this._gameInfo.bonusInfo;
            for (let i = 0; i < items.length; i++){
                let symbol = this.GetSymbolByIdx(items[i].idx);
                if(symbol){
                    symbol.playBonusTriAnim(true);
                }
            }
            Global.SlotsSoundMgr.playEffect("music_Pomi_Trigger_Freespin");
            await cc.vv.gameData.awaitTime(1.5);
            await cc.vv.gameData.getPopupScript().triBonusGame();

            await this.playBonusQp(true);
            await cc.vv.gameData.getBonusSlots().enterBonusGame(true);


            success();
        });
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
        // if(this._gameInfo.scatterZJLuXian && this._gameInfo.scatterZJLuXian.indexs){
        //     for(let i = 0; i < this._gameInfo.scatterZJLuXian.indexs.length; i++){
        //         let val = this._gameInfo.scatterZJLuXian.indexs[i]
        //         allWinIdx[val] = 1
        //     }
        // }

        //总
        for (const key in allWinIdx) {
            let symbol = this.GetSymbolByIdx(Number(key))
            if(symbol){
                symbol.playWinAnimation()
                symbol.ShowKuang()
            }
        }
    },

    async playFreeQp(bFree){
        return new Promise(async (success, failed)=> {
            let LMSlots_PrizePool_1 = cc.find("Canvas/safe_node/LMSlots_PrizePool_1");
            let slots = cc.find("Canvas/safe_node/slots");

            cc.vv.gameData.getPopupScript().playQpAnim();

            cc.vv.gameData.getPopupScript().showShake(2, 5, 5);
            cc.tween(LMSlots_PrizePool_1).to(0.5, {opacity: 0}).start();
            cc.tween(slots).to(0.5, {opacity: 0}).start();
            await cc.vv.gameData.awaitTime(0.5);
            cc.vv.gameData.getPopupScript().playHuoshanAnim();
            // cc.vv.gameData.getPopupScript().playHuoqiuEffect();
            await cc.vv.gameData.awaitTime(1.5);

            if (bFree) {
                this.Backup();
                this.ShowGameview(true);
            } else {
                this.Resume();
                this.ShowGameview(false);
            }

            cc.tween(LMSlots_PrizePool_1).to(0.5, {opacity: 255}).start();
            cc.tween(slots).to(0.5, {opacity: 255}).start();

            await cc.vv.gameData.awaitTime(1);
            success();
        })
    },

    async playBonusQp(bBonus){
        return new Promise(async (success, failed)=> {
            let LMSlots_PrizePool_1 = cc.find("Canvas/safe_node/LMSlots_PrizePool_1");
            let slots = cc.find("Canvas/safe_node/slots");
            let node_bonus = cc.find("Canvas/safe_node/node_bonus");

            cc.vv.gameData.getPopupScript().playQpAnim(bBonus);

            cc.vv.gameData.getPopupScript().showShake(2,5,5);
            cc.tween(LMSlots_PrizePool_1).to(0.5, {opacity: 0}).start();
            if(bBonus){
                cc.tween(slots).to(0.5, {opacity: 0}).start();
            } else {
                cc.tween(node_bonus).to(0.5, {opacity: 0}).start();
            }

            await cc.vv.gameData.awaitTime(0.5);
            cc.vv.gameData.getPopupScript().playHuoshanAnim();
            // cc.vv.gameData.getPopupScript().playHuoqiuEffect();
            await cc.vv.gameData.awaitTime(1.5);

            cc.vv.gameData.getBonusSlots().initAllNode();
            cc.tween(LMSlots_PrizePool_1).to(0.5, {opacity: 255}).start();
            // cc.find("prizePool_MINI",LMSlots_PrizePool_1).active = !bBonus;
            // cc.find("prizePool_MINOR",LMSlots_PrizePool_1).active = !bBonus;  

            if(bBonus){
                node_bonus.active = true;
                cc.tween(node_bonus).to(0.5, {opacity: 255}).start();
            } else {
                slots.active = true;
                cc.tween(slots).to(0.5, {opacity: 255}).start();
            }

            await cc.vv.gameData.awaitTime(1)
            success();
        })
    },

    //显示游戏界面：bFree true显示免费模式的界面，false 普通模式
    ShowGameview:function(bFree){
        cc.vv.gameData.setIsFreeGame(bFree)

        if(bFree){
            let total = cc.vv.gameData.GetTotalFree()
            let rest = cc.vv.gameData.GetFreeTime()

            //显示免费次数
            this._bottomScript.ShowFreeModel(true,total-rest,total)
            let nTotal = cc.vv.gameData.getFreeWinCoin()
            this._bottomScript.SetWin(nTotal)
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

        if(bFree){
            Global.SlotsSoundMgr.playBgm("music_Pomi_Freespin_Bg")
        } else {
            Global.SlotsSoundMgr.stopBgm()
        }

    },

    // update (dt) {},
});
