/**
 * 代理新增
 */
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setInfo:function(val){
        Global.setLabelString("bg/top/val",this.node,val )
    }

    // update (dt) {},
});
