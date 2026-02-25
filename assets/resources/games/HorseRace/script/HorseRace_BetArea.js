
cc.Class({
    extends: require("Table_BetAreas_Base"),

    properties: {
        jiangbeiList:[cc.Node],
    },

    setOdds(list){
        for(let i = 0; i < this.AreaList.length; i++) {
            let areaNode = this.AreaList[i].node

            if(list[i]){
                cc.find("odds/lbl",areaNode).getComponent(cc.Label).string = ""+list[i];
            } else {
                cc.find("odds/lbl",areaNode).getComponent(cc.Label).string = "";
            }
        }
    },


    // update (dt) {},
});
