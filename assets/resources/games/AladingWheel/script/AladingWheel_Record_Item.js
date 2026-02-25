
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {
    },

    //根据游戏显示自己的结果
    showGameResult: function (result) {
        if (result.win.length > 1) {
            cc.find("node_result/icon_deng", this.node).active = true;
            cc.find("node_result/symbol", this.node).active = false;
            cc.find("node_result/mult", this.node).getComponent(cc.Label).string = "";
        } else {
            cc.find("node_result/icon_deng", this.node).active = false;
            cc.find("node_result/symbol", this.node).active = true;
            cc.find("node_result/symbol", this.node).getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`laba_bet_${result.win[0].place-1}`);
            cc.find("node_result/mult", this.node).getComponent(cc.Label).string = "x" + result.win[0].mult;
        }
    },

    //根据自己的游戏显示押注选项
    showGameOption: function (opt) {
        let op = cc.find("node_option/symbol", this.node)
        if(op){
            op.getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`laba_bet_${opt-1}`);
        }

    },
});
