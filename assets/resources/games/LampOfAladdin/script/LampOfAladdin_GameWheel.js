// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


//资源配置
let RESOURCE_CFG = {
    "JACKPOT":"theme175_wheel_jackpot",
    "GRAND":"theme175_wheel_jp_0",
    "ULTRA":"theme175_wheel_jp_1",
    "MEGA":"theme175_wheel_jp_2",
    "MAJOR":"theme175_wheel_jp_3",
    "MINOR":"theme175_wheel_jp_4",
    "MINI":"theme175_wheel_jp_5",
    "2":"theme175_wheel_2x",
    "3":"theme175_wheel_3x",
    "5":"theme175_wheel_5x",
    "10":"theme175_wheel_10x",
    "FREE8":"theme175_wheel_freegame8",
    "FREE10":"theme175_wheel_freegame10",
    "FREE15":"theme175_wheel_freegame15",
    "Blue":"theme175_wheel_blue",
    "Black":"theme175_wheel_black",
    "Orange":"theme175_wheel_orange",
    "Gold":"theme175_wheel_gold",
    "Red":"theme175_wheel_red",
    "White":"theme175_wheel_white",
    "Green":"theme175_wheel_green",
};


let ITEM_TYPE = {
    FREE:1,
    GOLD:2,
    JACKPOT:3,
}

//轮子类型配置
//用于随机自定义轮子
let WHEEL_ITEM_TYPE_CFG = [
    3,2,2,1,2,2,
    3,2,2,1,2,2,
    3,2,2,1,2,2
];


cc.Class({
    extends: cc.Component,

    properties: {
        _isInGame: false,
        _isAutoRotation:true,

        _node_ui_pop: null,
        _wheelSpineParent: null,

        _wheel: null,
        _btnGo: null,

        _slotsInitPos: null,

        _itemsList:null,

        _atlas: null,  //资源图集

        _interval:0,

        _propsList: null,
        _multsList: null,

        _bToFree:false,

        _bReceive:false,
        // _isChangeLogo:false,
    },

    // LIFE-CYCLE CALLBACKS:

    // 断网重连
    ReconnectNet(propsList, mults){
        if(this._bReceive){ // 已经收到数据,不处理

        } else {
            this.enterGame(propsList, mults);
        }
    },

    //进入游戏
    async enterGame (propsList, mults) {
        this._propsList = propsList;
        this._multsList = mults;

        this._bToFree = false;
        this._bReceive = false;

        cc.vv.gameData.GetSlotsScript()._bottomScript.SetWin(0);

        Global.SlotsSoundMgr.playBgm(this._soundCfg.wheel_bgm);

        //取消自动旋转
        this.setAutoRotation(false);
        //设置在游戏中
        this._isInGame = true;

        this.scheduleOnce(()=>{
            //设置灰色可见
            this._setGrayBgVisible(true);
            //隐藏Wild收集
            this._setWildCollectVisible(false);
        }, 0.5);

        this.setCharacterVisible(false);
        //切屏
        this._switchScreen();
        await this.awaitTime(1.5);

        this.panel.active = true;
        // SlotsFacade.prizePool.alignTop();
        // if(SlotsFacade.logo.node.opacity > 0) {
        //     this._isChangeLogo = true;
        //     SlotsFacade.logo.node.active = false;
        // }

        Global.SlotsSoundMgr.playEffect("carpet_move");

        //播放魔法烟雾
        this.playSpine(cc.find("spine_magic_fog", this._wheelSpineParent));

        //延迟0.5秒
        await this.awaitTime(0.5);
        //播放轮盘边框特效-常规
        this.playSpine(cc.find("ui/spine_wheel_adge", this.node), "animation", true);
        //播放btnSpin点亮特效
        this.playSpine(cc.find("ui/spine_light", this.node), "animation", true);

        Global.SlotsSoundMgr.playEffect("magic_appear");

        //延迟0.5秒
        await this.awaitTime(0.5);
        //播放出现中间Genie出现方式
        this.playSpine(cc.find("spine_fog_path", this._wheelSpineParent));
        //延迟2.0秒
        // await this.awaitTime(1.5);
        // //播放出现中间Genie
        // this.playSpine(cc.find("spine_genie_showhide", this._wheelSpineParent), "animation");
        // //延迟0.5秒
        // await this.awaitTime(0.5);
        //轮盘物品非Jackpot变黑
        this._setAllNotJackpotToBlack();
        //隐藏Slots
        await this._setSlotsVisible(false);
        //所有黑掉Item变灰色透明
        this._setAllNotJackpotToGrayMask();
        //延迟1.0秒
        await this.awaitTime(1.5);
        //播放中间Genie消失烟雾
        await this.playSpine(cc.find("spine_disappear_fog", this._wheelSpineParent), "animation1");
        //播放右下角Genie出现烟雾
        this.playSpine(cc.find("spine_disappear_fog",this._wheelSpineParent), "animation2");

        // Global.SlotsSoundMgr.playEffect("magic_move");

        // //延迟0.3秒
        // await this.awaitTime(0.3);
        // //播放出现右下角Genie
        // this.playSpine(cc.find("spine_genie_showhide", this._wheelSpineParent), "animation1");
        //灰色背景去掉
        await this._setGrayBgVisible(false);
        //变化JACKPOT---具体奖池（Grand,Mega,Mni等）
        await this._changeJackpotToPool();
        //延迟0.3秒
        await this.awaitTime(0.3);
        //播放轮盘烟雾
        this.playSpine(cc.find("spine_wheel_fog", this._wheelSpineParent));
        //出现轮盘非奖池的其他物品
        await this._showWheelItemsProp();
        //延迟0.3秒
        await this.awaitTime(0.3);

        let bTransition = false;
        //请求开始游戏
        let resp = await cc.vv.gameData.reqSubGame(3); //转盘
        // test
        // let resp = {"data":{"idx":16,"rtype":3,"info":{"type":"free","num":15}},"uid":133913,"c":51,"code":200};

        if (resp.code == 200) {
            // 收到数据
            this._bReceive = true;
            //结算数据
            let sttlInfo = resp.data.info;
            //开始滚动轮盘
            await this._startRotationWheel(resp.data.idx - 1, false);

            if (sttlInfo.type == "free") { //免费
                bTransition = true;

                await this._showFreeGameStartUIDialouge(sttlInfo.num);
                //设置免费次数
                cc.vv.gameData.SetTotalFree(sttlInfo.num);
                cc.vv.gameData.SetFreeTime(sttlInfo.num);
                cc.vv.gameData.GetSlotsScript().ShowGameview(true);

                this._bToFree = true;
            }
            else { //金币类型：coin 奖池类型：pool
                // sttlInfo.mult = sttlInfo.mult || 1;
                await this._showWinCoinResultUIDialouge(sttlInfo.num);
            }
        }

        //退出游戏
        await this.exitGameWheel(bTransition);
    },

    //处理免费游戏结算
    async exitFreeGame (freewinCoin) {
        await this._showFreeGameResultUIDialouge(freewinCoin);
        this._hideAllUIDialouge();

        Global.SlotsSoundMgr.stopBgm();
    },

    //退出游戏
    async exitGameWheel (bTransition) {
        this.scheduleOnce(async ()=>{
            Global.SlotsSoundMgr.stopBgm();

            this._isInGame = false;
            this._isAutoRotation = true;
            //显示Wild收集
            this._setWildCollectVisible(true);
            //显示Slots
            await this._setSlotsVisible(true);

            for (let subNode of cc.find("ui", this.node).children) {
                if (subNode.name.substr(0,5) == "spine") {
                    subNode.active = false;
                }
            }
            this._hideAllUIDialouge();
            //重置
            this.resetInit();


            for (let subNode of this._wheelSpineParent.children) {
                subNode.active = false;
            }
            this.panel.active = false;

        }, 0.2);

        //切屏
        if (bTransition) {
            this._switchScreen();
            await this.awaitTime(1.5);
            this.setCharacterVisible(true);
        } else {
            this.setCharacterVisible(true, true);
        }
        // this.setCharacterVisible(true);

        // for (let subNode of this._wheelSpineParent.children) {
        //     subNode.active = false;
        // }
        // this.panel.active = false;
        // SlotsFacade.prizePool.toNormal();
        // if(this._isChangeLogo) {
        //     this._isChangeLogo = false;
        //     SlotsFacade.logo.node.active = true;
        // }
        if(SlotsFacade.dm.GetFreeTime()>0) {
            Global.SlotsSoundMgr.playBgm("free_bgm");
        }

    },

    setAutoRotation (auto) {
        this._isAutoRotation = auto;
    },

    onLoad () {
        this._node_ui_pop = cc.find("Canvas/safe_node/node_ui_pop");
        //特效父节点
        this._wheelSpineParent = cc.find("GameWheelSpine", this._node_ui_pop);
        this._wheelSpineParent.active = true;


        this._atlas = cc.vv.gameData.GetAtlasByName("wheel");
        this._wheel = cc.find("ui/wheel", this.node);

        this._btnSpin = cc.find("ui/btn_go", this.node);
        // Global.btnClickEvent(this._btnSpin, this.onBtnSpinClick, this);  //暂时是不需要玩家点击的

        let itemTemplate = cc.find("itemsList/Item", this._wheel);
        itemTemplate.active = false;

        let multItemTemplate = cc.find("itemListExtra/ItemExtra", this._wheel);
        multItemTemplate.active = false;

        this._itemsList = [];
        for (let i=0; i<18; i++) {
            let item = cc.instantiate(itemTemplate);
            item.active = true;
            item.angle = -(i*20 + 10);
            // item.getChildByName("line1").active = i!=17;
            // item.getChildByName("line2").active = i==0;
            item.parent = itemTemplate.parent;

            let multItem = cc.instantiate(multItemTemplate);
            multItem.active = true;
            multItem.angle = item.angle;
            multItem.parent = multItemTemplate.parent;

            this._itemsList.push({item:item, mult:multItem});
        }

        this._soundCfg = cc.vv.gameData.getGameCfg().soundCfg;

        this.panel = this.node.getChildByName("ui");
        this.panel.active = false;
    },

    start () {
        this.resetInit();
    },
    
    resetInit () {
        this._interval = 0;
        this._btnSpin.getComponent(cc.Button).enabled = false;

        let wheelDataList = [];
        let freeCnt = 0;
        for (let type of WHEEL_ITEM_TYPE_CFG) {
            switch (type) {
                case ITEM_TYPE.FREE:
                    let FREE_LIST = ["FREE8","FREE10","FREE15"];
                    wheelDataList.push(FREE_LIST[freeCnt]);
                    freeCnt ++;
                    break;
                case ITEM_TYPE.GOLD:
                    let goldsNum = cc.vv.gameData.GetTotalBet()*Global.random(5,375);
                    wheelDataList.push(goldsNum);
                    break;
                case ITEM_TYPE.JACKPOT:
                    //当前是展示，不是游戏中，不需要具体的奖池
                    let jackpot = "JACKPOT";
                    wheelDataList.push(jackpot);
                    break;
                default:
                    break;
            }
        }
        this.resetWheel(wheelDataList);
    },

    /*
    * wheelDataList=["GRAND",50000,2000000,"FREE8",100000,400000,"MEGA",25,100000,"FREE10",
        50000,2000000,"MINI",100000,300000,"FREE15",450000,1000000]
    * multList={"idx_12":3,"idx_15":2,"idx_18":2,"idx_3":2,"idx_17":2,"idx_2":2,"idx_6":2,"idx_11":5}
     */
    resetWheel (wheelDataList, multList) {
        this.restoreItems();

        //显示Item
        for (let i in wheelDataList) {
            let itemDataId = wheelDataList[i];
            let mult = null;
            if (multList) mult = multList["idx_" + (parseInt(i)+1)];
            let obj = this._itemsList[i];
            this._setItemShowByData(obj, itemDataId, mult);
        }
    },

    restoreItems () {
        for (let obj of this._itemsList) {
            //隐藏物品
            let item = obj.item;
            for (let i=1; i<=4; i++) item.getChildByName("props" + i).active = false;
            //隐藏倍数
            obj.mult.active = false;
        }
    },


    update (dt) {
        if (this._isAutoRotation) {
            this._interval += dt;
            if (this._interval > 0.03) {
                this._interval -= 0.03;
                this._wheel.angle -= 0.2;
            }
        }
    },

    onBtnSpinClick () {
        this._btnSpin.getComponent(cc.Button).interactable = false;
        // todo ... 暂时是自动的  没有用上
    },

    //开始转动轮盘
    //是否需要拨动
    async _startRotationWheel (winPropIdx, isNeedRelocation) {
        Global.SlotsSoundMgr.playEffect("magic_stir");

        //播放go 特效
        this.playSpine(cc.find("ui/spine_go", this.node));
        //播放Genie动作--出现
        // this.playSpine(cc.find("ui/spine_genie_action", this.node), "animation2", false, ()=>{
        //     this.playSpine(cc.find("ui/spine_genie_action", this.node), "animation", true); //循环播放伫立动作
        // });
        let alad = cc.find("ui/spine_genie_action", this.node);
        alad.active = true;
        let sScaleX = alad.scaleX;
        let sScaleY = alad.scaleY;
        alad.scale = 0;
        cc.tween(alad).to(0.5,{scaleX:sScaleX, scaleY:sScaleY}).start();
        this.playSpine(alad, "skill", true); //循环播放伫立动作

        Global.SlotsSoundMgr.playEffect("wheel_spin");

        //开始转转盘
        // let isNeedRelocation = Global.random(0,1)?true:false; //是否需要拨动
        let targetPropIdx = winPropIdx;
        //播放boom特效
        this.playSpine(cc.find("ui/spine_boom", this.node));
        await this._rotateWheelToTarget(targetPropIdx, 6, isNeedRelocation);
        Global.SlotsSoundMgr.stopEffectByName("wheel_spin");

        //播放拨动动作
        if (isNeedRelocation) {
            // this.playSpine(cc.find("ui/spine_genie_action", this.node), "animation1");
            await this.awaitTime(1.0);
            this._rotateWheelToTarget(targetPropIdx, 0, false);
            Global.SlotsSoundMgr.playEffect("wheel_stop");
            await this.awaitTime(0.5);
        }
        else {
            Global.SlotsSoundMgr.playEffect("wheel_stop");
        }
        //赢奖特效
        this.playSpine(cc.find("ui/spine_win", this.node), "animation", true);
        this.playSpine(cc.find("ui/spine_wheel_adge", this.node), "animation2", true);
        await this.awaitTime(2.0);
    },

    //isNeedRelocation 重新定位，拨动
    async _rotateWheelToTarget (targetIdx, roundNum, isNeedRelocation) {
        return new Promise(async success=>{
            let rorationWheel = this._wheel;

            if (isNeedRelocation) {
                targetIdx ++;
                if (targetIdx >= 18) targetIdx -=18;
            }

            let targetAngle = targetIdx*20 + 10;
            targetAngle *= -1;

            let diffAngle = targetAngle - rorationWheel.angle;
            let mRound = roundNum; //转动圈数

            //旋转
            await this.playActions(rorationWheel, [cc.rotateTo(0.5*mRound + 0.4, rorationWheel.angle + 360*mRound + diffAngle).easing(cc.easeSineInOut()),]);

            success();
        });
    },

    //设置物品显示通过对应物品数据
    _setItemShowByData (itemObj, itemDataId, mult) {
        let propType = this._getPropType(itemDataId);
        let propsNode = itemObj.item.getChildByName("props" + propType);
        propsNode.active = true;

        switch (propType) {
            case ITEM_TYPE.FREE:
                propsNode.getComponent(cc.Sprite).spriteFrame = this._atlas.getSpriteFrame(RESOURCE_CFG[itemDataId]);
                break;
            case ITEM_TYPE.JACKPOT:
                propsNode.getComponent(cc.Sprite).spriteFrame = this._atlas.getSpriteFrame(RESOURCE_CFG[itemDataId]);
                break;
            case ITEM_TYPE.GOLD:
                propsNode.getComponent(cc.Label).string = Global.convertNumToShort(parseInt(itemDataId), 1000, 0);
                break;
            default:
                break;
        }
        itemObj.item.name = itemDataId.toString();
        itemObj.item.getChildByName("item_bg").getComponent(cc.Sprite).spriteFrame = this._atlas.getSpriteFrame(RESOURCE_CFG[this._getItemBgColorName(itemDataId)]);

        if (mult) {
            let multNode = itemObj.mult;
            multNode.active = true;
            multNode.getChildByName("mult").getComponent(cc.Sprite).spriteFrame = this._atlas.getSpriteFrame(RESOURCE_CFG[mult.toString()]);
        }
    },

    //item对应的数据Id
    _getItemBgColorName (itemDataId) {
        let propType = this._getPropType(itemDataId);

        let bgColor = "White";
        switch (propType) {
            case ITEM_TYPE.FREE:
                bgColor = "Red";
                break;
            case ITEM_TYPE.JACKPOT:
                bgColor = "Gold";
                break;
            case ITEM_TYPE.GOLD:
                let mult = parseInt(itemDataId)/cc.vv.gameData.GetTotalBet();
                if (mult > 300) {
                    bgColor = "Orange";
                }
                else if (mult > 200) {
                    bgColor = "Blue";
                }
                else {
                    bgColor = this._isInGame?"Green":"White";
                }
                break;
            default:
                break;
        }
        return bgColor;
    },

    _getPropType (prop) {
        if (typeof prop == "string") {
            if (prop.substr(0,4) == "FREE") {
                return ITEM_TYPE.FREE;
            }
            else {
                return ITEM_TYPE.JACKPOT;
            }
        }
        else {
            return ITEM_TYPE.GOLD;
        }
    },

    //改变奖池到具体奖励
    async _changeJackpotToPool () {
        Global.SlotsSoundMgr.playEffect("jp_reset");

        for (let i in WHEEL_ITEM_TYPE_CFG) {
            if (WHEEL_ITEM_TYPE_CFG[i] == ITEM_TYPE.JACKPOT) {
                let item = this._itemsList[i].item;
                if (this._propsList) {
                    item.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(()=>{
                        this._setItemShowByData(this._itemsList[i], this._propsList[i]); //设置具体奖池
                    })));
                }
                await this.playSpine(item.getChildByName("spine_jackpot_change"));
                item.getChildByName("spine_jackpot_change").active = false;
            }
        }
    },

    //显示轮盘所有物品
    async _showWheelItemsProp () {
        if (this._propsList) {
            Global.SlotsSoundMgr.playEffect("multi_reset");

            //摆放绿色背景金币
            for (let i in this._propsList) {
                let propId = this._propsList[i];

                let propType = this._getPropType(propId);
                if (propType == ITEM_TYPE.JACKPOT) continue;

                let bgColor = this._getItemBgColorName(propId);
                if (bgColor == "Green") { //优先摆放绿色
                    let itemObj = this._itemsList[i];
                    this._setItemShowByData(itemObj, propId, this._multsList["idx_" + (parseInt(i)+1)]); //设置具体金币
                    itemObj.item.getChildByName("black_mask").active = false;
                    await this.playActions(itemObj.item, [cc.delayTime(0.1), cc.callFunc(()=>{
                        this.playSpine(itemObj.item.getChildByName("spine_green_bg"), "animation2");
                        itemObj.item.getChildByName("spine_green_bg").active = false;
                    })]);
                }
            }

            //摆放其他
            for (let i in this._propsList) {
                let propId = this._propsList[i];
                let propType = this._getPropType(propId);
                if (propType == ITEM_TYPE.JACKPOT) continue;

                let bgColor = this._getItemBgColorName(propId);
                if (bgColor != "Green") { //优先摆放绿色
                    let itemObj = this._itemsList[i];
                    itemObj.item.getChildByName("black_mask").active = false;
                    this._setItemShowByData(itemObj, propId); //设置具体金币
                }
            }
        }
    },

    //所有非奖池的Item变灰
    _setAllNotJackpotToBlack () {
        for (let obj of this._itemsList) {
            if (obj.item.name != "JACKPOT") {
                let black_mask = obj.item.getChildByName("black_mask");
                black_mask.active = true;
                black_mask.opacity = 255;
            }
        }
    },

    //所有非奖池的Item变灰
    _setAllNotJackpotToGrayMask () {
        for (let obj of this._itemsList) {
            if (obj.item.name != "JACKPOT") {
                let black_mask = obj.item.getChildByName("black_mask");
                cc.tween(black_mask).to(0.8, {opacity:180}).start();
            }
        }
    },

    setCharacterVisible(bVisible, bMove = false){
        let character = cc.find("Canvas/safe_node/character");
        if(bVisible && bMove){
            let norPos = character.position;
            character.x = norPos.x - cc.winSize.width;
            character.active = bVisible;
            cc.tween(character)
                .to(0.5,{position:norPos}, {easing:"easeIn"})
                .start()
        } else {
            character.active = bVisible;
        }
    },

    //设置Slots隐藏与否
    async _setSlotsVisible (isVisible) {
        let slotsNode = cc.find("Canvas/safe_node/slots");
        if (slotsNode.active == isVisible) return;

        let node_energy = cc.find("Canvas/safe_node/slots/node_energy");
        node_energy.active = false;
        let prizePool = cc.find("Canvas/safe_node/LMSlots_PrizePool_1");
        prizePool.active = isVisible;

        let hidePos = cc.v2(0, -1000);
        if (!this._slotsInitPos) this._slotsInitPos = slotsNode.position;

        let startPos = isVisible?hidePos:this._slotsInitPos;
        let targetPos = isVisible?this._slotsInitPos:hidePos;

        if (isVisible) {
            if (!this._bToFree) node_energy.active = true;
            slotsNode.position = targetPos;
            slotsNode.active = true;
        }
        else {
            slotsNode.position = startPos;
            await this.playActions(slotsNode, [cc.moveTo(1.0, targetPos).easing(cc.easeSineIn())]);
            slotsNode.active = false;
        }
    },

    //wild收集是否可见
    _setWildCollectVisible (isVisible) {
        //隐藏/显示Wild收集
        cc.find("Canvas/safe_node/slots/spine_collect_wild").active = isVisible;
    },

    //显示灰色背景
    _setGrayBgVisible (isVisible) {
        let startOpacity = isVisible?0:200;
        let targetOpacity = isVisible?200:0;

        let grayLayer = cc.find("grayLayer", this._wheelSpineParent);
        grayLayer.active = true;
        grayLayer.opacity = startOpacity;

        return new Promise((success)=>{
            cc.tween(grayLayer).to(1.0, {opacity:targetOpacity}).call(()=>{
                if (!isVisible) grayLayer.active = false;
                success();
            }).start();
        });
    },

    //切屏
    async _switchScreen () {
        if (this._bToFree) {
            Global.SlotsSoundMgr.playEffect(this._soundCfg.transition1);
        }
        else {
            Global.SlotsSoundMgr.playEffect(this._soundCfg.transition_2);
        }

        // let spine_transition = cc.find("spine_transition/spine", this._wheelSpineParent);
        let spine_transition = cc.find("Canvas/safe_node/spine_transition");
        spine_transition.parent.active = true;
        await this.playSpine(spine_transition, "skill_1");
        spine_transition.active = false;
    },

    //显示免费游戏开始界面
    _showFreeGameStartUIDialouge (freetimes) {
        this._hideAllUIDialouge();

        let dialouge = cc.find("uiFreeGameTri", this._node_ui_pop);
        dialouge.active = true;

        let spineBg = cc.find("spine", dialouge);
        spineBg.active = true;

        // let uiStart = cc.find('uiStart', dialouge);
        // uiStart.active = true;

        let btnstart = cc.find("btn", dialouge);
        btnstart.getComponent(cc.Button).enabled = false;

        let lblFreetimes = cc.find("times", dialouge);
        lblFreetimes.getComponent(cc.Label).string = freetimes;

        let self = this
        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect(this._soundCfg.fg_popup);
            //开始界面-弹出
            lblFreetimes.scale = 0;
            cc.tween(lblFreetimes).delay(0.5).to(0.3, {scale:1.3}).to(0.2, {scale:1}).start();
            cc.tween(btnstart).to(0.3, {scale:1.3}).to(0.2, {scale:1}).start();
            await this.playSpine(spineBg, "idle",false,function () {
                self.playSpine(spineBg, "loop", true);
            });

            btnstart.getComponent(cc.Button).enabled = true;

            if (cc.vv.gameData.isNeedAutoPlay()) {
                btnstart.stopAllActions();
                cc.tween(btnstart)
                    .delay(cc.vv.gameData.getAutoPlayTime())
                    .call(async ()=>{
                        //开始界面-退出
                        btnstart.getComponent(cc.Button).enabled = false;
                        cc.tween(lblFreetimes).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();
                        cc.tween(btnstart).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();

                        Global.SlotsSoundMgr.playEffect(this._soundCfg.fg_popclose);
                        await this.playSpine(spineBg, "end");
                        //注销点击
                        btnstart.off('click');

                        dialouge.active = false;

                        success();  //下一步
                    })
                    .start();
            }

            //按钮点击
            Global.btnClickEvent(btnstart, async ()=>{
                btnstart.stopAllActions();
                btnstart.getComponent(cc.Button).enabled = false;

                Global.SlotsSoundMgr.playEffect(this._soundCfg.click);
                //开始界面-退出
                cc.tween(lblFreetimes).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();
                cc.tween(btnstart).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();

                Global.SlotsSoundMgr.playEffect(this._soundCfg.fg_popclose);
                await this.playSpine(spineBg, "end");
                //注销点击
                btnstart.off('click');

                dialouge.active = false;

                success();  //下一步
            },this)
        });
    },

    //显示免费游戏结算界面
    async _showFreeGameResultUIDialouge (winCoin) {
        this._hideAllUIDialouge();

        let dialouge = cc.find("uiFreeGameEnd",this._node_ui_pop);
        dialouge.active = true;

        let spineBg = cc.find("spine", dialouge);
        spineBg.active = true;

        let offY = 45;
        let uiResult = cc.find('uiResult', dialouge);
        uiResult.active = true;
        uiResult.y = -offY;
        uiResult.opacity = 0;

        let btnCollect = cc.find("btn", uiResult);
        btnCollect.getComponent(cc.Button).enabled = false;

        let lblWinCoin = cc.find("lblWinCoin", uiResult);
        lblWinCoin.active = true;
        lblWinCoin.getComponent(cc.Label).string = "";

        let self = this;
        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect(this._soundCfg.fg_popup);
            //开始界面-弹出
            cc.tween(uiResult).to(0.4, {y: 0, opacity:255}).start();

            this.playSpine(spineBg, "idle",false, function () {
                //开始界面-静态
                self.playSpine(spineBg, "loop", true);
            });
            await cc.vv.gameData.awaitTime(0.4);
            //赢取金币
            // let winCoin = cc.vv.gameData.GetGameTotalFreeWin();
            lblWinCoin.active = true;
            Global.doRoallNumEff(lblWinCoin, 0, winCoin, 2.0, ()=>{
                btnCollect.getComponent(cc.Button).enabled = true;
            }, null, 2, true);

            if (cc.vv.gameData.isNeedAutoPlay()) {
                btnCollect.stopAllActions();
                cc.tween(btnCollect)
                    .delay(cc.vv.gameData.getAutoPlayTime())
                    .call(async ()=>{
                        btnCollect.getComponent(cc.Button).enabled = false;
                        // cc.vv.gameData.AddCoin(winCoin);
                        // cc.vv.gameData.GetSlotsScript()._topScript.ShowCoin();

                        //开始界面-退出
                        cc.tween(uiResult).to(0.4, {y:-offY, opacity:0}).start();

                        Global.SlotsSoundMgr.playEffect(this._soundCfg.fg_popclose);
                        await this.playSpine(spineBg, "end");
                        //注销点击
                        btnCollect.off('click');

                        dialouge.active = false;

                        await this.awaitTime(0.2)
                        cc.vv.gameData.GetSlotsScript().ShowGameview(false);

                        //切屏
                        this.setCharacterVisible(false);
                        /*await */this._switchScreen();
                        await this.awaitTime(1.3)
                        this.setCharacterVisible(true);

                        success();  //下一步
                    })
                    .start();
            }

            //按钮点击
            Global.btnClickEvent(btnCollect, async ()=>{
                btnCollect.stopAllActions();
                btnCollect.getComponent(cc.Button).enabled = false;

                // cc.vv.gameData.AddCoin(winCoin);
                // cc.vv.gameData.GetSlotsScript()._topScript.ShowCoin();

                Global.SlotsSoundMgr.playEffect(this._soundCfg.click);
                //开始界面-退出
                cc.tween(uiResult).to(0.4, {y:-offY, opacity:0}).start();

                Global.SlotsSoundMgr.playEffect(this._soundCfg.fg_popclose);
                await this.playSpine(spineBg, "end");
                //注销点击
                btnCollect.off('click');

                dialouge.active = false;

                await this.awaitTime(0.2)
                cc.vv.gameData.GetSlotsScript().ShowGameview(false);

                //切屏
                this.setCharacterVisible(false); 
                /*await */this._switchScreen();
                await this.awaitTime(1.3)
                this.setCharacterVisible(true);

                success();  //下一步
            },this)
        });
    },

    //显示中奖金币结算界面
    async _showWinCoinResultUIDialouge (winCoin) {
        this._hideAllUIDialouge();

        let dialouge = cc.find("uiWinCoinDialouge", this._node_ui_pop);
        dialouge.active = true;

        let spineBg = cc.find("spine", dialouge);
        spineBg.active = true;

        let uiResult = cc.find('uiResult', dialouge);
        uiResult.active = true;
        uiResult.y = -100;
        uiResult.opacity = 0;

        let btnCollect = cc.find("btn", uiResult);
        btnCollect.getComponent(cc.Button).enabled = false;

        let lblWinCoin = cc.find("lblWinCoin", uiResult);
        lblWinCoin.active = true;
        lblWinCoin.getComponent(cc.Label).string = "";

        let self = this;
        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect(this._soundCfg.wheel_popup);

            //开始界面-弹出
            cc.tween(uiResult).to(0.4, {y: 0, opacity:255}).start();
            this.playSpine(spineBg, "idle",false, function () {
                //开始界面-静态
                self.playSpine(spineBg, "loop", true);
            });
            await cc.vv.gameData.awaitTime(0.4);

            //赢取金币
            Global.doRoallNumEff(lblWinCoin, 0, winCoin, 2.0, ()=>{
                btnCollect.getComponent(cc.Button).enabled = true;
            }, null, 2, true);
            await cc.vv.gameData.awaitTime(2);
            // lblWinCoin.getComponent("LabelRollCmp").startRoll(0, winCoin);
            // btnCollect.getComponent(cc.Button).enabled = true;
            cc.vv.gameData.GetSlotsScript()._bottomScript.SetWin(winCoin);
            cc.vv.gameData.AddCoin(winCoin);
            cc.vv.gameData.GetSlotsScript()._topScript.ShowCoin();

            if (cc.vv.gameData.isNeedAutoPlay()) {
                btnCollect.stopAllActions();
                cc.tween(btnCollect)
                    .delay(cc.vv.gameData.getAutoPlayTime())
                    .call(async ()=>{
                        btnCollect.getComponent(cc.Button).enabled = false;
                        Global.SlotsSoundMgr.playEffect(this._soundCfg.wheel_popclose);

                        //开始界面-退出
                        cc.tween(uiResult).to(0.4, {y:-100, opacity:0}).start();
                        await this.playSpine(spineBg, "end");
                        //注销点击
                        btnCollect.off('click');

                        dialouge.active = false;

                        success();  //下一步
                    })
                    .start();
            }

            //按钮点击
            Global.btnClickEvent(btnCollect, async ()=>{
                btnCollect.stopAllActions();
                btnCollect.getComponent(cc.Button).enabled = false;
                Global.SlotsSoundMgr.playEffect(this._soundCfg.click);
                Global.SlotsSoundMgr.playEffect(this._soundCfg.wheel_popclose);

                //开始界面-退出
                cc.tween(uiResult).to(0.4, {y:-100, opacity:0}).start();
                await this.playSpine(spineBg, "end");
                //注销点击
                btnCollect.off('click');

                dialouge.active = false;

                success();  //下一步
            },this)
        });

    },

    //隐藏UI
    _hideAllUIDialouge () {
        cc.find("uiFreeGameTri", this._node_ui_pop).active = false;
        cc.find("uiFreeGameEnd", this._node_ui_pop).active = false;
        cc.find("uiWinCoinDialouge", this._node_ui_pop).active = false;
    },

    //播放Spine
    playSpine (node, animationName="animation", isLoop=false, endCall=null) {
        return new Promise((success)=>{
            if (node) {
                node.active = true;
                AppLog.log("播放节点[" + node.parent.name + "/" + node.name + "]的spine动作: " + animationName);
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
