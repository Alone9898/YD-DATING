

cc.Class({
    extends: require("Table_BetAreas_Base"),

    properties: {

    },


    //设置总筹码
    setAreaTotalBet:function(areaNode, val) {
        this._super(areaNode, val);
        // let touzhu_szdb = cc.find("touzhu_szdb", areaNode);
        // if(touzhu_szdb){
        //     touzhu_szdb.active = val>0?true:false
        // }
    },

    playClickAnim(areanIdx){
        let arenNode = this.getBetAreaNode(areanIdx)
        let selclick = arenNode.getChildByName("selclick");
        selclick.active = true
        cc.tween(selclick)
            .delay(0.3)
            .call(()=>{
                selclick.active = false;
            })
            .start();
    }


    // update (dt) {},
});
