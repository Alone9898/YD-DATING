// jp相关配置
let JpCfg =  {
    "0":{
        nodeName:"prizePool_Mini",  // 节点名称
        lockAni:"animation4",       // 枷锁动画
        unlockAni:"animation4",   // 解锁动画
        iconIndex:0,    // 提示中的图标下标
        weight:0,       // 权重
        upY:-38,        // 显示收集图标的y位置
        downY:-60,      // 初始y
    },
    "1":{
        nodeName:"prizePool_Minor",
        lockAni:"animation3",
        unlockAni:"animation3",
        iconIndex:1,
        weight:1,
        upY:-38,
        downY:-60,
    },
    "2":{
        nodeName:"prizePool_Major",
        lockAni:"animation2",
        unlockAni:"animation2",
        iconIndex:2,
        weight:2,
        upY:-38,
        downY:-60,
    },
    "3":{
        nodeName:"prizePool_Grand",
        lockAni:"animation1",
        unlockAni:"animation1",
        iconIndex:3,
        weight:4,
        upY:53,
        downY:9,
    }
};

cc.Class({
    extends: require("LMSlots_PrizePool_Base"),

    properties: {
        unlockTip: cc.Node,
    },


    /**
     * @override
     * @param {*} node
     * @param {*} bLock
     * @param {*} unLockBet
     * @param {*} poolType
     * @param {*} bInit
     */
    ShowNodeLockByNode: function (node, bLock, unLockBet, poolType, bInit) {
        if (!JpCfg[poolType + ""]) {
            return;
        }
        let param = {
            poolIdx: poolType,
            val: bLock
        };
        this.processTips(param);
    },

    processTips(data) {
        // this.showJackPotTips(data.poolIdx, data.val);
        let aniCfg = JpCfg[data.poolIdx + ""];
        let jpNodeName = aniCfg.nodeName;
        if (jpNodeName) {
            let targetJpNode = cc.find(jpNodeName, this.node)
            if (targetJpNode) {
                let lockSp = cc.find("sp/314_jp_lock", targetJpNode).getComponent(sp.Skeleton);
                let unlockSp = cc.find("sp/314_jp_unlock", targetJpNode).getComponent(sp.Skeleton);
                if (data.val) {
                    //锁
                    targetJpNode.isLock = true;
                    Global.SlotsSoundMgr.stopEffectByName("jp_lock");
                    Global.SlotsSoundMgr.playEffect("jp_lock");
                    lockSp.node.active = true;
                    lockSp.setAnimation(0, aniCfg.lockAni, false);
                    lockSp.setCompleteListener(() => {
                        lockSp.setCompleteListener(null);
                        lockSp.node.active = false;
                    })
                    this.scheduleOnce(() => {
                        targetJpNode.getChildByName("bg").color = cc.Color.GRAY;
                        targetJpNode.getChildByName("lbl_num").color = cc.Color.GRAY;
                    }, 0.4);
                } else {
                    // 解锁
                    targetJpNode.isLock = false;
                    Global.SlotsSoundMgr.stopEffectByName("jp_unlock");
                    Global.SlotsSoundMgr.playEffect("jp_unlock");
                    unlockSp.node.active = true;
                    unlockSp.setAnimation(0, aniCfg.unlockAni, false);
                    unlockSp.setCompleteListener(() => {
                        unlockSp.setCompleteListener(null);
                        unlockSp.node.active = false;
                    })
                    this.scheduleOnce(() => {
                        targetJpNode.getChildByName("bg").color = cc.Color.WHITE;
                        targetJpNode.getChildByName("lbl_num").color = cc.Color.WHITE;
                    }, 0.4);
                }
            }
        }
    },

    showJackPotTips(jpId, isLock) {
        let weight = JpCfg[jpId + ""].weight;
        if (isLock) {
            if (this._nowJpLockWeight < weight) {
                return;
            }
            this._nowJpLockWeight = weight;
        } else {
            if (this._nowJpUnlockWeight > weight) {
                return;
            }
            this._nowJpUnlockWeight = weight;
        }
        let aniCfg = JpCfg[jpId + ""];
        let jpNodeName = aniCfg.nodeName;
        let targetJpNode = cc.find(jpNodeName, this.node)
        if (targetJpNode) {
            let tips_uncloked = this.unlockTip;
            tips_uncloked.stopAllActions();
            tips_uncloked.active = false;
            tips_uncloked.getChildByName("icon").getComponent("ImgSwitchCmp").setIndex(aniCfg.iconIndex);
            let ePos = tips_uncloked.parent.convertToNodeSpaceAR(cc.vv.gameData.GetBottomScript()._lbl_total_bet.convertToWorldSpaceAR(cc.v2(0, 0)));
            tips_uncloked.position = cc.v2(ePos.x, ePos.y + 100);

            if (isLock) {
            } else {
                this._nowJpLockWeight = this._nowJpUnlockWeight + 1;
                tips_uncloked.scale = 0;
                tips_uncloked.active = true;
                cc.tween(tips_uncloked)
                    .to(0.4, {scale: 1}, {easing: "backOut"})
                    .delay(2)
                    .to(0.2, {scale: 0})
                    .call(() => {
                        tips_uncloked.active = false;
                    })
                    .start();
            }
        }
    },

    init(){
        this.showJpCollect(false);
        this.showPickItems(false);
        this.playCollectWin(0,false);
        this.playCollectWin(1,false);
        this.playCollectWin(2,false);
        this.playCollectWin(3,false);
    },

    showJpCollect(bShow) {
        for (let i = 0; i < 4; i++) {
            let poolNode = cc.find(JpCfg[i + ""].nodeName, this.node);
            poolNode.stopAllActions();
            if (bShow) {
                cc.tween(poolNode)
                    .to(0.5, {y: JpCfg[i + ""].upY})
                    .start()
            } else {
                cc.tween(poolNode)
                    .to(0.5, {y: JpCfg[i + ""].downY})
                    .start()
            }
        }
    },

    showPickItems(bShow, data = [0,0,0,0]){
        for (let i = 0; i < 4; i++){
            cc.find(`${JpCfg[i + ""].nodeName}/pick`, this.node).active = bShow;

            if(bShow){
                this.initCollectCnt(i, data[i]);
            } else {
                this.initCollectCnt(i, 0);
            }
        }
    },

    initCollectCnt(jpIdx, cnt) {
        let poolNode = cc.find(JpCfg[jpIdx + ""].nodeName, this.node);
        // cc.find("item1/light", poolNode).active = cnt>=1;
        // cc.find("item2/light", poolNode).active = cnt>=2;
        // cc.find("item3/light", poolNode).active = cnt>=3;

        cc.find("pick/item1/314_jp_jd", poolNode).active = cnt>=1;
        cc.find("pick/item1/314_jp_jd", poolNode).getComponent(sp.Skeleton).setAnimation(0, `animation${4-jpIdx}_1`,true);
        cc.find("pick/item2/314_jp_jd", poolNode).active = cnt>=2;
        cc.find("pick/item2/314_jp_jd", poolNode).getComponent(sp.Skeleton).setAnimation(0, `animation${4-jpIdx}_1`,true);
        cc.find("pick/item3/314_jp_jd", poolNode).active = cnt>=3;
        cc.find("pick/item3/314_jp_jd", poolNode).getComponent(sp.Skeleton).setAnimation(0, `animation${4-jpIdx}_1`,true);

        cc.find("pick/item3/314_jp_jdjl01", poolNode).active = cnt==2;
        if(cnt == 2){
            // cc.find("pick/item3/314_jp_jdjl01", poolNode).getComponent(sp.Skeleton).setAnimation(0, `animation${jpIdx+1}`,true);
        }
    },

    addACollectCnt(jpIdx, cnt) {
        let poolNode = cc.find(JpCfg[jpIdx + ""].nodeName, this.node);
        if(cnt == 1){
            let sp1 = cc.find("pick/item1/314_jp_jd", poolNode).getComponent(sp.Skeleton);
            sp1.node.active = true;
            sp1.setAnimation(0, `animation${4-jpIdx}`,false);
            sp1.addAnimation(0,`animation${4-jpIdx}_1`,true);
        } else if(cnt == 2){
            let sp2 = cc.find("pick/item2/314_jp_jd", poolNode).getComponent(sp.Skeleton);
            sp2.node.active = true;
            sp2.setAnimation(0, `animation${4-jpIdx}`,false);
            sp2.addAnimation(0,`animation${4-jpIdx}_1`,true);
            cc.find("pick/item3/314_jp_jdjl01", poolNode).active = true;
            // cc.find("pick/item3/314_jp_jdjl01", poolNode).getComponent(sp.Skeleton).setAnimation(0, `animation${jpIdx+1}`,true);
        } else if(cnt == 3){
            let sp3 = cc.find("pick/item3/314_jp_jd", poolNode).getComponent(sp.Skeleton);
            sp3.node.active = true;
            sp3.setAnimation(0, `animation${4-jpIdx}`,false);
            sp3.addAnimation(0,`animation${4-jpIdx}_1`,true);
            cc.find("pick/item3/314_jp_jdjl01", poolNode).active = false;
        }
    },

    playCollectWin(jpIdx, bPlay){
        let poolNode = cc.find(JpCfg[jpIdx + ""].nodeName, this.node);
        if(bPlay){
            cc.find("sp/314_jp_win", poolNode).active = true;
            cc.find("sp/314_jp_win", poolNode).getComponent(sp.Skeleton).setAnimation(0, `animation${4-jpIdx}`,true);
        } else {
            cc.find("sp/314_jp_win", poolNode).active = false;
        }
    },

});
