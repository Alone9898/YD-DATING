cc.Class({
    extends: require("Table_History_Detail"),

    properties: {
        
    },

    showGameType:function(result){
        let cfg = cc.vv.gameData.getGameCfg()
        let res = cfg.ResultMap[result.res]
        let atlas = cc.vv.gameData.getAtlas(0)
        if(atlas && res){  
            cc.find("ui/node_type/symbol", this.node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("symbol_"+res.symbol)
            cc.find("ui/node_type/mult", this.node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("x"+res.mult)
        }
    },

    showGameResult:function(result){
        let cfg = cc.vv.gameData.getGameCfg()
        let res = cfg.ResultMap[result.res]
        let atlas = cc.vv.gameData.getAtlas(0)
        if(atlas && res){  
            cc.find("ui/node_result/symbol", this.node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("symbol_"+res.symbol)
            cc.find("ui/node_result/mult", this.node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("x"+res.mult)
        }
    },
});

