
cc.Class({
    extends: require("Table_History_Detail"),

    properties: {

    },

    showGameResult:function(result){
        cc.find("ui/node_type/paoma_result", this.node).getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`paoma_result${result.res}`);
    },

    showGameType:function(result){
        cc.find("ui/node_result/paoma_result", this.node).getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`paoma_result${result.res}`);
    },

    // update (dt) {},
});
