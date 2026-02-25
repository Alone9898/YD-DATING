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
        let data = result
        let lbl = cc.find("node_result/val",this.node)
        lbl.getComponent(cc.Label).string = Global.SavePoints(data.num)
        lbl.color = data.res>0?cc.Color.GREEN:cc.Color.WHITE
        
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        let str = "--"
        let result = JSON.parse(this._itemdata.result)
        if(result.roll == 1){
            str = "UNDER"
        }
        else if(result.roll == 2){
            str = "OVER"
        }
        Global.setLabelString("node_option/lbl",this.node,str)
    },


    // update (dt) {},
});
