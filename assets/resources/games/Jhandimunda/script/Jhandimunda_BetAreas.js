
cc.Class({
    extends: require("Table_BetAreas_Base"),

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    setAreaMyBet(areaNode, val) {
        let node_mybet = cc.find("mybet", areaNode)
        if(node_mybet){
            cc.find("lbl", node_mybet).active = val>0?true:false
            cc.find("tip", node_mybet).active = val>0?false:true
            // node_mybet.active = val>0?true:false
            Global.setLabelString("lbl", node_mybet, Global.FormatNumToComma(val))
        }
    },

    // update (dt) {},
});
