/**
 * 历史记录
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn_close = cc.find("bg",this.node)
        Global.btnClickEvent(btn_close,this.onClickClose,this)
    },

    start () {

    },

    setInfo:function(info){
        //orderid
        Global.setLabelString("ui/node_order/val",this.node,info.i)
        //time
        Global.setLabelString("ui/node_time/val",this.node,Global.getTimeStr(info.t))

        //gameresult
        this.showGameResult(JSON.parse(info.result))

        //gametype
        this.showGameType(JSON.parse(info.result))
    },

    onClickClose:function(){
        this.node.destroy()
    },

    showGameResult:function(result){

    },

    showGameType:function(result){

    },

    // update (dt) {},
});
