/**
 * 跑马 记录
 */
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {

    },

    //根据游戏显示自己的结果
    showGameResult:function(result){
        let cfg = cc.vv.gameData.getGameCfg()
        let atlas = cc.vv.gameData.getAtlas(0)
        if(atlas && result.res){
            cc.find("node_result/paoma_result", this.node).getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(`paoma_result${result.res}`);
        }
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        Global.setLabelString("node_option/lbl",this.node,opt)
    },

    // update (dt) {},
});
