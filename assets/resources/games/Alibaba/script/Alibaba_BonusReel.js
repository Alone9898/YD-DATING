
cc.Class({
    extends: require('LMSlots_Reel_Base'),

    properties: {
        
    },

    Init(idx,nCount,node){
        this._holderNode = cc.find("mask/holder",this.node)
        this._holderOrigPosY = this._holderNode.position.y

        this._super(idx,nCount,node);
    },

    //创建整列的symbols
    LoadSymbols:function(){
        if(!this._symbolTemplete){
            this._symbolTemplete = cc.vv.gameData.GetPrefabByName("bonus_symbol");
            if(this._symbolTemplete){
                this._symbolTemplete.optimizationPolicy = cc.Prefab.OptimizationPolicy.MULTI_INSTANCE
            }
        }
        for(let i = 0; i < this._nCount+1; i++){
            this.CreateOneSymbol()
        }
        this.ReLayOut()

    },

    //初始化reel类型 (1表示topslots  2表示底部slots)
    initReelType(type){
        this._type = type;

        this._symbols.forEach(sym=>{
            sym.initSymbolType(type);
        })
    },

    //重写spin end
    OnReelSpinEnd(){
        this._reelState = []

        //不能判断，停下来的列等于总共的列，因为有时候只旋转了3列
        //停下来的列以及等于最后一列旋转的列，
        //说明整个列已经停止
        let symbol = this._symbols[0];
        if(symbol.GetShowId() === cc.vv.gameData.getGameCfg().bonusId && symbol.GetData().isGold){
            Global.SlotsSoundMgr.playEffect("diamondfall");
            symbol.playDiamondAnimation();
        }


        let data = cc.vv.gameData.getBonusGameMgr().GetLastStopSlotReel();
        let lastIdx = data.reelIdx;
        let slotsType = data.slotType;
        if(this._type === slotsType && this._reelIdx === lastIdx){
            cc.log(cc.js.formatStr("OnReelSpinEnd, %s, %s", slotsType, lastIdx));
            //所有列都停止了
            cc.vv.gameData.getBonusGameMgr().OnSpinEnd()
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
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveBefore();
            }
        }
    },

    //回弹动作最低点
    OnReelBounsActionDeep(){
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveDeep();
            }
        }

        this.playStopAnim();
    },

    // 播放停止动画
    playStopAnim(){
        let symbol = this._symbols[0];
        if(symbol.GetShowId() === cc.vv.gameData.getGameCfg().bonusId){
            let data = symbol.GetData();
            // symbol.playBonusStopAnimation();
        }

        let maxReelIdx = cc.vv.gameData.getBonusGameMgr().getMaxReelIdx(this._type, this._reelIdx%5);
        if(this._reelIdx === maxReelIdx){
            Global.SlotsSoundMgr.playEffect("reelstop");
        }
    },

    //列回弹动作完成之后
    OnReelBounsActionEnd(){
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
});
