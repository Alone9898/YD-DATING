/**
 * 底部信息区域
 */
cc.Class({
    extends: require("Table_Bottom_Base"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    // update (dt) {},

    showMyInfo(){
        
        this.showCoin()
    },
    showCoin:function(){
        let val = cc.vv.gameData.getMyCoin()
        Global.setLabelString("val",this.node,Global.FormatNumToComma(val.toFixed(2)))
    }
});
