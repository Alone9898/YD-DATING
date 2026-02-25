
cc.Class({
    extends: require('LMSlots_Reel_Base'),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    Init(idx,nCount,node){
        this._holderNode = cc.find("mask/holder",this.node)
        this._holderOrigPosY = this._holderNode.position.y

        this._super(idx,nCount,node);
    },

    //重写spin end
    OnReelSpinEnd(){
        this._reelState = []

        //不能判断，停下来的列等于总共的列，因为有时候只旋转了3列
        //停下来的列以及等于最后一列旋转的列，
        //说明整个列已经停止
        let lastIdx = krakenMgr.bonusMgr.GetLastStopReelIdx();
        if(this._reelIdx == lastIdx){
            // cc.log(cc.js.formatStr("OnReelSpinEnd, %s", lastIdx));
            //所有列都停止了
            krakenMgr.bonusMgr.OnSpinEnd()
        }

        let symbol = this._symbols[0];
        if(symbol.GetShowId() === 3 || symbol.GetShowId() === 4){
            krakenMgr.bonusMgr.addOneTotalCnt();
            symbol.setBonusToTop();
        }
    },

    //已经准备开始停止了
    //即：开始设置结果，已经进入了停止周期，stoptime变负的那一刻
    //执行在回弹之前
    ReadyToStop(){
        if(!this._bNotifyReadyStop) {
            this._bNotifyReadyStop = true
            // let slots = cc.vv.gameData.GetSlotsScript()
            // slots.OnReelReadyToStop(this._reelIdx)
        }
    },

    //列回弹动作之前
    OnReelBounsActionBefore(){
        // let slots = cc.vv.gameData.GetSlotsScript()
        // slots.OnReelBounsActionBefore(this._reelIdx)
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveBefore();
            }
        }
    },

    //回弹动作最低点
    OnReelBounsActionDeep(){
        // this.ShowAntiEffect(false)
        // this.playReelStop()
        // let slots = cc.vv.gameData.GetSlotsScript()
        // slots.OnReelBounsActionDeep(this._reelIdx)
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveDeep();
            }
        }

        // cc.vv.gameData.getBonusGameMgr().OnReelBounsActionDeep(this._reelIdx, this._type);

        this.playStopAnim();
    },

    // 播放停止动画
    playStopAnim(){
        let symbol = this._symbols[0];
        if(symbol.GetShowId() === 3 || symbol.GetShowId() === 4){
            symbol.playStopAnimation();
            Global.SlotsSoundMgr.playEffect("bonus_land1");
        }

        let maxReelIdx = krakenMgr.bonusMgr.getLastStopReel();
        if(this._reelIdx == maxReelIdx[this._reelIdx%5]){
            Global.SlotsSoundMgr.playEffect("reel_stop");
        }
    },

    //列回弹动作完成之后
    OnReelBounsActionEnd() {
        // let slots = cc.vv.gameData.GetSlotsScript()
        // slots.OnReelBounsActionEnd(this._reelIdx)
        if (this._originResult) {
            for (let i = 0; i < this._originResult.length; i++) {
                this._symbols[i].StopMoveEnd();
            }
        } else {
            cc.log('回弹结束，数据已经被清空了')
        }

        this.OnReelSpinEnd();
    },



    // update (dt) {},
});
