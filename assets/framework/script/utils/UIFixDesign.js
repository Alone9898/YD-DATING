/**
 * 
 */
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.FixDesignScale_V(this.node,true)
    },

    // start () {

    // },

    // update (dt) {},
});
