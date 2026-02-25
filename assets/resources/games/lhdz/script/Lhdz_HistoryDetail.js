/**
 * lhdz历史详情
 */
cc.Class({
    extends: require("Table_History_Detail"),

    properties: {
        sprs:[cc.SpriteFrame] //按龙，虎，和排序
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    showGameResult:function(result){
        let val = result.res
        let item = cc.find("ui/node_result/item",this.node)
        item.getComponent(cc.Sprite).spriteFrame = this.sprs[val-1]
    },

    showGameType:function(result){
        let card_d = cc.find("ui/node_type/gamePoker_d",this.node)
        card_d.getComponent("Poker").show16Poker(result.c1)
        let card_t = cc.find("ui/node_type/gamePoker_t",this.node)
        card_t.getComponent("Poker").show16Poker(result.c2)
    },

    // update (dt) {},
});
