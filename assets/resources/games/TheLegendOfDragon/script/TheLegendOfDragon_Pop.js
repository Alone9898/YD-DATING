/**
 * 弹窗管理
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _pop: null,
        _pick_start: null,
        _collect_jp: null,
        _free: null,
        _free_start: null,
        _free_end: null,

        _jpWin: 0,
        _freeWin:0,
        _pickData:null,
        _incWild:false,

        _pickStartClicked:false,
        _collectJpClicked:false,
        _freeStartClicked:false,
        _freeEndClicked:false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._pop = cc.find("safe_node/node_pop_ui", this.node);

        this._pick_start = this._pop.getChildByName("pick_start");
        let btnPickStart = this._pick_start.getChildByName("btn_start");
        btnPickStart.on('click', this.onClickPickStart.bind(this));

        this._collect_jp = this._pop.getChildByName("collect_jp");
        let btnCollectJp = this._collect_jp.getChildByName("btn_collect");
        btnCollectJp.on('click', this.onClickCollectJp.bind(this));

        this._free = this._pop.getChildByName("free");
        this._free_start = this._free.getChildByName("start");
        let btnFreeStart = this._free_start.getChildByName("btn_start");
        btnFreeStart.on('click', this.onClickFreeStart.bind(this));

        this._free_end = this._free.getChildByName("end");
        let btnFreeEnd = this._free_end.getChildByName("btn_collect");
        btnFreeEnd.on('click', this.onClickFreeEnd.bind(this));
    },
    // 显示抽卡游戏开始
    async showPickStart(pickData) {
        this._pickData = pickData;
        this._pop.active = true;
        this._pick_start.active = true;
        Global.showAlertAction(this._pick_start, true, 0.1, 1, null);
        this.showNodePopAnimation(this._pick_start.getChildByName("btn_start"), 0.2);
        Global.SlotsSoundMgr.stopBgm();
        Global.TheLegendOfDragon.playEffect("pick/pick_start_show");
        let btnPickStart = this._pick_start.getChildByName("btn_start");
        let func = ()=>{
            if (this._pickStartClicked) return false;
            this._pickStartClicked = true;
            Global.TheLegendOfDragon.playEffect("base/common_click");
            Global.showAlertAction(this._pick_start, false, 1, 0.1, ()=>{
                this._pop.active = false;
                this._pick_start.active = false;
                Global.TheLegendOfDragon.Logic.showTransition("qieping1");
                Global.TheLegendOfDragon.playEffect("base/transition_bonus");
                this._pickStartClicked = false;
            });
            Global.TheLegendOfDragon.playEffect("base/popup_out");
            this.scheduleOnce(()=>{
                Global.TheLegendOfDragon.Pick.show(this._pickData, 2);
            }, 1.5);

            Global.TheLegendOfDragon.Collect.hide();
        }
        await cc.vv.gameData.awaitTime(0.7);
        cc.vv.gameData.checkAutoPlay(btnPickStart, func);
    },

    onClickPickStart() {
        if (this._pickStartClicked) return false;
        let btnPickStart = this._pick_start.getChildByName("btn_start");
        btnPickStart.stopAllActions();
        this._pickStartClicked = true;
        Global.TheLegendOfDragon.playEffect("base/common_click");
        Global.showAlertAction(this._pick_start, false, 1, 0.1, ()=>{
            this._pop.active = false;
            this._pick_start.active = false;
            Global.TheLegendOfDragon.Logic.showTransition("qieping1");
            Global.TheLegendOfDragon.playEffect("base/transition_bonus");
            this._pickStartClicked = false;
        });
        Global.TheLegendOfDragon.playEffect("base/popup_out");
        this.scheduleOnce(()=>{
            Global.TheLegendOfDragon.Pick.show(this._pickData, 2);
        }, 1.5);

        Global.TheLegendOfDragon.Collect.hide();
    },

    //显示赢得奖池
    showCollectJp(jp, winCoin) {
        //jp: 1,2,3,4,5
        //idx:4,3,2,1,0
        let idx = 5-jp;
        this._jpWin = winCoin;
        this._pop.active = true;
        this._collect_jp.active = true;
        this._collect_jp.scale = 1;
        Global.doRoallNumEff(cc.find("coin_bg/lbl_coin", this._collect_jp), 0, winCoin, 2.0, null, null, 2, true);
        let ske = this._collect_jp.getChildByName("spine_bg").getComponent(sp.Skeleton);
        ske.setAnimation(0, "animation"+idx, false);
        ske.addAnimation(0, "animation"+idx+"_"+idx, true);

        let sounds = ["", "mini", "minor", "major", "maxi", "grand"]
        Global.TheLegendOfDragon.playEffect("pick/"+sounds[jp]);
        Global.SlotsSoundMgr.stopBgm();
        Global.TheLegendOfDragon.playEffect("pick/jackpot_show");
        let btnCollectJp = this._collect_jp.getChildByName("btn_collect");
        cc.vv.gameData.checkAutoPlay(btnCollectJp, ()=>{
            if (this._collectJpClicked) return;
            this._collectJpClicked = true;
            Global.TheLegendOfDragon.playEffect("base/common_click");
            Global.showAlertAction(this._collect_jp, false, 1, 0.1, ()=>{
                this._pop.active = false;
                this._collect_jp.active = false;
                Global.TheLegendOfDragon.Logic.showTransition("qieping1");
                Global.TheLegendOfDragon.playEffect("base/transition_bonus");
                this._collectJpClicked = false;
            });
            Global.TheLegendOfDragon.playEffect("base/popup_out");
            this.scheduleOnce(()=>{
                Global.SlotsSoundMgr.playNormalBgm(true);
                Global.TheLegendOfDragon.Pick.hide();
            }, 1);
            this.scheduleOnce(()=>{
                Global.TheLegendOfDragon.Slots.ShowBottomWin(this._jpWin,this._jpWin,true, ()=>{
                    if (Global.TheLegendOfDragon.Collect._reopen) {
                        Global.TheLegendOfDragon.Collect.showStore();
                    } else {
                        Global.TheLegendOfDragon.Slots.CanDoNextRound();
                    }
                });
            }, 2.5);
        })
    },

    onClickCollectJp() {
        if (this._collectJpClicked) return;
        this._collectJpClicked = true;
        let btnCollectJp = this._collect_jp.getChildByName("btn_collect");
        btnCollectJp.stopAllActions();
        Global.TheLegendOfDragon.playEffect("base/common_click");
        Global.showAlertAction(this._collect_jp, false, 1, 0.1, ()=>{
            this._pop.active = false;
            this._collect_jp.active = false;
            Global.TheLegendOfDragon.Logic.showTransition("qieping1");
            Global.TheLegendOfDragon.playEffect("base/transition_bonus");
            this._collectJpClicked = false;
        });
        Global.TheLegendOfDragon.playEffect("base/popup_out");
        this.scheduleOnce(()=>{
            Global.SlotsSoundMgr.playNormalBgm(true);
            Global.TheLegendOfDragon.Pick.hide();
        }, 1);
        this.scheduleOnce(()=>{
            Global.TheLegendOfDragon.Slots.ShowBottomWin(this._jpWin,this._jpWin,true, ()=>{
                if (Global.TheLegendOfDragon.Collect._reopen) {
                    Global.TheLegendOfDragon.Collect.showStore();
                } else {
                    Global.TheLegendOfDragon.Slots.CanDoNextRound();
                }
            });
        }, 2.5);
    },

    showNodePopAnimation(node, delay) {
        node.scale = 0;
        node.runAction(cc.sequence(cc.delayTime(delay), cc.scaleTo(0.3, 1.2), cc.scaleTo(0.2, 1)));
    },

    //显示免费游戏开始
    //hideBet: 隐藏压住额
    //incWild: 播放增加wild动画
    async showFreeStart(freeCnt, hideBet, incWild) {
        this._incWild = incWild;
        this._pop.active = true;
        this._free.active = true;
        this._free.scale = 1;
        this._free_start.active = true;
        let lblCount = this._free_start.getChildByName("lbl_count").getComponent(cc.Label);
        lblCount.string = ""+freeCnt;
        let ske = this._free.getChildByName("spine_bg").getComponent(sp.Skeleton);
        ske.setAnimation(0, "animation1_1", false);
        ske.addAnimation(0, "animation1_2", true);
        this.showNodePopAnimation(this._free_start.getChildByName("lbl_count"), 0.5);
        this.showNodePopAnimation(this._free_start.getChildByName("btn_start"), 0.8);
        if (freeCnt>8){
            lblCount.string = "8";
            let more = this._free_start.getChildByName("more");
            more.active = true;
            more.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
            more.getComponent(sp.Skeleton).setCompleteListener(()=>{
                lblCount.string = ""+freeCnt;
            });
        }

        Global.SlotsSoundMgr.stopBgm();
        Global.TheLegendOfDragon.playEffect("free/free_dialog_start_show");
        await cc.vv.gameData.awaitTime(1.3);
        let btnFreeStart = this._free_start.getChildByName("btn_start");
        cc.vv.gameData.checkAutoPlay(btnFreeStart, ()=>{
            if (this._freeStartClicked) return;
            this._freeStartClicked = true;
            Global.TheLegendOfDragon.playEffect("base/common_click");
            Global.showAlertAction(this._free, false, 1, 0.1, ()=>{
                this._pop.active = false;
                this._free.active = false;
                this._free_start.active = false;
                Global.TheLegendOfDragon.Logic.showTransition("qieping2");
                Global.TheLegendOfDragon.playEffect("base/transition_free");
                this._freeStartClicked = false;
            });
            Global.TheLegendOfDragon.playEffect("base/popup_out");

            this.scheduleOnce(()=>{
                Global.TheLegendOfDragon.Slots.ShowGameview(true);
            }, 0.8);

            this.scheduleOnce(()=>{
                Global.TheLegendOfDragon.Slots.CanDoNextRound();
            }, 1.8);

            if (this._incWild) {
                this.scheduleOnce(()=>{
                    this.showIncWild();
                }, 2.4);
            }

            Global.TheLegendOfDragon.Collect.hide();
        })
    },

    onClickFreeStart() {
        if (this._freeStartClicked) return;
        this._freeStartClicked = true;
        let btnFreeStart = this._free_start.getChildByName("btn_start");
        btnFreeStart.stopAllActions();
        Global.TheLegendOfDragon.playEffect("base/common_click");
        Global.showAlertAction(this._free, false, 1, 0.1, ()=>{
            this._pop.active = false;
            this._free.active = false;
            this._free_start.active = false;
            Global.TheLegendOfDragon.Logic.showTransition("qieping2");
            Global.TheLegendOfDragon.playEffect("base/transition_free");
            this._freeStartClicked = false;
        });
        Global.TheLegendOfDragon.playEffect("base/popup_out");

        this.scheduleOnce(()=>{
            Global.TheLegendOfDragon.Slots.ShowGameview(true);
        }, 0.8);

        this.scheduleOnce(()=>{
            Global.TheLegendOfDragon.Slots.CanDoNextRound();
        }, 1.8);

        if (this._incWild) {
            this.scheduleOnce(()=>{
                this.showIncWild();
            }, 2.4);
        }

        Global.TheLegendOfDragon.Collect.hide();
    },

    //显示免费游戏结束
    async showFreeEnd(winCoin) {
        this._freeWin = winCoin;
        this._pop.active = true;
        this._free.active = true;
        this._free.scale = 1;
        this._free_end.active = true;
        Global.doRoallNumEff(cc.find("coin_bg/lbl_coin", this._free_end), 0, winCoin, 2.0, null, null, 2, true);
        let ske = this._free.getChildByName("spine_bg").getComponent(sp.Skeleton);
        ske.setAnimation(0, "animation2_1", false);
        ske.addAnimation(0, "animation2_2", true);
        this.showNodePopAnimation(this._free_end.getChildByName("coin_bg"), 0.5);
        this.showNodePopAnimation(this._free_end.getChildByName("btn_collect"), 0.8);

        Global.SlotsSoundMgr.stopBgm();
        Global.TheLegendOfDragon.playEffect("free/free_dialog_collect_show");
        let btnFreeEnd = this._free_end.getChildByName("btn_collect");
        await cc.vv.gameData.awaitTime(1.3);
        cc.vv.gameData.checkAutoPlay(btnFreeEnd, ()=>{
            if (this._freeEndClicked) return;
            this._freeEndClicked = true;
            Global.TheLegendOfDragon.playEffect("base/common_click");
            Global.showAlertAction(this._free, false, 1, 0.1, ()=>{
                this._pop.active = false;
                this._free.active = false;
                this._free_end.active = false;
                Global.TheLegendOfDragon.Logic.showTransition("qieping2");
                Global.TheLegendOfDragon.playEffect("base/transition_free");
                this._freeEndClicked = false;
            });
            Global.TheLegendOfDragon.playEffect("base/popup_out");
            this.scheduleOnce(()=>{
                Global.TheLegendOfDragon.Slots.ShowGameview(false);
                Global.TheLegendOfDragon.Slots.Resume();
                Global.SlotsSoundMgr.playNormalBgm(true)
            }, 0.6);
            this.scheduleOnce(()=>{
                Global.TheLegendOfDragon.Slots.ShowBottomWin(this._freeWin,this._freeWin,true, ()=>{
                    if (Global.TheLegendOfDragon.Collect._reopen) {
                        Global.TheLegendOfDragon.Collect.showStore();
                    } else {
                        Global.TheLegendOfDragon.Slots.CanDoNextRound();
                    }
                });
            }, 1.5);
        });
    },

    onClickFreeEnd() {
        if (this._freeEndClicked) return;
        this._freeEndClicked = true;
        let btnFreeEnd = this._free_end.getChildByName("btn_collect");
        btnFreeEnd.stopAllActions();
        Global.TheLegendOfDragon.playEffect("base/common_click");
        Global.showAlertAction(this._free, false, 1, 0.1, ()=>{
            this._pop.active = false;
            this._free.active = false;
            this._free_end.active = false;
            Global.TheLegendOfDragon.Logic.showTransition("qieping2");
            Global.TheLegendOfDragon.playEffect("base/transition_free");
            this._freeEndClicked = false;
        });
        Global.TheLegendOfDragon.playEffect("base/popup_out");
        this.scheduleOnce(()=>{
            Global.TheLegendOfDragon.Slots.ShowGameview(false);
            Global.TheLegendOfDragon.Slots.Resume();
            Global.SlotsSoundMgr.playNormalBgm(true)
        }, 0.6);
        this.scheduleOnce(()=>{
            Global.TheLegendOfDragon.Slots.ShowBottomWin(this._freeWin,this._freeWin,true, ()=>{
                if (Global.TheLegendOfDragon.Collect._reopen) {
                    Global.TheLegendOfDragon.Collect.showStore();
                } else {
                    Global.TheLegendOfDragon.Slots.CanDoNextRound();
                }
            });
        }, 1.5);
    },

    //显示飞粒子
    showLizi(targetNode, cb) {
        let tips = cc.find("safe_node/slots/tips", this.node);
        let lizi = cc.instantiate(tips.getChildByName("lizi"));
        lizi.parent = this.node;
        lizi.position = this.node.convertToNodeSpaceAR(tips.convertToWorldSpaceAR(cc.v2(0,0)));
        lizi.active = true;
        lizi.opacity = 0;
        let pos = this.node.convertToNodeSpaceAR(targetNode.convertToWorldSpaceAR(cc.v2(0,0)));
        lizi.runAction(cc.sequence(cc.delayTime(1.2), cc.fadeIn(0), cc.callFunc(()=>{
            Global.TheLegendOfDragon.playEffect("free/num_fly");
        }), 
        cc.moveTo(0.6, pos),
        cc.callFunc(()=>{
            if (cb) cb();
        }), cc.destroySelf()));
    },

    //显示免费次数+1
    showAddFreeCnt(cb) {
        let tips = cc.find("safe_node/slots/tips", this.node);
        let add_free_cnt = tips.getChildByName("add_free_cnt");
        tips.active = true;
        add_free_cnt.active = true;
        let ske = add_free_cnt.getComponent(sp.Skeleton);
        ske.setAnimation(0, "animation", false);
        ske.setCompleteListener(()=>{
            tips.active = false;
            add_free_cnt.active = false;
        });
        Global.TheLegendOfDragon.playEffect("free/free_dialog_more_show");

        //粒子
        this.showLizi(cc.find("safe_node/LMSlots_Bottom/free_time", this.node), cb);
    },

    //显示免费奖励翻倍
    showAddFreeMulti(mul, cb) {
        let idx = 1
        if (mul==2) idx=1;
        else if (mul==3) idx=2;
        else if (mul==5) idx=3;
        else if (mul==10) idx=4;
        let tips = cc.find("safe_node/slots/tips", this.node);
        let add_free_multi = tips.getChildByName("add_free_multi");
        tips.active = true;
        add_free_multi.active = true;
        let ske = add_free_multi.getComponent(sp.Skeleton);
        ske.setAnimation(0, "animation"+idx, false);
        ske.setCompleteListener(()=>{
            tips.active = false;
            add_free_multi.active = false;
        });
        Global.TheLegendOfDragon.playEffect("free/free_dialog_more_show");

        //粒子
        this.showLizi(cc.find("safe_node/slots/free_multi", this.node), cb);
    },

    //显示bonus小游戏转盘开始
    showWheelStart() {
        let tips = cc.find("safe_node/slots/tips", this.node);
        let wheel_start = tips.getChildByName("wheel_start");
        tips.active = true;
        wheel_start.active = true;
        let ske = wheel_start.getComponent(sp.Skeleton);
        ske.setAnimation(0, "animation", false);
        ske.setCompleteListener(()=>{
            tips.active = false;
            wheel_start.active = false;
        });
    },

    //显示remove mini
    showRemoveMini() {
        let pop = this._pop;
        pop.active = true;
        let remove_mini = pop.getChildByName("remove_mini");
        remove_mini.active = true;
        remove_mini.scale = 0.2;
        cc.tween(remove_mini)
            .to(0.25, {scale:1}, {easing:"backInOut"})
            .delay(0.7)
            .to(0.25, {scale:0.2}, {easing:"backInOut"})
            .call(()=>{
                pop.active = false;
                remove_mini.active = false;
            })
            .start();
    },

    showIncWild() {      
        let spr_wild = cc.find("safe_node/slots/spr_inc_wild", this.node);
        spr_wild.active = true;
        spr_wild.scale = 0;
        cc.tween(spr_wild)
            .to(0.25, {scale:1}, {easing:"backInOut"})
            .delay(1.5)
            .to(0.25, {scale:0}, {easing:"backInOut"})
            .call(()=>{
                spr_wild.active = false;
            })
            .start();
        
    },

});
