
cc.Class({
    extends: require("LMSlots_Reel_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    Init(idx,nCount,node){
        this._holderNode = cc.find("mask/holder",this.node)

        this._holderOrigPosY = this._holderNode.position.y

        this._super(idx,nCount,node);
    },

    //列停止
    OnReelSpinEnd:function(){
        this._reelState = []
        let slots = cc.vv.gameData.getBonusSlotsScript()
        slots.OnReelSpinEnd(this._reelIdx)

        //不能判断，停下来的列等于总共的列，因为有时候只旋转了3列
        //停下来的列以及等于最后一列旋转的列，
        //说明整个列已经停止
        let lastReelStopIdx = slots.GetLastStopReelIdx()
        cc.log(lastReelStopIdx)
        if(this._reelIdx == lastReelStopIdx){
            //所有列都停止了
            slots.OnSpinEnd()
        }
    },

    //已经准备开始停止了
    //即：开始设置结果，已经进入了停止周期，stoptime变负的那一刻
    //执行在回弹之前
    ReadyToStop:function(){
        if(!this._bNotifyReadyStop){
            this._bNotifyReadyStop = true
            let slots = cc.vv.gameData.getBonusSlotsScript()
            slots.OnReelReadyToStop(this._reelIdx)
        }
    },

    //列回弹动作之前
    OnReelBounsActionBefore:function(){
        let slots = cc.vv.gameData.getBonusSlotsScript()
        slots.OnReelBounsActionBefore(this._reelIdx)
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveBefore();
            }
        }

    },

    //回弹动作最低点
    OnReelBounsActionDeep:function(){
        this.ShowAntiEffect(false)
        this.playReelStop()
        let slots = cc.vv.gameData.getBonusSlotsScript()
        slots.OnReelBounsActionDeep(this._reelIdx)
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveDeep();
            }
        }

    },

    //列回弹动作完成之后
    OnReelBounsActionEnd:function(){
        let slots = cc.vv.gameData.getBonusSlotsScript()
        slots.OnReelBounsActionEnd(this._reelIdx)
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveEnd();
            }
        }
        else{
            cc.log('回弹结束，数据已经被清空了')
        }

        this.OnReelSpinEnd()
    },

    // update (dt) {},
});
