/**
 * SevenUpDown 记录
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

            let item = cc.find("node_result/item", this.node);

            if(result.gold){
                item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame("r_h");
            } else {
                let list = ["r_hong","r_lv","r_lan"]; //2~6,8~12,7,
                item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(list[result.res-1])
            }
            cc.find("lbl", item).getComponent(cc.Label).string = result.point;

        }
    },

    //根据自己的游戏显示押注选项
    showGameOption:function(opt){
        let optname = ["2-6","8-12","7"]
        Global.setLabelString("node_option/lbl",this.node,optname[opt-1])
    },

    // update (dt) {},
});
