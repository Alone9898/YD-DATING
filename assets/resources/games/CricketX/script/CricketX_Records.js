/**
 * 游戏记录
 */
cc.Class({
    extends: cc.Component,

    properties: {
        _bExpand:false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_arrow = cc.find("bg/btn_arrow",this.node)
        Global.btnClickEvent(btn_arrow, this.onClickArrow, this)
    },

    start () {
        this.showRecords()
        this._showUIModel(this._bExpand)
    },

    onClickArrow:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        this._bExpand = !this._bExpand
        this._showUIModel(this._bExpand)
    },

    showRecords:function(bShowHint){
        let res = cc.vv.gameData.getGameRecords()
        let nTotal = res.length
        let nShowNum = 10
        for(let i = 0; i < nShowNum; i++){
            let data = res[nTotal-1-i]
            let item = cc.find("bg/lay/item"+(i+1),this.node)
            let lbl = cc.find("val",item)
            lbl.getComponent(cc.Label).string = data.toFixed(2)
            lbl.color = data>1.5?cc.Color.GREEN:cc.Color.BLUE
        }
    },

    _showUIModel:function(val){
        let bg = cc.find("bg",this.node)
        for(let i = 6; i<=10; i++){
            let item =cc.find("lay/item"+i,bg)
            item.active = val
        }
        bg.height = this._bExpand?700:460
        let arrow = cc.find("btn_arrow/dir",bg)
        arrow.scaleX = val?-2:2
    }

    // update (dt) {},
});
