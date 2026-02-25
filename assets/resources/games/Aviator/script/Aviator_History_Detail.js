/**
 * 历史详情
 */
cc.Class({
    extends: require("Table_History_Detail"),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    showGameResult:function(result){
        let data = result.mult
        let lbl = cc.find("ui/node_result/val",this.node)

        lbl.getComponent(cc.Label).string = data + "x"
        lbl.color = data>1.5?cc.color().fromHEX("#8C3EF7"):cc.color().fromHEX("#04A1E6")
    },

    showGameType:function(result){
        let data = result.mult
        let lbl = cc.find("ui/node_type/val",this.node)
        lbl.getComponent(cc.Label).string = data + "x"
        lbl.color = data>1.5?cc.color().fromHEX("#8C3EF7"):cc.color().fromHEX("#04A1E6")

        
    },
});
