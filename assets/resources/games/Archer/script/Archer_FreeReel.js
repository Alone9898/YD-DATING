
cc.Class({
    extends: require("LMSlots_Reel_Base"),

    properties: {
        _isBig:false,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    Init(idx,nCount,node, isBig){
        this._holderNode = cc.find("mask/holder",this.node);
        this._holderOrigPosY = this._holderNode.position.y;

        this._isBig = isBig;
        this._super(idx,nCount,node);
    },


    //创建整列的symbols
    LoadSymbols:function(){
        let url =this._isBig ? this._cfg.bigSymbolPrefab : this._cfg.symbolPrefab

        if(!this._symbolTemplete){
            this._symbolTemplete = cc.vv.gameData.GetPrefabByName(url)
            if(this._symbolTemplete){
                this._symbolTemplete.optimizationPolicy = cc.Prefab.OptimizationPolicy.MULTI_INSTANCE
            }
        }
        for(let i = 0; i < this._nCount+1; i++){
            this.CreateOneSymbol()
        }
        this.ReLayOut()

    },

    //获取symbol的位置
    GetSymbolPosByRow:function(row){
        return cc.v2(0,(row+0.5)*this._cfg.symbolSize.height * (this._isBig?3:1))
    },

    //旋转
    StartMove:function(){
        this._super();

        this._offset = this._cfg.symbolSize.height * (this._isBig?3:1)
    },

    //列停止
    OnReelSpinEnd:function(){
        this._reelState = []
        let slots = cc.vv.gameData.GetSlotsScript()
        slots.OnReelSpinEnd(this._reelIdx)

        //不能判断，停下来的列等于总共的列，因为有时候只旋转了3列
        //停下来的列以及等于最后一列旋转的列，
        //说明整个列已经停止
        let lastReelStopIdx = slots.GetLastStopReelIdx()
        if(this._reelIdx == lastReelStopIdx){
            //所有列都停止了
            cc.vv.gameData.getManageScript().OnSpinEnd()
        }
    },

    playReelStop(){
        let stopEff = "music_MagicLady_reelstop";
        for (let i = 0; i < this._symbols.length; i++){
            let item = this._symbols[i];
            if(item.GetShowId() == 2){
                item.playStopAnimation();
                stopEff = "music_MagicLady_buling";
            }
        }

        Global.SlotsSoundMgr.playEffect(stopEff);
    },

    // update (dt) {},
});
