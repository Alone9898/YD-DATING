
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

        this._node_tri_free = cc.find("node_tri_free", this._node_popup);
        this._node_end_free = cc.find("node_end_free", this._node_popup);
        this._node_tri_bonus = cc.find("node_tri_bonus", this._node_popup);
        this._node_end_bonus = cc.find("node_end_bonus", this._node_popup);
        this._node_win_jp = cc.find("node_win_jp", this._node_popup);
        this._node_tri_free.active = false;
        this._node_end_free.active = false;
        this._node_tri_bonus.active = false;
        this._node_end_bonus.active = false;
        this._node_win_jp.active = false;

        this._huoqiu = cc.find("safe_node/Effect_Pomi_huoqiu4", this.node);
        this._huoqiu_bg = cc.find("safe_node/Effect_Pomi_huoqiu4_bg", this.node);
        this._huoqiu.active = false;
        this._huoqiu_bg.active = false;

        this._node_qp = cc.find("safe_node/node_qp", this.node);
        this._node_qp.active = false;

    },

    playPanelAnim(bShow, p_node){
        return new Promise(async(success, failed)=> {
            let c_cnt = p_node.childrenCount;
            for (let i = 0; i < c_cnt; i++) {
                let node = p_node.children[i];
                let s_scaleX = node.scaleX;
                let s_scaleY = node.scaleY;
                if(bShow){
                    node.active = true;
                    node.setScale(0);
                    cc.tween(node).delay(i * 0.1).to(0.5, {scaleX:s_scaleX,scaleY:s_scaleY}, {easing: "backOut"}).start()
                } else {
                    cc.tween(node).delay((c_cnt-i)*0.1).to(0.5,{scaleX:0,scaleY:0}, {easing:"backIn"})
                        .call(()=>{node.active = false;node.scale = cc.v2(s_scaleX,s_scaleY);}).start()
                }
            }
            await cc.vv.gameData.awaitTime(c_cnt * 0.1 + 0.5);

            success();
        });
    },

    triFreeGame(bFirst, freeCnt){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("music_Pomi_common_viewOpen");
            this._node_popup.active = true;
            this._node_tri_free.active = true;

            cc.find("kuang/lbl",this._node_tri_free).getComponent(cc.Label).string = freeCnt;
            cc.find("text_first",this._node_tri_free).opacity = bFirst?255:0;
            cc.find("text_extra",this._node_tri_free).opacity = !bFirst?255:0;
            cc.find("btn",this._node_tri_free).opacity = bFirst?255:0;

            await this.playPanelAnim(true, this._node_tri_free);

            if(bFirst){
                let btn = cc.find("btn", this._node_tri_free);
                btn.off("click");
                btn.getComponent(cc.Button).interactable = true;

                let self = this;
                let clickFunc = async()=>{
                    Global.SlotsSoundMgr.playEffect("music_Pomi_common_Click");
                    btn.getComponent(cc.Button).interactable = false;

                    await self.playPanelAnim(false, self._node_tri_free);

                    self._node_popup.active = false;
                    self._node_tri_free.active = false;
                    success();
                };
                cc.vv.gameData.checkAutoPlay(btn, clickFunc);
                btn.on("click", async()=>{
                    btn.stopAllActions();
                    clickFunc();
                });
            } else {
                await cc.vv.gameData.awaitTime(2);

                await this.playPanelAnim(false, this._node_tri_free);

                this._node_popup.active = false;
                this._node_tri_free.active = false;
                success();
            }
        });
    },

    endFreeGame(winCoin,freeCnt){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("music_Pomi_common_viewOpen");
            this._node_popup.active = true;
            this._node_end_free.active = true;

            cc.find("kuang/lbl", this._node_end_free).getComponent(cc.Label).string = Global.FormatNumToComma(winCoin);
            cc.find("freeCnt", this._node_end_free).getComponent(cc.Label).string = freeCnt;

            let btn = cc.find("btn", this._node_end_free);
            btn.off("click");
            btn.getComponent(cc.Button).interactable = true;

            await this.playPanelAnim(true, this._node_end_free);

            let self = this;
            let clickFunc = async()=>{
                Global.SlotsSoundMgr.playEffect("music_Pomi_common_Click");
                btn.getComponent(cc.Button).interactable = false;

                await self.playPanelAnim(false, self._node_end_free);

                self._node_popup.active = false;
                self._node_end_free.active = false;
                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.on("click", async()=>{
                btn.stopAllActions();
                clickFunc();
            });
        });
    },

    triBonusGame(){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("music_Pomi_common_viewOpen");
            this._node_popup.active = true;
            this._node_tri_bonus.active = true;

            await this.playPanelAnim(true, this._node_tri_bonus);

            let btn = cc.find("btn", this._node_tri_bonus);
            btn.off("click");
            btn.getComponent(cc.Button).interactable = true;

            let self = this;
            let clickFunc = async()=>{
                Global.SlotsSoundMgr.playEffect("music_Pomi_common_Click");
                btn.getComponent(cc.Button).interactable = false;

                await self.playPanelAnim(false, self._node_tri_bonus);

                self._node_popup.active = false;
                self._node_tri_bonus.active = false;
                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.on("click", async()=>{
                btn.stopAllActions();
                clickFunc();
            });
        });
    },

    endBonusGame(winCoin){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("music_Pomi_common_viewOpen");
            this._node_popup.active = true;
            this._node_end_bonus.active = true;

            cc.find("kuang/lbl", this._node_end_bonus).getComponent(cc.Label).string = Global.FormatNumToComma(winCoin);
            await this.playPanelAnim(true, this._node_end_bonus);

            let btn = cc.find("btn", this._node_end_bonus);
            btn.off("click");
            btn.getComponent(cc.Button).interactable = true;

            let self = this;
            let clickFunc = async()=>{
                Global.SlotsSoundMgr.playEffect("music_Pomi_common_Click");
                btn.getComponent(cc.Button).interactable = false;

                await self.playPanelAnim(false, self._node_end_bonus);

                self._node_popup.active = false;
                self._node_end_bonus.active = false;
                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.on("click", async()=>{
                btn.stopAllActions();
                clickFunc();
            });
        });
    },

    playWinJp(winCoin, jpIdx){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("music_Pomi_common_viewOpen");
            this._node_popup.active = true;
            this._node_win_jp.active = true;

            cc.find("spr_jp", this._node_win_jp).getComponent("ImgSwitchCmp").setIndex(jpIdx-1);
            cc.find("kuang/lbl", this._node_win_jp).getComponent(cc.Label).string = Global.FormatNumToComma(winCoin);
            await this.playPanelAnim(true, this._node_win_jp);

            let btn = cc.find("btn", this._node_win_jp);
            btn.off("click");
            btn.getComponent(cc.Button).interactable = true;

            let self = this;
            let clickFunc = async()=>{
                Global.SlotsSoundMgr.playEffect("music_Pomi_common_Click");
                btn.getComponent(cc.Button).interactable = false;

                await self.playPanelAnim(false, self._node_win_jp);

                self._node_popup.active = false;
                self._node_win_jp.active = false;
                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.on("click", async()=>{
                btn.stopAllActions();
                clickFunc();
            });
        });
    },

    // playFreeQp(){
    //     return new Promise(async (success, failed)=> {
    //         Global.SlotsSoundMgr.playEffect("music_Pomi_GuoChang");
    //
    //         this.showShake(3.5,5,5);
    //         let t_hide = cc.tween().to(0.5, {opacity: 0});
    //         t_hide.clone(cc.find("Canvas/safe_node/LMSlots_PrizePool_1")).start();
    //         t_hide.clone(cc.find("Canvas/safe_node/slots")).start();
    //
    //         await cc.vv.gameData.awaitTime(0.5);
    //         await this.playHuoshanAnim();
    //
    //         let t_show = cc.tween().to(0.5, {opacity: 255});
    //         t_show.clone(cc.find("Canvas/safe_node/LMSlots_PrizePool_1")).start();
    //         t_show.clone(cc.find("Canvas/safe_node/slots")).start();
    //
    //         await cc.vv.gameData.awaitTime(0.5);
    //         success()
    //     })
    // },

    // playBonusQp(showBonus){
    //     return new Promise(async (success, failed)=> {
    //         Global.SlotsSoundMgr.playEffect("music_Pomi_GuoChang");
    //
    //         let n_slots = cc.find("Canvas/safe_node/slots");
    //         let b_slots = cc.find("Canvas/safe_node/node_bonus");
    //
    //         this.showShake(3.5,5,5);
    //         let t_hide = cc.tween().to(0.5, {opacity: 0});
    //         t_hide.clone(cc.find("Canvas/safe_node/LMSlots_PrizePool_1")).start();
    //         if(showBonus){
    //             t_hide.clone(n_slots).start()
    //         } else {
    //             t_hide.clone(b_slots).start()
    //         }
    //
    //         await cc.vv.gameData.awaitTime(0.5);
    //         await this.playHuoshanAnim();
    //
    //         let t_show = cc.tween().to(0.5, {opacity: 255});
    //         t_show.clone(cc.find("Canvas/safe_node/LMSlots_PrizePool_1")).start();
    //         if(showBonus){
    //             b_slots.active = true;
    //             t_show.clone(b_slots).start()
    //         } else {
    //             n_slots.active = true;
    //             t_show.clone(n_slots).start()
    //         }
    //
    //         await cc.vv.gameData.awaitTime(0.5);
    //         success()
    //     })
    // },


    async playQpAnim(bTriBonus){
        let character = cc.find("Canvas/safe_node/Xerxes");
        character.active = false;
        character.opacity = 0

        this._node_qp.active = true;
        let qpSp = cc.find("spine", this._node_qp).getComponent(sp.Skeleton);
        qpSp.timeScale = 0.7
        qpSp.setAnimation(0,"animation2",false);
        qpSp.setCompleteListener(()=>{
            this._node_qp.active = false;
        })
        await cc.vv.gameData.awaitTime(2);
        if(!bTriBonus){
            character.active = true;
            cc.tween(character).to(0.5, {opacity: 255}).start();
        }
    },


    async playHuoshanAnim(bBG){

        Global.SlotsSoundMgr.playEffect("music_Pomi_GuoChang");

        // cc.find("Canvas/safe_node/pomi_bg_shan/s_penfa").getComponent(cc.Animation).play("s_penfa");
        // cc.find("Canvas/safe_node/pomi_bg_shan/s_xiaohuo").getComponent(cc.Animation).play("s_xiaohuo");
        // cc.find("Canvas/safe_node/pomi_bg_shan/yanjiang/s_liudong").getComponent(cc.Animation).play("s_liudong");
        // await cc.vv.gameData.awaitTime(1.5);
    },

    async playHuoqiuEffect(bBG){
        if(bBG){
            this._huoqiu_bg.active = true;
            this._huoqiu_bg.getComponent(cc.ParticleSystem).resetSystem();
        } else {
            this._huoqiu.active = true;
            this._huoqiu.getComponent(cc.ParticleSystem).resetSystem();
        }
        await cc.vv.gameData.awaitTime(4);
        this._huoqiu.active = false;
        this._huoqiu_bg.active = false;
    },

    showShake(time,x,y){
        return new Promise(async (sucess, failed)=>{
            Global.SlotsSoundMgr.playEffect(Global.SlotsSoundMgr.bell)
            cc.find("Canvas/safe_node/slots").runAction(cc.shake(time,x,y))
            cc.find("Canvas/safe_node/node_bonus").runAction(cc.shake(time,x,y))
            cc.find("Canvas/safe_node/LMSlots_PrizePool_1").runAction(cc.shake(time,x,y))
            cc.find("Canvas/safe_node/spr_bg_normal").runAction(cc.shake(time,x,y))
            cc.find("Canvas/safe_node/spr_bg_free").runAction(cc.shake(time,x,y))
            // cc.find("Canvas/safe_node/pomi_bg_shan").runAction(cc.shake(time,x,y))
            // cc.find("Canvas/safe_node/pomi_bg_3").runAction(cc.shake(time,x,y))
            await cc.vv.gameData.awaitTime(time)
            sucess()
        })
    },

    // update (dt) {},
});
