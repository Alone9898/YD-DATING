/*
 * 收集游戏
*/
cc.Class({
    extends: cc.Component,

    properties: {
        _roles:[],      //角色列表
        _boxes:[],      //箱子列表
        _lblNum:null,   //元宝数量
        _lblNum2:null,  //元宝数量
        _store:null,    //商店节点
        _progress:null,  //进度条节点
        _reduce:null,  //reduce动画
        _prize_x2:null,//翻倍动画
        _lack_ingot_tip:null,//元宝不足提示
        _islock:false,
        _idx:1,
        _processing:false,
        _reopen: false,
    },

    onLoad () {
        this._idx = cc.vv.gameData.getDragonIdx();
        //龙
        this.showRole(this._idx);
        // 宝箱
        this._progress = cc.find("safe_node/slots/collect_progress", this.node);
        this._progress.on("click", this.onClickShowStore.bind(this));
        //商店
        this._store = cc.find("safe_node/collect_game", this.node);
        // 元宝数
        this._lblNum = cc.find("bg/lbl_num", this._progress).getComponent(cc.Label);
        this._lblNum2 = cc.find("layout/money_bg/lbl_money", this._store).getComponent(cc.Label);
        this.refreshIngotNum();

        cc.vv.NetManager.registerMsg(MsgId.SLOT_SUBGAME_DATA, this.OnRecvMsgSubAction, this);
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,this.onEventTotalbetUpdated,this)
    },

    onDestroy(){
        cc.vv.NetManager.unregisterMsg(MsgId.SLOT_SUBGAME_DATA, this.OnRecvMsgSubAction, false, this);
    },

    start() {
        this.initStore();
        this.onEventTotalbetUpdated();
    },

    refreshIngotNum() {
        let num = cc.vv.gameData.getIngot();
        this._lblNum.string = Global.FormatNumToComma(num);
        this._lblNum2.string = Global.FormatNumToComma(num);
    },

    _isCdOk(node, cdTime) {
        cdTime = cdTime || 500;
        let t = new Date().getTime();
        if(!node.time || t - node.time >= cdTime) {
            let btn = node.getComponent(cc.Button)
            if(btn) {
                btn.interactable = false;
                btn.scheduleOnce(()=>{
                    btn.interactable = true;
                }, cdTime/1000);
            }
            node.time = t;
            return true;
        }
        return false;
    },

    initStore() {
        let btnClose = cc.find("layout/btn_close", this._store);
        btnClose.on("click", this.onBtnClose.bind(this));

        //左移
        let btnLeft = cc.find("layout/btn_left", this._store);
        btnLeft.on("click", ()=>{
            if(this._isCdOk(btnLeft)) {
                this.onBtnLeft();
            }
        });
        //右移
        let btnRight = cc.find("layout/btn_right", this._store);
        btnRight.on("click", ()=>{
            if(this._isCdOk(btnRight)) {
                this.onBtnRight();
            }
        });

        //箱子
        for (let i=1; i<=9; i++) {
            let box = cc.find("layout/box_bg/item"+i, this._store);
            box.on("click", this.onBtnBox.bind(this));
            this._boxes[i] = {
                node: box,
                icon: box.getChildByName("icon"),
                spine: box.getChildByName("spine"),
                moneybg: box.getChildByName("money_bg"),
                lblcoin: cc.find("lbl_wincoin", box).getComponent(cc.Label),
                lblprice: cc.find("money_bg/lbl_money", box).getComponent(cc.Label),
            };
        }

        this.refreshData();
    },

    onEventTotalbetUpdated() {
        let islock = cc.vv.gameData.GetBetIdx() < cc.vv.gameData.getUnlockIdx();
        if (islock!=this._islock) {
            this._islock = islock;
            if (islock) {
                this._progress.getChildByName("lock").getComponent(sp.Skeleton).setAnimation(0, "animation1", false);
                Global.TheLegendOfDragon.playEffect("base/lock");
            } else {
                this._progress.getChildByName("lock").getComponent(sp.Skeleton).setAnimation(0, "animation2", false);
                Global.TheLegendOfDragon.playEffect("base/unlock");
            }
        }
    },

    //道具掉落
    onDropItem(itemid, didx) {
        cc.vv.gameData.addItem(didx, itemid);

        let atlas_store = cc.vv.gameData.GetAtlasByName("coins_store");
        let atlas_base = cc.vv.gameData.GetAtlasByName("base");
        if (didx == this._idx) {
            let item = cc.find("layout/material_bg/item_"+itemid, this._store);
            if (item) {
                let material = item.getChildByName("material");
                material.active = true;
                material.getComponent(cc.Sprite).spriteFrame = atlas_store.getSpriteFrame("theme177_collect_material"+didx+"_"+itemid);
                item.getChildByName("text").active = true;
            }
        }

        let prompt = cc.find("safe_node/slots/collect_prompt", this.node);
        prompt.getComponent(cc.Sprite).spriteFrame = atlas_base.getSpriteFrame("theme177_collect_prompt_"+itemid);
        prompt.getChildByName("material").getComponent(cc.Sprite).spriteFrame = atlas_store.getSpriteFrame("theme177_collect_material"+didx+"_"+itemid);

        prompt.scale = 0.1;
        prompt.position = cc.v2(0, 0);
        prompt.active = true;
        cc.tween(prompt)
        .to(0.4, {scale:1}, {easing:"backInOut"})
        .delay(0.8)
        .to(0.05, {scale:1.05})
        .to(0.35, {scale:0, position:cc.v2(-220,280)})
        .start()
    },

    hide() {
        if (this._store.active == true) {
            this._store.active = false;
            cc.vv.gameData.GetBottomScript().ShowInputMask(false);
        }
    },

    onClickShowStore() {
        if (!cc.vv.gameData.GetBottomScript().GetSpinBtnState()) return;
        if (cc.vv.gameData.GetAutoModelTime()>0) return;
        if (cc.vv.gameData.GetFreeTime()>0) return;
        this.showStore();
    },

    showStore() {
        if (!this._islock) {
            this._store.active = true;
            this._processing = false;
            this._reopen = false;
            this.refreshData();

            let layout = this._store.getChildByName("layout");
            layout.stopAllActions();
            layout.scale = 0.5;
            layout.runAction(cc.scaleTo(0.25, 1));

            Global.TheLegendOfDragon.playEffect("shop/shop_show");
            cc.vv.gameData.GetBottomScript().ShowInputMask(true);
            cc.vv.gameData.GetBottomScript().ShowBtnsByState("moveing_1");
        } else {
            let unlockidx = cc.vv.gameData.getUnlockIdx();
            cc.vv.gameData.GetBottomScript().SetBetIdx(unlockidx);
        }
    },

    onBtnClose() {
        Global.TheLegendOfDragon.playEffect("shop/shop_close");
        if (this._processing) return;

        cc.vv.gameData.setDragonIdx(this._idx);
        this.showRole(this._idx);
        //同步服务端
        let req = {c: MsgId.SLOT_SUBGAME_DATA,
            gameid: cc.vv.gameData.getGameId(),
        };
        req.data = {rtype: 3,
            didx: this._idx
        };
        cc.vv.NetManager.send(req, true);

        this.hide();
        Global.TheLegendOfDragon.Slots.CanDoNextRound();
    },
    // 主界面显示的龙
    showRole(idx) {
        for (let i=1; i<=6; i++) {
            let role = cc.find("safe_node/roles/role"+i, this.node);
            role.active = (i==idx);
        }
    },

    //箱子动画
    //animation:打开 animation1:正常 anamation2:锁定 animation1_1:上锁 animation2_1:开锁
    setBoxAnim(box, state) {
        if (state == "null") {
            box.spine.active = false;
        } else {
            box.spine.active = true;
            let ske = box.spine.getComponent(sp.Skeleton);
            if (state == "unopen") {
                ske.setAnimation(0, "animation1", true);
            }else if (state == "opening") {
                ske.setAnimation(0, "animation", false);
            }else if (state == "locked") {
                ske.setAnimation(0, "animation2", false);
            }else if (state == "locking") {
                ske.setAnimation(0, "animation1_1", false);
            }else if (state == "unlocking") {
                ske.setAnimation(0, "animation2_1", false);
                ske.addAnimation(0, "animation1", true);
            }
        }
    },

    showBoxInfo(box, chest){
        box.icon.active = true;
        box.moneybg.active = false;
        let atlas = cc.vv.gameData.GetAtlasByName("coins_store");
        if (chest.tp == 1) {
            box.lblcoin.string = Global.convertNumToShort(chest.coin, 1000, 0);
            box.icon.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("theme177_collect_bg3");
        }else if (chest.tp == 2) {
            box.lblcoin.string = "";
            box.icon.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("theme177_collect_logo1");
        }else if (chest.tp == 3) {
            box.lblcoin.string = "";
            box.icon.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("theme177_collect_logo2");
        }
    },

    refreshData() {
        let data = cc.vv.gameData;
        let dragon = cc.vv.gameData.getDragon(this._idx);
        let atlas = cc.vv.gameData.GetAtlasByName("coins_store");
        //标题
        let title = cc.find("layout/title_bg/title", this._store);
        title.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("theme177_collect_name"+this._idx);
        //道具
        for (let i=1; i<=5; i++) {
            let item = cc.find("layout/material_bg/item_"+i, this._store);
            let has = data.hasItem(this._idx, i);
            let material = item.getChildByName("material");
            material.active = has;
            if (has) {
                material.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("theme177_collect_material"+this._idx+"_"+i);
            }
            item.color = has?cc.Color.WHITE:cc.color(96,96,96,255);
            item.getChildByName("text").color = has?cc.Color.WHITE:cc.color(96,96,96,255);
            
        }
        //等级
        let levelBg = cc.find("layout/level_bg", this._store);
        let lblLv = levelBg.getChildByName("lbl_lv").getComponent(cc.Label);
        lblLv.string = ""+dragon.lv;
        for (let i=1; i<=5; i++) {
            levelBg.getChildByName("lv"+i).active = (i<=dragon.lv);
        }
        //Avatar
        let characterBg = cc.find("layout/character_bg", this._store);
        for (let i=1; i<=6; i++) {
            let character = characterBg.getChildByName("spine"+i);
            character.active = (i==this._idx);
            if (i==this._idx) {
                cc.log("dragon", dragon, dragon.lock);
                character.color = dragon.lock==0?cc.Color.WHITE:cc.Color.GRAY;
                characterBg.getChildByName("lock").active = dragon.lock!=0;
            }
        }

        //page indicator
        for (let i=1; i<=6; i++) {
            cc.find("layout/choose_bg/choose"+i+"/choosed", this._store).active = (i==this._idx);
        }
        //箱子
        for (let i=1; i<=9; i++) {
            let chest = data.getChest(this._idx, i);
            let box = this._boxes[i];
            //0:未开启 1:金币 2:免费游戏 3:pick小游戏
             if (chest.tp == 0) {
                box.icon.active = false;
                box.moneybg.active = true;
                box.lblcoin.string = "";
                box.lblprice.string = Global.FormatNumToComma(chest.price);

                let price = chest.price
                if (data.hasItem(this._idx, 5)) price = price-200
                if (data.getIngot()>=price && !data.isChestLocked(this._idx, i)) {
                    this.setBoxAnim(box, "unopen");
                } else {
                    this.setBoxAnim(box, "locked");
                }
            }else {
                this.showBoxInfo(box, chest)
                this.setBoxAnim(box, "null");
            }
        }
        //等级锁
        let lock2 = cc.find("layout/lock_lv2", this._store);
        lock2.active = dragon.lv < 2;
        if (dragon.lv < 2) lock2.getComponent(sp.Skeleton).setAnimation(0, "animation1", false);
        let lock4 = cc.find("layout/lock_lv4", this._store);
        lock4.active = dragon.lv < 4;
        if (dragon.lv < 4) lock4.getComponent(sp.Skeleton).setAnimation(0, "animation2", false);
        
        //元宝数
        this.refreshIngotNum();
    },

    doExchangeAction(node, deltaX) {
        node.stopAllActions();
        node.x = 0;
        node.runAction(cc.sequence(cc.spawn(cc.fadeTo(0.15,63),cc.moveBy(0.15,deltaX,0)),
            cc.spawn(cc.fadeTo(0.15,255),cc.moveBy(0.15,-deltaX,0))));
    },

    refreshDataWithAction(deltaX) {
        this.scheduleOnce(()=>{
            this.refreshData();
        }, 0.15);
        this.doExchangeAction(cc.find("layout/title_bg", this._store), deltaX);
        this.doExchangeAction(cc.find("layout/character_bg", this._store), deltaX);
        this.doExchangeAction(cc.find("layout/box_bg", this._store), deltaX);
    },

    onBtnLeft() {
        Global.TheLegendOfDragon.playEffect("shop/shop_click");
        if (this._processing) return;
        this._idx = this._idx - 1;
        if (this._idx < 1) {
            this._idx = 6;
        }
        this.refreshDataWithAction(-20);
    },

    onBtnRight() {
        Global.TheLegendOfDragon.playEffect("shop/shop_click");
        if (this._processing) return;
        this._idx = this._idx + 1;
        if (this._idx > 6) {
            this._idx = 1;
        }
        this.refreshDataWithAction(20);
    },

    showLackIngot(node) {
        if (!this._lack_ingot_tip) {
            this._lack_ingot_tip = cc.find("layout/lack_ingot_tip", this._store);
        }

        this._lack_ingot_tip.active = true;
        this._lack_ingot_tip.stopAllActions();
        let wp = node.convertToWorldSpaceAR(cc.v2(0, 60));
        this._lack_ingot_tip.position = this._lack_ingot_tip.parent.convertToNodeSpaceAR(wp);
        this._lack_ingot_tip.scale = 0;
        this._lack_ingot_tip.runAction(cc.sequence(cc.scaleTo(0.5,1), cc.delayTime(2), cc.scaleTo(0.5,0)));
    },

    onBtnBox(event) {
        if (this._processing) return;
        for (let i=1; i<=9; i++) {
            if (event.node == this._boxes[i].node) {
                cc.log("buy box", this._idx, i);
                let data = cc.vv.gameData;
                let dragon = data.getDragon(this._idx);
                if (dragon.lock!=0) return;  //龙未解锁
                if (data.isChestLocked(this._idx, i)) return; //箱子未解锁
                let chest = data.getChest(this._idx, i);
                if (chest.tp != 0) return;  //已开启
                let price = chest.price
                if (data.hasItem(this._idx, 5)) price = price-200
                if (data.getIngot() < price) { //元宝不足
                    this.showLackIngot(event.node);
                    return;
                }
                let req = {c: MsgId.SLOT_SUBGAME_DATA,
                    gameid: cc.vv.gameData.getGameId(),
                };
                req.data = {rtype: 2,
                    didx: this._idx,
                    cidx: i,
                };
                cc.vv.NetManager.send(req);
                this._processing = true;
                break;
            }
        }
    },

    async Sleep(time) {
        return new Promise((resolve, reject) => {
            this.scheduleOnce(()=>{resolve()}, time);
        });
    },

    async showOpenBox(cidx, chest, dec_ingot, prize_x2) {
        let box = this._boxes[cidx];
        if (dec_ingot) {
            //显示折扣特效
            if (!this._reduce) {
                this._reduce = cc.find("layout/reduce", this._store);
            }
            this._reduce.active = true;
            let wp = box.node.convertToWorldSpaceAR(cc.v2(0, -40));
            this._reduce.position = this._reduce.parent.convertToNodeSpaceAR(wp);
            this._reduce.active = true;
            this._reduce.getComponent(sp.Skeleton).setAnimation(0, "animation", false);

            await this.Sleep(0.5);
            let price = box.lblprice.string;
            box.lblprice.string = Global.FormatNumToComma((parseInt(price)-200));
        }
        //播放开箱动画
        this.setBoxAnim(box, "opening");
        Global.TheLegendOfDragon.playEffect("shop/open");
        await this.Sleep(0.5);

        if (prize_x2) {
            //先显示原奖励
            let coin = chest.coin;
            chest.coin = Math.floor(coin/2);
            this.showBoxInfo(box, chest);

            await this.Sleep(1);
            // 显示翻倍特效
            if (!this._prize_x2) {
                this._prize_x2 = cc.find("layout/prize_x2", this._store);
            }
            this._prize_x2.active = true;
            let wp = box.node.convertToWorldSpaceAR(cc.v2(0, 0));
            this._prize_x2.position = this._prize_x2.parent.convertToNodeSpaceAR(wp);
            this._prize_x2.active = true;
            this._prize_x2.getComponent(sp.Skeleton).setAnimation(0, "animation1", false);

            //再显示翻倍后奖励
            chest.coin = coin;
        }

        await this.Sleep(0.5);
        this.showBoxInfo(box, chest);
        
    },

    async onMsgBuyBox(msg) {
        if (msg.spcode != 0) {
            this._processing = false;
            return;
        }
        
        let data = cc.vv.gameData;
        data.setDragonLv(msg.didx, msg.lv);
        if (msg.unlock_didx > 0) {
            data.unlockDragon(msg.unlock_didx);
        }

        //更新箱子
        data.updateChest(msg.didx, msg.cidx, msg.chest.tp, msg.chest.coin);
        data.setIngot(msg.num);
        // 是否重置
        if (msg.reset) {
            data.resetChests(msg.didx, msg.chests);
            data.resetItems(msg.didx, msg.items);
        }
        await this.showOpenBox(msg.cidx, msg.chest, msg.dec_ingot, msg.prize_x2);
        await this.Sleep(1);
        if (msg.reset) {
            Global.TheLegendOfDragon.playEffect("shop/level_up");
        }
        this.refreshData();

        if (msg.chest.tp == 1) {  //金币
            cc.vv.gameData.GetBottomScript().SetWin(msg.chest.coin);
            cc.vv.gameData.AddCoin(msg.chest.coin);
            cc.vv.gameData.GetTopScript().ShowCoin();
        } else if (msg.chest.tp == 2) {  //免费游戏
            this._reopen = true;
            let freeCnt = msg.free.cnt;
            cc.vv.gameData.SetFreeTime(freeCnt)
            cc.vv.gameData.SetTotalFree(freeCnt)
            //跳转到免费游戏
            Global.TheLegendOfDragon.Pop.showFreeStart(freeCnt, true, msg.free.inc_wild);
        } else if (msg.chest.tp == 3) {   //pick小游戏
            this._reopen = true;
            //跳转到pick游戏
            Global.TheLegendOfDragon.Pop.showPickStart(msg.pick);
        }
        
        this._processing = false;
    },

    OnRecvMsgSubAction:function(msg){
        if (msg.code == 200) {
            if (msg.data.rtype == 2) {  //购买宝箱
                this.onMsgBuyBox(msg.data);
            } else if (msg.data.rtype == 3) {  //选择神龙
                cc.log("choose dragon", msg.data.didx);
            }
        }

    },

});
