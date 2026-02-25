/**
 * @author Cui Guoyang
 * @date 2021/8/30
 * @description
 */

cc.Class({
    extends: require("LMSlots_Reel_Base"),

    properties: {

    },

    //旋转
    StartMove:function(){
        this._super();
    },

    //列停止
    OnReelSpinEnd:function(){
        this._super();
    },

    playReelStop(){
        this._super();
    },

    AppendSymbol:function(symbolArray,dir){
        for(let i = 0; i < symbolArray.length; i++){
            let node = cc.instantiate(this._symbolTemplete)
            node.parent = this._holderNode
            let scp = node.addComponent(this._cfg.scripts.Symbols)
            scp.SetSymbolReelIdx(this._reelIdx)
            if(dir === 1){

                let idx = -1 - i; //行号
                node.position = this.GetSymbolPosByRow(idx)

                scp.Init(idx,this._topAniNode)

                this._symbols.unshift(scp)
            }
            else if(dir === 2){
                let idx = this._symbols.length-1; //插到倒数第二个，让最后一个一直往后拍
                scp.Init(idx,this._topAniNode)
                this._symbols.splice(idx,0,scp)
            }

            scp.ShowById(symbolArray[i].id, symbolArray[i].data);
        }

        if(dir === 2){ // 顶部添加，中间会有一个默认格子
            this.ReLayOut()
        }
    },

    deleteSymbol(index) {
        let symbol = this._symbols[index];
        this._symbols.splice(index, 1);
        symbol.setAnimationToTop(false);
        symbol.ShowKuang(false);
        symbol.node.destroy();
    },

    clearLastSymbol() {
        let symbol = this._symbols[this._symbols.length - 1];
        if (symbol) {
            symbol.setAnimationToTop(false);
            symbol.ShowKuang(false);
        }
    },
});