
//
let itemType = {
    none : 0,
    Mini : 1,
    Minor : 2,
    Major : 3,
    Maxi : 4,
    Grand : 5,
    jackpotBoost : 6,
    megaJackpotBoost : 7,
    superJackpotBoost : 8,
    jackpotRemove : 9,
};


cc.Class({
    extends: cc.Component,

    properties: {
        _itemList:[],
        _winItemList:[],

        _choiceIdxs:[],
        _canClick:false,

        _removeJpCnt:0,   // 隐藏的奖池个数
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    Init(){
        this._spr_bg_pick = cc.find("safe_node/spr_bg_pick", this.node);
        this._spr_bg_pick.active = false;

        this._node_slotsAni = cc.find("safe_node/slots/top_ani", this.node);
        this._node_slotsReel = cc.find("safe_node/slots/reels", this.node);
        this._node_pick = cc.find("safe_node/node_pick", this.node);
        this._node_pick.active = false;

        this._node_tit = cc.find("node_tit", this._node_pick);

        this._spine_db = cc.find("layout/spine_db", this._node_pick);
        this._spine_db.active = false;

        this._node_items = cc.find("layout/node_items", this._node_pick);
        for (let i = 1; i <= 18; i++){
            let item = cc.find("item"+i, this._node_items);
            Global.btnClickEvent(item, function () {
                this.onClickItem(item)
            }, this);
            this._itemList.push({node:item, type:itemType.none});
        }

        this._spr_mask = cc.find("layout/spr_mask", this._node_pick);
        this._spr_mask.active = false;

        // this._sym_win = cc.find("layout/sym_win", this._node_pick);
        // for (let i = 0; i < this._sym_win.childrenCount; i++){
        //     this._sym_win.children[i].active = false;
        // }

        this._node_top = cc.find("layout/node_top", this._node_pick);
        for (let i = 1; i <= 18; i++){
            let item = cc.find("win"+i, this._node_top);
            item.active = true;
            for (let idx = 0; idx < item.childrenCount; idx++){
                item.children[idx].active = false;
            }
            this._winItemList.push(item);
        }

        this._par_fly_jp = cc.find("par_fly_jp", this._node_pick);
        this._par_fly_jp.active = false;
    },

    onEnable(){
        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, this);
    },

    onDisable(){
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, false, this);
    },

    // 断网重连
    ReconnectNet(){
        if(this._jackpotGame.isEnd){// 结算中 -等待结算

        } else { // 游戏中 -刷新数据
            this.gainPickGame(false,true);
        }
    },

    initTit(){
        cc.find("spr_bonus", this._node_tit).active = false;
        cc.find("spr_freegame", this._node_tit).active = false;
        cc.find("spr_match", this._node_tit).active = true;
    },

    initAllItems(){
        for (let i = 0; i < this._itemList.length; i++){
            let pick = cc.find("pick", this._itemList[i].node);
            let choiceIdxs = this._jackpotGame.choiceIdxs;
            let results = this._jackpotGame.results;
            let type;
            if(choiceIdxs && choiceIdxs.includes(i+1)){
                type = results[choiceIdxs.indexOf(i+1)];
            }else {
                type = itemType.none;
            }
            let animName = this.getAnimNameByType(type);
            pick.getComponent(sp.Skeleton).setAnimation(0,animName, false);
            this._itemList[i].type = type;


            let winNode = cc.find("w"+type, this._winItemList[i]);
            if(type === 0){
                // winNode.active = false;
            }
            else if(type < 6){   // 普通
                winNode.active = true;
                let idxs = this.getSameTypeIdxs(type, this._curCnt-1);
                if(idxs.length >= 2){
                    winNode.getComponent(sp.Skeleton).setAnimation(0,"animation", true);
                } else {
                    winNode.getComponent(sp.Skeleton).setAnimation(0,"animation2", true);
                }
            }
            else {
                winNode.active = true;
                winNode.getComponent(sp.Skeleton).setAnimation(0,"animation1_1", true);
            }

        }
    },

    initWinItems(){
        for (let i = 0; i < this._winItemList.length; i++){
            let item = this._winItemList[i];
            for (let idx = 0; idx < item.childrenCount; idx++){
                item.children[idx].active = false;
            }
        }
    },

    initAllJackpot(){
        let choiceIdxs = this._jackpotGame.choiceIdxs;
        let results = this._jackpotGame.results;

        this._removeJpCnt = 0;
        for (let i = 0; i < choiceIdxs.length; i++){
            if(results[i] === 9){
                this._removeJpCnt += 1;
                this.showJackpot(false, this._removeJpCnt, true);
            }
        }
    },

    playItemBlinkAnim(){
        let idxsList = []
        let length = Global.random(4,7);
        for( ; idxsList.length < length; ){
            let num = Global.random(1,18)
            if( !idxsList.includes(num)){
                idxsList.push(num)
            }
        }

        for(let i = 0; i < idxsList.length; i++){
            let idx = idxsList[i]-1;

            if(this._itemList[idx].type === itemType.none){
                cc.find("pick", this._itemList[idx].node).getComponent(sp.Skeleton).setAnimation(0,"animation1", false);
            }

        }
    },

    // 获得pick游戏
    gainPickGame(isTri, bReconnect=false){
        return new Promise(async(success, failed)=> {
            // 不是免费游戏，触发局的钱不带入小游戏结算里面
            if(cc.vv.gameData.GetTotalFree() <= 0){
                cc.vv.gameData.GetBottomScript().SetWin(0);
            }

            this._jackpotGame = cc.vv.gameData.getJackpotGame();

            cc.vv.gameData.GetSlotsScript().showTaSpr(false);
            cc.vv.gameData.GetSlotsScript().removeAllFlyNode(false);

            this._spr_bg_pick.active = true;
            this._node_slotsAni.active = false;
            this._node_slotsReel.active = false;
            this._node_pick.active = true;
            this._spr_mask.active = false;
            // this._node_top.removeAllChildren();
            this._curCnt = this._jackpotGame.choiceIdxs.length;

            this._choiceIdxs = [];
            this.initTit();
            this.initWinItems();
            this.initAllItems();
            this.lockJackpot(this._jackpotGame.jackpotValues, this._jackpotGame.currMult);
            this.initAllJackpot();

            if(isTri){
                await cc.vv.gameData.awaitTime(1.5)
            }
            Global.SlotsSoundMgr.playBgm("pick_bgm");

            if(isTri && this._jackpotGame.powerUpCnt > 0){
                await cc.vv.gameData.getPopupScript().playPowerUpAnim(this._jackpotGame.powerUpCnt);
            }

            this._node_items.stopAllActions();
            this._node_items.runAction(cc.repeatForever(cc.sequence(
                cc.delayTime(3),cc.callFunc(()=>{this.playItemBlinkAnim()}))));

            await cc.vv.gameData.awaitTime(0.5)
            this._canClick = true;
            this._gatherInfo = false;
            this.setAutoPlay();

            if(!bReconnect){
                this._pickSuccess = success;
            } else {
                success();
            }
        });
    },

    // 结束pick游戏
    async endPickGame(){
        await cc.vv.gameData.awaitTime(1);
        this._spine_db.active = true;
        this._spine_db.getComponent(sp.Skeleton).setAnimation(0, "animation", false);

        this._node_items.stopAllActions();
        this.playWinResult();

        let isLock = this.getPoolBLock(this._jackpotGame.jackpot.id - 1);
        if(!isLock){
            this.playWinJpAnim(this._jackpotGame.jackpot.id, true);
        }

        await cc.vv.gameData.awaitTime(2);

        let winCoin = this._jackpotGame.winCoin;
        if(isLock){
            await cc.vv.gameData.getPopupScript().playEndPickAnim(winCoin);
        }else {
            this.playWinJpAnim(this._jackpotGame.jackpot.id, false);
            await cc.vv.gameData.getPopupScript().playEndPickJpAnim(winCoin, this._jackpotGame.jackpot.id);
        }

        cc.vv.gameData.getPopupScript().playQPMen();
        await cc.vv.gameData.awaitTime(2);
        this._spr_bg_pick.active = false;
        this._node_pick.active = false;
        this._node_slotsAni.active = true;
        this._node_slotsReel.active = true;
        this.unlockJackpot();
        cc.vv.gameData.GetSlotsScript().showTaSpr(true);
        this._removeJpCnt = 0;
        this.showJackpot(true, 5, true);

        await cc.vv.gameData.awaitTime(2);
        let nTotal = winCoin;
        if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()){
            nTotal += cc.vv.gameData.getFreeWinCoin()
            cc.vv.gameData.setFreeWinCoin(nTotal)
        }else if( cc.vv.gameData.GetFreeTime() === 0){  // 免费最后一局、和非免费
            cc.vv.gameData.AddCoin(winCoin)
        }
        await new Promise((success, failed)=>{
            cc.vv.gameData.GetSlotsScript().ShowBottomWin(winCoin,nTotal,true,function () {
                success();
            })
        });

        if(this._pickSuccess){
            Global.SlotsSoundMgr.stopBgm();
            let bgm = cc.vv.gameData.isSuperGame() ? "sb_bgm" : "fg_bgm";
            Global.SlotsSoundMgr.playBgm(bgm);

            this._pickSuccess();
            this._pickSuccess = null;
        }
    },

    onClickItem(node){
        let idx =  Number(node.name.substring("item".length));

        if(!this._canClick){    // 当前不可点击
            return false
        }
        if(this._itemList[idx-1].type !== itemType.none){   // 点击的图标已经打开了
            return false;
        }

        let results = this._jackpotGame.results;
        if(this._curCnt >= results.length){   // 当前的个数到最后一个了
            return false;
        }
        if(results[this._curCnt] > 5){ // 当前的图标为特殊图标，不可再点击了
            this._canClick = false;
        }

        if(this._choiceIdxs.includes(idx) || this._jackpotGame.choiceIdxs.includes(idx)){   // 重复数据
            return false;
        }

        this._curCnt += 1;
        this._choiceIdxs.push(idx);
        this._itemList[idx-1].type = results[this._curCnt-1];
        this._needAwait = results[this._curCnt-1] > 5;
        cc.log("this._needAwait", this._needAwait);
        this.showItemResult(node, results[this._curCnt-1], this._curCnt);

        if(this._gatherInfo){

        }else {
            cc.tween(node)
                .call(()=>{ this._gatherInfo = true;})
                .delay(0.5)
                .call(()=>{
                    this._canClick = false;
                    this.sendMsg();
                })
                .start()
        }

        return true
    },

    setAutoPlay(){

        let self = this;
        let randomIdx = Global.random(1,18);
        let item= cc.find("item" + randomIdx, this._node_items);
        cc.vv.gameData.checkAutoPlay(item, function () {
            let clickT = self.onClickItem(item);
            if(!clickT){
                self.setAutoPlay()
            }
        })

    },

    sendMsg(){
        let req = {c: MsgId.SLOT_SUBGAME_DATA};
        req.gameid = cc.vv.gameData.getGameId();
        req.data = {
            rtype:1,
            choiceIdxs:this._choiceIdxs,
        };
        cc.vv.NetManager.send(req,true);
        this._rcvMsg = false;

        this._choiceIdxs = [];
        this._canClick = false;
    },

    onRcvSubGameAction(msg){
        if(msg.code === 200){
            this._rcvMsg = true;

            let data = msg.data;
            this._jackpotGame = data.jackpotGame;
            cc.vv.gameData.setJackpotGame(this._jackpotGame);

            /*if(this._jackpotGame.isEnd){
                this.endPickGame();


            } else {

                //-- 判断特殊图标是否播完
                this._canClick = true;
                this._gatherInfo = false;
            }*/
        }
    },

    // 显示节点结果
    async showItemResult(node, type, curCnt){

        let pick = cc.find("pick", node);
        let animName = this.getAnimNameByType(type);

        let isLast = curCnt === this._jackpotGame.results.length
        if(isLast){
            pick.getComponent(sp.Skeleton).setAnimation(0,"animation11", false);
            pick.getComponent(sp.Skeleton).addAnimation(0,animName, false);
            await cc.vv.gameData.awaitTime(1)
        } else {
            pick.getComponent(sp.Skeleton).setAnimation(0,animName, false);
        }
        Global.SlotsSoundMgr.playEffect(type < 6 ? "jp_appear" : "boost_appear");

        await cc.vv.gameData.awaitTime(1);
        if(type < 6){

            let idxs = this.getSameTypeIdxs(type, curCnt);
            let animName = "animation2";
            if(idxs.length >= 2){
                animName = "animation";
            }
            let choiceIdxs = this._jackpotGame.choiceIdxs;
            for (let i = 0; i < idxs.length; i++){
                if(choiceIdxs[idxs[i]]){
                    let idx = choiceIdxs[idxs[i]];
                    let winNode = cc.find("w"+type,this._winItemList[idx-1]);
                    winNode.active = true;
                    winNode.getComponent(sp.Skeleton).setAnimation(0,animName, true);
                }
            }
        }
        else if(type >= 6){  // 特殊图标

            let jpList = ["MINI", "MINOR", "MAJOR", "MAXI", "GRAND"];
            let startPos = this._node_pick.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v2(0,0)));
            let prizeNode = cc.find("Canvas/safe_node/LMSlots_PrizePool_1/prizePool_"+jpList[this._removeJpCnt]);
            let endPos = this._node_pick.convertToNodeSpaceAR(prizeNode.convertToWorldSpaceAR(cc.v2(0,0)));

            this._par_fly_jp.active = true;
            this._par_fly_jp.getComponent(cc.ParticleSystem).resetSystem();
            this._par_fly_jp.position = startPos;
            cc.tween(this._par_fly_jp).to(0.5, {position:endPos}).start()
            await cc.vv.gameData.awaitTime(0.5);
            this._par_fly_jp.active = false;

            this._spine_db.active = true;
            this._spine_db.getComponent(sp.Skeleton).setAnimation(0, "animation", false);

            let singleTime = 1;
            let creTime = 0.1;
            if(type == 6){   // jackpot
                Global.SlotsSoundMgr.playEffect("jp_boost");
                this.increaseJackpot(this._jackpotGame.jackpotValues, singleTime,creTime,this._jackpotGame.currMult)
                await cc.vv.gameData.awaitTime((5-this._removeJpCnt)*creTime);
            } else if(type == 7){   //megaJackpotBoost
                Global.SlotsSoundMgr.playEffect("jp_boost");
                this.increaseJackpot(this._jackpotGame.jackpotValues, singleTime,creTime, this._jackpotGame.currMult)
                await cc.vv.gameData.awaitTime((5-this._removeJpCnt)*creTime);
            } else if(type == 8){   //superJackpotBoost
                Global.SlotsSoundMgr.playEffect("jp_boost");
                this.increaseJackpot(this._jackpotGame.jackpotValues, singleTime,creTime, this._jackpotGame.currMult)
                await cc.vv.gameData.awaitTime((5-this._removeJpCnt)*creTime);
            } else if(type == 9){   //jackpotRemove
                Global.SlotsSoundMgr.playEffect("jp_remove");
                this._removeJpCnt += 1;
                this.showJackpot(false, this._removeJpCnt, false);
                await cc.vv.gameData.awaitTime(1);
            }

            this._needAwait = false;
        }
    },

    // 最终赢奖动画
    playWinResult(){
        let jackpot = this._jackpotGame.jackpot;//最终获得的jackpot, {id=1, value=1000}
        let results = this._jackpotGame.results;
        let choiceIdxs = this._jackpotGame.choiceIdxs;

        this._spr_mask.active = true;
        for (let i = 0; i < choiceIdxs.length; i++){
            if(results[i] !== jackpot.id){
                cc.find("w"+results[i], this._winItemList[choiceIdxs[i]-1]).active = false;
            }
        }
    },

    // 获取当前类型的所有点
    getSameTypeIdxs(type, idx){
        let results = this._jackpotGame.results;
        let list = [];
        for (let i = 0; i < idx; i++){
            if(results[i] === type){
                list.push(i)
            }
        }
        cc.log(list)
        return list;
    },

    getAnimNameByType(type){
        switch (type) {
            case 0: return "animation1_1";
            case 1: return "animation7";
            case 2: return "animation6";
            case 3: return "animation5";
            case 4: return "animation4";
            case 5: return "animation3";
            case 6: return "animation8";
            case 7: return "animation9";
            case 8: return "animation10";
            case 9: return "animation2";
        }
    },

    //奖池锁定(停止滚动)
    lockJackpot(jackpotvalus, mult){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");
        prizepool.PausePool([{prizeType:0,pauseNum:jackpotvalus[0]*mult},{prizeType:1,pauseNum:jackpotvalus[1]*mult},
            {prizeType:2,pauseNum:jackpotvalus[2]*mult},{prizeType:3,pauseNum:jackpotvalus[3]*mult},{prizeType:4,pauseNum:jackpotvalus[4]*mult}]);
    },

    //恢复奖池
    unlockJackpot(){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");
        prizepool.ResumePausePool();
    },

    // 奖池增长
    increaseJackpot(jackpotvalus, singleTime, creTime, mult){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");
        prizepool.increaseJackpot([{prizeType:0,pauseNum:jackpotvalus[0]},{prizeType:1,pauseNum:jackpotvalus[1]},
            {prizeType:2,pauseNum:jackpotvalus[2]},{prizeType:3,pauseNum:jackpotvalus[3]},{prizeType:4,pauseNum:jackpotvalus[4]}], singleTime, creTime, mult);
    },

    // 显隐奖池
    showJackpot(bShow, cnt, init){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");
        if(init){
            for (let i = 0; i < cnt; i++){
                prizepool.showJackpot(bShow, i, init);
            }
        }
        else {
            prizepool.showJackpot(bShow, cnt-1, init);
        }

    },

    playWinJpAnim(jpId, bPlay){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");
        prizepool.playJp1Anim(jpId-1, bPlay);
    },

    getPoolBLock(idx){
        let prizepool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1").getComponent("LMSlots_PrizePool_Base");
         return prizepool.getPoolBLock(idx);
    },

    update (dt) {
        if(!this._needAwait && this._rcvMsg){      // 特殊图标动画完成，收到51回调消息
            this._needAwait = true;
            this._rcvMsg = false;

            cc.log(this._jackpotGame)
            if(this._jackpotGame.isEnd){
                this.endPickGame();


            } else {

                //-- 判断特殊图标是否播完
                this._canClick = true;
                this._gatherInfo = false;

                this.setAutoPlay()
            }
        }
    },
});
