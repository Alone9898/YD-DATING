
cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {
        _wildInfo:[],

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    Init(){
        this._super();

        this._node_wilds = cc.find("node_wild", this.node);

        // this._top_men = cc.find("top_men",this.node)
        // this._top_men.children.forEach(child=>{child.active = false;})
    },


    async ReconnectShow(){
        this._topScript.SetBackLobby(false);
        this._bottomScript.ShowBtnsByState("moveing_1");

        if (cc.vv.gameData.GetTotalFree() > 0){
            this.recoverShip();
            this.ShowGameview(true);

        } else {
            this.ShowGameview(false);
        }

        let collectGame = cc.vv.gameData.getCollectGame();
        if(collectGame){
            if(collectGame.state === 1) {
                await cc.vv.gameData.getWheelScript().enterWheel();
            } else if(collectGame.state === 2){
                await cc.vv.gameData.getMapScript().enterGame(false)
            }
        }

        if(cc.vv.gameData.getBonusGame()){
            await cc.vv.gameData.getBonusSlotsScript().enterBonusGame(false);
        }


        if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetFreeTime() == 0){
            await this.endFreeGame();
        }

        this._topScript.StopMove()
        this._bottomScript.CanDoNextRound();
    },

    ReconnectNet(){
        let collectGame = cc.vv.gameData.getCollectGame();
        if(this._stopTime > 0 && !this._gameInfo){  // 旋转中，未收到44返回
            this.ReconnectShow();
        }
        else if(collectGame && collectGame.state === 1){  // 收集游戏-转盘
            cc.vv.gameData.getWheelScript().ReconnectNet();
        }
        else if(collectGame && collectGame.state === 2) {  // 收集游戏-
            cc.vv.gameData.getMapScript().ReconnectNet(false)
        }
        else if(cc.vv.gameData.getBonusGame()){ // bonus游戏
            this.ReconnectShow();
        }
    },

    StartMove(){
        if(cc.vv.gameData.isBonusGame()){
            cc.vv.gameData.getBonusSlotsScript().StartMove();
        } else {

            this._super();
            Global.SlotsSoundMgr.playNormalBgm();

            if(cc.vv.gameData.isFreeGame() && cc.vv.gameData.getWildInfo()){
                this.popShipWildNode();
            }
        }
    },

    StopMove(){
        if(cc.vv.gameData.isBonusGame()){
            cc.vv.gameData.getBonusSlotsScript().StopMove();
        } else {
            this._super();


        }
    },

    onMsgSpine(msg){
        this._super(msg);

        if(cc.vv.gameData.isFreeGame() && msg.wildInfo){
            this.SetStopTime(10);

            this._wildInfo = msg.wildInfo;
            this.moveShipWildNode();
        }
    },


    OnSpinEnd(){
        this.onSpinEndAction();
    },

    async onSpinEndAction(){
        // 进度条
        this.playCollectAnim();

        if(cc.vv.gameData.isFreeGame()){
            for (let i = 0; i < this._wildInfo.length; i++) {
                this.GetSymbolByIdx(this._wildInfo[i].idx).setWildMult(this._wildInfo[i].mult);
            }
        }
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
        if(this._gameInfo.collectGame.state == 1){  // 跟转盘游戏赢的钱一起更新
            updateBalance = false;
        }
        await new Promise((sucess, failed)=>{
            this.ShowBottomWin(nWin,nTotal,updateBalance,sucess)
        });

        // 收集满获得转盘游戏
        if(this._gameInfo.collectGame.state == 1){
            if(!nWin){
                await cc.vv.gameData.awaitTime(1.5)
            }

            Global.SlotsSoundMgr.playEffect("triggering");
            await cc.vv.gameData.awaitTime(1);
            await cc.vv.gameData.getWheelScript().enterWheel();
        }


        if(this._gameInfo.bonusGame){
            if(this._gameInfo.collectGame.state !== 1 && !nWin){
                await cc.vv.gameData.awaitTime(1.5)
            }
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
            let isFirst = this._gameInfo.freeCnt === this._gameInfo.allFreeCnt;
            let freeInfo = this._gameInfo.freeResult.freeInfo
            if(isFirst){
                let idxs = freeInfo.scatterIdx;
                for (let i = 0; i < idxs.length; i++){
                    let symbol = this.GetSymbolByIdx(idxs[i]);
                    if(symbol){
                        symbol.playTriggerAnimation();
                    }
                }
                Global.SlotsSoundMgr.playEffect("retrigger");
                await cc.vv.gameData.awaitTime(1.5);

                await cc.vv.gameData.getPopupScript().triFreeGame(isFirst, freeInfo.freeCnt);
                cc.vv.gameData.getPopupScript().playKQpAnim();

                await cc.vv.gameData.awaitTime(3.5);
                this.Backup();
                this.ShowGameview(true);

                await cc.vv.gameData.awaitTime(1);
            } else {
                await cc.vv.gameData.getPopupScript().triFreeGame(isFirst, freeInfo.freeCnt);
            }
    //
            success();
        });
    },

    endFreeGame(){
        return new Promise(async (success, failed)=> {
            let nWin = cc.vv.gameData.getFreeWinCoin();

            Global.SlotsSoundMgr.playEffect("fgend");
            await cc.vv.gameData.getPopupScript().playWinPanel(nWin);

            cc.vv.gameData.getPopupScript().playKQpAnim();
            await cc.vv.gameData.awaitTime(3.5);
            this.Resume();
            this.ShowGameview(false);
            this.destroyAllShip();
            this._wildInfo = [];
            Global.SlotsSoundMgr.stopBgm();

            await cc.vv.gameData.awaitTime(1);

            await new Promise((sucess, failed)=>{
                this.ShowBottomWin(nWin,nWin,true,sucess)
            });

            success();
        });
    },

    triBonusGame(){
        return new Promise(async (success, failed)=> {
            // await cc.vv.gameData.awaitTime(1.5)

            await cc.vv.gameData.getPopupScript().triBonusGame();
            cc.vv.gameData.getPopupScript().playYinBibQpAnim();
            await cc.vv.gameData.awaitTime(1.5);
            await cc.vv.gameData.getBonusSlotsScript().enterBonusGame(true);

            success();
        });
    },

    //显示中奖路线
    //竞品中的显示线路是：先总，后单条循环。目前我们只显示总的
    ShowWinTrace:function(){
        this.hideAllShip();

        let allWinIdx = []
        let scatterWinIdx = []

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
                scatterWinIdx[val] = 1
            }
        }

        //总
        for (const key in allWinIdx) {
            let symbol = this.GetSymbolByIdx(Number(key))
            if(symbol){
                symbol.playWinAnimation()
                symbol.ShowKuang()
            }
        }
        for (const key in scatterWinIdx) {
            let symbol = this.GetSymbolByIdx(Number(key))
            if(symbol){
                symbol.playWinAnimation()
                // symbol.ShowKuang()
            }
        }
    },

    ShowGameview:function(bFree){
        this._super(bFree);

        cc.vv.gameData.setIsFreeGame(bFree);

        if(bFree){
            Global.SlotsSoundMgr.playBgm("fgbgm");

            let nTotal = cc.vv.gameData.getFreeWinCoin()
            this._bottomScript.SetWin(nTotal)
        }
    },

    // 复制一个船
    getShipByIdx(idx){

        if(cc.find("wild_"+idx, this._node_wilds)){
            return cc.find("wild_"+idx, this._node_wilds);
        } else {
            let node = cc.instantiate(cc.vv.gameData.GetPrefabByName("ship"));
            node.active = true;
            node.parent = this._node_wilds;
            node.name = "wild_"+idx;
            node.position = this.getShipPosByIdx(idx);

            return node;
        }
    },

    // 销毁所有船
    destroyAllShip(){
        for (let i = 0; i < this._node_wilds.childrenCount; i++){
            this._node_wilds.children[i].destroy();
        }
    },

    // 隐藏所有船
    hideAllShip(){
        for (let i = 0; i < this._node_wilds.childrenCount; i++){
            this._node_wilds.children[i].active = false;
        }
    },


    // 断线重连恢复船的位置
    recoverShip(){
        // let list = [];
        this._wildInfo = cc.vv.gameData.getWildInfo();
        this._wildInfo.forEach(info=>{
            // if(info.prevIdx && !list.includes(info.idx) && info.idx%5!==1){
                // list.push(info.idx);
                this.GetSymbolByIdx(info.idx).ShowById(1);
            // }
        });
    },

    popShipWildNode(){

        for (let i = 0; i < this._wildInfo.length; i++){
            let idx = this._wildInfo[i].idx;

            let ship = this.getShipByIdx(idx);
            ship.active = true;
            ship.getComponent(sp.Skeleton).setAnimation(0,"Wild_Intro",true);

        }
    },

    async moveShipWildNode(){

        let wildInfo = this._wildInfo;

        await cc.vv.gameData.awaitTime(1);
        let bMove = false;
        for (let i = 0; i < wildInfo.length; i++){
            if(wildInfo[i].prevIdx){
                bMove = true;
                wildInfo[i].prevIdx.forEach((pIdx, j)=>{
                    let ship = this.getShipByIdx(pIdx);
                    if(ship){
                        cc.tween(ship)
                            .to(0.8, {position:this.getShipPosByIdx(wildInfo[i].idx)})
                            .call(()=>{
                                if(j >= 1){
                                    ship.destroy();
                                } else {
                                    ship.getComponent(sp.Skeleton).setAnimation(0,"Wild_Loop",false);
                                    ship.name = "wild_"+wildInfo[i].idx;
                                }
                            })
                            .start()
                    }
                })
            }
        }

        for (let i = 0; i < 3; i++){    // 第一列
            // let idx = i*5+1;
            let ship = cc.find("wild_"+(i*5+1), this._node_wilds);
            if(ship){
                bMove = true;
                ship.getComponent(sp.Skeleton).setAnimation(0,"Wild_Intro",true);
                cc.tween(ship)
                    .to(1, {position:cc.v2(-this._node_wilds.width/2-100,ship.y)})
                    .call(()=>{
                        ship.destroy();
                    })
                    .start()
            }
        }
        if(bMove){
            Global.SlotsSoundMgr.playEffect("wildMove");
            await cc.vv.gameData.awaitTime(1);
        }

        this.SetStopTime(this.GetStopTime());
    },


    getShipPosByIdx(idx){
        let col = (idx-1)%5;
        let row = Math.floor((idx-1)/5);
        let height = cc.vv.gameData.getGameCfg().symbolSize.height;
        let pos = this._reels[col].node.convertToWorldSpaceAR(cc.v2(0, (1-row)*height));
        return this._node_wilds.convertToNodeSpaceAR(pos);
    },

    // 播放能量收集动画
    playCollectAnim(){
        let cards = this._gameInfo.resultCards;
        let list = [];
        for (let i = 0; i < cards.length; i++){
            if(cards[i] === 3){     // bonus图标
                list.push(i+1);
            }
        }
        if(list.length > 0){
            cc.vv.gameData.getCollectScript().playCollectAnim(list);
        }
    },


    // update (dt) {},
});
