/**
 * Crash 押注记录
 */
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {
        back_bg:cc.SpriteFrame,
        green_bg:cc.SpriteFrame,
        red_ball:cc.SpriteFrame,
        green_ball:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    // update (dt) {},

    //根据游戏显示自己的结果
    showGameResult:function(result){
        let data = result.mult
        let item = cc.find("node_result/item",this.node)

        let showbg = data>=2?this.green_bg:this.back_bg
        let showball = data>=2?this.red_ball:this.green_ball
        item.getComponent(cc.Sprite).spriteFrame = showbg
        cc.find("color",item).getComponent(cc.Sprite).spriteFrame = showball
        Global.setLabelString("val",item,data + "x")
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        
        Global.setLabelString("node_option/lbl",this.node,opt)
    },

});
