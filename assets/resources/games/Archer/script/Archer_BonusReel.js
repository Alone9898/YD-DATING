
cc.Class({
    extends: require('LMSlots_Reel_Base'),

    properties: {
        _maxScale:0.7,//symbol最大倍数
        _type:1,    // 1 2 3
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    Init:function(idx,nCount,node){
        this._holderNode = cc.find("mask/holder",this.node);
        this._holderOrigPosY = this._holderNode.position.y;

        this._super(idx,nCount,node);
    },

    setType(slotIdx){
        this._type =slotIdx;
    },

    //创建一个符号元素
    CreateOneSymbol:function(){
        let node = cc.instantiate(this._symbolTemplete)
        node.parent = this._holderNode
        node.setScale(this._maxScale);
        let scp = node.addComponent(this._cfg.scripts.Symbols)
        let idx = this._symbols.length; //行号
        scp.SetSymbolReelIdx(this._reelIdx)
        scp.Init(idx,this._topAniNode, this._maxScale)
        scp.setType("bonus_"+this._type)

        this._symbols.push(scp)
    },


    //获取symbol的位置
    GetSymbolPosByRow:function(row){
        return cc.v2(0,(row+0.5)*this._cfg.symbolSize.height*this._maxScale)
    },

    //列停止
    OnReelSpinEnd:function(){
        this._reelState = []
        let slots = cc.vv.gameData.getBonusScript()
        slots.OnReelSpinEnd(this._reelIdx);

        //不能判断，停下来的列等于总共的列，因为有时候只旋转了3列
        //停下来的列以及等于最后一列旋转的列，
        //说明整个列已经停止
        let lastSlotStopIdx = slots.GetLastStopReelIdx().slots_idx
        let lastReelStopIdx = slots.GetLastStopReelIdx().reel_idx
        if(this._type == lastSlotStopIdx && this._reelIdx == lastReelStopIdx){
            //所有列都停止了
            slots.OnSpinEnd()
        }
        this.playBonusStopAnim();
    },

    OnReelBounsActionDeep(){
        // this.playReelStop()
        // let slots = cc.vv.gameData.getBonusScript()
        // slots.OnReelBounsActionDeep(this._reelIdx)
        if(this._originResult){
            for(let i = 0; i < this._originResult.length; i++){
                this._symbols[i].StopMoveDeep();
            }
        }
    },


    async playBonusStopAnim(){
        let bonusIds = cc.vv.gameData.getGameCfg().bonusIds;

        let item = this._symbols[0];
        let id = item.GetShowId();
        if(bonusIds.includes(id)){
            cc.vv.gameData.getBonusScript().setKuangAnim(false, this._type-1, this._reelIdx);

            let topNode = item.setAnimationToTop(true,true);
            await topNode.getComponent("Archer_Symbol").playBonusStopAnim();
            topNode.getComponent("Archer_Symbol").playBonusIdleAnim();
        }
    },

    // update (dt) {},
});
