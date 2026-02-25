/**
 * Crash累计方式下注
 */
cc.Class({
    extends: cc.Component,

    properties: {
      _betlist:null  
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        this._betlist = [1,10,100,500]

        for(let i = 0; i < 4; i++){
            let item = cc.find("item"+(i+1),this.node)
            Global.btnClickEvent(item, this.onClickQuickItem, this)
            Global.setLabelString("val",item,Global.FormatNumToComma(this._betlist[i]))
        }
    },

    start () {

    },

    setUI(clickItemCall){
        this._clickItemCall = clickItemCall
    },

    onClickQuickItem(sender){
        Global.TableSoundMgr.playCommonEff("com_click")
        if(this._clickItemCall){
            let nodeName = sender.node.name
            let idx = nodeName.charAt(nodeName.length-1)
            let val = this._betlist[Number(idx)-1]

            this._clickItemCall(val)
        }
    }

    // update (dt) {},
});
