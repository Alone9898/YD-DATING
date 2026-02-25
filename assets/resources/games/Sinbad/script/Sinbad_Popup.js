
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    Init(){
        this._node_popup = cc.find("safe_node/node_popup", this.node);
        this._node_popup.active = false;

        this._node_win = cc.find("node_win", this._node_popup);
        this._node_win.active = false;

        this._node_tri_free = cc.find("node_tri_free", this._node_popup);
        this._node_tri_bonus = cc.find("node_tri_bonus", this._node_popup);
        this._node_tri_free.active = false;
        this._node_tri_bonus.active = false;

        this._kGuoChang = cc.find("safe_node/KGuoChang", this.node);
        this._YinBiGuoChang = cc.find("safe_node/YinBiGuoChang", this.node);
        this._kGuoChang.active = false;
        this._YinBiGuoChang.active = false;
    },

    playWinPanel(winCoin){
        return new Promise(async (success, failed)=> {
            this._node_popup.active = true;
            this._node_win.active = true;

            this._node_win.setScale(0);
            cc.tween(this._node_win).to(0.5,{scale:1},{easing:"backOut"}).start();

            cc.find("total_win", this._node_win).getComponent(cc.Label).string = Global.FormatNumToComma(winCoin);

            let btn = cc.find("btn", this._node_win);
            btn.off("click");
            await cc.vv.gameData.awaitTime(0.5);

            let self = this;
            let clickFunc = async()=> {
                Global.SlotsSoundMgr.playEffect("button");
                btn.getComponent(cc.Button).interactable = false;
                cc.tween(self._node_win).to(0.5,{scale:0},{easing:"backIn"}).start();

                await cc.vv.gameData.awaitTime(0.5);
                self._node_popup.active = false;
                self._node_win.active = false;
                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.getComponent(cc.Button).interactable = true;
            btn.on("click", async()=> {
                btn.stopAllActions();
                clickFunc();
            })
        })
    },

    triFreeGame(bFirst,freeCnt){
        return new Promise(async (success, failed)=> {

            Global.SlotsSoundMgr.playEffect("fgbegin");

            this._node_popup.active = true;
            this._node_tri_free.active = true;

            this._node_tri_free.setScale(0);
            cc.tween(this._node_tri_free).to(0.5,{scale:1},{easing:"backOut"}).start();

            cc.find("lbl",this._node_tri_free).getComponent(cc.Label).string = freeCnt;

            cc.find("free_games_EN", this._node_tri_free).active = bFirst;
            cc.find("extra_free_EN", this._node_tri_free).active = !bFirst;
            let btn = cc.find("btn", this._node_tri_free);
            btn.active = bFirst;
            btn.getComponent(cc.Button).interactable = false;

            await cc.vv.gameData.awaitTime(0.5);
            if(bFirst){
                btn.off("click");
                btn.getComponent(cc.Button).interactable = true;
                let self = this;
                let clickFunc = async()=> {
                    Global.SlotsSoundMgr.playEffect("button");
                    btn.getComponent(cc.Button).interactable = false;
                    cc.tween(self._node_tri_free).to(0.5,{scale:0},{easing:"backIn"}).start();
                    await cc.vv.gameData.awaitTime(0.5);

                    self._node_popup.active = false;
                    self._node_tri_free.active = false;

                    success();
                };
                cc.vv.gameData.checkAutoPlay(btn, clickFunc);
                btn.on("click", async()=> {
                    btn.stopAllActions();
                    clickFunc();
                });
            } else {
                await cc.vv.gameData.awaitTime(2);
                cc.tween(this._node_tri_free).to(0.5,{scale:0},{easing:"backIn"}).start();
                await cc.vv.gameData.awaitTime(0.5);

                this._node_popup.active = false;
                this._node_tri_free.active = false;

                success();
            }
        });
    },

    triBonusGame(){
        return new Promise(async (success, failed)=> {
            this._node_popup.active = true;
            this._node_tri_bonus.active = true;

            this._node_tri_bonus.setScale(0);
            cc.tween(this._node_tri_bonus).to(0.5,{scale:1},{easing:"backOut"}).start();

            let btn = cc.find("btn", this._node_tri_bonus);
            btn.off("click");
            await cc.vv.gameData.awaitTime(0.5);

            let self = this;
            let clickFunc = async()=> {
                Global.SlotsSoundMgr.playEffect("button");
                btn.getComponent(cc.Button).interactable = false;
                cc.tween(self._node_tri_bonus).to(0.5,{scale:0},{easing:"backIn"}).start();

                await cc.vv.gameData.awaitTime(0.5);
                self._node_popup.active = false;
                self._node_tri_bonus.active = false;
                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.getComponent(cc.Button).interactable = true;
            btn.on("click", async()=> {
                btn.stopAllActions();
                clickFunc();
            })
        });
    },

    async playKQpAnim(){
        Global.SlotsSoundMgr.playEffect("TransitionIn");

        this._kGuoChang.active = true;
        this._kGuoChang.getComponent(sp.Skeleton).setAnimation(0, "KGuoChang_Intro", false);
        this._kGuoChang.getComponent(sp.Skeleton).addAnimation(0, "KGuoChang_Loop", false);
        let entry = this._kGuoChang.getComponent(sp.Skeleton).addAnimation(0, "KGuoChang_End", false);
        this._kGuoChang.getComponent(sp.Skeleton).setTrackCompleteListener(entry, ()=>{
            this._kGuoChang.getComponent(sp.Skeleton).setTrackCompleteListener(entry, null);
            this._kGuoChang.active = false;
        });
        await cc.vv.gameData.awaitTime(3.5);
        Global.SlotsSoundMgr.playEffect("TransitionOut");
    },

    playYinBibQpAnim(){
        Global.SlotsSoundMgr.playEffect("bgTransition");
        this._YinBiGuoChang.active = true;
        this._YinBiGuoChang.getComponent(sp.Skeleton).setAnimation(0, "YinBiGuoChang", false);
        this._YinBiGuoChang.getComponent(sp.Skeleton).setCompleteListener(()=>{
            this._YinBiGuoChang.getComponent(sp.Skeleton).setCompleteListener(null);
            this._YinBiGuoChang.active = false;
        });
    },

    // update (dt) {},
});
