/**
 * 订单记录item
 */
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    //根据游戏显示自己的结果
    showGameResult:function(result){
        let data = result.mult
        let lbl = cc.find("node_result/val",this.node)
        lbl.getComponent(cc.Label).string = data + "x"
        lbl.color = data>1.5?cc.Color.GREEN:cc.Color.BLUE
        
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        
        Global.setLabelString("node_option/lbl",this.node,opt)
    },


    // update (dt) {},
});
