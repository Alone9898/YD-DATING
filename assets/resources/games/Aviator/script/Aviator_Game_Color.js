/**
 * 倍率颜色
 */
cc.Class({
    extends: cc.Component,

    properties: {
        blue:cc.SpriteFrame,
        pure:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    //nType:1 blue 2 pure
    setColor:function(nType){
        this.node.getComponent(cc.Sprite).spriteFrame = (nType==2)?this.pure:this.blue
    }

    // update (dt) {},
});
