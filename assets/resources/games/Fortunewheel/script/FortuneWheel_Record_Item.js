/**
 * Fortune Wheel记录
 */

cc.Class({
    extends: require("Table_Record_Item"),

    properties: {
        
    },

    //根据游戏显示自己的结果
    showGameResult:function(result){
        let cfg = cc.vv.gameData.getGameCfg()
        let res = cfg.ResultMap[result.res]
        let atlas = cc.vv.gameData.getAtlas(0)
        if(atlas && res){  
            cc.find("node_result/symbol", this.node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("symbol_"+res.symbol)
            cc.find("node_result/mult", this.node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("x"+res.mult)
        }
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        let node_op = cc.find("node_option/symbol", this.node)
        if(!node_op) return
        let atlas = cc.vv.gameData.getAtlas(0)
        if(atlas){  
            node_op.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("symbol_"+opt)
        }
    }
});
