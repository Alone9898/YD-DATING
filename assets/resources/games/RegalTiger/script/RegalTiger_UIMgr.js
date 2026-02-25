//老虎界面管理

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        this._freeNode = cc.find('node_free',this.node);
        this._bonusNode = cc.find('node_bonus',this.node);      //bonus开始界面
        this._bonusUINode = cc.find('node_bonusUI',this.node);  //bonus游戏界面

        this._freegameSpNode = cc.find('Canvas/safe_node/screenani/freegamestartspine');

        this._btn_start = cc.find('node_bg/free_start/btn_start',this._freeNode)
        Global.btnClickEvent(this._btn_start,this.onNormalFreeStart,this)
        this._btn_start.getComponent(cc.Button).interactable = false;

        this._btn_collect = cc.find('node_bg/free_end/btn_collect',this._freeNode)
        Global.btnClickEvent(this._btn_collect,this.onNormalFreeCollect,this)
        this._btn_collect.getComponent(cc.Button).interactable = false;

        this._btn_engstart = cc.find('node_bg/engfree_start/btn_start',this._freeNode)
        Global.btnClickEvent(this._btn_engstart,this.onEnergyFreeStart,this)
        this._btn_engstart.getComponent(cc.Button).interactable = false;

        this._btn_engcollect = cc.find('node_bg/engfree_end/btn_collect',this._freeNode)
        Global.btnClickEvent(this._btn_engcollect,this.onEnergyFreeCollect,this)
        this._btn_engcollect.getComponent(cc.Button).interactable = false;

        this._btn_presshere = cc.find('bonusrun/btn_start/herestart/clickarea',this._bonusUINode)
        Global.btnClickEvent(this._btn_presshere,this.onBonusStart,this)
        
    },

    //显示普通免费开始界面
    async showNormalFreeUI(){
        return new Promise((success)=>{
            this._normalFreeStart = success;
            cc.find('node_bg/free_end',this._freeNode).active = false;
            let lblnode = cc.find('node_bg/free_start/lbl_freetimes',this._freeNode);
            lblnode.getComponent(cc.Label).string = cc.vv.gameData.getAllFreeTimes();
            Global.SlotsSoundMgr.playEffect('pupup_in1');
            let self = this;
            this.showFreeUI('node_bg/free_start',function(){
                self._btn_start.getComponent(cc.Button).interactable = true;
                cc.vv.gameData.checkAutoPlay(self._btn_start, self.onNormalFreeStart.bind(self));
            });

        })
    },

    //显示普通免费收集界面
    async showNormalCollectUI(){
        return new Promise((success)=>{
            Global.SlotsSoundMgr.playEffect('free_dialog_collect_show');
            this._normalCollect = success;
            let lblnode = cc.find('node_bg/free_end/lbl_win_num',this._freeNode);
            let freecoin = cc.vv.gameData.GetGameTotalFreeWin();
            Global.doRoallNumEff(lblnode,0,freecoin,1.5,null,null,2,true);
            Global.SlotsSoundMgr.playEffect('pupup_in2');
            let self = this;
            this.showFreeUI('node_bg/free_end', function(){
                self._btn_collect.getComponent(cc.Button).interactable = true;
                cc.vv.gameData.checkAutoPlay(self._btn_collect, self.onNormalFreeCollect.bind(self));
            });

        })
    },

    //显示bonus游戏开始界面
    async showEnergyFreeStartUI(){
        let lblnode = cc.find('node_bg/engfree_start/lbl_freetimes',this._freeNode);
        lblnode.getComponent(cc.Label).string = 10;
        this.showFreeUI('node_bg/engfree_start', ()=>{
            this._btn_engstart.getComponent(cc.Button).interactable = true;
            cc.vv.gameData.checkAutoPlay(this._btn_engstart, this.onEnergyFreeStart.bind(this));
        });
        // 设置倍数
        let energyData = cc.vv.gameData.getEnergyData();
        if(energyData) {
            let mulCfg = {
                2:{mul1:"2X", mul2:"5X"},
                7:{mul1:"2X", mul2:"10X"},
                13:{mul1:"3X", mul2:"25X"},
                20:{mul1:"5X", mul2:"100X"},
            }[energyData.map_idx];
            if(mulCfg) {
                let label1 = cc.find('node_bg/engfree_start/spr_wild1/label',this._freeNode);
                label1.getComponent(cc.Label).string = mulCfg.mul1;
                let label2 = cc.find('node_bg/engfree_start/spr_wild2/label',this._freeNode);
                label2.getComponent(cc.Label).string = mulCfg.mul2;
            }
        }
        this.showEnergyFreeUI(10,10);

    },

    //断线重连直接显示地图大关
    showEnergyFreeUI(reset,total){
        this.changeBg(2);
        cc.vv.gameData.GetSlotsScript().openMidAni(true);
        cc.vv.gameData.GetBottomScript().ShowFreeModel(true,total-reset,total);
    },

    //显示地图大关游戏收集界面
    async showEnergyFreeCollectUI(){
        return new Promise((success)=>{
            Global.SlotsSoundMgr.playEffect('free_dialog_collect_show');
            this._engFreeCollect = success;
            let lblnode = cc.find('node_bg/engfree_end/lbl_win_num',this._freeNode);
            let totalcoin = cc.vv.gameData.getBigMapTotalWinCoin();
            Global.doRoallNumEff(lblnode,0,totalcoin,1.5,null,null,2,true);
            let self = this;
            this.showFreeUI('node_bg/engfree_end', function () {
                self._btn_engcollect.getComponent(cc.Button).interactable = true;
                cc.vv.gameData.checkAutoPlay(self._btn_engcollect, self.onEnergyFreeCollect.bind(self));
            });

        })
    },

    //显示bonus游戏开始界面
    async showBonusStartUI(){
        return new Promise((success)=>{
            this._bonusNode.active = true;
            let bgnode = cc.find('bonusstartnode',this._bonusNode);
            bgnode.scale = 0;
            Global.SlotsSoundMgr.playEffect('pupup_in1');
            cc.tween(bgnode).to(0.3,{scale:1},{easing:'backOut'}).start();
            this.scheduleOnce(()=>{
                cc.tween(bgnode).to(0.3,{scale:0},{easing:'backIn'}).call(()=>{
                    this._bonusNode.active = false;
                    success();
                }).start();
            },2);
        })
    },

    //显示bonus界面
    showBonusUI(isshow){
        this._bonusUINode.active = isshow;
        cc.find('node_energy',this.node.parent).active = !isshow;
        cc.find('Canvas/safe_node/tiger').active = !isshow;
        if(isshow){
            let startNode = cc.find('bonusrun/btn_start',this._bonusUINode);
            startNode.active = true;
            cc.find('bonusrun/btn_start/freespinecomplete',this._bonusUINode).active = false;
            this.bonusGameStartUI(true);
            this.changeBg(3);
            this.setBonusTimes(3);
            //开始提示渐变效果
            let herestart = cc.find('herestart',startNode);
            herestart.opacity = 255;
            herestart.stopAllActions();
            herestart.runAction(cc.repeatForever(cc.sequence(cc.fadeTo(1,0),cc.fadeTo(1,255))));

            cc.vv.gameData.checkAutoPlay(this._btn_presshere, this.onBonusStart.bind(this));
        }else{
            this.changeBg(1);
        }
    },

    //断线重连显示bonus游戏界面
    reConnectShowBonusUI(){
        this._bonusUINode.active = true;
        cc.find('node_energy',this.node.parent).active = false;
        cc.find('Canvas/safe_node/tiger').active = false;
        this.changeBg(3);
        this.bonusGameStartUI(false);
        let bonusdata = cc.vv.gameData.GetBonusData();
        cc.vv.gameData.SetRespinTime(bonusdata.num)
        this.setBonusTimes(bonusdata.num);
    },

    //显示bonus游戏收集界面
    showBonusCollectUI(){
        this._bonusUINode.active = false;
    },

    //更新Bonus免费旋转次数
    updateBonusFreeSpinsTimes(){
        let bonusdata = cc.vv.gameData.GetBonusData();
        let num = bonusdata.data.num;
        let total = bonusdata.data.total;

        if(num > 0){
            if(num == 3){
                Global.SlotsSoundMgr.playEffect('bonus_remainingReset');
                let addnumspine = cc.find('bonusrun/btn_start/freespinremaining/addnumspine',this._bonusUINode)
                cc.vv.gameData.playSpine(addnumspine,'animation1',false,null);
            }else{
                Global.SlotsSoundMgr.playEffect('bonus_remaining');
            }
            this.updateSpineTimes();
            cc.find('bonusrun/btn_start',this._bonusUINode).active = true;
        }else{
            cc.find('bonusrun/btn_start',this._bonusUINode).active = false;
        }

        let lblnum = cc.find('bonusrun/epclnk_bg/bg_collected/collectednum',this._bonusUINode);
        lblnum.getComponent(cc.Label).string = total;
    },

    //更新旋转次数
    updateSpineTimes(){
        let bonusdata = cc.vv.gameData.GetBonusData();
        if(bonusdata&&bonusdata.idxs&&bonusdata.idxs.length > 0){
            let num = cc.vv.gameData.GetRespinTime();
            if(num){
                this.setBonusTimes(num);
                cc.find('bonusrun/btn_start/freespinremaining',this._bonusUINode).active = true;
            }else{
                cc.find('bonusrun/btn_start',this._bonusUINode).active = false;
            }
        }
    },

    //设置times
    setBonusTimes(num){
        cc.vv.gameData.SetRespinTime(num)
        let spframe = cc.vv.gameData.GetSpriteFrameByName('theme115_bonus_counter_num'+num);
        let remain = cc.find('bonusrun/btn_start/freespinremaining/remainingnum',this._bonusUINode);
        remain.getComponent(cc.Sprite).spriteFrame = spframe;
    },

    //旋转停止
    async bonusSpinsEnd(num){
        if(num <= 0){
            cc.find('bonusrun/btn_start/freespinremaining',this._bonusUINode).active = false;
            cc.find('bonusrun/btn_start/freespinecomplete',this._bonusUINode).active = true;
            cc.find('bonusrun/btn_start',this._bonusUINode).active = true;
        }
    },

    //点击bonus游戏开始点击事件
    onBonusStart(){
        this._btn_presshere.stopAllActions()
        Global.SlotsSoundMgr.playEffect('btn_click');
        this.bonusGameStartUI(false);
        this.setBonusTimes(3);
        this.updateBonusFreeSpinsTimes();
        cc.vv.gameData.GetBottomScript().CanDoNextRound();
    },

    //进入bonus游戏需要显示的界面 true press here界面 false bonus旋转中界面
    bonusGameStartUI(isshow){
        cc.find('bonusrun/btn_start/herestart',this._bonusUINode).active = isshow;
        cc.find('bonusrun/btn_start/freespinremaining',this._bonusUINode).active = !isshow;
        cc.find('bonusrun/epclnk_bg/epclnk',this._bonusUINode).active = isshow;
        cc.find('bonusrun/epclnk_bg/bg_collected',this._bonusUINode).active = !isshow;
    },

    //普通免费开始事件
    onNormalFreeStart(){
        this._btn_start.stopAllActions()
        this._btn_start.getComponent(cc.Button).interactable = false;
        Global.SlotsSoundMgr.playEffect('btn_click');
        this.hideFreeUI('node_bg/free_start',()=>{
            Global.SlotsSoundMgr.playEffect('transition1');
            cc.vv.gameData.playSpine(this._freegameSpNode,'animation',false,()=>{
                Global.SlotsSoundMgr.playBgm('free_bgm');
                if(this._normalFreeStart){
                    this._normalFreeStart();
                    this._normalFreeStart = null;
                }
            });

            this.scheduleOnce(() => {
                //切换背景
                this.changeBg(2);
                cc.vv.gameData.GetBottomScript().ShowFreeModel(true,0,6);
            }, 0.5);
        });
    },

    //普通免费收集事件
    onNormalFreeCollect(){
        this._btn_collect.stopAllActions();
        this._btn_collect.getComponent(cc.Button).interactable = false;
        Global.SlotsSoundMgr.playEffect('free_dialog_collect_click');
        this.hideFreeUI('node_bg/free_end',()=>{
            Global.SlotsSoundMgr.stopBgm();
            Global.SlotsSoundMgr.playEffect('transition1');
            cc.vv.gameData.playSpine(this._freegameSpNode,'animation',false,()=>{
                let wincoin = cc.vv.gameData.GetGameTotalFreeWin();
                cc.vv.gameData.GetSlotsScript().ShowBottomWin(wincoin,wincoin,true,()=>{
                    if(this._normalCollect){
                        this._normalCollect();
                        this._normalCollect = null;
                    }
                });
            });
            let self = this;
            self.scheduleOnce(() => {
                self.changeBg(1);
                cc.vv.gameData.GetSlotsScript().resumeCards();
                cc.vv.gameData.GetBottomScript().ShowFreeModel(false);
            }, 0.3);
        });
    },

    //能量免费开始事件
    onEnergyFreeStart(){
        this._btn_engstart.stopAllActions();
        this._btn_engstart.getComponent(cc.Button).interactable = false;
        Global.SlotsSoundMgr.playEffect('btn_click');
        this.hideFreeUI('node_bg/engfree_start',()=>{
            cc.find('node_energy',this.node.parent).active = false;
            Global.SlotsSoundMgr.playBgm('free_bgm');
             this.scheduleOnce(()=>{
                cc.vv.gameData.GetBottomScript().CanDoNextRound();
            },0.5);
        });
    },

    //能量免费收集事件
    onEnergyFreeCollect(){
        this._btn_engcollect.stopAllActions();
        this._btn_engcollect.getComponent(cc.Button).interactable = false;
        Global.SlotsSoundMgr.playEffect('free_dialog_collect_click');
        this.hideFreeUI('node_bg/engfree_end',()=>{
            Global.SlotsSoundMgr.stopBgm();
            cc.vv.gameData.clearEnergyData();
            this.changeBg(1);
            cc.find('node_energy',this.node.parent).active = true;
            cc.vv.gameData.GetSlotsScript().openMidAni(false);
            cc.vv.gameData.GetBottomScript().ShowFreeModel(false);
            this.scheduleOnce(()=>{
                if(this._engFreeCollect){
                    this._engFreeCollect();
                    this._engFreeCollect = null;
                }
            },0.5);
        });
    },

    //显示免费界面
    showFreeUI(nodename, callback){
        this._freeNode.active = true;
        let bgnode = cc.find('node_bg',this._freeNode);
        let shownode = cc.find(nodename,this._freeNode);
        shownode.active = true;
        bgnode.scale = 0;
        cc.tween(bgnode).to(0.3,{scale:1},{easing:'backOut'})
            .call(()=>{
                if(callback){
                    callback();
                }
            })
            .start();
    },

    //隐藏免费界面
    hideFreeUI(nodename,callback){
        let bgnode = cc.find('node_bg',this._freeNode);
        cc.tween(bgnode).to(0.3,{scale:0},{easing:'backIn'}).call(()=>{
            let shownode = cc.find(nodename,this._freeNode);
            shownode.active = false;
            this._freeNode.active = false;
            if(callback){
                callback();
            }
        }).start();
    },

    //改变背景
    changeBg(type){
        let bg = cc.find('Canvas/safe_node/bg');
        switch (type) {
            case 1:bg.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.GetSpriteFrameByName('theme115_base_bg');break;
            case 2:bg.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.GetSpriteFrameByName('theme115_free_bg');break;
            case 3:bg.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.GetSpriteFrameByName('theme115_bonus_bg');break;
            default:
                break;
        }
    },
});
