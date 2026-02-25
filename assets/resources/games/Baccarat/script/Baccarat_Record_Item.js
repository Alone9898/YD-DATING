/**
 * 百家乐记录
 */
cc.Class({
    extends: require("Table_Record_Item"),

    properties: {
        // zhuziPre:cc.Prefab, // 珠仔路上item
    },

    //根据游戏显示自己的结果
    showGameResult:function(result){
        let cfg = cc.vv.gameData.getGameCfg()
        let atlas = cc.vv.gameData.getAtlas(0)
        if(atlas && result.res){
            let item = cc.find("node_result/zhuzi", this.node)//.instantiate(this.zhuziPre);
            let sprNameList = ["zoushi_icon02","zoushi_icon01","zoushi_icon03"];  // 庄 闲 和
            item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(sprNameList[result.res-1]);
            cc.find("p_p", item).active = result.winplace.indexOf(5)>=0;
            cc.find("b_p", item).active = result.winplace.indexOf(4)>=0;
        }
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        let optname = ["Banker", "Player", "Tie", "Banker Pair", "Player Pair"]
        Global.setLabelString("node_option/lbl",this.node,optname[opt-1])
    },

    // update (dt) {},
});
