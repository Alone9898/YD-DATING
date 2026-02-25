
cc.Class({
    extends: require("LMSlots_Slots_Base"),

    properties: {
        _slotCnt:3,
        _slotsList:[],
        _reelsList:[],
        _moveReels:[],
        _slotsCntList:[],
        _fullWinList:[],
        _spinCnt:0, // 剩余次数

        _stopEffInfo:[],

        _playBgm1:false,
        _playBgm2:false,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},


    Init(){
        this._topScript = cc.vv.gameData.GetTopScript()
        this._bottomScript = cc.vv.gameData.GetBottomScript()

        this._cfg = cc.vv.gameData.getGameCfg()
        this._col = 15
        this._row = 1

        this._node_bonus = cc.find("safe_node/node_bonus", this.node);
        this._node_bonus.active = false;

        this._node_slots = cc.find("slots", this._node_bonus);
        for (let i = 1; i <= 3; i++){
            let node = cc.find("slots"+i, this._node_slots);
            this.createReels(this._col,this._row, node, i);
            this._slotsList.push(node);

            let spr_cnt = cc.find("spr_cnt", node);
            this._slotsCntList.push(spr_cnt);
            let bonus_prize = cc.find("bonus_prize", node);
            bonus_prize.active = false;
            this._fullWinList.push(bonus_prize);
        }
        this._flyNode = cc.find("flyNode", this._node_slots);
        this._kuangNode = cc.find("kuangNode", this._node_slots);

        this._tit_nor = cc.find("node_tit/node_nor", this._node_bonus);
        this._tit_win = cc.find("node_tit/node_win", this._node_bonus);
        this._tit_nor.active = false;
        this._tit_win.active = false;

    },

    //创建卷轴
    createReels:function(col,row, slotNode, slotIdx){
        this._reelsList[slotIdx-1]=[];
        for (let i = 0; i < col; i++) {
            let node = cc.find("reels/reel" + (i+1),slotNode);
            let scp = node.addComponent("Archer_BonusReel");
            scp.Init(i,row, cc.find("top_ani", slotNode));
            scp.setType(slotIdx)
            this._reelsList[slotIdx-1].push(scp);
        }
    },


    //点击旋转按钮调用
    StartMove:function(){
        let slots = this._bonusGame.slots;

        this._bStopRightnow = null
        this._gameInfo = null

        //top状态更新
        this._topScript.StartMove()

        //清理数据
        cc.vv.gameData.ClearOneRoundData()

        this._moveReels = [];
        for (let s_i = 0; s_i < slots.length; s_i++){
            this._moveReels[s_i] = [];
            for (let r_i = 0; r_i < this._col; r_i++){
                if(!slots[s_i].bonusIdxs.includes(r_i+1)){
                    let reel = this._reelsList[s_i][r_i];
                    this._moveReels[s_i].push(reel);
                }
            }
        }

        //每列转起来
        this.moveReelLastIdx = -1
        this.MoveReels(this._moveReels[0], 1);
        this.MoveReels(this._moveReels[1], 2);
        this.MoveReels(this._moveReels[2], 3);

        //设置停止时间
        //就是从开始旋转，如果多少秒会开始停止
        this._stopTime = this.GetStopTime()
    },

    MoveReels:function(arry, slot_idx){
        for(let i = 0; i < arry.length; i++){
            let item = arry[i]
            item.StartMove()
            let idx = item.GetReelIdx()
            if(idx%5> this.moveReelLastIdx){
                this.moveReelLastIdx = idx
                this.moveSlotLastIdx = slot_idx;
            }
        }
    },

    //每列停止时间间隔 = 每列的停止间隔 + 每列的回弹时间
    //reelIdx:0开始
    GetReelStopInter:function(reelIdx){
        let nIter = this._cfg.reelStopInter || 0.6

        return (reelIdx%5)*nIter
    },

    //获取最后一个停下来的列序号
    GetLastStopReelIdx:function(){
        return {slots_idx:this.moveSlotLastIdx,reel_idx:this.moveReelLastIdx}
    },

    //点击停止按钮调用
    StopMove:function(){
        this._bStopRightnow = true
        this._bottomScript.ShowBtnsByState("moveing_1")

        this._stopTime = -1
        for (let idx = 0; idx < this._moveReels.length; idx++){
            let reels = this._moveReels[idx];
            for(let i = 0; i < reels.length; i++ ){
                let item = reels[i]
                let reelStopInterv = 0 //立即停止
                item.StopMove(reelStopInterv)
                item.StopMoveRightNow()
            }
        }
    },

    //收到旋转结果
    //gameData模块收到数据后，转发到此处
    onMsgSpine:function(){
        // cc.log(msg)

        this._gameInfo = Global.copy(this._bonusGame);
        // let cards = msg.resultCards
        this.SetSlotsResult()
        // this.SetReelStateInfo()

    },

    SetSlotsResult:function(){
        let bonusCards = cc.vv.gameData.getGameCfg().bonusIds;
        let slots = this._bonusGame.slots;
        for(let s_i = 0; s_i < this._slotCnt; s_i++){
            let reels = this._moveReels[s_i];
            let bonusIdxs = slots[s_i].bonusIdxs;
            let bonusItems = slots[s_i].bonusItems;
            for(let i = 0; i < reels.length; i++ ){
                let item = reels[i];
                let reelIdx = item.GetReelIdx();
                let res = {}
                if(bonusIdxs.includes(reelIdx+1)){
                    res.sid = bonusCards[s_i];
                    res.data = bonusItems[bonusIdxs.indexOf(reelIdx+1)];

                    this._stopEffInfo[reelIdx%5].bSpecial = true;
                } else {
                    res.sid = this.getRandomVal();
                }

                item.SetResult([res])
            }
        }
    },

    OnReelSpinEnd(colIdx){
        let info = this._stopEffInfo[colIdx%5];
        if(!info.bPlay){
            info.bPlay = true;
            if(info.bSpecial){
                Global.SlotsSoundMgr.playEffect("music_MagicLady_lightingBuling");
            } else {
                Global.SlotsSoundMgr.playEffect("music_MagicLady_reelstop");
            }
        }
    },


    async OnSpinEnd(){
        await cc.vv.gameData.awaitTime(1);

        let state = this._bonusGame.state;
        if(state == 1){
            Global.SlotsSoundMgr.playEffect("music_MagicLady_chooseLayerReady");
        }

        this.showKuangNode();
        let addT1 = this.updateFullWin(false);
        let addT2 = this.updateTotalCnt(false);
        await cc.vv.gameData.awaitTime(Math.max(addT1, addT2));

        if(this._bonusGame.isEnd){
            this.exitBonusGame();
        }else {
            if(state == 1){
                await this.winExtraSpins();
            }

            this.reqSpin();
        }
    },


    update (dt) {
        if(this._stopTime > 0){
            this._stopTime = this._stopTime - dt
            if(this._stopTime <= 0 ){ //空转时间到了
                if(this.CanStopSlot()){//满足开始停止的条件
                    this._roundSpineTime = 0
                    this._bottomScript.ShowBtnsByState("moveing_2")
                    //倒计时完，设置一次
                    for (let idx = 0; idx < this._slotCnt; idx++) {
                        let reels = this._reelsList[idx];
                        for (let i = 0; i < reels.length; i++) {
                            let item = reels[i]
                            let reelStopInterv = this.GetReelStopInter(i)
                            item.StopMove(reelStopInterv)
                        }
                    }
                }
                else{
                    //如果没有结果,则延迟一帧
                    this._stopTime = dt

                    //记录一个超时时间.
                    this._roundSpineTime = this._roundSpineTime || 0
                    this._roundSpineTime += dt
                    if(this._roundSpineTime > 30 ){
                        // this._stopTime = -1
                        this._topScript.SetBackLobby(true)
                    }
                }

            }
        }
    },

    // 断网重连
    ReconnectNet(){
        if(this._bonusGame.isEnd){  // 结算中，不处理

        }
        else /*if(this._stopTime > 0 && this._gameInfo)*/{  // 旋转中,且没收到51数据->重连
            this.enterBonusGame(false,true);
        }
    },

    // 进入小游戏
    enterBonusGame(isTri, bReconnect=false){
        return new Promise(async(success, failed)=> {
            this.changeBgm(false);

            cc.vv.gameData.setIsBonusGame(true);
            this._node_bonus.active = true;
            cc.vv.gameData.getManageScript().showCharacterActive(false);
            cc.vv.gameData.getManageScript().showBonusView(true);
            cc.vv.gameData.GetBottomScript().SetWin(0);

            this._bonusGame = cc.vv.gameData.getBonusGame();
            cc.vv.gameData.getManageScript().lockJackpot( this._bonusGame.jackpotValues);

            this._spinCnt = this._bonusGame.spinCnt;
            this.showRestCnt(this._spinCnt);
            this.updateTotalCnt(true);
            this.showKuangNode();
            this.updateFullWin(true);
            this.initStopInfo();

            this.initAllSymBol(isTri)
            if(isTri){
                await cc.vv.gameData.awaitTime(0.5);
                await this.playTriAnim();
                await cc.vv.gameData.getPopupScript().playTriBonus(this._bonusGame.totalSpinCnt);
            }

            let state = this._bonusGame.state;
            if(state == 1){
                await this.winExtraSpins();
            }

            this.reqSpin();

            if(!bReconnect){
                this._bonusSuccess = success;
            } else {
                success();
            }
        });
    },

    // 退出小游戏
    async exitBonusGame(){

        for (let s_i = 0; s_i < this._slotCnt; s_i++){
            for (let i = 0; i <  this._reelsList[s_i].length; i++){
                this.setKuangAnim(false, s_i, i);
            }
        }

        await this.playEndAnim();

        this.changeBgm(true);
        let winCoin = this._bonusGame.winCoin;
        await cc.vv.gameData.getPopupScript().playWinBonus(winCoin);

        cc.vv.gameData.setIsBonusGame(false);
        this._node_bonus.active = false;
        cc.vv.gameData.getPopupScript().playQPAnim();
        await cc.vv.gameData.awaitTime(1.3);
        cc.vv.gameData.getManageScript().showBonusView(false);
        cc.vv.gameData.getManageScript().unlockJackpot();
        // await cc.vv.gameData.getManageScript().playEndQpAnim();
        await cc.vv.gameData.awaitTime(0.4);
        cc.vv.gameData.getManageScript().showCharacterActive(true)
        await new Promise((success, failed)=>{
            cc.vv.gameData.AddCoin(winCoin);
            cc.vv.gameData.GetSlotsScript().ShowBottomWin(winCoin,winCoin,true,success)
        });

        if(this._bonusSuccess){
            this._bonusSuccess();
            this._bonusSuccess = null;
        }
    },

    winExtraSpins(){
        return new Promise(async (success, failed)=> {
            let toPos = cc.find("lbl", this._tit_nor).convertToWorldSpaceAR(cc.v2(0, 0));
            await cc.vv.gameData.getPopupScript().bonusExtraSpins(toPos);
            this._bonusGame = cc.vv.gameData.getBonusGame();
            this._spinCnt = this._bonusGame.spinCnt;
            this.showRestCnt(this._spinCnt, true);
            await cc.vv.gameData.awaitTime(0.8);

            this.changeBgm(false);
            success();
        });
    },

    async playEndAnim(){
        let slots = this._bonusGame.slots;
        let total = 0;
        for (let s_i = 2; s_i >= 0; s_i--){

            let extraCoin = slots[s_i].extraCoin;
            if(extraCoin > 0){
                let win = cc.find("win", this._fullWinList[s_i]);
                win.active = true;

                await cc.vv.gameData.awaitTime(0.5);
                win.active = false;

                let lbl = cc.find("lbl", this._fullWinList[s_i]);
                let startPos = lbl.position;
                let endPos = this._fullWinList[s_i].convertToNodeSpaceAR(this._tit_win.convertToWorldSpaceAR(cc.v2(0,0)));
                cc.tween(lbl).to(0.5, {position:endPos}).start();
                await cc.vv.gameData.awaitTime(0.5);
                this._fullWinList[s_i].active = false;
                lbl.position = startPos;

                total += extraCoin;
                this.showTitWin(total, 3);
                Global.SlotsSoundMgr.playEffect("music_MagicLady_lightingCollect4");
                await cc.vv.gameData.awaitTime(1);
            }

            let bonusIdxs = slots[s_i].bonusIdxs;
            let bonusItems = slots[s_i].bonusItems;

            bonusItems.sort((a,b)=>{
                return (a.idx-1) / 5 - (b.idx-1) / 5
            }).sort(function (a, b) {
                return (a.idx-1) % 5 - (b.idx-1) % 5
            });

            let winEff = ["music_MagicLady_lightingCollect1","music_MagicLady_lightingCollect2","music_MagicLady_lightingCollect3"]
            for (let i = 0; i < bonusItems.length; i++){
                let idx = bonusItems[i].idx
                let symbol = this._reelsList[s_i][idx-1].GetSymbolByRow(0)
                let topNode = symbol.getAnimationTop();
                if(topNode){
                    topNode.getComponent("Archer_Symbol").playBonusWinAnim();
                }

                if(bonusItems[i].coin){
                    total += bonusItems[i].coin;
                    this.showTitWin(total, s_i)

                    Global.SlotsSoundMgr.playEffect(winEff[s_i]);
                } else if(bonusItems[i].jackpot){
                    total += bonusItems[i].jackpot.value;
                    this.showTitWin(total, s_i)

                    Global.SlotsSoundMgr.playEffect("music_MagicLady_lightingCollectMini");
                }

                await cc.vv.gameData.awaitTime(0.7);
            }
        }
    },

    // bonus游戏旋转结果请求
    async reqSpin(){
        let reqdata = {rtype:2};
        let msg = await cc.vv.gameData.getManageScript().reqSubGame(reqdata);
        if(msg && msg.code === 200){
            this.changeBgm(false);
            cc.log(msg);
            this._spinCnt -= 1;
            this.showRestCnt(this._spinCnt);
            this.initStopInfo()
            this.StartMove();

            let result = msg.data.result;
            this._bonusGame = msg.data.bonusGame;
            this.onMsgSpine();

        }
    },

    // 初始化展示所有图标节点
    initAllSymBol(isTri){
        let bonusCards = cc.vv.gameData.getGameCfg().bonusIds;

        let slots = this._bonusGame.slots;
        for (let s_i = 0; s_i < this._slotCnt; s_i++){
            let cards = [];
            let data = [];

            slots[s_i].bonusItems.forEach(item=>{
                cards[item.idx-1] = bonusCards[s_i];
                data[item.idx-1] = item;
            });

            for (let i = 0; i <  this._reelsList[s_i].length; i++){
                let symbol = this._reelsList[s_i][i].GetSymbolByRow(0);
                symbol.setAnimationToTop(false);

                symbol.ShowById(14);
                if(cards[i]){
                    if(!isTri || (isTri && s_i == 0)){cc.log(symbol);
                        symbol.ShowById(cards[i], data[i]);
                        let aniNode = symbol.setAnimationToTop(true,true);
                        aniNode.getComponent("Archer_Symbol").playBonusIdleAnim();
                    }
                }
            }
        }
    },


    // 触发小游戏的动画
    playTriAnim(){
        return new Promise(async (success, failed)=> {
            let cfg = cc.vv.gameData.getGameCfg();
            let bonusCards = cfg.bonusIds;

            let slots = this._bonusGame.slots;
            let bonusItems = slots[0].bonusItems;

            bonusItems.sort((a,b)=>{
                return (a.idx-1) / 5 - (b.idx-1) / 5
            }).sort(function (a, b) {
                return (a.idx-1) % 5 - (b.idx-1) % 5
            });


            for (let i = 0; i <  bonusItems.length; i++){
                let idx = bonusItems[i].idx;
                let s_symbol = this._reelsList[0][idx-1].GetSymbolByRow(0);

                let fly_node = cc.find("fly", this._flyNode);
                if(!fly_node){
                    fly_node = cc.instantiate(cc.find(cfg.symbol[bonusCards[0]].node,s_symbol.node));
                    fly_node.name = "fly";
                    fly_node.parent = this._flyNode;
                }
                fly_node.position = this._flyNode.convertToNodeSpaceAR(s_symbol.node.convertToWorldSpaceAR(cc.v2(0,0)));

                for (let s_i = 1; s_i < this._slotCnt; s_i++){
                    let e_symbol = this._reelsList[s_i][idx-1].GetSymbolByRow(0);
                    let endPos = this._flyNode.convertToNodeSpaceAR(e_symbol.node.convertToWorldSpaceAR(cc.v2(0,0)));

                    fly_node.active = true;
                    fly_node.scale = 0.7
                    cc.tween(fly_node)
                        .to(0.3, {position:endPos, scale:0.9})
                        .to(0.2, {scale:0.4})
                        .to(0.1, {scale:0.7})
                        .start()
                    await cc.vv.gameData.awaitTime(0.6);
                    let showEff = (s_i==1)?"music_MagicLady_lighttingShow2":"music_MagicLady_lighttingShow3";
                    Global.SlotsSoundMgr.playEffect(showEff);

                    fly_node.active = false;

                    e_symbol.ShowById(bonusCards[s_i], bonusItems[i]);
                    let aniNode = e_symbol.setAnimationToTop(true,true);

                    let callBack = async function(){
                            await aniNode.getComponent("Archer_Symbol").playBonusShowAnim();
                            aniNode.getComponent("Archer_Symbol").playBonusIdleAnim();
                    };
                    callBack();

                    // await cc.vv.gameData.awaitTime(1);
                }
            }

            success();
        });
    },

    showRestCnt(cnt, bAdd){
        this._tit_nor.active = true;
        this._tit_win.active = false;

        cc.find("lbl", this._tit_nor).getComponent(cc.Label).string = cnt;
        let par = cc.find("par", this._tit_nor);
        if(bAdd){
            Global.SlotsSoundMgr.playEffect("music_MagicLady_addrespinnum");
            par.active = true;
            par.getComponent(cc.ParticleSystem).resetSystem();
        } else {
            par.active = false;
        }

    },

    showTitWin(winCoin, winType){
        this._tit_nor.active = false;
        this._tit_win.active = true;

        cc.find("lbl", this._tit_win).getComponent(cc.Label).string = Global.FormatNumToComma(winCoin);

        let kuang = cc.find("kuang", this._tit_win);
        kuang.active = true;
        kuang.getComponent("ImgSwitchCmp").setIndex(winType);
        kuang.opacity = 0;
        cc.tween(kuang)
            .to(0.1,{opacity:255})
            .delay(0.3)
            .to(0.1,{opacity:0})
            .start()
    },

    updateTotalCnt(init){
        let slots = this._bonusGame.slots;
        let addT = 0;
        for (let i = 0; i < this._slotsCntList.length; i++) {
            let total = slots[i].bonusIdxs.length;

            let lbl = cc.find("lbl", this._slotsCntList[i]);
            let light = cc.find("light", this._slotsCntList[i]);
            if (init) {
                lbl.getComponent(cc.Label).string = total;
                light.active = false;
            } else {
                let curCnt = Number(lbl.getComponent(cc.Label).string);
                lbl.getComponent(cc.Label).string = total;

                if (curCnt < total) {
                    cc.tween(lbl).to(0.5,{scale:1.2}).to(0.5,{scale:1}).start()

                    light.active = true;
                    light.opacity = 0;
                    cc.tween(light)
                        .to(0.3, {opacity: 255})
                        .delay(0.4)
                        .to(0.3, {opacity: 0})
                        .start()

                    addT = 1
                }
            }
        }

        if(addT > 0){
            Global.SlotsSoundMgr.playEffect("music_MagicLady_addrespinnum");
        }
        return addT
    },

    showKuangNode(){
        let slots = this._bonusGame.slots;
        for (let s_i = 0; s_i < this._slotCnt; s_i++) {
            let bonusIdxs = slots[s_i].bonusIdxs;
            let total = bonusIdxs.length;

            for (let i = 0; i < 15; i++){
                if(total >= 15-3 && !bonusIdxs.includes(i+1)){
                    this.setKuangAnim(true, s_i, i);
                }
                else {
                    this.setKuangAnim(false, s_i, i);
                }
            }
        }
    },

    updateFullWin(init){
        let slots = this._bonusGame.slots;
        for (let s_i = 0; s_i < this._slotCnt; s_i++) {
            let total = slots[s_i].bonusIdxs.length;
            let extraCoin = slots[s_i].extraCoin;
            if(init){
                if(total == 15 && extraCoin > 0){
                    this._fullWinList[s_i].active = true;
                    let lbl = cc.find("lbl", this._fullWinList[s_i]);
                    cc.find("win", this._fullWinList[s_i]).active = false;
                } else {
                    this._fullWinList[s_i].active = false;
                }
            } else {
                if(total == 15 && !this._fullWinList[s_i].active){
                    this._fullWinList[s_i].active = true;
                    let lbl = cc.find("lbl", this._fullWinList[s_i]);
                    cc.find("win", this._fullWinList[s_i]).active = false;

                    Global.SlotsSoundMgr.playEffect("sound_MagicLady_jackpot_jump");
                    Global.doRoallNumEff(lbl,0,extraCoin, 1.5,function () {
                        Global.SlotsSoundMgr.stopEffectByName("sound_MagicLady_jackpot_jump");
                        Global.SlotsSoundMgr.playEffect("sound_MagicLady_jackpot_over");
                    },null,0,true);

                    return 1.5
                }
            }
        }
        return 0
    },

    // updateFullWin(isTri){
    //     let slots = this._bonusGame.slots;
    //     for (let s_i = 0; s_i < this._slotCnt; s_i++) {
    //         if(isTri){
    //             this._fullWinList[s_i].active = false;
    //         } else {
    //             let bonusIdxs = slots[s_i].bonusIdxs;
    //             let total = bonusIdxs.length;
    //
    //             if(total == 15 && !this._fullWinList[s_i].active){
    //                 this._fullWinList[s_i].active = true;
    //                 let lbl = cc.find("lbl", this._fullWinList[s_i]);
    //                 cc.find("win", this._fullWinList[s_i]).active = false;
    //
    //                 Global.SlotsSoundMgr.playEffect();
    //                 Global.doRoallNumEff(lbl,0,slots[s_i].extraCoin, 1.5,null,null,0,true);
    //             }
    //         }
    //     }
    // },

    // 获取一个随机图标
    getRandomVal(){
        let cfg = cc.vv.gameData.getGameCfg()
        let randIdx = Global.random(1,cfg.randomSymbols.length)
        return cfg.randomSymbols[randIdx-1]
    },

    /**
     * @param bShow 是否显示
     * @param s_i slots序号
     * @param r_i 在卷轴中位置
     */
    setKuangAnim(bShow, s_i, r_i){
        if(bShow){
            let cloneNode = cc.find(cc.js.formatStr("kuang_ani_%s_%s",s_i,r_i),this._kuangNode);
            if(!cloneNode){
                cloneNode = cc.instantiate(cc.vv.gameData.GetPrefabByName("kuang_bonus"));
            }
            cloneNode.active = true;
            cloneNode.parent = this._kuangNode;
            cloneNode.name = cc.js.formatStr("kuang_ani_%s_%s",s_i,r_i);
            let pos = this._reelsList[s_i][r_i].node.convertToWorldSpaceAR(cc.v2(0,0));
            cloneNode.position = this._kuangNode.convertToNodeSpaceAR(pos);
            return cloneNode;
        } else {
            let showNode = cc.find(cc.js.formatStr("kuang_ani_%s_%s",s_i,r_i),this._kuangNode);
            if (showNode) {
                showNode.active = false;
            }
        }
    },

    initStopInfo(){
        for (let i = 0; i < 5; i++){
            this._stopEffInfo[i] = {bPlay:false, bSpecial:false};
        }
    },

    changeBgm(bStop){
        if(bStop){
            Global.SlotsSoundMgr.stopBgm();
            this._playBgm1 = false;
            this._playBgm2 = false;
        } else {
            if(this._spinCnt > 2 && !this._playBgm1){
                Global.SlotsSoundMgr.playBgm("music_MagicLady_RespinBG");
                this._playBgm1 = true;
                this._playBgm2 = false;
            }
            else if(this._spinCnt <= 2 && !this._playBgm2){
                Global.SlotsSoundMgr.playBgm("music_MagicLady_RespinBG2");
                this._playBgm1 = false;
                this._playBgm2 = true;
            }
        }
    },

    // update (dt) {},
});
