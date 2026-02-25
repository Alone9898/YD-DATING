
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

        this._node_extra_bonus = cc.find("node_extra_bonus", this._node_popup);
        this._node_add = cc.find("node_add", this._node_popup);
        this._node_tri_bonus = cc.find("node_tri_bonus", this._node_popup);
        this._node_end_bonus = cc.find("node_end_bonus", this._node_popup);
        this._node_tri_free = cc.find("node_tri_free", this._node_popup);
        this._node_end_free = cc.find("node_end_free", this._node_popup);
        this._node_extra_bonus.active = false;
        this._node_add.active = false;
        this._node_tri_bonus.active = false;
        this._node_end_bonus.active = false;
        this._node_tri_free.active = false;
        this._node_end_free.active = false;

        this._node_qp = cc.find("safe_node/node_qp", this.node);
        this._node_qp.active = false;

    },

    playTriBonus(cnt){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("music_MagicLady_respinStartLayer");

            this._node_popup.active = true;
            this._node_tri_bonus.active = true;

            let mask = cc.find("mask", this._node_tri_bonus);
            mask.getComponent(cc.Mask).enabled = true;

            let bg = cc.find("mask/bg", this._node_tri_bonus);
            let par = cc.find("mask/par", this._node_tri_bonus);
            let tit = cc.find("mask/tit", this._node_tri_bonus);
            cc.find("lbl", tit).getComponent(cc.Label).string = cnt;
            let par_lbl = cc.find("par_lbl", tit);
            let btn = cc.find("mask/btn", this._node_tri_bonus);
            tit.active = false;
            btn.active = false;
            let s_pos = cc.find("mask/s_pos", this._node_tri_bonus);
            let spr1 = cc.find("mask/spr1", this._node_tri_bonus);
            let kuang1 = cc.find("kuang", spr1);
            let spr2 = cc.find("mask/spr2", this._node_tri_bonus);
            let kuang2 = cc.find("kuang", spr2);
            let spr3 = cc.find("mask/spr3", this._node_tri_bonus);
            let kuang3 = cc.find("kuang", spr3);
            let line1 = cc.find("mask/line1", this._node_tri_bonus);
            let line2 = cc.find("mask/line2", this._node_tri_bonus);

            par.getComponent(cc.ParticleSystem).resetSystem();
            bg.opacity = 0;
            cc.tween(bg).to(0.5, {opacity:255}).start();

            spr1.y = s_pos.y;
            spr2.y = s_pos.y;
            spr3.y = s_pos.y;
            line1.y = s_pos.y;
            line2.y = s_pos.y;

            await cc.vv.gameData.awaitTime(0.5);
            cc.tween(spr1)
                .to(0.5, {position:cc.v2(spr1.x,0)})
                .call(()=>{
                    kuang1.opacity = 0;
                    cc.tween(kuang1)
                        .to(0.2,{opacity:255})
                        .delay(0.5)
                        .to(0.2,{opacity:0})
                        .start();
                })
                .start();
            cc.tween(line1).delay(0.2).to(0.5, {position:cc.v2(line1.x,0)}).start();
            cc.tween(spr2).delay(0.4).to(0.5, {position:cc.v2(spr2.x,0)})
                .call(()=>{
                    kuang2.opacity = 0;
                    cc.tween(kuang2)
                        .to(0.2,{opacity:255})
                        .delay(0.5)
                        .to(0.2,{opacity:0})
                        .start();
                })
                .start();
            cc.tween(line2).delay(0.6).to(0.5, {position:cc.v2(line2.x,0)}).start();
            cc.tween(spr3).delay(0.8).to(0.5, {position:cc.v2(spr3.x,0)})
                .call(()=>{
                    kuang3.opacity = 0;
                    cc.tween(kuang3)
                        .to(0.2,{opacity:255})
                        .delay(0.5)
                        .to(0.2,{opacity:0})
                        .start();
                })
                .start();

            await cc.vv.gameData.awaitTime(1.2);
            tit.active = true;
            tit.opacity = 0;
            cc.tween(tit).to(0.5, {opacity:255}).start();
            par_lbl.getComponent(cc.ParticleSystem).resetSystem();
            await cc.vv.gameData.awaitTime(0.2);
            btn.active = true;
            btn.getComponent(cc.Button).interactable = true;
            btn.off("click");
            btn.opacity = 0;
            cc.tween(btn).to(0.5, {opacity:255}).start();

            await cc.vv.gameData.awaitTime(0.5); 
            bg.getComponent(cc.Animation).play("tc_saoguang");

            let self = this;
            let clickFunc = async()=> {
                btn.getComponent(cc.Button).interactable = false;
                mask.getComponent(cc.Mask).enabled = false;

                mask.children.forEach(node=>{
                    let s_scale = node.scale;
                    cc.tween(node)
                        .to(0.7, {scale:s_scale-0.2}, {easing:"backIn"})
                        .call(()=>{
                            node.setScale(s_scale)
                        })
                        .start()
                })

                await cc.vv.gameData.awaitTime(0.7);

                self._node_popup.active = false;
                self._node_tri_bonus.active = false;

                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.on("click", async()=> {
                btn.stopAllActions()
                clickFunc();
            });
        })
    },

    // bonus游戏额外次数
    bonusExtraSpins(toPos){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("music_MagicLady_chooseLayer_start");

            this._node_popup.active = true;
            // cc.find("mask", this._node_popup).active = false;
            this._node_extra_bonus.active = true;

            let par = cc.find("par", this._node_extra_bonus);
            let tit1 = cc.find("tit/tit1", this._node_extra_bonus);
            let tit2 = cc.find("tit/tit2", this._node_extra_bonus);
            let tit3 = cc.find("tit/tit3", this._node_extra_bonus);
            par.active = false;
            tit1.active = true;
            tit2.active = true;
            tit3.active = false;

            this._node_extra_bonus.setScale(0);
            tit1.setScale(0);
            tit2.setScale(0);
            cc.tween(this._node_extra_bonus).to(0.3,{scale:1},{easing:"backOut"}).start();
            cc.tween(tit1).to(0.5,{scale:1},{easing:"backOut"}).start();
            cc.tween(tit2).to(0.7,{scale:1},{easing:"backOut"}).start();

            let canClick = true;
            let itemList = [];
            for (let i = 1; i <= 3; i++){
                let item =  cc.find("item"+i, this._node_extra_bonus);
                itemList.push(item);
                cc.find("gray", item).active = false;
                cc.find("light", item).active = false;

                item.getComponent(cc.Button).interactable = true;
                item.off("click");
                let self = this;
                item.on("click", ()=>{
                    clickFunc(i)
                });
            }
            cc.vv.gameData.checkAutoPlay(cc.find("item1", this._node_extra_bonus), function (){clickFunc(1)});

            let self = this;
            let clickFunc = async function (idx) {
                if(!canClick){
                    return;
                }
                canClick = false;
                cc.find("item1", self._node_extra_bonus).stopAllActions();
                let reqdata = {rtype:1, choiceId:idx};
                let msg = await cc.vv.gameData.getManageScript().reqSubGame(reqdata);
                if(msg && msg.code === 200){
                    Global.SlotsSoundMgr.playEffect("music_MagicLady_chooseLayer_click");

                    let extraSpins = msg.data.extraSpins;
                    let bonusGame = msg.data.bonusGame;
                    cc.vv.gameData.setBonusGame(bonusGame);

                    par.active = true;
                    par.getComponent(cc.ParticleSystem).resetSystem();

                    tit3.active = true;
                    tit3.setScale(0);
                    cc.tween(tit1).to(0.5,{scale:0},{easing:"backIn"}).start();
                    cc.tween(tit2).to(0.5,{scale:0},{easing:"backIn"}).start();
                    cc.tween(tit3).to(0.5,{scale:1},{easing:"backOut"}).start();

                    for (let i = 0; i < itemList.length; i++){
                        let showNode = cc.find((i+1==idx)?"light":"gray", itemList[i]);

                        cc.find("cnt", showNode).getComponent("ImgSwitchCmp").setIndex(extraSpins[i]-1);
                        cc.find("text", showNode).getComponent("ImgSwitchCmp").setIndex((extraSpins[i]>1)?1:0);

                        showNode.active = true;
                        if (i+1==idx){
                            showNode.setScale(0);
                            cc.tween(showNode).to(0.3, {scale:1}).start();
                        } else {
                            showNode.opacity = 0;
                            cc.tween(showNode).delay(0.3).to(0.3, {opacity:255}).start();
                        }
                    }

                    await cc.vv.gameData.awaitTime(0.7);

                    self._node_add.active = true;
                    let from = self._node_add.parent.convertToNodeSpaceAR(itemList[idx-1].convertToWorldSpaceAR(cc.v2(0,0)));
                    let to = self._node_add.parent.convertToNodeSpaceAR(toPos);
                    let v = cc.v2(to.x, to.y).sub(cc.v2(from.x, from.y));
                    let length = v.mag();
                    let angle = v.signAngle(cc.v2(1, 0));

                    self._node_add.position = from;
                    self._node_add.angle = -angle * cc.macro.DEG + 90;
                    self._node_add.scale = length / self._node_add.height;

                    self._node_add.getComponent(cc.Animation).play("addSpin");

                    await cc.vv.gameData.awaitTime(0.5);

                    success();

                    Global.SlotsSoundMgr.playEffect("music_MagicLady_chooseLayer_over");
                    cc.tween(self._node_extra_bonus).to(1, {scale:0}, {easing:"backIn"}).start()
                    await cc.vv.gameData.awaitTime(1);

                    self._node_popup.active = false;
                    // cc.find("mask", self._node_popup).active = true;
                    self._node_extra_bonus.active = false;
                }
            }
        });
    },

    playWinBonus(wincoin){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("music_MagicLady_respinOverLayer");
            this._node_popup.active = true;
            this._node_end_bonus.active = true;

            cc.find("kuang/lbl", this._node_end_bonus).getComponent(cc.Label).string =  Global.FormatNumToComma(wincoin);

            let btn = cc.find("btn", this._node_end_bonus);
            btn.getComponent(cc.Button).interactable = true;
            btn.off("click");

            let nodeCnt = this._node_end_bonus.childrenCount;
            for (let i = 0; i < nodeCnt; i++){
                let node = this._node_end_bonus.children[i];
                let s_scale = node.scale;
                node.opacity = 0;
                node.setScale(0);
                cc.tween(node).to(0.5+i*0.1, {scale:s_scale,opacity:255}, {easing:"backOut"}).start()
            }

            await cc.vv.gameData.awaitTime(0.5+nodeCnt*0.1);

            let self = this;
            let clickFunc = async()=> {
                btn.getComponent(cc.Button).interactable = false;
                for (let i = 0; i < nodeCnt; i++){
                    let node = this._node_end_bonus.children[i];
                    let s_scale = node.scale;
                    cc.tween(node)
                        .to(0.5+(nodeCnt-i-1)*0.1, {scale:0,opacity:0}, {easing:"backIn"})
                        .call(()=>{node.setScale(s_scale)})
                        .start()
                }

                await cc.vv.gameData.awaitTime(0.5+nodeCnt*0.1);
                self._node_popup.active = false;
                self._node_end_bonus.active = false;

                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.on("click", async()=> {
                btn.stopAllActions();
                clickFunc();
            });
        });
    },

    playTriFreeAnim(){
        return new Promise(async (success, failed)=> {
            this._node_popup.active = true;
            this._node_tri_free.active = true;

            let btn = cc.find("btn", this._node_tri_free);
            btn.getComponent(cc.Button).interactable = true;
            btn.off("click");

            let nodeCnt = this._node_tri_free.childrenCount;
            for (let i = 0; i < nodeCnt; i++){
                let node = this._node_tri_free.children[i];
                let s_scale = node.scale;
                node.opacity = 0;
                node.setScale(0);
                cc.tween(node).to(0.5+i*0.1, {scale:s_scale,opacity:255}, {easing:"backOut"}).start()
            }
            await cc.vv.gameData.awaitTime(0.5+nodeCnt*0.1);

            let self = this;
            let clickFunc = async()=> {
                btn.getComponent(cc.Button).interactable = false;
                for (let i = 0; i < nodeCnt; i++){
                    let node = this._node_tri_free.children[i];
                    let s_scale = node.scale;
                    cc.tween(node)
                        .to(0.5+(nodeCnt-i-1)*0.1, {scale:0,opacity:0}, {easing:"backIn"})
                        .call(()=>{node.setScale(s_scale)})
                        .start()
                }

                await cc.vv.gameData.awaitTime(0.5+nodeCnt*0.1);
                self._node_popup.active = false;
                self._node_tri_free.active = false;

                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.on("click", async()=> {
                btn.stopAllActions();
                clickFunc();
            });
        })
    },

    // 结束免费
    playWinFreeAnim(wincoin, freeCnt){
        return new Promise(async (success, failed)=> {
            Global.SlotsSoundMgr.playEffect("music_MagicLady_FreespinOverView");

            this._node_popup.active = true;
            this._node_end_free.active = true;

            cc.find("kuang/lbl", this._node_end_free).getComponent(cc.Label).string =  Global.FormatNumToComma(wincoin);
            cc.find("spr2/cnt", this._node_end_free).getComponent(cc.Label).string = freeCnt;

            let btn = cc.find("btn", this._node_end_free);
            btn.getComponent(cc.Button).interactable = true;
            btn.off("click");

            let nodeCnt = this._node_end_free.childrenCount;
            for (let i = 0; i < nodeCnt; i++){
                let node = this._node_end_free.children[i];
                let s_scale = node.scale;
                node.opacity = 0;
                node.setScale(0);
                cc.tween(node).to(0.5+i*0.1, {scale:s_scale,opacity:255}, {easing:"backOut"}).start()
            }

            await cc.vv.gameData.awaitTime(0.5+nodeCnt*0.1);

            let self = this;
            let clickFunc = async()=> {
                btn.getComponent(cc.Button).interactable = false;
                for (let i = 0; i < nodeCnt; i++){
                    let node = this._node_end_free.children[i];
                    let s_scale = node.scale;
                    cc.tween(node)
                        .to(0.5+(nodeCnt-i-1)*0.1, {scale:0,opacity:0}, {easing:"backIn"})
                        .call(()=>{node.setScale(s_scale)})
                        .start()
                }

                await cc.vv.gameData.awaitTime(0.5+nodeCnt*0.1);
                self._node_popup.active = false;
                self._node_end_free.active = false;

                success();
            };
            cc.vv.gameData.checkAutoPlay(btn, clickFunc);
            btn.on("click", async()=> {
                btn.stopAllActions();
                clickFunc();
            });
        });
    },

    playQPAnim(){
        Global.SlotsSoundMgr.playEffect("music_MagicLady_changeToNormalEffect");
        this._node_qp.active = true;
        let qpSp = cc.find("spine",this._node_qp).getComponent(sp.Skeleton);
        qpSp.timeScale = 0.6;
        qpSp.setAnimation(0, "animation2", false);
        qpSp.setCompleteListener(()=>{
            this._node_qp.active = false;
        })
    },

    // update (dt) {},
});
