/**
 * 能量触发的免费游戏
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _isEnable:false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._mid_ani = cc.find('Canvas/safe_node/mid_ani');
        this._spine_genie = cc.find("spine_genie", this._mid_ani);
        this._spine_cloud = cc.find("spine_cloud", this._mid_ani);
        this._lbl_mult = cc.find("lbl_mult", this._mid_ani);

        this._soundCfg = cc.vv.gameData.getGameCfg().soundCfg;
    },

    //进入能量免费游戏
    async enterFreeGame () {
        this._isEnable = true;

        //显示免费UI
        this._setFreeUIVisible(true);
        //显示开始UI
        await this._showStartUI();

        //请求开始游戏
        let resp = await cc.vv.gameData.reqSubGame(2); //大关免费
        if (resp.code == 200) {
            Global.SlotsSoundMgr.playBgm(this._soundCfg.free_bgm);

            //设置10次免费游戏
            cc.vv.gameData.SetTotalFree(10);
            cc.vv.gameData.SetFreeTime(10);

            //切屏
            // await this._switchScreen();
            cc.vv.gameData.GetBottomScript().CanDoNextRound();
        }
    },

    reconnect () {
        //显示免费UI
        if (cc.vv.gameData.GetFreeTime() > 0) {
            this._setFreeUIVisible(true);
            this._isEnable = true;
        }
    },

    //退出能量免费游戏
    async exitFreeGame () {
        await this._showResultUI();

        this._isEnable = false;
        //隐藏免费UI
        this.scheduleOnce(()=>{
            this._setFreeUIVisible(false);

            let collectData = cc.vv.gameData.getCollectData();
            collectData.num = 0; //清空进度条
            Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_REFUSH_ENERGY);

            Global.SlotsSoundMgr.stopBgm();
        }, 0.5);

        //切屏
        this.setCharacterVisible(false);
        this._switchScreen();
        await cc.vv.gameData.awaitTime(1.5);
        this.setCharacterVisible(true)
    },

    //是否开启
    isEnable () {
      return this._isEnable;
    },

    //开始滚动
    async onStartMove () {
        if (!this._isEnable) return;

        this._lbl_mult.active = false;
        // if (this._spine_genie.getComponent(sp.Skeleton).animation != "animation4") {
        //     Global.SlotsSoundMgr.playEffect(this._soundCfg.reel_hide);
        //     //精灵-出
        //     this.playSpine(this._spine_genie, "animation2", false , ()=>{
        //         this.playSpine(this._spine_genie, "animation4"); //精灵-空
        //     });
        // }
        //
        // if (this._spine_cloud.getComponent(sp.Skeleton).animation != "animation2") {
        //     //云-入
        //     this.playSpine(this._spine_cloud, "animation2", false, ()=>{
        //         // this.playSpine(this._spine_cloud, "animation4"); //云-静止
        //     });
        // }
    },

    //停止滚动
    async onEndMove () {
        if (!this._isEnable) return;

        if (this._spine_cloud.getComponent(sp.Skeleton).animation == "animation4") {
            //云-出
            this.playSpine(this._spine_cloud, "animation1", false, ()=>{
                this.playSpine(this._spine_cloud, "animation3"); //云-空
            });

            Global.SlotsSoundMgr.playEffect(this._soundCfg.reel_appear);
            await this.playSpine(this._spine_genie, "animation1"); //精灵-入
        }

        //设置倍数
        let collectData = cc.vv.gameData.getCollectData()
        this._lbl_mult.active = true;
        this._lbl_mult.getComponent(cc.Label).string =  collectData.mult + "X";
        /*await*/ this.playSpine(this._spine_genie, "animation"); //精灵-正常动作
    },

    //是否结束
    isFinish () {
        let collect = cc.vv.gameData.getGameInfo().collect; //通过collect，判断是大关免费游戏，还是普通免费游戏
        if(collect && collect.open == 2 && cc.vv.gameData.isFinishFreeTime()){
           return true;
        }
        return false;
    },

    //显示/隐藏 免费UI
    _setFreeUIVisible (isVisible) {
        // Global.playFGMusic(isVisible?this._soundCfg.free_bgm:this._soundCfg.base_bgm);

        cc.vv.gameData.GetSlotsScript()._bottomScript.ShowFreeModel(isVisible, 10, 10);

        //隐藏/显示能量收集
        cc.find("Canvas/safe_node/slots/node_energy").active = !isVisible;

        //隐藏/显示背景轮盘
        cc.find("Canvas/safe_node/gameWheel").active = !isVisible;
        cc.vv.gameData.setClientOpenCollectEnergy(!isVisible);

        //隐藏/显示Wild收集
        cc.find("Canvas/safe_node/slots/spine_collect_wild").active = !isVisible;
        cc.vv.gameData.setClientOpenCollectWild(!isVisible);

        //切换免费背景
        cc.find("Canvas/safe_node/spr_bg_normal").active = !isVisible;
        cc.find("Canvas/safe_node/spr_bg_free_map").active = isVisible;


        //隐藏、显示免费spineLogo
        // cc.find("Canvas/safe_node/spine_freelogo").active = isVisible;

        //底部押注数据隐藏
        cc.find("totalBetBg", cc.vv.gameData.GetSlotsScript()._bottomScript.node).active = !isVisible;

        //中间列
        if (isVisible) {
            this._showSlotMidReel();
        }
        else {
            this._hideSlotMidReel();
        }
    },

    //显示slots中间动画
    _showSlotMidReel () {
        this._mid_ani.active = true;
        this.playSpine(this._spine_genie, "animation4");
        this.playSpine(this._spine_cloud, "animation4");
        this._lbl_mult.active = false;
    },

    //隐藏slots中间动画
    _hideSlotMidReel () {
        this._mid_ani.active = false;
    },

    //显示开始界面
    _showStartUI () {
        this._hideFreeGameUI();

        let grayBg = cc.find("grayBg", this.node);
        grayBg.active = true;

        let spineBg = cc.find("spine_bg", this.node);
        spineBg.active = true;

        let btnstart = cc.find('btn_start', this.node);
        btnstart.active = true;

        let lbl_mult1 = cc.find('lbl_mult1', this.node);
        lbl_mult1.active = true;
        lbl_mult1.getComponent(cc.Label).string = "";

        let lbl_mult2 = cc.find('lbl_mult2', this.node);
        lbl_mult2.active = true;
        lbl_mult2.getComponent(cc.Label).string = "";

        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect(this._soundCfg.map_popclose);

            btnstart.getComponent(cc.Button).enabled = false;

            let cfg = {"3":[2,5],"7":[2,10],"12":[3,25],"19":[5,100]};
            let engData = cc.vv.gameData.getCollectData();
            if (engData && engData.idx) {
                lbl_mult1.getComponent(cc.Label).string = cfg[engData.idx][0] + "X";
                lbl_mult2.getComponent(cc.Label).string = cfg[engData.idx][1] + "X";
            }

            //开始界面-弹出
            cc.tween(btnstart).to(0.3, {scale:1.3}).to(0.2, {scale:1}).start();
            await this.playSpine(spineBg, "animation1");

            btnstart.getComponent(cc.Button).enabled = true;

            //开始界面-静态
            this.playSpine(spineBg, "animation1_1", true);
            if (cc.vv.gameData.isNeedAutoPlay()) {
                btnstart.stopAllActions();
                cc.tween(btnstart)
                    .delay(cc.vv.gameData.getAutoPlayTime())
                    .call(async ()=>{
                        btnstart.getComponent(cc.Button).enabled = false;
                        Global.SlotsSoundMgr.playEffect(this._soundCfg.fg_popclose);
                        await this.playSpine(spineBg, "animation1_2");
                        spineBg.active = false;
                        //注销点击
                        btnstart.off('click');
                        btnstart.active = false;

                        grayBg.active = false;
                        lbl_mult1.active = false;
                        lbl_mult2.active = false;

                        success();  //下一步
                    })
                    .to(0.3, {scale:1.3})
                    .to(0.2, {scale:0})
                    .start();
            }

            Global.btnClickEvent(btnstart, async ()=>{
                btnstart.stopAllActions();
                btnstart.getComponent(cc.Button).enabled = false;
                Global.SlotsSoundMgr.playEffect(this._soundCfg.click);

                //开始界面-退出
                cc.tween(btnstart).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();

                Global.SlotsSoundMgr.playEffect(this._soundCfg.fg_popclose);
                await this.playSpine(spineBg, "animation1_2");
                spineBg.active = false;
                //注销点击
                btnstart.off('click');
                btnstart.active = false;

                grayBg.active = false;
                lbl_mult1.active = false;
                lbl_mult2.active = false;

                success();  //下一步
            },this)

        });
    },

    //显示结算界面
    async _showResultUI () {
        this._hideFreeGameUI();

        let grayBg = cc.find("grayBg", this.node);
        grayBg.active = true;

        let spineBg = cc.find("spine_bg", this.node);
        spineBg.active = true;

        let btncollect = cc.find('btn_collect',this.node)
        btncollect.active = true;
        btncollect.getComponent(cc.Button).enabled = false;

        let lblWinCoin = cc.find("lblWinCoin", this.node);
        lblWinCoin.active = true;
        lblWinCoin.getComponent(cc.Label).string = "";

        let self = this;
        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect(this._soundCfg.map_popup);
            //开始界面-弹出
            cc.tween(btncollect).to(0.3, {scale:1.3}).to(0.2, {scale:1}).start();
            this.playSpine(spineBg, "animation2",false, function () {
                //开始界面-静态
                self.playSpine(spineBg, "animation2_1", true);
            });
            await cc.vv.gameData.awaitTime(0.4);

            //赢取金币
            let winCoin = cc.vv.gameData.GetGameTotalFreeWin();
            lblWinCoin.scale = 1.0;
            Global.doRoallNumEff(lblWinCoin, 0, winCoin, 2.0, ()=>{
                btncollect.getComponent(cc.Button).enabled = true;

                // cc.vv.gameData.GetSlotsScript()._bottomScript.SetWin(winCoin);
            }, null, 2, true);

            // //开始界面-静态
            // this.playSpine(spineBg, "animation2_1", true);

            if (cc.vv.gameData.isNeedAutoPlay()) {
                btncollect.stopAllActions();
                cc.tween(btncollect)
                    .delay(cc.vv.gameData.getAutoPlayTime())
                    .call(async ()=>{
                        btncollect.getComponent(cc.Button).enabled = false;
                        lblWinCoin.getComponent(cc.Label).string = Global.FormatNumToComma(Number(winCoin));

                        // cc.vv.gameData.GetSlotsScript()._bottomScript.SetWin(winCoin);

                        //开始界面-退出
                        cc.tween(lblWinCoin).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();

                        // cc.vv.gameData.AddCoin(winCoin);
                        // cc.vv.gameData.GetSlotsScript()._topScript.ShowCoin();

                        Global.SlotsSoundMgr.playEffect(this._soundCfg.fg_popclose);
                        await this.playSpine(spineBg, "animation2_2");
                        spineBg.active = false;
                        //注销点击
                        btncollect.off('click');
                        btncollect.active = false;

                        lblWinCoin.active = false;

                        grayBg.active = false;

                        success();  //下一步
                    })
                    .to(0.3, {scale:1.3})
                    .to(0.2, {scale:0})
                    .start();
            }

            //按钮点击
            Global.btnClickEvent(btncollect, async ()=>{
                btncollect.stopAllActions();
                btncollect.getComponent(cc.Button).enabled = false;
                lblWinCoin.getComponent(cc.Label).string = Global.FormatNumToComma(Number(winCoin));

                cc.vv.gameData.GetSlotsScript()._bottomScript.SetWin(winCoin);

                Global.SlotsSoundMgr.playEffect(this._soundCfg.click);

                //开始界面-退出
                cc.tween(btncollect).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();
                cc.tween(lblWinCoin).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();

                // cc.vv.gameData.AddCoin(winCoin);
                // cc.vv.gameData.GetSlotsScript()._topScript.ShowCoin();

                Global.SlotsSoundMgr.playEffect(this._soundCfg.fg_popclose);
                await this.playSpine(spineBg, "animation2_2");
                spineBg.active = false;
                //注销点击
                btncollect.off('click');
                btncollect.active = false;

                lblWinCoin.active = false;

                grayBg.active = false;

                success();  //下一步
            },this)
        });
    },

    //隐藏UI
    _hideFreeGameUI () {
        for (let subNode of this.node.children) subNode.active = false;
    },


    setCharacterVisible(bVisible){
        let character = cc.find("Canvas/safe_node/character");
        character.active = bVisible;
    },

    //切屏
    async _switchScreen () {
        let spine_transition = cc.find("Canvas/safe_node/spine_transition");
        await this.playSpine(spine_transition, "skill_1");
        spine_transition.active = false;

        Global.SlotsSoundMgr.playEffect(this._soundCfg.transition1);
    },

    //播放Spine
    playSpine (node, animationName="animation", isLoop=false, endCall=null) {
        return new Promise((success)=>{
            if (node) {
                node.active = true;
                node.getComponent(sp.Skeleton).setAnimation(0, animationName, isLoop);
                if (!isLoop) {
                    node.getComponent(sp.Skeleton).setCompleteListener(()=>{
                        if (endCall) endCall();
                        success(); //下一步
                    });
                }
                else {
                    success(); //下一步
                }
            }
            else {
                if (endCall) endCall();
                success(); //下一步
            }
        });
    },

    //播放Actions
    playActions (node, actionsArr) {
        return new Promise((success)=>{
            actionsArr.push(cc.callFunc(()=>{
                success();
            }));

            node.active = true;
            node.runAction(cc.sequence(actionsArr));
        });
    },

    //等待时间
    awaitTime (time) {
        return new Promise((success)=>{
            this.scheduleOnce(()=>{
                success()
            },time);
        });
    },
});
