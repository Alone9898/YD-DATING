/**
 * 底部信息区域
 */
cc.Class({
    extends: require("Table_Bottom_Base"),

    properties: {
        
    },

    showMyInfo(){
        
        this.showCoin()
    },
    showCoin:function(){
        let val = cc.vv.gameData.getMyCoin()
        Global.setLabelString("lbl_coin",this.node,Global.FormatNumToComma(val.toFixed(2)))
    }
});
