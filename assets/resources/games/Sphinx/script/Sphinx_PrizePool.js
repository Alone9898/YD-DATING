
let jackpotNames = ['MINI','MINOR','MAJOR','MAXI','GRAND']  //节点名称
cc.Class({
    extends: require("LMSlots_PrizePool_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {
    //
    // },

    InItPoolList(){
        this._super();

        for (let i = 0; i < this._poolList.length; i++){
            let item = this._poolList[i].node;

            cc.find("jp1", item).active = false;
            cc.find("jp2", item).active = false;
            cc.find("jp3", item).active = false;
            cc.find("jp4", item).active = false;
            cc.find("jp_suo", item).active = false;

            cc.find("tip",item).active = false;
            cc.find("tip/spr_lock",item).active = false;
            cc.find("tip/spr_unlock",item).active = false;
        }
    },

    //各个节点上的解锁/锁定表现
    ShowNodeLockByNode:function(node,bLock,unLockBet,poolType,bInit){
        // this.updataJackPoolLock(poolType,bLock);

        let targetJpNode = node
        let spine_lock = cc.find("jp_suo",targetJpNode)
        if(targetJpNode){
            this.showTipNode(bLock,poolType,bInit);

            let aniType = [5,4,3,2,1] //对应奖池的动画前缀类型
            let sprType = ["mini","minor","major","maxi","grand"];
            let fontSize = 25;
            let fontSizeList = [20,20,22,22,25];
            if(bLock){

                if(bInit){
                    spine_lock.active = false;
                } else {
                    Global.SlotsSoundMgr.playEffect("jp_lock");
                    spine_lock.active = true;
                    spine_lock.getComponent(sp.Skeleton).setAnimation(0,cc.js.formatStr("animation%s_%s",aniType[poolType],1),false)
                }
                this.showNodeState(targetJpNode,true, sprType[poolType], aniType[poolType],fontSizeList[poolType]);

                this.playJp4Anim(false, node);
            }
            else{
                if(bInit){
                    spine_lock.active = false;
                } else {
                    Global.SlotsSoundMgr.playEffect("jp_unlock");
                    spine_lock.active = true;
                    spine_lock.getComponent(sp.Skeleton).setAnimation(0,cc.js.formatStr("animation%s_%s",aniType[poolType],2),false)
                }
                this.showNodeState(targetJpNode,false, sprType[poolType],aniType[poolType],fontSize);

                this.playJp4Anim(true, node, poolType);
            }
        }
    },

    showTipNode(bLock,poolType,bInit){

        for (let i = 0; i < jackpotNames.length; i++){
            let tips = cc.find( cc.js.formatStr("prizePool_%s/tip",jackpotNames[i]), this.node);
            tips.active = true
            if(!bInit && poolType === i) {
                if (bLock) {
                    cc.find("spr_lock", tips).active = true
                    cc.find("spr_unlock", tips).active = false

                    tips.scale = 0
                    cc.tween(tips)
                        .to(0.5, {scale: 1}, {easing: "backOut"})
                        .delay(0.5)
                        .to(0.5, {scale: 0}, {easing: "backIn"}).start()
                } else {
                    cc.find("spr_lock", tips).active = false
                    cc.find("spr_unlock", tips).active = true
                    tips.scale = 0
                    cc.tween(tips)
                        .to(0.5, {scale: 1}, {easing: "backOut"})
                        .delay(0.5)
                        .to(0.5, {scale: 0}, {easing: "backIn"}).start()
                }
            }
            else {
                cc.find("spr_lock",tips).active = false;
                cc.find("spr_unlock",tips).active = false;
                tips.stopAllActions();
                tips.scale = 0
            }
        }
    },

    // 显示节点状态
    showNodeState(node, isLock, name,type, fontSize){

        let atlas_base = cc.vv.gameData.GetAtlasByName("baseImg");

        if(isLock){
            node.getComponent(cc.Sprite).spriteFrame = atlas_base.getSpriteFrame(cc.js.formatStr("jp_%s_1",name));
            cc.find("lbl_num", node).getComponent(cc.Label).font = cc.vv.gameData.GetFontByName("theme227_base_jp0");
            cc.find("lbl_num", node).position = cc.find("pos_jp0",node).position;
        } else {
            node.getComponent(cc.Sprite).spriteFrame = atlas_base.getSpriteFrame(cc.js.formatStr("jp_%s",name));
            cc.find("lbl_num", node).getComponent(cc.Label).font = cc.vv.gameData.GetFontByName(cc.js.formatStr("theme227_base_jp%s",type));
            cc.find("lbl_num", node).position = cc.v2(0,-14);
        }
        cc.find("lbl_num", node).getComponent(cc.Label).fontSize = fontSize;
    },

    // 奖池增长 -已经先暂停
    //pauseDatas:[{prizeType:val,pauseNum:val}...]
    //singleTme 单个增长的时间
    async increaseJackpot(pauseDatas, singleTime, creTime, mult){
        this._poolList = this.node.getComponentsInChildren("LMSlotMachine_PrizePool");

        for (let p_Idx = 0; p_Idx < this._poolList.length; p_Idx++){
            let poolNode = this._poolList[p_Idx].node;

            if(poolNode.active){
                let poolLbl = this._poolList[p_Idx].getJackpotLabel();
                let poolType = this._poolList[p_Idx].GetPoolType();
                for (let d_Idx = 0; d_Idx < pauseDatas.length; d_Idx++){
                    if(poolType == pauseDatas[d_Idx].prizeType){
                        if(poolLbl){
                            Global.doRoallNumEff(poolLbl,0,pauseDatas[d_Idx].pauseNum * mult, singleTime,null,null,0,true);
                            this.playJp3Anim(poolNode,d_Idx);
                            await cc.vv.gameData.awaitTime(creTime);
                        }
                        break;
                    }
                }
            }
        }
    },

    playJp1Anim(idx, bPlay){
        let aniType = [5,4,3,2,1] //对应奖池的动画前缀类型

        let poolNode = cc.find(cc.js.formatStr("prizePool_%s",jackpotNames[idx]),this.node);
        let jp1 = cc.find("jp1", poolNode);
        if(jp1){
            if(bPlay){
                jp1.active = true;
                let animName = cc.js.formatStr("animation%s", aniType[idx]);
                jp1.getComponent(sp.Skeleton).setAnimation(0, animName, true);
            }else {
                jp1.active = false;
            }
        }
    },

    playJp2Anim(node, idx){
        let aniType = [5,4,3,2,1] //对应奖池的动画前缀类型

        let jp2 = cc.find("jp2", node);
        if(jp2){
            jp2.active = true;
            let animName = cc.js.formatStr("animation%s", aniType[idx]);
            jp2.getComponent(sp.Skeleton).setAnimation(0, animName, false);
            jp2.getComponent(sp.Skeleton).setCompleteListener(()=>{
                jp2.active = false;
            })
        }
    },

    playJp3Anim(node, idx){
        let aniType = [5,4,3,2,1] //对应奖池的动画前缀类型

        let jp3 = cc.find("jp3", node);
        if(jp3){
            jp3.active = true;
            let animName = cc.js.formatStr("animation%s", aniType[idx]);
            jp3.getComponent(sp.Skeleton).setAnimation(0, animName, false);
            jp3.getComponent(sp.Skeleton).setCompleteListener(()=>{
                jp3.active = false;
            })
        }
    },

    playJp4Anim(bPlay, node, idx){
        let aniType = [5,4,3,2,1] //对应奖池的动画前缀类型

        let jp4 = cc.find("jp4", node);
        if(jp4){
            if(bPlay){
                jp4.active = true;
                let animName = cc.js.formatStr("animation%s", aniType[idx]);
                jp4.getComponent(sp.Skeleton).setAnimation(0, animName, true);
            }
            else {
                jp4.active = false;
            }
        }
    },

    async showJackpot(bShow, idx, init){
        let poolNode = cc.find(cc.js.formatStr("prizePool_%s",jackpotNames[idx]),this.node);
        if(poolNode){
            if(!init){
                this.playJp2Anim(poolNode, idx);
                await cc.vv.gameData.awaitTime(0.5)
            }
            poolNode.active = bShow;
        }
    },

    //  bonus游戏赢得奖池动画
    // showWinJp(idx, bShow){
    //
    //     let spNode = cc.find(cc.js.formatStr("prizePool_%s/spine_win",jackpotNames[idx-1]),this.node);
    //     spNode.active = bShow;
    // },

    getPoolBLock(idx){
        let poolNode = cc.find(cc.js.formatStr("prizePool_%s",jackpotNames[idx]),this.node);
        let isLock = poolNode.getComponent("LMSlotMachine_PrizePool").isLocked();
        return isLock;
    },

    // update (dt) {},
});
