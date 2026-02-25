
cc.Class({
    extends: cc.Component,

    properties: {
        _curBoxStatus:1,    // 共3个状态对应箱子: 未开1，半开2，全开3
    },
    onLoad() {
        window.krakenMgr = this; // 创建个全局变量，以便子模块方便访问
    },

    Init(){
        let safe_node = cc.find("safe_node", this.node);

        this.characterSp = cc.find("shuiguai_shen_4", safe_node).getComponent(sp.Skeleton);
        this.characterSp_shou = cc.find("shuiguai_shou_11", safe_node).getComponent(sp.Skeleton);
        this.characterSp_shou.node.active = false;

        this.slotsMgr = cc.vv.gameData.GetSlotsScript();

        this.bonusMgr = cc.find("bonus", safe_node).addComponent("PowerOfTheKraken_BonusSlots");
        this.bonusMgr.Init();

        this.collectMgr = cc.find("collect", safe_node).getComponent("PowerOfTheKraken_Collect");
        this.collectMgr.init();

        this.oceanPickMgr = cc.find("ocean_pick", safe_node).getComponent("PowerOfTheKraken_OceanPick");
        this.oceanPickMgr.init();
        this.pickMgr = cc.find("pick", safe_node).getComponent("PowerOfTheKraken_Pick");
        this.pickMgr.init();

        this.popupMgr = cc.find("popup", safe_node).getComponent("PowerOfTheKraken_Popup");
        this.popupMgr.init();

        this.jpMgr = safe_node.getComponentsInChildren("PowerOfTheKraken_PrizePool")[0];
        this.jpMgr.init();

        this._bgSp = cc.find("314_bgty", safe_node).getComponent(sp.Skeleton);
        this._freeBgSp = cc.find("314_freebg", safe_node).getComponent(sp.Skeleton);
        this._sFreeBgSp = cc.find("314_superfreebg", safe_node).getComponent(sp.Skeleton);
        this._xzSp = cc.find("shuiguai_shen_4/shuiguai_qiantui_3", safe_node).getComponent(sp.Skeleton);
        cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/winCoin",this._xzSp.node).active = false;
        cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/addCoin",this._xzSp.node).active = false;
        cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/314_respin_jsgx",this._xzSp.node).active = false;

        this._wildSjNode = cc.find("wild_sj", safe_node);
        this._wildSjNode.active = false;
        this._wildSjNode.children.forEach(node=>{node.active = false;});

        this._pick_qp = cc.find("pike_qieping_texiao", safe_node).getComponent(sp.Skeleton);
        this._pick_qp.node.active = false;
        this._pick_qp2 = cc.find("pike_qieping_texiao2", safe_node).getComponent(sp.Skeleton);
        this._pick_qp2.node.active = false;
        this._qipao_qp = cc.find("314_respin_qipao", safe_node).getComponent(sp.Skeleton);
        this._qipao_qp.node.active = false;


        let topNode = cc.vv.gameData.GetTopScript().node;
        let bottomNode = cc.vv.gameData.GetBottomScript().node;
        this.scheduleOnce(()=>{
            this._sPos_top = topNode.position;
            this._sPos_bottom = bottomNode.position;
        },0)
    },

    start(){
        this.ReconnectShow()
    },

    onDestroy() {
        window.krakenMgr = null;
    },

    onEnable(){
        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, this);
    },

    onDisable(){
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.onRcvSubGameAction, false, this);
    },

    /**
     * @param data {rtype:type}
     */
    reqSubGame(data){
        return new Promise(res => {
            this._subCallBack = res;
            let req = {c: MsgId.SLOT_SUBGAME_DATA};
            req.gameid = cc.vv.gameData.getGameId();
            req.data = data;
            cc.vv.NetManager.send(req, true);
        });
    },

    onRcvSubGameAction(msg){
        if(this._subCallBack){
            this._subCallBack(msg);
            this._subCallBack = null;
        }
    },

    async ReconnectShow(){
        cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
        await cc.vv.gameData.awaitTime(0);

        this.initBoxStatus();

        let isFree = cc.vv.gameData.GetTotalFree() > 0;
        let jackpotGame = cc.vv.gameData.GetJackpotGame();
        let bonusGame = cc.vv.gameData.GetBonusGame();
        this.collectMgr.setCollectState(!(isFree || !!bonusGame), false);


        // //-------------
        // let pos1 = this.slotsMgr.GetSymbolByIdx(1).node.convertToWorldSpaceAR(cc.v2(0,0));
        // await this.oceanPickMgr.triOceanGame({coins:[100,100], coin:20100}, pos1);

        let superFree = cc.vv.gameData.GetSuperFree();
        let isSuper = superFree.state == 1;
        cc.vv.gameData.setIsSuper(isSuper);
        if(isSuper){  // super free
            this.slotsMgr.setSymbolSfBack(superFree.stickyIdxs, superFree.stickyItems);
            this.ShowGameview(true);
        } else if(cc.vv.gameData.GetTotalFree() > 0){   // normal free
            this.ShowGameview(true);
        } else {
            this.ShowGameview(false);
        }

        if(bonusGame){  // epic小游戏
            await this.bonusMgr.showBonusGame(bonusGame)
        }

        if(jackpotGame){  // 开宝箱小游戏
            if(bonusGame){
                Global.SlotsSoundMgr.stopBgm();
                await this.triPickGame(jackpotGame)
            } else {
                krakenMgr.showTopBottomNode(false, false);
                await this.pickMgr.backPickGame(jackpotGame)
            }
        }


        // 结束免费
        if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetFreeTime() == 0){
            // await this.exitFreeGame();
        }


        this.slotsMgr.CanDoNextRound()
    },

    //收到旋转结果
    //gameData模块收到数据后，转发到此处
    onMsgSpine:function(msg) {
        this._gameInfo = msg;
    },

    async OnSpinEnd(){
        //显示中奖路线
        this.slotsMgr.ShowWinTrace();
        await new Promise((success)=>{
            let nWin = cc.vv.gameData.GetGameWin()
            let nTotal = nWin
            let updateAllCoin = true;
            if(cc.vv.gameData.GetTotalFree() > 0 && cc.vv.gameData.GetTotalFree() != cc.vv.gameData.GetFreeTime()){
                nTotal = cc.vv.gameData.GetGameTotalFreeWin()
                updateAllCoin = cc.vv.gameData.GetFreeTime() == 0;
            }
            this.slotsMgr.ShowBottomWin(nWin,nTotal,updateAllCoin,()=>{
                success();
            });

        });

        let bonusGame = this._gameInfo.bonusGame;
        if(bonusGame){
            await this.triBonusGame();
        }

        let jackpotGame = this._gameInfo.jackpotGame;
        if(jackpotGame) {
            await this.triPickGame();
        }

        if(this._gameInfo.freeResult && this._gameInfo.freeResult.freeInfo && this._gameInfo.freeResult.freeInfo.freeCnt > 0){
            await this.triFreeGame();
        }

        //检测是否免费游戏结束
        if(this._gameInfo.allFreeCnt>0&&this._gameInfo.freeCnt==0){
            await this.exitFreeGame();
        }

        //下一局
        this.slotsMgr.CanDoNextRound();
    },

    playWildSjAnim(symPos, idx){
        Global.SlotsSoundMgr.playEffect("wild_collect");
        let node = cc.instantiate(this._wildSjNode);
        node.active = true;
        node.parent = this._wildSjNode.parent;

        let boxInfo = this._gameInfo.boxInfo;
        let newStatus =  boxInfo.status;
        let maxIdx = boxInfo.wildIdxs.reduce((a,b)=>(a-1)%5 > (b-1)%5 ? a : b);

        for (let i = 0; i < 3; i++){
            let sPos = node.convertToNodeSpaceAR(symPos);
            let ePos = node.convertToNodeSpaceAR(this._xzSp.node.convertToWorldSpaceAR(cc.v2(0,0)));

            let n2 = cc.instantiate(cc.find("sj_1", node));
            n2.parent = node;
            n2.position = sPos;
            n2.active = true;
            n2.getComponent(cc.ParticleSystem).resetSystem();
            cc.tween(n2)
                .delay(0.1*i)
                .to(0.5, {position:ePos})
                .start()

            let n1 = cc.instantiate(cc.find("314_sj", node));
            n1.parent = node;
            n1.position = sPos;
            n1.active = true;
            n1.getComponent(sp.Skeleton).setAnimation(0,"animation", false);
            cc.tween(n1)
                .delay(0.1*i)
                .to(0.5, {position:ePos})
                .call(()=>{
                    if(i ==0 ) {
                        this.playXzSj(this._xzStatus)
                    }
                    if(i == 2){
                        node.destroy();
                        if(idx == maxIdx){
                            this.playXzOpen(this._xzStatus, newStatus);
                            this._xzStatus = newStatus;
                        }
                    }
                })
                .start()
        }

    },

    async triBonusGame(){
        return new Promise(async (sucess, failed)=> {
            let isSuper = cc.vv.gameData.IsSuper();
            if(isSuper){
                this.slotsMgr.setSymbolSfResume();
                await cc.vv.gameData.awaitTime(0.8);

                let bonusIdxs = this._gameInfo.stickyIdxs;
                let bonusItems = this._gameInfo.stickyItems;
                for (let i = 0; i < bonusIdxs.length; i++){
                    let symbol = this.slotsMgr.GetSymbolByIdx(bonusIdxs[i]);
                    symbol.ClearState();
                    symbol.ShowById(bonusItems[i].c==2||bonusItems[i].c==1 ? 3 : 4, bonusItems[i]);
                }
                this.slotsMgr.setSymbolSfDestroy();
                await cc.vv.gameData.awaitTime(0.1);
            }

            Global.SlotsSoundMgr.playEffect("respin_trigger");

            let playSnimIdxs = isSuper ? this._gameInfo.stickyIdxs : this._gameInfo.bonusIdxs;
            if(playSnimIdxs){
                for (let idx of playSnimIdxs) {
                    let symbol = this.slotsMgr.GetSymbolByIdx(idx)
                    if (symbol) {
                        symbol.playTriggerAnimation()
                    }
                }
            }

            await cc.vv.gameData.awaitTime(2);

            this.showTopBottomNode(false,false);
            if(!cc.vv.gameData.IsFree()){
                cc.vv.gameData.GetBottomScript().SetWin(0);
            }
            Global.SlotsSoundMgr.stopBgm();
            await this.popupMgr.playTriBonus(!isSuper);
            await this.bonusMgr.triBonusGame(this._gameInfo.bonusGame, this._gameInfo.resultCards);

            if(playSnimIdxs){
                for (let idx of playSnimIdxs) {
                    let symbol = this.slotsMgr.GetSymbolByIdx(idx)
                    if (symbol) {
                        symbol.playBonusIdleAni(true)
                    }
                }
            }

            sucess();
        })
    },

    async triPickGame(){
        return new Promise(async (sucess, failed)=> {
            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playEffect("chest_trigger");
            this.playXzTrigger();
            this.showTopBottomNode(false, true);

            await cc.vv.gameData.awaitTime(1);
            if(!cc.vv.gameData.IsFree()){
                cc.vv.gameData.GetBottomScript().SetWin(0);
            }
            this._pick_qp.node.active = true;
            this._pick_qp.node.position = this._pick_qp.node.parent.convertToNodeSpaceAR(this._xzSp.node.convertToWorldSpaceAR(cc.v2(0,0)));
            this._pick_qp.setAnimation(0, "animation1", false);
            this._pick_qp.setCompleteListener(()=>{
                this._pick_qp.setCompleteListener(null);
                this._pick_qp.node.active = false;
            });

            await cc.vv.gameData.awaitTime(1);
            this.playJinbiQp();

            await cc.vv.gameData.awaitTime(1);
            this.jpMgr.showJpCollect(true);
            this.jpMgr.showPickItems(true);

            await cc.vv.gameData.awaitTime(0.5);

            await this.pickMgr.triPickGame();

            sucess();
        });
    },

    triFreeGame(){
        return new Promise(async (sucess, failed)=> {
            Global.SlotsSoundMgr.playEffect("bell");
            let isFirst = this._gameInfo.freeCnt === this._gameInfo.allFreeCnt;
            for (let id of this._gameInfo.freeResult.freeInfo.scatterIdx) {
                let symbol = this.slotsMgr.GetSymbolByIdx(id)
                if(symbol){
                    symbol.playTriggerAnimation(true)
                }
            }

            this.collectMgr.addOneItem();
            await cc.vv.gameData.awaitTime(2);

            let triCnt = this._gameInfo.freeResult.freeInfo.freeCnt;
            let isSuper = this._gameInfo.superFree.state == 1;
            cc.vv.gameData.setIsSuper(isSuper);
            Global.SlotsSoundMgr.stopBgm();
            await this.popupMgr.triFreeGame(triCnt, !isSuper, isFirst);

            if( isFirst) { // 首次
                if(isSuper){
                    this.collectMgr.playFullAnim(true);
                } else {
                    this.collectMgr.setCollectState(false, true);
                }

                this.slotsMgr.Backup();
                Global.SlotsSoundMgr.playEffect("transition_free");
                this.characterSp.setAnimation(0,"animation3", false);
                this.characterSp.addAnimation(0,"animation1", true);

                await cc.vv.gameData.awaitTime(0.5);
                this.playShake();
                if(isSuper){
                    this._sFreeBgSp.node.opacity = 0;
                    cc.tween(this._sFreeBgSp.node)
                        .to(1, {opacity:255})
                        .start()
                } else {
                    this._freeBgSp.node.opacity = 0;
                    cc.tween(this._freeBgSp.node)
                        .to(1, {opacity:255})
                        .start()
                }

                await cc.vv.gameData.awaitTime(0.5);
                this.ShowGameview(true);
                await cc.vv.gameData.awaitTime(0.5);
            } else {

            }

            sucess();
        })
    },

    exitFreeGame(){
        return new Promise(async (sucess, failed)=> {
            Global.SlotsSoundMgr.stopBgm();
            let isSuper = cc.vv.gameData.IsSuper()
            await this.popupMgr.endFreeGame(cc.vv.gameData.GetGameTotalFreeWin(), !isSuper);

            Global.SlotsSoundMgr.playEffect("transition_free");
            this.characterSp.setAnimation(0,"animation3", false);
            this.characterSp.addAnimation(0,"animation1", true);

            await cc.vv.gameData.awaitTime(0.5);
            this.playShake();
            this.playQiPaoQp();

            if(isSuper){
                cc.tween(this._sFreeBgSp.node)
                    .to(1, {opacity:0})
                    .start()
            } else {
                cc.tween(this._freeBgSp.node)
                    .to(1, {opacity:0})
                    .start()
            }

            await cc.vv.gameData.awaitTime(0.5);
            this.ShowGameview(false);
            if(isSuper){
                cc.vv.gameData.setIsSuper(false);
                this.collectMgr.initItems(0);
            }
            this.collectMgr.setCollectState(true, true);
            this.slotsMgr.setSymbolSfDestroy();
            this.slotsMgr.Resume();
            Global.SlotsSoundMgr.playNormalBgm();

            await cc.vv.gameData.awaitTime(2);
            let nWin = cc.vv.gameData.GetGameTotalFreeWin();
            let nTotal = nWin;
            await new Promise((sucess, failed)=>{
                this.slotsMgr.ShowBottomWin(nWin,nTotal,true,sucess)
            });
            sucess();
        })
    },

    //显示游戏界面：bFree true显示免费模式的界面，false 普通模式
    ShowGameview:function(bFree){
        let isSuper = cc.vv.gameData.IsSuper();
        if(bFree){
            if(isSuper){
                Global.SlotsSoundMgr.playBgm("super_bgm");
            } else {
                Global.SlotsSoundMgr.playBgm("free_bgm");
            }

            let total = cc.vv.gameData.GetTotalFree()
            let rest = cc.vv.gameData.GetFreeTime()

            //显示免费次数
            cc.vv.gameData.GetBottomScript().ShowFreeModel(true,total-rest,total)
            let nTotal = cc.vv.gameData.GetTotalFreeWin()
            cc.vv.gameData.GetBottomScript().SetWin(nTotal)


            //this.CanDoNextRound()
            this._freeBgSp.setAnimation(0,"animation", true);
            this._sFreeBgSp.setAnimation(0,"animation", true);
        }
        else{
            cc.vv.gameData.GetBottomScript().ShowFreeModel(false)
            this._bgSp.setAnimation(0,"animation1", true);
        }

        this._bgSp.node.active = !bFree;
        this._freeBgSp.node.active = bFree && !isSuper;
        this._sFreeBgSp.node.active = bFree && isSuper;
    },


    // 初始化箱子状态
    initBoxStatus(){
        let boxInfo = cc.vv.gameData.GetBoxInfo();
        this._xzStatus = boxInfo.status ? boxInfo.status : 1;
        this._xzSp.setAnimation(0,`X_baoxiang_${this._xzStatus}`, true);
        cc.find("bx_xunhuan_texiao", this._xzSp.node).active = true;
    },

    // 箱子出现
    playXzShowAnim(){
        this._xzSp.node.active = true;
        this._xzSp.setAnimation(0,"Chuxian_"+this._xzStatus,false);
        this._xzSp.addAnimation(0,"X_baoxiang_"+this._xzStatus,true);
        cc.find("bx_xunhuan_texiao", this._xzSp.node).active = true;
    },

    // 箱子打开
    playXzOpen(curStatus,newStatus){
        let dkSp = cc.find("bx_dakai_texiao", this._xzSp.node).getComponent(sp.Skeleton);
        if(newStatus-curStatus == 1){ // 升1级
            this._xzSp.setAnimation(0,"K_baoxiang_"+curStatus, false);
            this._xzSp.addAnimation(0,"X_baoxiang_"+newStatus, true);
            dkSp.node.active = true;
            dkSp.clearTracks();
            let entry = dkSp.setAnimation(0,"animation1",false);
            dkSp.setTrackCompleteListener(entry, ()=>{
                dkSp.setTrackCompleteListener(entry,null);
                dkSp.node.active = false;
            })
        } else if(newStatus-curStatus == 2){ // 升2级 1-->3
            this._xzSp.setAnimation(0,"K_baoxiang_1", false);
            this._xzSp.addAnimation(0,"K_baoxiang_2", false);
            this._xzSp.addAnimation(0,"X_baoxiang_3", true);
            dkSp.node.active = true;
            dkSp.clearTracks();
            let entry = dkSp.setAnimation(0,"animation2",false);
            dkSp.setTrackCompleteListener(entry, ()=>{
                dkSp.setTrackCompleteListener(entry,null);
                dkSp.node.active = false;
            })
        } else if(newStatus-curStatus == 0){    // 保持原状态
            this._xzSp.setAnimation(0,"X_baoxiang_"+newStatus, true);
        }

        if(this._gameInfo.jackpotGame){
            this.playXzTrigger();
        }
    },

    // 箱子触发
    playXzTrigger(){
        this._xzSp.setAnimation(0, "J_shou3_qie", true);
    },

    // 箱子收集
    playXzSj(status){
        let animN = status == 1 ? "" : status;
        this._xzSp.setAnimation(0, "J_shou" + animN, false);

        let sjSp = cc.find("bx_shouji_texiao", this._xzSp.node).getComponent(sp.Skeleton);
        sjSp.node.active = true;
        sjSp.setAnimation(0,"animation",false);
    },

    // 举起奖励结果框
    characterPlayResult(){
        Global.SlotsSoundMgr.playEffect("kraken_raise");
        this.characterSp.setAnimation(0,"animation7",false);
        this.characterSp.addAnimation(0,"animation7_7",false);
        this.characterSp.addAnimation(0,"animation8",true);

        this._xzSp.node.active = true;
        this._xzSp.setAnimation(0,"Chuxian_shoujitiao",false);
        this._xzSp.addAnimation(0,"Sjt_xunhuan",true);
        cc.find("bx_xunhuan_texiao", this._xzSp.node).active = false;
    },

    // 收起奖励结果框
    characterHideResult(){
        this.characterSp.setAnimation(0,"animation9",false);
        this.characterSp.addAnimation(0,"animation9_9",false);
        this.characterSp.addAnimation(0,"animation1",true);

        let entry1 = this._xzSp.setAnimation(0,"Xiaoshi_shoujitiao",false);
        this._xzSp.setTrackCompleteListener(entry1, ()=>{
            this._xzSp.setTrackCompleteListener(entry1,null);
            krakenMgr.playXzAddCoin("", "", false);
            cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/winCoin",this._xzSp.node).active = false;
            cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/addCoin",this._xzSp.node).active = false;
            cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/314_respin_jsgx",this._xzSp.node).active = false;

            this._xzSp.node.active = false;
        });
    },

    // 断线回到举起奖励框状态
    characterBackResult(winCoin){
        if(winCoin > 0){
            this.characterSp.setAnimation(0,"animation8",true);
            this._xzSp.setAnimation(0,"Sjt_xunhuan",true);

            let winLbl = cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/winCoin",this._xzSp.node);
            winLbl.active = true;
            winLbl.getComponent(cc.Label).string = Global.FormatNumToComma(winCoin);
        } else {
            this._xzSp.node.active = false;
        }
        cc.find("bx_xunhuan_texiao", this._xzSp.node).active = false;
    },

    // 奖励结果框+钱
    playXzAddCoin(resCoin, addCoin){
        let winLbl = cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/winCoin",this._xzSp.node);
        let addLbl = cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/addCoin",this._xzSp.node);
        let jsgx = cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/314_respin_jsgx",this._xzSp.node);

        winLbl.active = true;
        addLbl.active = true;
        jsgx.active = true;
        winLbl.getComponent(cc.Label).string = resCoin >=0 ? Global.FormatNumToComma(resCoin) : "";
        addLbl.getComponent(cc.Label).string = addCoin >=0 ? Global.FormatNumToComma(addCoin) : "";
        jsgx.getComponent(sp.Skeleton).setAnimation(0,"animation",false);
        addLbl.scale = 0;
        addLbl.position = cc.v2(0,0);
        addLbl.opacity = 255;
        addLbl.stopAllActions();
        cc.tween(addLbl)
            .parallel(
                cc.tween().to(0.5,{scale:1}, {easing:"backOut"}),
                cc.tween().to(0.5,{y:100}),
                cc.tween().delay(0.3).to(0.2,{opacity:100})
            )
            .call(()=>{
                addLbl.active = false;
            })
            .start()
    },

    playTriBonusAnim(){
        this.slotsMgr.node.active = false;
        Global.SlotsSoundMgr.playEffect("transition_respin");

        let entry1 = this._xzSp.setAnimation(0,"Xiaoshi_"+this._xzStatus, false);
        this._xzSp.setTrackCompleteListener(entry1, ()=>{
            this._xzSp.setTrackCompleteListener(entry1,null);
            this._xzSp.node.active = false;
        });

        this.characterSp.setAnimation(0, "animation6", false);
        this.characterSp.addAnimation(0, "animation1", true);
        this.characterSp_shou.node.active = true;
        this.characterSp_shou.node.position = this.characterSp.node.position;
        this.characterSp_shou.setAnimation(0, "animation6", false);
        this.characterSp_shou.setCompleteListener(()=>{
            this.characterSp_shou.setCompleteListener(null);
            this.characterSp_shou.node.active = false;
        });

        // let ePos = cc.v2(this.bonusMgr.node.x, this.bonusMgr.node.y);
        this.bonusMgr.node.stopAllActions();
        cc.tween(this.bonusMgr.node)
            .delay(0.55)
            .parallel(
                cc.tween().repeat(13,
                    cc.tween()
                        .to(0.025,{x:-6})
                        .to(0.05,{x:6})
                        .to(0.025,{x:0})),
                cc.tween().by(1.4,{y:250},{easing:"quadOut"})
            )
            .by(1.2, {y:-250},{easing:"elasticInOut"})
            .start()

        this.collectMgr.setCollectState(false, true);
    },

    playEndBonusAnim(){
        Global.SlotsSoundMgr.playEffect("transition_respin");

        this.characterSp.setAnimation(0, "animation6", false);
        this.characterSp.addAnimation(0, "animation1", true);
        this.characterSp_shou.node.active = true;
        this.characterSp_shou.node.position = this.characterSp.node.position;
        this.characterSp_shou.setAnimation(0, "animation6", false);
        this.characterSp_shou.setCompleteListener(()=>{
            this.characterSp_shou.setCompleteListener(null);
            this.characterSp_shou.node.active = false;
        });

        // this._xzSp.node.active = true;
        // cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/winCoin",this._xzSp.node).active = false;
        // cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/addCoin",this._xzSp.node).active = false;
        // cc.find("ATTACHED_NODE_TREE/ATTACHED_NODE:root/ATTACHED_NODE:label1/314_respin_jsgx",this._xzSp.node).active = false;

        // this._xzSp.node.active = true;
        // this._xzSp.setAnimation(0,"Chuxian_"+this._xzStatus,false);
        // this._xzSp.addAnimation(0,"X_baoxiang_"+this._xzStatus,true);

        let ePos = cc.v2(this.bonusMgr.node.x, this.bonusMgr.node.y);
        this.bonusMgr.node.stopAllActions();
        cc.tween(this.bonusMgr.node)
            .delay(0.55)
            .parallel(
                cc.tween().repeat(13,
                    cc.tween()
                        .to(0.025,{x:-6})
                        .to(0.05,{x:6})
                        .to(0.025,{x:0})),
                cc.tween().by(1.4,{y:250},{easing:"quadOut"})
            )
            .by(1.2, {y:-250},{easing:"elasticInOut"})
            // .call(()=>{
            //     this.bonusMgr.node.active = false;
            //     this.slotsMgr.node.active = true;
            // })
            .start()

        // this.collectMgr.setCollectState(true, true);
    },

    // 金币转场
    playJinbiQp(){
        Global.SlotsSoundMgr.playEffect("transition_pick");
        this._pick_qp2.node.active = true;
        this._pick_qp2.setAnimation(0, "animation", false);
        this._pick_qp2.setCompleteListener(()=>{
            this._pick_qp2.setCompleteListener(null);
            this._pick_qp2.node.active = false;
        });
    },

    // 气泡转场
    playQiPaoQp(){
        this._qipao_qp.node.active = true;
        this._qipao_qp.setAnimation(0,"animation",false);
        this._qipao_qp.setCompleteListener(()=>{
            this._qipao_qp.setCompleteListener(null);
            this._qipao_qp.node.active = false;
        })
    },

    // 场景抖动
    playShake(){
        let safe_node = cc.find("safe_node", this.node);
        Global.shakeNode(safe_node, 6, 1, safe_node.position);
    },

    // 显示隐藏top条、bottom条
    showTopBottomNode(bShow, bPlay){
        let topNode = cc.vv.gameData.GetTopScript().node;
        let bottomNode = cc.vv.gameData.GetBottomScript().node;

        if(bPlay){
            if(bShow){
                topNode.y = this._sPos_top.y + 900;
                bottomNode.y = this._sPos_bottom.y - 900;
                topNode.active = true;
                bottomNode.active = true;
                cc.tween(topNode)
                    .to(0.5,{y:this._sPos_top.y})
                    .start()
                cc.tween(bottomNode)
                    .to(0.5,{y:this._sPos_bottom.y})
                    .start()
            }
            else {
                cc.tween(topNode)
                    .by(0.5, {y:this._sPos_top.y + 800})
                    .call(()=>{
                        topNode.active = false
                    })
                    .start()
                cc.tween(bottomNode)
                    .by(0.5, {y:this._sPos_bottom.y - 800})
                    .call(()=>{
                        bottomNode.active = false
                    })
                    .start()
            }
        } else {
            topNode.active = bShow;
            bottomNode.active = bShow;
        }

    },

});
