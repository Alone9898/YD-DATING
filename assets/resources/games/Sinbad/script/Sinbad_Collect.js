// 收集进度条
cc.Class({
    extends: cc.Component,

    properties: {
        _itemSpList:[],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    Init(){
        this._node_collect = cc.find("safe_node/slots/node_collect", this.node);

        this._mask_jdt = cc.find("mask", this._node_collect);
        this._node_jdt = cc.find("mask/JinDuTiao", this._node_collect);
        this._node_jdt_zhang = cc.find("mask/JinDuTiao/zhang", this._node_collect);

        this._node_lock = cc.find("collect_bar_lock", this._node_collect);
        this._spine_lock = cc.find("collect_bar_lock/BetUp_ToUnlock", this._node_collect);


        this._btn_click = cc.find("btn_click", this._node_collect);
        Global.btnClickEvent(this._btn_click, this.onClickSjt, this);
        this._btn_wheel = cc.find("collect_wheel", this._node_collect);
        Global.btnClickEvent(this._btn_wheel, this.onClickWheel, this);

        this._node_bonus = cc.find("collect_bonus", this._node_collect);

        this._flyNode = cc.find("flyNode", this._node_collect);
        this._fly_par = cc.find("fly_par", this._flyNode);
        this._fly_par.active = false;

        let progressData = cc.vv.gameData.getProgressData();
        this.initBar(progressData.totalCnt/progressData.needCnt);
        this.initSjtState();
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,this.onEventTotalbetUpdated,this)// 押注额改变

    },

    initBar(percent){

        let per = Math.min(1, percent);
        this._node_jdt.active = per != 0;
        this._node_jdt.x = this._mask_jdt.width*(per-1);
        this._node_jdt_zhang.active = false;

    },

    //进度条增长
    riseJdt(percent){
        let per = Math.min(1, percent);

        this._node_jdt.active = true;
        cc.tween(this._node_jdt)
            .to(0.5, {x:this._mask_jdt.width*(per-1)})
            .start();

        this._node_jdt_zhang.active = true;
        this._node_jdt_zhang.getComponent(sp.Skeleton).setAnimation(0,"JinDuTiao_Intro",false);
        this._node_jdt_zhang.getComponent(sp.Skeleton).setCompleteListener(()=>{
            this._node_jdt_zhang.getComponent(sp.Skeleton).setCompleteListener();
            this._node_jdt_zhang.active = false;
        })
    },

    initSjtState(){
        let curBet = cc.vv.gameData.GetBetIdx();
        let needBet = cc.vv.gameData.getNeedBet();

        this._isLock = curBet < needBet;
        if(this._isLock){
            this._node_lock.active = true;
            this._spine_lock.getComponent(sp.Skeleton).setAnimation(0,"BetUp_ToUnlock",true);
        } else {
            this._node_lock.active = false;
        }
    },

    // 点击收集条
    onClickSjt(){
        if (!cc.vv.gameData.GetBottomScript().GetSpinBtnState()) return;
        if (cc.vv.gameData.GetAutoModelTime() > 0) return;
        if (cc.vv.gameData.isFreeGame()) return;
        if (cc.vv.gameData.isBonusGame()) return;

        let curBet = cc.vv.gameData.GetBetIdx();
        let needBet = cc.vv.gameData.getNeedBet();
        if(this._isLock && needBet >= curBet && needBet <= cc.vv.gameData.GetBetMults().length){
            cc.vv.gameData.GetBottomScript().SetBetIdx(needBet);
        }
    },

    // 点击地图入口
    onClickWheel(){
        if (!cc.vv.gameData.GetBottomScript().GetSpinBtnState()) return;
        if (cc.vv.gameData.GetAutoModelTime() > 0) return;
        if (cc.vv.gameData.isFreeGame()) return;
        if (cc.vv.gameData.isBonusGame()) return;

        cc.vv.gameData.getMapScript().enterGame(false);
    },

    // 押注额改变
    onEventTotalbetUpdated(){
        let curBet = cc.vv.gameData.GetBetIdx();
        let needBet = cc.vv.gameData.getNeedBet();

        if(this._isLock && curBet >= needBet) { // 解锁
            Global.SlotsSoundMgr.playEffect("unlock");
            this._isLock = false;

            this._spine_lock.getComponent(sp.Skeleton).setAnimation(0,"BetUp_ToUnlock_JieSuo",false);
            this._spine_lock.getComponent(sp.Skeleton).setCompleteListener(()=>{
                this._spine_lock.getComponent(sp.Skeleton).setCompleteListener();
                this._node_lock.active = false;
            })
        } else if(!this._isLock && curBet < needBet){   // 上锁
    //         Global.SlotsSoundMgr.playEffect("lock");
            this._isLock = true;

            this._node_lock.active = true;
            this._spine_lock.getComponent(sp.Skeleton).setAnimation(0,"BetUp_ToUnlock",true);
        }
    },

    // 进度条能量收集
    async playCollectAnim(idxs){
        if(!this._isLock && idxs.length > 0){
            Global.SlotsSoundMgr.playEffect("coinfly");

            for (let i = 0; i < idxs.length; i++){
                let idx = idxs[i];

                let _fly_par = cc.instantiate(this._fly_par);
                _fly_par.parent = this._flyNode;

                let symbol = cc.vv.gameData.GetSlotsScript().GetSymbolByIdx(idx);

                let startPos = this._flyNode.convertToNodeSpaceAR(symbol.node.convertToWorldSpaceAR(cc.v2(0,0)));
                let endPos = this._flyNode.convertToNodeSpaceAR(this._node_bonus.convertToWorldSpaceAR(cc.v2(0,0)));

                _fly_par.active = true;
                _fly_par.position = startPos;
                _fly_par.getComponent(cc.ParticleSystem).resetSystem();

                cc.tween(_fly_par)
                    .to(0.3,{scale:1.2})
                    .to(0.5,{position:endPos, scale:0.1})
                    .call(()=>{_fly_par.destroy()})
                    .start()

            }
            await cc.vv.gameData.awaitTime(0.8);

            // await cc.vv.gameData.awaitTime(0.3);

            let fankui = cc.find("YinBiFanKui",this._node_bonus);
            fankui.active = true;
            fankui.getComponent(sp.Skeleton).setAnimation(0,"YinBiFanKui",false);
            fankui.getComponent(sp.Skeleton).setCompleteListener(()=>{
                fankui.getComponent(sp.Skeleton).setCompleteListener();
                fankui.active = false;
            });

            let progressData = cc.vv.gameData.getProgressData();
            this.riseJdt(progressData.totalCnt/progressData.needCnt);
        }
    },

    // update (dt) {},
});
