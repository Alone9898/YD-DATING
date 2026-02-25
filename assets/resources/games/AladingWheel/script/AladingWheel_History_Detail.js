cc.Class({
    extends: require("Table_History_Detail"),

    properties: {
    },

    showGameType: function (result) {
        if (result.win.length > 1) {
            cc.find("ui/node_type/icon_deng", this.node).active = true;
            cc.find("ui/node_type/symbol", this.node).active = false;
            cc.find("ui/node_type/mult", this.node).getComponent(cc.Label).string = "";
        } else {
            cc.find("ui/node_type/icon_deng", this.node).active = false;
            cc.find("ui/node_type/symbol", this.node).active = true;
            cc.find("ui/node_type/symbol", this.node).getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`laba_bet_${result.win[0].place-1}`);
            cc.find("ui/node_type/mult", this.node).getComponent(cc.Label).string = "x" + result.win[0].mult;
        }

    },

    showGameResult: function (result) {
        // cc.find("ui/node_result/symbol", this.node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("symbol_" + res.symbol)
        // cc.find("ui/ui/node_result/mult", this.node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("x" + res.mult)

        if (result.win.length > 1) {
            cc.find("ui/node_result/icon_deng", this.node).active = true;
            cc.find("ui/node_result/symbol", this.node).active = false;
            cc.find("ui/node_result/mult", this.node).getComponent(cc.Label).string = 0;
        } else {
            cc.find("ui/node_result/icon_deng", this.node).active = false;
            cc.find("ui/node_result/symbol", this.node).active = true;
            cc.find("ui/node_result/symbol", this.node).getComponent(cc.Sprite).spriteFrame = cc.vv.gameData.getAtlas(0).getSpriteFrame(`laba_bet_${result.win[0].place-1}`);
            cc.find("ui/node_result/mult", this.node).getComponent(cc.Label).string = "x" + result.win[0].mult;
        }
    },
});

