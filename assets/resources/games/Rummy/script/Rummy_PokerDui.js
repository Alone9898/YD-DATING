/**
 * rummy 牌组
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    addPoker:function(node){
        let lay = cc.find("lay",this.node)
        node.parent = lay
        this.resetSize()
    },

    //尺寸刷新
    resetSize:function(){
        let laycmp = cc.find("lay",this.node).getComponent(cc.Layout)
        laycmp.updateLayout()
        this.node.width = laycmp.width
    },

    // update (dt) {},
});
