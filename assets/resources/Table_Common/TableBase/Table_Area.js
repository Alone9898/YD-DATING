/**
 *方位定义
 */

cc.Class({
    extends: cc.Component,

    properties: {
        idx:{
            default:-1,
            type:cc.Integer,
            tooltip:"方位定义",
        },
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.btnClickEvent(this.node,this.onClickArea,this)
    },

    start () {

    },

    //点击押注方位
    onClickArea:function(){
        Global.TableSoundMgr.playCommonEff("com_click")
        Global.dispatchEvent("bet_area",this.idx)
    },

    //下注方位是否可以点击
    setAeranEnable:function(val){
        this.node.getComponent(cc.Button).interactable = val
    }

    // update (dt) {},
});
