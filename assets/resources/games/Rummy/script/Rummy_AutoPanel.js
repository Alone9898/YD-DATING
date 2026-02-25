/**
 * 自动面板
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
        Global.btnClickEvent(this.node,this.onClickAuto,this)
    },

    start () {

    },

    onClickAuto:function(){

        cc.vv.NetManager.send({c:MsgId.YD_RUMMY_AUTO_CANCEL})
        this.node.active = false
        Global.dispatchEvent("show_auto",false)
    }

    // update (dt) {},
});
