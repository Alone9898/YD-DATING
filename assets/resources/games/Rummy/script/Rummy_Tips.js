/**
 * 提示框
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_close = cc.find("ui/btn_close",this.node)
        Global.btnClickEvent(btn_close,this.onClickClose,this)

        let btn_sure = cc.find("ui/btn_sure",this.node)
        Global.btnClickEvent(btn_sure,this.onClickSure,this)
    },

    start () {

    },

    setInfo:function(type,tips,sureCall,cancelCall){
        let title_show = cc.find("ui/show",this.node)
        title_show.active = (type == 1)
        let title_drop = cc.find("ui/drop",this.node)
        title_drop.active = (type == 2)
        Global.setLabelString("ui/lbl_tip",this.node,tips)
        this._sureCall = sureCall
        this._cancelCall = cancelCall
    },

    onClickClose:function(){
        Global.TableSoundMgr.playEffect("click")
        if(this._cancelCall){
            this._cancelCall()
        }
        this.node.destroy()
    },

    onClickSure:function(){
        Global.TableSoundMgr.playEffect("click")
        if(this._sureCall){
            this._sureCall()
        }
        this.node.destroy()
    },

    // update (dt) {},
});
