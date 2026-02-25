
cc.Class({
    extends: cc.Component,

    properties: {
        _itemList:[],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    Init(){
        this._node_collect = cc.find("safe_node/slots/node_collect", this.node);

        for (let i = 1; i <= 10; i++){
            let item = cc.find("node_items/item"+i, this._node_collect);
            this._itemList.push(item);
        }

        this._spine_super = cc.find("spine_super", this._node_collect);

        let btn_lock = cc.find("btn_lock", this._node_collect);
        btn_lock.off("click");
        Global.btnClickEvent(btn_lock, this.clickLockBtn, this);
        this._spine_lock = cc.find("btn_lock/spine_lock", this._node_collect);

        this._par_fly = cc.find("par_fly", this._node_collect);
        this._par_fly.active = false;

        this._spr_tip = cc.find("safe_node/slots/spr_collect_tip", this.node);
        this._spr_tip.active = false;

        this.initItems();
        this.showLockSpin();
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,this.onEventTotalbetUpdated,this)// 押注额改变
    },

    // 初始现在收集图标
    initItems(){
        this._bonusTrail =  cc.vv.gameData.getBonusTrail();
        let curCnt = this._bonusTrail.count;

        if(curCnt == this._bonusTrail.totalCount){
            curCnt = 0;
        }

        for (let i = 0; i < this._itemList.length; i++){
            cc.find("spr", this._itemList[i]).active = i < curCnt;

            let spine_dange = cc.find("spine_dange", this._itemList[i]);
            spine_dange.active = i < curCnt;
            if(spine_dange.active){
                spine_dange.getComponent(sp.Skeleton).setAnimation(0,"animation1",true);
            }
        }

        let spine_jl = cc.find("spine_jl", this._itemList[9])
        if(curCnt === 9){   // 收到最后一个了
            spine_jl.active = true;
            spine_jl.getComponent(sp.Skeleton).setAnimation(0,"animation",true);
        } else {
            spine_jl.active = false;
        }

        this._spine_super.getComponent(sp.Skeleton).setAnimation(0, "animation1", true);
    },

    // 获得一个图标
    async playGainItemAnim(list){
        return new Promise(async(success, failed)=>{
            if(this._isLock){
                success();
                return ;
            }

            this._bonusTrail =  cc.vv.gameData.getBonusTrail();
            let curCnt = this._bonusTrail.count;
            // let idxs = [1,2,3];

            let item = this._itemList[curCnt-1];

            // 飞粒子
            for (let i = 0; i < list.length; i++){
                let par = cc.instantiate(this._par_fly);
                par.parent = this._node_collect;

                let symbol = list[i];
                let startPos = this._node_collect.convertToNodeSpaceAR(symbol.node.convertToWorldSpaceAR(cc.v2(0,0)));
                let endPos = this._node_collect.convertToNodeSpaceAR(item.convertToWorldSpaceAR(cc.v2(0,0)));

                par.position = startPos;
                par.active = true;
                par.getComponent(cc.ParticleSystem).resetSystem();
                cc.tween(par)
                    .to(0.5, {position:endPos})
                    .call(()=>{ par.destroy()})
                    .start()
            }

            await cc.vv.gameData.awaitTime(0.5);

            let spr = cc.find("spr",item);
            let spine_dange = cc.find("spine_dange", item);
            if(curCnt < 10){
                spr.active = true;
                spine_dange.active = true;
                spine_dange.getComponent(sp.Skeleton).setAnimation(0, "animation3", false);
                spine_dange.getComponent(sp.Skeleton).addAnimation(0, "animation1", true);
            } else {
                cc.find("spine_jl", item).active = false;

                spr.active = true;
                spine_dange.active = true;
                spine_dange.getComponent(sp.Skeleton).setAnimation(0, "animation4", false);
                spine_dange.getComponent(sp.Skeleton).addAnimation(0, "animation2", true);

                await cc.vv.gameData.awaitTime(0.2);

                this._spine_super.getComponent(sp.Skeleton).setAnimation(0,"animation2", false);
                await cc.vv.gameData.awaitTime(0.8);
            }


            success();
        })
    },


    showLockSpin(){
        let curBet = cc.vv.gameData.GetBetIdx();
        let needBet = cc.vv.gameData.getNeedBet();

        if(curBet < needBet){
            this._isLock = true;
            this._spine_lock.active = true;
            this._spine_lock.getComponent(sp.Skeleton).setAnimation(0, "animation2", true);
        } else {
            this._isLock = false;
            this._spine_lock.active = false;
        }
    },

    clickLockBtn(){
        if (!cc.vv.gameData.GetBottomScript().GetSpinBtnState()) return;
        if (cc.vv.gameData.GetAutoModelTime() > 0) return;
        if (cc.vv.gameData.isFreeGame()) return;
        if (cc.vv.gameData.isSuperGame()) return;
        if (cc.vv.gameData.isBonusGame()) return;

        if(this._isLock){
            let needBet = cc.vv.gameData.getNeedBet();
            let allMults = cc.vv.gameData.GetBetMults();

            if(needBet > allMults.length){
            }else {
                cc.vv.gameData.GetBottomScript().SetBetIdx(needBet)
            }
        }
    },

    onEventTotalbetUpdated(){
        let curBet = cc.vv.gameData.GetBetIdx();
        let needBet = cc.vv.gameData.getNeedBet();

        if(curBet < needBet && !this._isLock){  // 锁住
            Global.SlotsSoundMgr.playEffect("sb_lock");

            this._isLock = true;
            this._spine_lock.active = true;
            this._spine_lock.getComponent(sp.Skeleton).setAnimation(0, "animation1", false);
            this._spine_lock.getComponent(sp.Skeleton).addAnimation(0, "animation2", true);

            this.showTipSpr(false);
        } else if(curBet >= needBet && this._isLock){   // 解锁
            Global.SlotsSoundMgr.playEffect("sb_unlock");

            this._isLock = false;
            this._spine_lock.getComponent(sp.Skeleton).setAnimation(0, "animation3", false);

            this.showTipSpr(true);
        }
    },

    showTipSpr(bShow){
        this._spr_tip.stopAllActions();

        if(bShow){
            this._spr_tip.active = true;
            this._spr_tip.setScale(0);

            cc.tween(this._spr_tip)
                .to(0.5, {scale:1}, {easing:"backOut"})
                .delay(2)
                .to(0.5,{scale:0})
                .call(()=>{this._spr_tip.active = false;})
                .start();
        } else {
            if(this._spr_tip.active){
                cc.tween(this._spr_tip)
                    .to(this._spr_tip.scaleX/2, {scale:0})
                    .call(()=>{this._spr_tip.active = false;})
                    .start();
            }
        }
    }

    // update (dt) {},
});
