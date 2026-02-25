/**
 * Crash 历史记录详情
 */
cc.Class({
    extends: require("Table_History_Detail"),

    properties: {
        back_bg:cc.SpriteFrame,
        green_bg:cc.SpriteFrame,
        red_ball:cc.SpriteFrame,
        green_ball:cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    showGameResult:function(result){
        let data = result.mult
        let item = cc.find("ui/node_result/item",this.node)

        let showbg = data>=2?this.green_bg:this.back_bg
        let showball = data>=2?this.red_ball:this.green_ball
        item.getComponent(cc.Sprite).spriteFrame = showbg
        cc.find("color",item).getComponent(cc.Sprite).spriteFrame = showball
        Global.setLabelString("val",item,data + "x")
    },

    showGameType:function(result){
        let data = result.mult
        let item = cc.find("ui/node_type/item",this.node)

        let showbg = data>=2?this.green_bg:this.back_bg
        let showball = data>=2?this.red_ball:this.green_ball
        item.getComponent(cc.Sprite).spriteFrame = showbg
        cc.find("color",item).getComponent(cc.Sprite).spriteFrame = showball
        Global.setLabelString("val",item,data + "x")
    },

});
