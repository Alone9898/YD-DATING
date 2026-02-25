
cc.Class({
    extends: cc.Component,

    properties: {
        _isLockState:true,  // 收集条状态
        // _itemList:[],   // 节点列表
    },

    // LIFE-CYCLE CALLBACKS:

    init() {
        this._showNode = cc.find("showNode", this.node);
        this._normalSpr = cc.find("collect1", this._showNode);
        this._lockedSpr = cc.find("collect1_locked", this._showNode);

        this._lockSp = cc.find("314_jdp_suo", this._showNode).getComponent(sp.Skeleton);
        this._winSp = cc.find("314_jdp_win", this._showNode).getComponent(sp.Skeleton);
        this._qpSp = cc.find("314_jdp_qp", this.node).getComponent(sp.Skeleton);
        this._tip = cc.find("base_tip1", this.node);

        this._qpSp.active = false;
        this._winSp.active = false;
        this._tip.active = false;

        this.initCollectState();
        this.initItems();

        Global.btnClickEvent(cc.find("btn", this.node), this.onClickCollectBtn, this);
        Global.registerEvent(cc.vv.gameData._EventId.SLOT_TOTALBET_UPDATED,this.onEventTotalbetUpdated,this)// 押注额改变
    },

    start () {

    },

    // 初始收集条显示
    initCollectState(){
        let curBet = cc.vv.gameData.GetBetIdx();
        let minBet = cc.vv.gameData.GetCollectMinBet();

        if(curBet < minBet){    // 锁住
            this._isLockState = true;

            this._normalSpr.active = false;
            this._lockedSpr.active = true;
            this._lockSp.node.active = true;
            this._lockSp.setAnimation(0,"animation1",true);
        }else {
            this._isLockState = false;
            this._normalSpr.active = true;
            this._lockedSpr.active = false;
            this._lockSp.node.active = false;
        }
    },

    // 初始化图标
    initItems(cnt){
        let superFree = cc.vv.gameData.GetSuperFree();
        if(cnt == 0){
            superFree.count = cnt;
        }
        let curCnt = superFree.count;

        for(let i = 1; i <= 8; i++){
            let item = cc.find("items/item"+i, this._showNode);
            item.active = i <= curCnt;
            item.getComponent(sp.Skeleton).setAnimation(0,"aniameion1",true);
            // this._itemList.push(item);
        }
    },

    // 加一个图标
    async addOneItem(){
        let superFree = cc.vv.gameData.GetSuperFree();
        let curCnt = superFree.count;
        let item = cc.find("items/item"+curCnt, this._showNode);

        if(item && !item.active){
            item.active = true;

            item.getComponent(sp.Skeleton).setAnimation(0,"aniameion2",false);
            item.getComponent(sp.Skeleton).addAnimation(0,"aniameion1",true);
        }
    },

    // 集满后动画
    playFullAnim(bPlay){
        if(bPlay){
            this._winSp.node.active = true;
            this._winSp.setAnimation(0,"animation",false);
            this._winSp.setCompleteListener(()=>{
                this._winSp.setCompleteListener(null);
                this._winSp.node.active = false;
                this.setCollectState(false, true);
            })
        }else {
            this._winSp.node.active = false;
        }
    },

    // 押注额改变
    onEventTotalbetUpdated(){
        let curBet = cc.vv.gameData.GetBetIdx();
        let minBet = cc.vv.gameData.GetCollectMinBet();

        if(!this._isLockState && curBet < minBet) {    // 上锁
            Global.SlotsSoundMgr.playEffect("map_lock");
            this._isLockState = true;

            this._normalSpr.active = false;
            this._lockedSpr.active = true;
            this._lockSp.node.active = true;
            this._lockSp.setAnimation(0,"animation2",false);
            this._lockSp.addAnimation(0,"animation1",true);

            this.showTips(false);
        }
        else if(this._isLockState && curBet >= minBet){ // 解锁
            Global.SlotsSoundMgr.playEffect("map_unlock");
            this._isLockState = false;

            this._isLockState = false;
            this._normalSpr.active = true;
            this._lockedSpr.active = false;
            this._lockSp.setAnimation(0,"animation3",false);

            this.showTips(true);
        }
    },

    showTips(bShow){
        if(bShow){
            Global.SlotsSoundMgr.playEffect("tips_pop");
            this._tip.active = true;
            this._tip.scale = 0;
            this._tip.stopAllActions();
            cc.tween(this._tip)
                .to(0.3, {scale:1})
                .delay(2)
                .call(()=>{
                    Global.SlotsSoundMgr.playEffect("tips_withdraw");
                })
                .to(0.3, {scale:0})
                .start()
        } else {
            Global.SlotsSoundMgr.playEffect("tips_withdraw");
            this._tip.active = false;
            this._tip.stopAllActions();
            cc.tween(this._tip)
                .to(0.3, {scale:0})
                .start()
        }

    },



    // 点击进度条
    onClickCollectBtn(){
        if (!cc.vv.gameData.GetBottomScript().GetSpinBtnState()) return;
        if (cc.vv.gameData.GetAutoModelTime() > 0) return;
        if(!this._showNode.active) return;

        if (this._isLockState){
            let minBet = cc.vv.gameData.GetCollectMinBet();
            let allMults = cc.vv.gameData.GetBetMults();

            if(minBet > allMults.length){
            }else {
                cc.vv.gameData.GetBottomScript().SetBetIdx(minBet)
            }
        }
    },

    // 设置收集条状态
    setCollectState(bShow, bPlay){
        this._showNode.stopAllActions();
        if(bPlay) {
            if(bShow){
                this._showNode.opacity = 0;
                this._showNode.active = true;
                cc.tween(this._showNode)
                    .to(0.5,{opacity:255})
                    .start()
            } else {
                cc.tween(this._showNode)
                    .to(0.5,{opacity:0})
                    .call(()=>{
                        this._showNode.active = false;
                    })
                    .start()
            }

            this._qpSp.node.active = true;
            this._qpSp.setAnimation(0,"animation",false);
            this._qpSp.setCompleteListener(()=>{
                this._qpSp.setCompleteListener(null);
                this._qpSp.active = false;
            })
        } else {
            this._showNode.active = bShow;
            this._showNode.opacity = 255;
            this._qpSp.active = false;
        }
    },

});
