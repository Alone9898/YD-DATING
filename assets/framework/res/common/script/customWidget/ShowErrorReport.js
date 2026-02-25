/**
 * 错误显示
 */

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.FixDesignScale_V(this.node)
        
        let btn_close = cc.find('ui_bg/btn_close',this.node)
        btn_close.on("click",this.onClickClose,this)
    },

    start () {

    },

    setMsg:function(str){
        let lbl = cc.find('ui_bg/lbl_content',this.node)
        lbl.getComponent(cc.Label).string = str
    },

    onClickClose:function(){
        this.node.destroy()
    }

    // update (dt) {},
});
