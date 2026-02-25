// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

let BottleItem = function (node, atlas, owner) {
    this.node = node;
    this.atlas = atlas;
    this.owner = owner;

    this.jackpotIdx = 0;
    this.bottle = cc.find("bottle", this.node);
    this.jackpot = cc.find("jackpot", this.node);
    this.spine_click = cc.find("spine_click", this.node);
    this.spine_loop = cc.find("spine_loop", this.node);

    this.spine_bird_show = cc.find("spine_bird_show", this.node);
    this.spine_bird = cc.find("spine_bird_fly", this.node);
    this.spine_bottle_disappear = cc.find("spine_bottle_disappear", this.node);

    //恢复初始
    this.resetInit = ()=>{
        for (let subnode of this.node.children) subnode.active = false;
        this.bottle.active = true;
        this.setJackpotIdx(0); //显示原始瓶子
        this.setClickEnable(true);
        this.setGray(false);
    };

    //根据服务器数据恢复
    this.restoreByData = (serverItemInfo)=>{
        this.setClickEnable(false);
        this.setJackpotIdx(serverItemInfo.localType);
        //出现特效
        if (serverItemInfo.localType) {
            //是鸟
            if (serverItemInfo.localType == 7) {
                this.owner.playSpine(this.spine_bird_show, "animation", true);
                this.owner.playSpine(this.spine_bird, "animation", true);
                this.jackpot.active = false;
            }
            else {
                this.owner.scheduleOnce(()=>{
                    this.owner.playSpine(this.spine_loop, "animation" + this.jackpotIdx, true);
                }, 1.0);
                this.jackpot.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("pick_jp_" + this.jackpotIdx);
                //显示奖池
                this.jackpot.active = true;
                this.jackpot.scale = 1;
            }
        }
    };

    //设置Idx
    this.setJackpotIdx = (jackpotIdx)=>{
        this.jackpotIdx = jackpotIdx;
        if (jackpotIdx == 7) { //鸟
            this.bottle.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("pick_niao");
            this.bottle.active = true;
        }
        else { // 瓶子
            this.bottle.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("pick_deng");
            // if(jackpotIdx > 0){
            //     this.jackpot.active = true;
            //     this.jackpot.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("theme175_pick_jp_" + this.jackpotIdx);
            //     this.jackpot.scale = 1;
            // }
        }
    };

    //设置回调
    this.setClickCallback = (callback)=>{
        this.node.off("click");
        Global.btnClickEvent(this.node, ()=>{
            this.setClickEnable(false);
            callback();
        }, this);
    };

    this.setClickEnable = (enabled)=>{
        this.node.getComponent(cc.Button).interactable = enabled;
    };

    this.isClickEnable = ()=>{
        return this.node.getComponent(cc.Button).interactable;
    };

    //设置为灰色
    this.setGray = (isGray)=>{
        let color = isGray?new cc.Color(80,80,80,255):cc.Color.WHITE;
        for (let node of this.node.children) {
            node.color = color;
        }
    };

    //播放奖池出现
    this.playJackpotDisappear = (bAnim=true)=>{
        this.jackpot.active = true;
        this.jackpot.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("pick_jp_" + this.jackpotIdx);
        if (bAnim) {
            cc.tween(this.jackpot)
                .call(()=>{
                    this.jackpot.scale = 0;
                })
                .to(0.3, {scale:1.2})
                .to(0.15, {scale:1.0})
                .start();
        }
        else {
            // this.jackpot.active = true;
            this.jackpot.scale = 1;
        }
    };

    this.playItemLock = async (jackpotIdx)=>{
        this.setJackpotIdx(jackpotIdx);
        this.owner.scheduleOnce(()=>{
            //奖池出现
            this.playJackpotDisappear();
            //出现特效
            this.owner.playSpine(this.spine_loop, "animation" + jackpotIdx, true);
        }, 0.5);
        //瓶子点击效果
        await this.owner.playSpine(this.spine_click, "animation" + jackpotIdx);

        await this.owner.awaitTime(0.5);

        //奖池变黑
        this.jackpot.color = new cc.Color(80,80,80,255);
        this.spine_loop.active = false;
        this.spine_click.active = false;
        this.bottle.active = false;
        //瓶子消失
        this.owner.playSpine(this.spine_bottle_disappear);
    };

    this.playOpenItem = async (jackpotIdx)=>{
        this.setJackpotIdx(jackpotIdx);
        this.owner.scheduleOnce(()=>{
            //奖池出现
            this.playJackpotDisappear();
            //出现特效
            this.owner.playSpine(this.spine_loop, "animation" + jackpotIdx, true);
        }, 0.5);
        //瓶子点击效果
        await this.owner.playSpine(this.spine_click, "animation" + jackpotIdx);
    };

    this.playShowBird = () => {
        this.jackpot.active = false;
        this.bottle.active = false;

        this.owner.playSpine(this.spine_bird_show, "animation", true);
        this.owner.playSpine(this.spine_bird, "animation", true);
    };
};


cc.Class({
    extends: cc.Component,

    properties: {
        _uiStart: null,
        _uiMain: null,
        _uiResult: null,

        _itemsList: null,
        _jackpotList: null,

        _subgameInfo: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._soundCfg = cc.vv.gameData.getGameCfg().soundCfg;

        this._slot = cc.find("Canvas/safe_node/slots");
        this._uiStart = cc.find("uiStart", this.node);
        this._uiResult = cc.find("uiResult", this.node);
        this._uiQp = cc.find("uiQp", this.node);
        this._uiQp.active = false;


        this._uiMain = cc.find("uiMain", this.node);

        this._itemsList = [];

        let atlas = cc.vv.gameData.GetAtlasByName("pick");

        let listNode = cc.find("itemListBg/List", this._uiMain);
        let itemTemplate = cc.find("ItemTemplate", listNode);
        itemTemplate.active = false;
        for (let i=0; i<20; i++) {
            let item = cc.instantiate(itemTemplate);
            item.active = true;
            item.name = i.toString();
            item.parent = listNode;
            this._itemsList.push(new BottleItem(item, atlas, this));
        }

        this._jackpotList = [];
        let jackpotNode = cc.find("Canvas/safe_node/LMSlots_PrizePool_1");
        for (let node of jackpotNode.children) {
            this._jackpotList.push(node);
        }

        //先初始化
        // this._resetInit();
    },

    // 断网重连
    ReconnectNet(subgameInfo, isReconnected){
        if(this._subgameInfo && this._subgameInfo.endFlag){   // 结算中，不处理

        } else {
            this.enterGame(subgameInfo, isReconnected);
        }
    },

    async enterGame (subgameInfo, isReconnected) {
        this._subgameInfo = subgameInfo;

        cc.vv.gameData.GetSlotsScript()._bottomScript.ShowBtnsByState("moveing_1");
        Global.SlotsSoundMgr.playBgm(this._soundCfg.pick_bgm);

        //测试数据
        // this._subgameInfo = {"idx":17,"type":"3","coin":0,"pick":{"idx_18":{"state":false},"idx_12":{"state":false},"idx_14":{"state":false},"idx_3":{"state":false},"idx_10":{"state":false},"idx_20":{"state":false},"idx_16":{"state":false},"idx_5":{"state":false},"idx_9":{"state":false},"idx_15":{"state":false},"idx_19":{"state":false},"idx_8":{"state":true},"idx_17":{"state":true},"idx_13":{"state":true,"type":1},"idx_7":{"state":true,"type":1},"idx_6":{"state":true},"idx_11":{"state":true},"idx_2":{"state":true},"idx_4":{"state":false},"idx_1":{"state":false}},"rtype":4};
        // isReconnected = true;

        //先初始化
        this._resetInit();

        if (isReconnected) {
            //根据数据恢复场景
            this._restoreByServerData();
        }
        else {
            //播放Wild收集满特效
            await this._playWildCollectSuccess();
            //显示开始界面
            await this._popStartDialuage();
        }

        //显示游戏主界面
        await this._showMain();
        //显示结算界面
        await this._showResultDialouge(this._subgameInfo.coin);
        //退出游戏
        await this.exitGame();
    },

    async exitGame () {
        return new Promise((success)=>{
            let collectWildData = cc.vv.gameData.getCollectWildData();
            if (collectWildData) {
                collectWildData.num = 0;
                Global.dispatchEvent(cc.vv.gameData._EventId.SLOT_REFUSH_COLLECT_WILD_PROGRESS);
            }

            cc.vv.gameData.GetSlotsScript()._bottomScript.ShowBtnsByState("idle");
            //先初始化
            this._resetInit();

            Global.SlotsSoundMgr.stopBgm();

            cc.vv.gameData.GetSlotsScript().ShowBottomWin(this._subgameInfo.coin, this._subgameInfo.coin, true, ()=>{
                success();
            });
        })

    },

    start () {
        // if (cc.vv.gameData.getDeskInfo().pool && cc.vv.gameData.getDeskInfo().pool.pick) { //断线重连
        //     this.enterGame(cc.vv.gameData.getDeskInfo().pool, true);
        //     cc.vv.gameData.GetSlotsScript()._topScript.SetBackLobby(false);
        // }
    },

    //恢复初始化
    _resetInit () {
      for (let subNode of this.node.children) subNode.active = false;
      for (let jackpot of this._jackpotList) {
          jackpot.getChildByName("spine_jackpot_disappear").active = false;
          jackpot.getChildByName("spine_jackpot_win").active = false;

          jackpot.color = cc.Color.WHITE;
          for (let node of jackpot.children) node.color = cc.Color.WHITE;
      }
      for (let bottleItem of this._itemsList) bottleItem.resetInit();
    },

    _restoreByServerData () {
        //恢复选项
        let pickInfo = this._subgameInfo.pick;
        for (let i=1; i<=20; i++) {
            let itemInfo = pickInfo["idx_" + i];
            if (itemInfo.state) {
                itemInfo.localType = this._convertServerType(itemInfo.type);
                let bottleItem = this._itemsList[i - 1];
                bottleItem.restoreByData(itemInfo);
            }
        }

        //恢复奖池（需要置灰）
        let birdNum = this._getBirdNum();
        if (birdNum > 0) {
            for (let i=1; i<=birdNum; i++) {
                let jackpotNode = this._jackpotList[6 - i]; //计算位置

                //设置奖池灰色
                jackpotNode.color = new cc.Color(80,80,80,255);
                for (let node of jackpotNode.children) node.color = new cc.Color(80,80,80,255);
            }
        }
    },

    //计算已有鸟数
    _getBirdNum () {
        let birdNum = 0;
        let pickInfo = this._subgameInfo.pick;
        for (let i=1; i<=20; i++) {
            let itemInfo = pickInfo["idx_" + i];
            if (itemInfo.type == 7) {
                birdNum ++;
            }
        }
        return birdNum;
    },

    //播放Wild收集满特效
    async _playWildCollectSuccess() {
        Global.SlotsSoundMgr.playEffect(this._soundCfg.pick_congratulate);

        let spineWildWin = cc.find("Canvas/safe_node/slots/spine_collect_wild/spine2");
        await this.playSpine(spineWildWin);
        spineWildWin.active = false;
    },

    //显示游戏主界面
    async _showMain() {
        // await cc.vv.gameData.awaitTime(1);
        // this._uiMain.active = true;
        // this.scheduleOnce(()=>{
        //     this._uiMain.active = true;
        // }, 0.8);
        // await cc.vv.gameData.awaitTime(2);
        //过渡界面
        this._playTransition();
        await cc.vv.gameData.awaitTime(2.2);
        this._uiMain.active = true;
        this._slot.active = false;


        let self = this;
        return new Promise(async (success, failed)=>{
            // let selectNum = 0;
            this._pickSuccess = success;
            //操作Item
            for (let bottleItem of this._itemsList) {
                bottleItem.setClickCallback(async ()=>{
                    /*//屏蔽其他物品点击
                    this._setUnSelectItemsClickEnable(false);

                    let resp = await cc.vv.gameData.reqSubGame(4, {idx:parseInt(bottleItem.node.name) + 1});
                    // resp = {"data":{"idx":18,"type":2,"coin":24777900,"endFlag":true,"rtype":4,"pick":{"idx_16":{"state":false,"type":"5"},"idx_4":{"state":false,"type":"6"},"idx_3":{"state":false,"type":"4"},"idx_13":{"state":false,"type":"5"},"idx_6":{"state":false,"type":"6"},"idx_5":{"state":false,"type":"6"},"idx_8":{"state":false,"type":"1"},"idx_10":{"state":true,"type":2},"idx_2":{"state":false,"type":"7"},"idx_1":{"state":false,"type":"7"},"idx_18":{"state":true,"type":2},"idx_17":{"state":false,"type":"3"},"idx_11":{"state":false,"type":"1"},"idx_12":{"state":true,"type":4},"idx_19":{"state":false,"type":"3"},"idx_14":{"state":false,"type":"5"},"idx_9":{"state":false,"type":"1"},"idx_7":{"state":true,"type":2},"idx_15":{"state":true,"type":4},"idx_20":{"state":false,"type":"3"}}},"uid":103094,"c":51,"code":200};
                    if (resp.code === 200) {
                        let info = resp.data;
                        this._subgameInfo = info;

                        //物品点击
                        let jackpotIdx = this._convertServerType(info.type);
                        bottleItem.setJackpotIdx(jackpotIdx);
                        this.scheduleOnce(()=>{
                            bottleItem.bottle.active = false; //隐藏瓶子
                        }, 0.3);

                        if (jackpotIdx == 7) { //鸟
                            Global.SlotsSoundMgr.playEffect(this._soundCfg.lamp_bird);

                            bottleItem.playShowBird();
                            await this.awaitTime(0.6);

                            let birdNum = this._getBirdNum();
                            let lockJackpotIdx = 7 - birdNum;
                            //播放被锁住的奖池选项
                            if (this._subgameInfo.minTypeIdxs) {
                                for (let idx of this._subgameInfo.minTypeIdxs) {
                                    let lockItemIdx = idx - 1;
                                    let lockItem = this._itemsList[lockItemIdx];
                                    lockItem.playItemLock(lockJackpotIdx);
                                }
                                Global.SlotsSoundMgr.playEffect(this._soundCfg.lamp_disappear);
                            }

                            //锁住奖池效果
                            await this.awaitTime(0.6);
                            await this._playJackpotDisappearEffect(parseInt(bottleItem.node.name), lockJackpotIdx);
                        }
                        else {
                            Global.SlotsSoundMgr.playEffect(this._soundCfg.lamp_click);
                            await bottleItem.playOpenItem(jackpotIdx);
                        }

                        if (info.endFlag) {
                            //播放中奖结果
                            this._playWinEffect(jackpotIdx);
                            await this.awaitTime(2.0);

                            //下一步，结算。。。
                            success();
                        }
                        else {
                            //设置其他未选择的继续操作
                            this._setUnSelectItemsClickEnable(true);
                        }
                    }
                    else {
                        AppLog.warn("返回数据错误!");
                        failed();
                    }*/
                    self.clickItemfunc(bottleItem);
                });
            }
            self.setAutoPlay();
        });
    },

    async clickItemfunc (bottleItem){
        this._itemsList.forEach(item=>{
            item.node.stopAllActions();
        });

        //屏蔽其他物品点击
        this._setUnSelectItemsClickEnable(false);

        let resp = await cc.vv.gameData.reqSubGame(4, {idx:parseInt(bottleItem.node.name) + 1});
        // resp = {"data":{"idx":18,"type":2,"coin":24777900,"endFlag":true,"rtype":4,"pick":{"idx_16":{"state":false,"type":"5"},"idx_4":{"state":false,"type":"6"},"idx_3":{"state":false,"type":"4"},"idx_13":{"state":false,"type":"5"},"idx_6":{"state":false,"type":"6"},"idx_5":{"state":false,"type":"6"},"idx_8":{"state":false,"type":"1"},"idx_10":{"state":true,"type":2},"idx_2":{"state":false,"type":"7"},"idx_1":{"state":false,"type":"7"},"idx_18":{"state":true,"type":2},"idx_17":{"state":false,"type":"3"},"idx_11":{"state":false,"type":"1"},"idx_12":{"state":true,"type":4},"idx_19":{"state":false,"type":"3"},"idx_14":{"state":false,"type":"5"},"idx_9":{"state":false,"type":"1"},"idx_7":{"state":true,"type":2},"idx_15":{"state":true,"type":4},"idx_20":{"state":false,"type":"3"}}},"uid":103094,"c":51,"code":200};
        if (resp.code === 200) {
            let info = resp.data;
            this._subgameInfo = info;

            //物品点击
            let jackpotIdx = this._convertServerType(info.type);
            bottleItem.setJackpotIdx(jackpotIdx);
            this.scheduleOnce(()=>{
                bottleItem.bottle.active = false; //隐藏瓶子
            }, 0.3);

            if (jackpotIdx == 7) { //鸟
                Global.SlotsSoundMgr.playEffect(this._soundCfg.lamp_bird);

                bottleItem.playShowBird();
                await this.awaitTime(0.6);

                let birdNum = this._getBirdNum();
                let lockJackpotIdx = 7 - birdNum;
                //播放被锁住的奖池选项
                if (this._subgameInfo.minTypeIdxs) {
                    for (let idx of this._subgameInfo.minTypeIdxs) {
                        let lockItemIdx = idx - 1;
                        let lockItem = this._itemsList[lockItemIdx];
                        lockItem.playItemLock(lockJackpotIdx);
                    }
                    Global.SlotsSoundMgr.playEffect(this._soundCfg.lamp_disappear);
                }

                //锁住奖池效果
                await this.awaitTime(0.6);
                await this._playJackpotDisappearEffect(parseInt(bottleItem.node.name), lockJackpotIdx);
            }
            else {
                Global.SlotsSoundMgr.playEffect(this._soundCfg.lamp_click);
                await bottleItem.playOpenItem(jackpotIdx);
            }

            if (info.endFlag) {
                //播放中奖结果
                this._playWinEffect(jackpotIdx);
                await this.awaitTime(2.0);

                //下一步，结算。。。
                if(this._pickSuccess){
                    this._pickSuccess();
                    this._pickSuccess = null;
                }
            }
            else {
                //设置其他未选择的继续操作
                this._setUnSelectItemsClickEnable(true);
                this.setAutoPlay();
            }
        }
        else {
            AppLog.warn("返回数据错误!");
            // failed();
        }
    },

    setAutoPlay(){
        let list = [];
        for (let i = 0; i < this._itemsList.length; i++){
            if(this._itemsList[i].isClickEnable()){
                list.push(this._itemsList[i]);
            }
        }

        let randomIdx = Global.random(0,list.length-1)
        let self = this;
        cc.vv.gameData.checkAutoPlay(list[randomIdx].node,  function (){self.clickItemfunc(list[randomIdx])});
    },


    //jackpot类型转变(客户端动画Grand是1，而服务端是6)
    _convertServerType (serverType) {
        if (serverType == 7)
            return serverType;
        else {
            return 7 - serverType;
        }
    },

    //设置是否可以点击
    _setUnSelectItemsClickEnable (enable) {
        for (let bottleItem of this._itemsList) {
            if (bottleItem.jackpotIdx == 0) {
                bottleItem.setClickEnable(enable);
            }
        }
    },

    //显示未选中Items
    _showUnSelectItems () {
        for (let bottleItem of this._itemsList) {
            if (bottleItem.jackpotIdx == 0) {
                let itemInfo = this._subgameInfo.pick["idx_" + (parseInt(bottleItem.node.name) + 1)];
                itemInfo.localType = this._convertServerType(itemInfo.type);
                bottleItem.setJackpotIdx(itemInfo.localType);

                if (itemInfo.localType != 7) {
                    bottleItem.playJackpotDisappear(false);
                }
                bottleItem.setGray(true);
            }
        }
    },

    //播放中奖结果
    _playWinEffect(winPropIdx) {
        for (let bottleItem of this._itemsList) {
            if (bottleItem.jackpotIdx == winPropIdx) { //实际是应该等于中奖物品
                this.playSpine(bottleItem.spine_loop, "animation" + bottleItem.jackpotIdx + "_1", true);
            }
        }

        //显示未选中Items
        this._showUnSelectItems();
        //播放奖池中奖特效
        this._playJackpotWinEffect(winPropIdx);
    },

    //播放奖池中奖特效
    _playJackpotWinEffect(jackpotIdx) {
        let jackpotNode = this._jackpotList[jackpotIdx - 1]; //计算位置
        jackpotNode.getChildByName("spine_jackpot_win").active = true;
        // let spine_jackpot_win_template = cc.find("spine_jackpot_win", this._uiMain);
        //
        // let jackpotWinEff = cc.instantiate(spine_jackpot_win_template);
        // jackpotWinEff.parent = jackpotNode;
        // jackpotWinEff.x = 0;
        // jackpotWinEff.y = 0;
        // jackpotWinEff.name = "jackpotWinEff";
        // this.playSpine(jackpotWinEff, "animation" + jackpotIdx, true)

        Global.SlotsSoundMgr.playEffect(this._soundCfg.jp_congratulate);
    },

    //播放奖池消失特效
    async _playJackpotDisappearEffect(itemIdx, jackpotIdx) {
        let jackpotNode = this._jackpotList[jackpotIdx - 1]; //计算位置

        let particle_eff = cc.find("particle_eff", this._uiMain);
        particle_eff.active = true;
        particle_eff.position = this._convertNodePosToLocalPos(this._itemsList[itemIdx].node, this._uiMain);

        let p = particle_eff.getComponent(cc.ParticleSystem);
        p.resetSystem();

        await this.playActions(particle_eff, [cc.moveTo(0.5, this._convertNodePosToLocalPos(jackpotNode, this._uiMain))])

        //隐藏特效
        jackpotNode.getChildByName("spine_jackpot_disappear").active = true;

        // let spine_jackpot_disappear_template = cc.find("spine_jackpot_disappear", this._uiMain);
        // let jackpotDisappearEff = cc.instantiate(spine_jackpot_disappear_template);
        // jackpotDisappearEff.parent = jackpotNode;
        // jackpotDisappearEff.x = 0;
        // jackpotDisappearEff.y = 0;
        // jackpotDisappearEff.name = "jackpotDisappearEff";

        //设置奖池灰色
        jackpotNode.color = new cc.Color(80,80,80,255);
        for (let node of jackpotNode.children) node.color = new cc.Color(80,80,80,255);
        await this.playSpine(jackpotNode.getChildByName("spine_jackpot_disappear"), "animation" + jackpotIdx)
    },

    _convertNodePosToLocalPos (node, localNode) {
        return localNode.convertToNodeSpaceAR(node.parent.convertToWorldSpaceAR(node.position));
    },

    //显示开始界面
    async _popStartDialuage() {
        this._uiStart.active = true;

        let spineBg = cc.find("spine_bg", this._uiStart);
        spineBg.active = true;

        let btnstart = cc.find("btn_start", this._uiStart);
        btnstart.getComponent(cc.Button).enabled = false;

        return new Promise(async (success)=>{
            //开始界面-弹出
            cc.tween(btnstart).to(0.3, {scale:1.3}).to(0.2, {scale:1}).start();
            await this.playSpine(spineBg, "animation1");

            btnstart.getComponent(cc.Button).enabled = true;

            //开始界面-静态
            await this.playSpine(spineBg, "animation1_1", true);

            if (cc.vv.gameData.isNeedAutoPlay()) {
                btnstart.stopAllActions();
                cc.tween(btnstart)
                    .delay(cc.vv.gameData.getAutoPlayTime())
                    .call(async ()=>{
                        btnstart.getComponent(cc.Button).enabled = false;
                        await this.playSpine(spineBg, "animation1_2");
                        //注销点击
                        btnstart.off('click');

                        this._uiStart.active = false;

                        success();  //下一步
                    })
                    .to(0.3, {scale:1.3})
                    .to(0.2, {scale:0})
                    .start();
            }

            //按钮点击
            Global.btnClickEvent(btnstart, async ()=>{
                btnstart.stopAllActions();
                Global.SlotsSoundMgr.playEffect(this._soundCfg.click);

                btnstart.getComponent(cc.Button).enabled = false;

                //开始界面-退出
                cc.tween(btnstart).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();
                await this.playSpine(spineBg, "animation1_2");
                //注销点击
                btnstart.off('click');

                this._uiStart.active = false;

                success();  //下一步
            },this)
        });
    },

    //过渡界面
    async _playTransition() {
        Global.SlotsSoundMgr.playEffect(this._soundCfg.transition2);

        this._uiQp.active = true;
        let spine_transition = cc.find("spine_transition", this._uiQp);
        await this.playSpine(spine_transition, "animation");
        this._uiQp.active = false;
    },

    //显示结算界面
    async _showResultDialouge(winCoin) {
        this._uiResult.active = true;

        let spineBg = cc.find("spine_bg", this._uiResult);
        spineBg.active = true;

        let btncollect = cc.find("btn_collect", this._uiResult);
        btncollect.getComponent(cc.Button).enabled = false;

        let lblWinCoin = cc.find("lblWinCoin", this._uiResult);
        lblWinCoin.active = true;
        lblWinCoin.scale = 1.0;
        lblWinCoin.getComponent(cc.Label).string = "";

        return new Promise(async (success)=>{
            Global.SlotsSoundMgr.playEffect(this._soundCfg.pick_popup);
            //开始界面-弹出
            cc.tween(btncollect).to(0.3, {scale:1.3}).to(0.2, {scale:1}).start();
            await this.playSpine(spineBg, "animation2");
            //开始界面-静态
            this.playSpine(spineBg, "animation2_1", true);

            //赢取金币
            Global.doRoallNumEff(lblWinCoin, 0, winCoin, 2.0, ()=>{
                btncollect.getComponent(cc.Button).enabled = true;
                cc.vv.gameData.AddCoin(winCoin);
            }, null, 2, true);

            if (cc.vv.gameData.isNeedAutoPlay()) {
                btncollect.stopAllActions();
                cc.tween(btncollect)
                    .delay(cc.vv.gameData.getAutoPlayTime())
                    .call(async ()=>{
                        btncollect.getComponent(cc.Button).enabled = false;
                        Global.SlotsSoundMgr.playEffect(this._soundCfg.pick_popclose);
                        //开始界面-退出
                        cc.tween(lblWinCoin).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();
                        await this.playSpine(spineBg, "animation2_2");
                        //注销点击
                        btncollect.off('click');

                        this._uiResult.active = false;

                        //过渡界面
                        this.scheduleOnce(()=>{
                            this._uiMain.active = false;
                            this._slot.active = true;
                        }, 2.2);
                        await this._playTransition();

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

                Global.SlotsSoundMgr.playEffect(this._soundCfg.click);

                Global.SlotsSoundMgr.playEffect(this._soundCfg.pick_popclose);
                //开始界面-退出
                cc.tween(btncollect).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();
                cc.tween(lblWinCoin).to(0.3, {scale:1.3}).to(0.2, {scale:0}).start();
                await this.playSpine(spineBg, "animation2_2");
                //注销点击
                btncollect.off('click');

                this._uiResult.active = false;

                //过渡界面
                this.scheduleOnce(()=>{
                    this._uiMain.active = false;
                    this._slot.active = true;
                }, 2.2);
                await this._playTransition();

                success();  //下一步
            },this)

        });
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
