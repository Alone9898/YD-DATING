/**
 * lhdz 记录
 */
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {
        sprs:[cc.SpriteFrame] //按龙，虎，和排序
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    // update (dt) {},

     //根据游戏显示自己的结果
     showGameResult:function(result){
        let val = result.res
        let item = cc.find("node_result/item",this.node)
        item.getComponent(cc.Sprite).spriteFrame = this.sprs[val-1]
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        let optname = ["Dragon","Tiger","Tie"]
        Global.setLabelString("node_option/lbl",this.node,optname[opt-1])
    },
});
