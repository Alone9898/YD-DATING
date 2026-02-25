
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
        this._node_del_free = cc.find("node_del_free", this._node_popup);
        this._node_tri_pick = cc.find("node_tri_pick", this._node_popup);
        this._node_end_pick = cc.find("node_end_pick", this._node_popup);
        this._node_end_pick_jp = cc.find("node_end_pick_jp", this._node_popup);
        this._node_power_up = cc.find("node_power_up", this._node_popup);
        this._node_tri_free.active = false;
        this._node_end_free.active = false;
        this._node_del_free.active = false;
        this._node_tri_pick.active = false;
        this._node_end_pick.active = false;
        this._node_end_pick_jp.active = false;
        this._node_power_up.active = false;

        this._node_qp = cc.find("safe_node/node_qp", this.node);
        this._node_qp.active = false;

        this._qp_jzt = cc.find("spine_jzt", this._node_qp);
        this._qp_men = cc.find("spine_men", this._node_qp);
        // this._qp_falao = cc.find("spine_falao", this._node_qp);
        this._qp_jzt.active = false;
        this._qp_men.active = false;
        // this._qp_falao.active = false;
    },


    // 触发免费
    playTriFreeAnim(freeCnt, bSuper, isFirstTri, powerCnt) {
        return new Promise(async (success, failed) => {
            let effect = "";
            let sp_type = 0;
            if(isFirstTri) {
                if(bSuper){
                    effect = "sb_start1";
                    sp_type = 3;
                } else {
                    effect = "fg_start1";
                    sp_type = 0;
                }
            } else {
                if(bSuper){
                    effect = "sb_extra";
                    sp_type = 4;
                } else {
                    effect = "fg_extra";
                    sp_type = 1;
                }
            }
            Global.SlotsSoundMgr.playEffect(effect);

            this._node_popup.active = true;
            this._node_tri_free.active = true;

            let spine_bg = cc.find("spine_bg", this._node_tri_free);
            let lbl_cnt = cc.find("lbl_cnt", this._node_tri_free);
            let spr_power = cc.find("spr_powerUp", this._node_tri_free);
            let btn_start = cc.find("btn_start", this._node_tri_free);
            lbl_cnt.getComponent(cc.Label).string = freeCnt;

            lbl_cnt.active = false;
            spr_power.active = false;
            btn_start.active = false;

            spine_bg.getComponent(sp.Skeleton).setAnimation(0, cc.js.formatStr("animation%s_1",sp_type), false);
            spine_bg.getComponent(sp.Skeleton).addAnimation(0,  cc.js.formatStr("animation%s_2",sp_type), true);

            await cc.vv.gameData.awaitTime(0.3);
            lbl_cnt.active = true;
            lbl_cnt.setScale(0);
            cc.tween(lbl_cnt).to(0.5, {scale:1}, {easing:"backOut"}).start();
            spr_power.active = powerCnt > 0;
            if( powerCnt > 0){
                spr_power.active = true;
                for (let i = 1; i <= 4; i++){
                    cc.find("add"+i, spr_power).active = i === powerCnt;
                }
                spr_power.setScale(0);
                cc.tween(spr_power).to(0.5, {scale:1}, {easing:"backOut"}).start();
            }

            if(!isFirstTri){
                await cc.vv.gameData.awaitTime(1.5);
                spine_bg.getComponent(sp.Skeleton).setAnimation(0,  cc.js.formatStr("animation%s_3",sp_type), false);
                await cc.vv.gameData.awaitTime(0.3);
                cc.tween(lbl_cnt).to(0.5, {scale:0}, {easing:"backIn"}).start();
                if(spr_power.active){
                    cc.tween(spr_power).to(0.5, {scale:0}, {easing:"backIn"}).start();
                }

                await cc.vv.gameData.awaitTime(0.5);
                this._node_popup.active = false;
                this._node_tri_free.active = false;

                success();
            } else {
                await cc.vv.gameData.awaitTime(0.3);
                btn_start.active = true;
                btn_start.setScale(0);
                cc.tween(btn_start).to(0.5, {scale:1}, {easing:"backOut"}).start();

                await cc.vv.gameData.awaitTime(0.5);

                let self = this;
                let clickFunc = async()=>{
                    Global.SlotsSoundMgr.playEffect("click");
                    btn_start.getComponent(cc.Button).interactable = false;
                    // Global.SlotsSoundMgr.playEffect("popup_out");
                    cc.tween(btn_start).to(0.5, {scale:0}, {easing:"backIn"}).start();
                    spine_bg.getComponent(sp.Skeleton).setAnimation(0,  cc.js.formatStr("animation%s_3",sp_type), false);
                    await cc.vv.gameData.awaitTime(0.3);
                    cc.tween(lbl_cnt).to(0.5, {scale:0}, {easing:"backIn"}).start();
                    if(spr_power.active){
                        cc.tween(spr_power).to(0.5, {scale:0}, {easing:"backIn"}).start();
                    }

                    await cc.vv.gameData.awaitTime(0.5);
                    self._node_popup.active = false;
                    self._node_tri_free.active = false;

                    success();
                };
                cc.vv.gameData.checkAutoPlay(btn_start, clickFunc);
                btn_start.off("click");
                btn_start.getComponent(cc.Button).interactable = true;
                btn_start.on("click", async()=>{
                    btn_start.stopAllActions();
                    clickFunc();
                })
            }
        })
    },

    // 免费删除图标
    playDelSymFree(idxs, powerCnt){
        return new Promise(async (success, failed) => {
            // Global.SlotsSoundMgr.playEffect("");

            this._node_popup.active = true;
            this._node_del_free.active = true;

            let spine_bg = cc.find("spine_bg", this._node_del_free);
            let node_sym = cc.find("node_syms", this._node_del_free);
            let spine_bz = cc.find("node_syms/spine_bz", this._node_del_free);
            let spine_lbl = cc.find("spine_lbl", this._node_del_free);
            let spr_power = cc.find("spr_powerUp", this._node_del_free);
            let spr_add = cc.find("spr_add", spr_power);
            let par = cc.find("par", this._node_del_free);

            spine_lbl.active = false;
            spr_power.active = powerCnt > 0;

            let atlas_base = cc.vv.gameData.GetAtlasByName("baseImg");
            if( powerCnt > 0){
                spr_add.getComponent(cc.Sprite).spriteFrame = atlas_base.getSpriteFrame("dialog_"+powerCnt);
                spr_power.setScale(0);
                cc.tween(spr_power).to(0.3, {scale:1}, {easing:"backOut"}).start();
            }
            par.active = false;

            spine_bg.getComponent(sp.Skeleton).setAnimation(0, "animation1", false);
            spine_bg.getComponent(sp.Skeleton).addAnimation(0, "animation2", true);

            node_sym.active = true;
            node_sym.setScale(1);
            for (let i = 1; i <= 12; i++){
                let item = cc.find("item_"+i, node_sym);
                item.active = true;
                item.setScale(1);
                item.getComponent(sp.Skeleton).setAnimation(0, "animation"+i, false);
                item.getComponent(sp.Skeleton).addAnimation(0, "animation"+i+"_1", false);
            }

            await cc.vv.gameData.awaitTime(1);

            idxs.sort((a,b)=>{return b - a});
            let cfg = cc.vv.gameData.getGameCfg()
            for (let i = 0; i < 6; i++){    // 前几个默认的
                Global.SlotsSoundMgr.playEffect("symbol_remove");

                let id = cfg.symbol[idxs[i]].del_id;
                let item = cc.find("item_"+id, node_sym);

                spine_bz.active = true;
                spine_bz.position = item.position;

                spine_bz.getComponent(sp.Skeleton).setAnimation(0, "animation", false);

                await cc.vv.gameData.awaitTime(0.3);
                cc.tween(item).to(0.3, {scale:0}).start()

                await cc.vv.gameData.awaitTime(0.8);
            }

            Global.SlotsSoundMgr.playEffect("power_appear");
            spine_lbl.active = true;
            spine_lbl.getComponent(sp.Skeleton).setAnimation(0, "animation7", false);
            spine_lbl.getComponent(sp.Skeleton).addAnimation(0, "animation8", false);
            await cc.vv.gameData.awaitTime(1.2);

            if(powerCnt > 0){
                await cc.vv.gameData.awaitTime(2);

                Global.SlotsSoundMgr.playEffect("power_appear");
                spine_lbl.getComponent(sp.Skeleton).setAnimation(0, "animation3", false);
                spine_lbl.getComponent(sp.Skeleton).addAnimation(0, "animation4", false);

                await cc.vv.gameData.awaitTime(2);

                for (let i = 6; i < idxs.length; i++){
                    Global.SlotsSoundMgr.playEffect("power_shoot");

                    let id = cfg.symbol[idxs[i]].del_id;
                    let item = cc.find("item_"+id, node_sym);
                    spine_bz.active = true;
                    spine_bz.position = item.position;

                    let startPos = this._node_del_free.convertToNodeSpaceAR(spr_add.convertToWorldSpaceAR(cc.v2(0,0)));
                    let endPos = this._node_del_free.convertToNodeSpaceAR(item.convertToWorldSpaceAR(cc.v2(0,0)));

                    par.active = true;
                    par.getComponent(cc.ParticleSystem).resetSystem();
                    par.position = startPos;
                    cc.tween(par).to(0.3, {position:endPos}).start();
                    await cc.vv.gameData.awaitTime(0.3);

                    spine_bz.getComponent(sp.Skeleton).setAnimation(0, "animation2", false);

                    powerCnt -= 1;
                    if(powerCnt > 0){
                        spr_add.getComponent(cc.Sprite).spriteFrame = atlas_base.getSpriteFrame("theme227_dialog_"+powerCnt);
                    }

                    await cc.vv.gameData.awaitTime(0.5);
                    cc.tween(item).to(0.3, {scale:0}).start();
                }
                await cc.vv.gameData.awaitTime(0.3);

                spine_lbl.getComponent(sp.Skeleton).setAnimation(0, "animation6", false);

                if(spr_power.active){
                    cc.tween(spr_power).to(0.3, {scale:0}, {easing:"backIn"}).start();
                }

                await cc.vv.gameData.awaitTime(1);
            }

            cc.tween(node_sym).to(0.3, {scale:0}, {easing:"backIn"}).start();
            spine_bg.getComponent(sp.Skeleton).setAnimation(0, "animation5", false);

            await cc.vv.gameData.awaitTime(1);
            this._node_del_free.active = false;
            this._node_popup.active = false;
            success();
        })
    },

    // 结束免费
    playEndFreeAnim(wincoin) {
        return new Promise(async (success, failed) => {
            let sp_type = 2;
            let effect = "fg_collect";
            if(cc.vv.gameData.isSuperGame()){
                sp_type = 5;
                effect = "sb_collect"
            }
            Global.SlotsSoundMgr.playEffect(effect);

            this._node_popup.active = true;
            this._node_end_free.active = true;

            let spine_bg = cc.find("spine_bg", this._node_end_free);
            let lbl_cnt = cc.find("lbl_cnt", this._node_end_free);
            let btn_collect = cc.find("btn_collect", this._node_end_free);

            lbl_cnt.active = false;
            btn_collect.active = false;

            spine_bg.getComponent(sp.Skeleton).setAnimation(0, cc.js.formatStr("animation%s_1",sp_type), false);
            spine_bg.getComponent(sp.Skeleton).addAnimation(0, cc.js.formatStr("animation%s_2",sp_type), true);

            await cc.vv.gameData.awaitTime(0.3);
            lbl_cnt.active = true;
            lbl_cnt.setScale(0);
            Global.doRoallNumEff(lbl_cnt,0,wincoin, 1.5,null,null,2,true);
            cc.tween(lbl_cnt).to(0.5, {scale:1}, {easing:"backOut"}).start();

            await cc.vv.gameData.awaitTime(0.3);
            btn_collect.active = true;
            btn_collect.setScale(0);
            cc.tween(btn_collect).to(0.5, {scale:1}, {easing:"backOut"}).start();

            await cc.vv.gameData.awaitTime(0.5);

            let self = this;
            let clickFunc = async()=>{
                Global.SlotsSoundMgr.playEffect("click");
                btn_collect.getComponent(cc.Button).interactable = false;
                if(Global.FormatCommaNumToNum(lbl_cnt.getComponent(cc.Label).string) != wincoin){
                    lbl_cnt.stopAllActions();
                    lbl_cnt.getComponent(cc.Label).string = Global.FormatNumToComma(wincoin);
                    await cc.vv.gameData.awaitTime(0.2);
                }

                Global.SlotsSoundMgr.playEffect("popup_out");
                cc.tween(btn_collect).to(0.5, {scale:0}, {easing:"backIn"}).start();
                spine_bg.getComponent(sp.Skeleton).setAnimation(0, cc.js.formatStr("animation%s_3",sp_type), false);
                await cc.vv.gameData.awaitTime(0.3);
                cc.tween(lbl_cnt).to(0.5, {scale:0}, {easing:"backIn"}).start();

                await cc.vv.gameData.awaitTime(0.5);
                self._node_popup.active = false;
                self._node_end_free.active = false;
                success();
            };
            cc.vv.gameData.checkAutoPlay(btn_collect, clickFunc);
            btn_collect.off("click");
            btn_collect.getComponent(cc.Button).interactable = true;
            btn_collect.on("click", async()=>{
                btn_collect.stopAllActions();
                clickFunc();
            })
        })
    },

    // 触发pick游戏
    playTriPickAnim(){
        return new Promise(async (success, failed) => {
            Global.SlotsSoundMgr.playEffect("pick_start1");

            this._node_popup.active = true;
            this._node_tri_pick.active = true;

            let self = this;
            let spine = cc.find("spine", this._node_tri_pick);
            spine.getComponent(sp.Skeleton).setAnimation(0, "animation1", false);
            spine.getComponent(sp.Skeleton).setCompleteListener(()=>{
                self._node_popup.active = false;
                self._node_tri_pick.active = false;

                success();
            })
        });
    },

    // 结束pick游戏
    playEndPickAnim(wincoin) {
        return new Promise(async (success, failed) => {
            Global.SlotsSoundMgr.playEffect("pick_collect");

            this._node_popup.active = true;
            this._node_end_pick.active = true;

            let spine_bg = cc.find("spine_bg", this._node_end_pick);
            let lbl_cnt = cc.find("lbl_cnt", this._node_end_pick);
            let btn_collect = cc.find("btn_collect", this._node_end_pick);

            lbl_cnt.active = false;
            btn_collect.active = false;

            spine_bg.getComponent(sp.Skeleton).setAnimation(0, "animation2_1", false);
            spine_bg.getComponent(sp.Skeleton).addAnimation(0, "animation2_2", true);

            await cc.vv.gameData.awaitTime(0.3);
            lbl_cnt.active = true;
            lbl_cnt.setScale(0);
            Global.doRoallNumEff(lbl_cnt,0,wincoin, 1.5,null,null,2,true);
            cc.tween(lbl_cnt).to(0.5, {scale:1}, {easing:"backOut"}).start();

            await cc.vv.gameData.awaitTime(0.3);
            btn_collect.active = true;
            btn_collect.setScale(0);
            cc.tween(btn_collect).to(0.5, {scale:1}, {easing:"backOut"}).start();

            await cc.vv.gameData.awaitTime(0.5);
            let self = this;
            let clickFunc = async()=>{
                Global.SlotsSoundMgr.playEffect("click");
                btn_collect.getComponent(cc.Button).interactable = false;
                if(Global.FormatCommaNumToNum(lbl_cnt.getComponent(cc.Label).string) != wincoin){
                    lbl_cnt.stopAllActions();
                    lbl_cnt.getComponent(cc.Label).string = Global.FormatNumToComma(wincoin);
                    await cc.vv.gameData.awaitTime(0.2);
                }
                Global.SlotsSoundMgr.playEffect("popup_out");
                cc.tween(btn_collect).to(0.5, {scale:0}, {easing:"backIn"}).start();
                spine_bg.getComponent(sp.Skeleton).setAnimation(0, "animation2_3", false);
                await cc.vv.gameData.awaitTime(0.3);
                cc.tween(lbl_cnt).to(0.5, {scale:0}, {easing:"backIn"}).start();

                await cc.vv.gameData.awaitTime(0.5);
                self._node_popup.active = false;
                self._node_end_pick.active = false;
                success();
            };
            cc.vv.gameData.checkAutoPlay(btn_collect, clickFunc);
            btn_collect.off("click");
            btn_collect.getComponent(cc.Button).interactable = true;
            btn_collect.on("click", async()=>{
                btn_collect.stopAllActions();
                clickFunc();
            })
        })
    },

    // 结束pick游戏--解锁了奖池
    playEndPickJpAnim(wincoin, jpType) {
        return new Promise(async (success, failed) => {
            let effList = ["dialog_mini","dialog_minor","dialog_major","dialog_maxi","dialog_grand"];
            Global.SlotsSoundMgr.playEffect(effList[jpType-1]);

            this._node_popup.active = true;
            this._node_end_pick_jp.active = true;

            let spine_bg = cc.find("spine_bg", this._node_end_pick_jp);
            let lbl_cnt = cc.find("lbl_cnt", this._node_end_pick_jp);
            let btn_collect = cc.find("btn_collect", this._node_end_pick_jp);

            lbl_cnt.active = false;
            btn_collect.active = false;

            spine_bg.getComponent(sp.Skeleton).setAnimation(0, cc.js.formatStr("animation%s_1", 6-jpType), false);
            spine_bg.getComponent(sp.Skeleton).addAnimation(0, cc.js.formatStr("animation%s_2", 6-jpType), true);

            await cc.vv.gameData.awaitTime(0.3);
            lbl_cnt.active = true;
            lbl_cnt.setScale(0);
            Global.doRoallNumEff(lbl_cnt,0,wincoin, 1.5,null,null,2,true);
            cc.tween(lbl_cnt).to(0.5, {scale:1}, {easing:"backOut"}).start();

            await cc.vv.gameData.awaitTime(0.3);
            btn_collect.active = true;
            btn_collect.setScale(0);
            cc.tween(btn_collect).to(0.5, {scale:1}, {easing:"backOut"}).start();

            await cc.vv.gameData.awaitTime(0.5);
            let self = this;
            let clickFunc = async()=>{
                Global.SlotsSoundMgr.playEffect("click");
                btn_collect.getComponent(cc.Button).interactable = false;
                if(Global.FormatCommaNumToNum(lbl_cnt.getComponent(cc.Label).string) != wincoin){
                    lbl_cnt.stopAllActions();
                    lbl_cnt.getComponent(cc.Label).string = Global.FormatNumToComma(wincoin);
                    await cc.vv.gameData.awaitTime(0.2);
                }
                Global.SlotsSoundMgr.playEffect("popup_out");
                cc.tween(btn_collect).to(0.5, {scale:0}, {easing:"backIn"}).start();
                spine_bg.getComponent(sp.Skeleton).setAnimation(0, cc.js.formatStr("animation%s_3", 6-jpType), false);
                await cc.vv.gameData.awaitTime(0.3);
                cc.tween(lbl_cnt).to(0.5, {scale:0}, {easing:"backIn"}).start();

                await cc.vv.gameData.awaitTime(0.5);
                self._node_popup.active = false;
                self._node_end_pick_jp.active = false;
                success();
            };
            cc.vv.gameData.checkAutoPlay(btn_collect, clickFunc);
            btn_collect.off("click");
            btn_collect.getComponent(cc.Button).interactable = true;
            btn_collect.on("click", async()=>{
                btn_collect.stopAllActions();
                clickFunc();
            })
        })
    },

    // 触发pick游戏是获得power up
    playPowerUpAnim(cnt){
        return new Promise(async (success, failed) => {
            this._node_popup.active = true;
            this._node_power_up.active = true;

            let self = this;
            let spine_bg = cc.find("spine_bg", this._node_power_up);
            spine_bg.getComponent(sp.Skeleton).setAnimation(0, "animation"+cnt, false);
            spine_bg.getComponent(sp.Skeleton).setCompleteListener(()=>{
                self._node_power_up.active = false;
                self._node_popup.active = false;

                success();
            })

            await cc.vv.gameData.awaitTime(0.5);
            Global.SlotsSoundMgr.playEffect("popup_out");
        });
    },



    // 金字塔
    playQPJzt(){
        Global.SlotsSoundMgr.playEffect("transition1");

        let self = this;
        this._node_qp.active = true;
        this._qp_jzt.active = true;
        this._qp_jzt.getComponent(sp.Skeleton).setAnimation(0,"animation", false);
        this._qp_jzt.getComponent(sp.Skeleton).setCompleteListener(()=>{
            self._qp_jzt.active = false;
            self._node_qp.active = false;
        })
    },

    // 门
    playQPMen(){
        Global.SlotsSoundMgr.playEffect("transition2");

        let self = this;
        this._node_qp.active = true;
        this._qp_men.active = true;
        this._qp_men.getComponent(sp.Skeleton).setAnimation(0,"animation", false);
        this._qp_men.getComponent(sp.Skeleton).setCompleteListener(()=>{
            self._qp_men.active = false;
            self._node_qp.active = false;
        })
    },

    // 法老
    // playQPFalao(){
    //     Global.SlotsSoundMgr.playEffect("transition3");
    //
    //     let self = this;
    //     this._node_qp.active = true;
    //     this._qp_falao.active = true;
    //     this._qp_falao.getComponent(sp.Skeleton).setAnimation(0,"animation1", false);
    //     this._qp_falao.getComponent(sp.Skeleton).setCompleteListener(()=>{
    //         self._qp_falao.active = false;
    //         self._node_qp.active = false;
    //     })
    // },

    // update (dt) {},
});
