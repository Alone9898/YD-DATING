cc.Class({
    extends: cc.Component,

    properties: {},

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._respin_start = cc.find("respin_start", this.node);
        this._respin_start.active = false;
        this._respin_win = cc.find("respin_win", this.node);
        this._respin_win.active = false;
        this._pick_start = cc.find("pick_start", this.node);
        this._pick_start.active = false;
        this._jp_win = cc.find("jackpot_win", this.node);
        this._jp_win.active = false;
        this._free_start = cc.find("free_start", this.node);
        this._free_start.active = false;
        this._free_win = cc.find("free_win", this.node);
        this._free_win.active = false;


        this.node.active = false;
    },

    start() {

    },

    async playTriBonus(bNormal) {
        return new Promise(async (success, failed) => {
            if(bNormal){
                Global.SlotsSoundMgr.playEffect("respin_start");
            } else {
                Global.SlotsSoundMgr.playEffect("sp_respin_start");
            }
            this.node.active = true;
            this._respin_start.active = true;
            let bgSp = cc.find("spine", this._respin_start).getComponent(sp.Skeleton);
            bgSp.setAnimation(0, bNormal ? "animation1_1" : "animation2_1", false);
            bgSp.addAnimation(0, bNormal ? "animation1_2" : "animation2_2", true);

            await cc.vv.gameData.awaitTime(0.5);
            let btn = cc.find("btn", this._respin_start);
            btn.getComponent(cc.Button).interactable = true;
            btn.off("click");
            let self = this;
            btn.on("click", () => {
                btn.getComponent(cc.Button).interactable = false;
                Global.SlotsSoundMgr.playEffect("click");

                let entry = bgSp.setAnimation(0, bNormal ? "animation1_3" : "animation2_3", false);
                bgSp.setTrackCompleteListener(entry, () => {
                    self.node.active = false;
                    self._respin_start.active = false;
                    success();
                })
            });

            await cc.vv.gameData.awaitTime(2);
            btn.getComponent(cc.Button).interactable = false;
            let entry2 = bgSp.setAnimation(0, bNormal ? "animation1_3" : "animation2_3", false);
            bgSp.setTrackCompleteListener(entry2, () => {
                self.node.active = false;
                self._respin_start.active = false;
                success();
            })
        });
    },

    async playTriPick(bNormal) {
        return new Promise(async (success, failed) => {
            if(bNormal){
                Global.SlotsSoundMgr.playEffect("pick_start");
            } else {
                Global.SlotsSoundMgr.playEffect("sp_pick_start");
            }

            this.node.active = true;
            this._pick_start.active = true;
            let bgSp = cc.find("spine", this._pick_start).getComponent(sp.Skeleton);
            bgSp.setAnimation(0, bNormal ? "animation1_1" : "animation2_1", false);
            bgSp.addAnimation(0, bNormal ? "animation1_2" : "animation2_2", true);

            await cc.vv.gameData.awaitTime(0.5);
            let btn = cc.find("btn", this._pick_start);
            btn.getComponent(cc.Button).interactable = true;
            btn.off("click");
            let self = this;
            btn.on("click", () => {
                btn.getComponent(cc.Button).interactable = false;
                Global.SlotsSoundMgr.playEffect("click");

                let entry = bgSp.setAnimation(0, bNormal ? "animation1_3" : "animation2_3", false);
                bgSp.setTrackCompleteListener(entry, () => {
                    self.node.active = false;
                    self._pick_start.active = false;
                    success();
                })
            });

            await cc.vv.gameData.awaitTime(2);
            btn.getComponent(cc.Button).interactable = false;
            let entry2 = bgSp.setAnimation(0, bNormal ? "animation1_3" : "animation2_3", false);
            bgSp.setTrackCompleteListener(entry2, () => {
                self.node.active = false;
                self._pick_start.active = false;
                success();
            })
        });
    },

    async endBonusGame(winCoin){
        return new Promise(async (success, failed) => {
            Global.SlotsSoundMgr.playEffect("respin_collect");
            this.node.active = true;
            this._respin_win.active = true;
            let bgSp =cc.find("314_popup_bg", this._respin_win).getComponent(sp.Skeleton);
            bgSp.setAnimation(0,"animation1",false);
            bgSp.addAnimation(0,"animation2",true);
            let fgSp = cc.find("314_popup_resjs", this._respin_win).getComponent(sp.Skeleton);
            fgSp.setAnimation(0,"animation1",false);
            fgSp.addAnimation(0,"animation2",true);

            let popNode = cc.find("pop", this._respin_win);
            popNode.scale = 0;
            cc.tween(popNode)
                .hide()
                .delay(0.3)
                .show()
                .to(0.5, {scale:1},{easing:"backOut"})
                .start();

            let label = cc.find("pop/label", this._respin_win);
            Global.doRoallNumEff(label,0,winCoin, 1.5,null,null,2,true);

            await cc.vv.gameData.awaitTime(1);
            let btn = cc.find("pop/btn", this._respin_win);
            btn.getComponent(cc.Button).interactable = true;
            btn.off("click");
            let self = this;
            btn.on("click", () => {
                btn.getComponent(cc.Button).interactable = false;
                Global.SlotsSoundMgr.playEffect("click");

                cc.tween(popNode).to(0.5, {scale:0},{easing:"backIn"}).start();
                bgSp.setAnimation(0,"animation3",false);
                let entry = fgSp.setAnimation(0, "animation3", false);
                fgSp.setTrackCompleteListener(entry, () => {
                    self.node.active = false;
                    self._respin_win.active = false;
                    success();
                })
            });
        });
    },

    async playJpWin(jpIdx, winCoin, mult=1, bNormal=true) {
        return new Promise(async (success, failed) => {
            this.node.active = true;
            this._jp_win.active = true;

            let effName = ["dialog_mini1","dialog_minor1","dialog_major1","dialog_grand1"];
            Global.SlotsSoundMgr.playEffect(effName[jpIdx-1]);

            let bgSp;
            let jpListName = ["minitanchuang","minortanchuang","majortanchuang","grandtanchuang"];
            for (let i = 0; i < 4; i++){
                let node =  cc.find(jpListName[i], this._jp_win)
                if(i+1 == jpIdx){
                    node.active = true;
                    bgSp = node.getComponent(sp.Skeleton);
                } else {
                    node.active = false;
                }
            }
            bgSp.node.active = true;
            bgSp.setAnimation(0, "animation1_1"/*bNormal ? "animation1_1" : "animation2_1"*/, false);
            bgSp.addAnimation(0, "animation1_2"/*bNormal ? "animation1_2" : "animation2_2"*/, true);

            let popNode = cc.find("pop", this._jp_win);
            popNode.scale = 0;
            cc.tween(popNode)
                .hide()
                .delay(0.3)
                .show()
                .to(0.5, {scale:1},{easing:"backOut"})
                .start();

            let label = cc.find("pop/label", this._jp_win);
            Global.doRoallNumEff(label,0,winCoin, 1.5,null,null,2,true);

            let multNode = cc.find("pop/mult", this._jp_win);
            let btn = cc.find("pop/btn", this._jp_win);
            let zhaSp = cc.find("314_popup_fgzha", popNode).getComponent(sp.Skeleton);
            if(mult>1){
                multNode.active = true;
                multNode.position = cc.v2(364,342);
                btn.active = false;
                btn.opacity = 0
                for (let node of multNode){
                    node.active = node.name.lastIndexOf(mult)==0;
                }

                await cc.vv.gameData.awaitTime(1.5);
                cc.tween(multNode)
                    .to(0.5, {position:label.position})
                    .to(0.3,{opacity:0})
                    .start()
                await cc.vv.gameData.awaitTime(0.5);
                zhaSp.node.active = true;
                zhaSp.setAnimation(0,"animation1_1",false);
                zhaSp.setCompleteListener(()=>{
                    zhaSp.setCompleteListener(null);
                    zhaSp.node.active = false;
                })
                Global.doRoallNumEff(label,0,winCoin*mult, 1.0,null,null,2,true);
                btn.active = true;
                cc.tween(btn)
                    .to(0.5,{opacity:255})
                    .start()
            } else {
                btn.active = true;
                multNode.active = false;
                zhaSp.node.active = false;
            }


            await cc.vv.gameData.awaitTime(1);
            btn.getComponent(cc.Button).interactable = true;
            btn.off("click");
            let self = this;
            btn.on("click", () => {
                btn.getComponent(cc.Button).interactable = false;
                Global.SlotsSoundMgr.playEffect("click");

                cc.tween(popNode).to(0.5, {scale:0},{easing:"backIn"}).start();
                let entry = bgSp.setAnimation(0, "animation1_3"/*bNormal ? "animation1_3" : "animation2_3"*/, false);
                bgSp.setTrackCompleteListener(entry, () => {
                    self.node.active = false;
                    self._pick_start.active = false;
                    success();
                })
            });
        })
    },

    async triFreeGame(cnt, bNormal, isFirst){
        return new Promise(async (success, failed) => {
            this.node.active = true;
            this._free_start.active = true;
            let bgSp =cc.find("314_popup_bg", this._free_start).getComponent(sp.Skeleton);
            bgSp.setAnimation(0,"animation1",false);
            bgSp.addAnimation(0,"animation2",true);
            let fgSp = cc.find("314_popup_fg", this._free_start).getComponent(sp.Skeleton);
            if(isFirst){
                if(bNormal){
                    Global.SlotsSoundMgr.playEffect("free_start");
                } else {
                    Global.SlotsSoundMgr.playEffect("sp_free_start");
                }

                fgSp.setAnimation(0,bNormal?"animation1_1":"animation3_1",false);
                fgSp.addAnimation(0,bNormal?"animation1_2":"animation3_2",true);
            } else {
                Global.SlotsSoundMgr.playEffect("free_extra");
                fgSp.setAnimation(0,"animation5_1",false);
                fgSp.addAnimation(0,"animation5_2",true);
            }

            let popNode = cc.find("pop", this._free_start);
            popNode.scale = 0;
            cc.tween(popNode)
                .hide()
                .delay(0.3)
                .show()
                .to(0.5, {scale:1},{easing:"backOut"})
                .start();

            Global.setLabelString("pop/label", this._free_start, cnt);
            let btn = cc.find("pop/btn", this._free_start);
            btn.active = isFirst;
            await cc.vv.gameData.awaitTime(1);
            let self = this;
            if(isFirst){
                btn.getComponent(cc.Button).interactable = true;
                btn.off("click");
                btn.on("click", () => {
                    btn.getComponent(cc.Button).interactable = false;
                    Global.SlotsSoundMgr.playEffect("click");

                    cc.tween(popNode).to(0.5, {scale:0},{easing:"backIn"}).start();
                    bgSp.setAnimation(0,"animation3",false);
                    let entry = fgSp.setAnimation(0, bNormal ? "animation1_3" : "animation3_3", false);
                    fgSp.setTrackCompleteListener(entry, () => {
                        self.node.active = false;
                        self._free_start.active = false;
                        success();
                    })
                });
            } else {
                await cc.vv.gameData.awaitTime(2);
                cc.tween(popNode).to(0.5, {scale:0},{easing:"backIn"}).start();
                bgSp.setAnimation(0,"animation3",false);
                let entry = fgSp.setAnimation(0, "animation5_3", false);
                fgSp.setTrackCompleteListener(entry, () => {
                    self.node.active = false;
                    self._free_start.active = false;
                    success();
                })
            }
        });
    },

    async endFreeGame(winCoin,bNormal){
        return new Promise(async (success, failed) => {
            if(bNormal){
                Global.SlotsSoundMgr.playEffect("free_collect");
            } else {
                Global.SlotsSoundMgr.playEffect("sp_free_collect");
            }
            this.node.active = true;
            this._free_win.active = true;
            let bgSp =cc.find("314_popup_bg", this._free_win).getComponent(sp.Skeleton);
            bgSp.setAnimation(0,"animation1",false);
            bgSp.addAnimation(0,"animation2",true);
            let fgSp = cc.find("314_popup_fg", this._free_win).getComponent(sp.Skeleton);
            fgSp.setAnimation(0,bNormal?"animation2_1":"animation4_1",false);
            fgSp.addAnimation(0,bNormal?"animation2_2":"animation4_2",true);

            let popNode = cc.find("pop", this._free_win);
            popNode.scale = 0;
            cc.tween(popNode)
                .hide()
                .delay(0.3)
                .show()
                .to(0.5, {scale:1},{easing:"backOut"})
                .start();

            let label = cc.find("pop/label", this._free_win);
            Global.doRoallNumEff(label,0,winCoin, 1.5,null,null,2,true);

            await cc.vv.gameData.awaitTime(1);
            let btn = cc.find("pop/btn", this._free_win);
            btn.getComponent(cc.Button).interactable = true;
            btn.off("click");
            let self = this;
            btn.on("click", () => {
                btn.getComponent(cc.Button).interactable = false;
                Global.SlotsSoundMgr.playEffect("click");
                // Global.SlotsSoundMgr.playEffect("transition_free");

                cc.tween(popNode).to(0.5, {scale:0},{easing:"backIn"}).start();
                bgSp.setAnimation(0,"animation3",false);
                let entry = fgSp.setAnimation(0, bNormal ? "animation2_3" : "animation4_3", false);
                fgSp.setTrackCompleteListener(entry, () => {
                    self.node.active = false;
                    self._free_win.active = false;
                    success();
                })
            });
        });
    },

    // update (dt) {},
});
